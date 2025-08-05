import os
import jwt
import requests
from typing import Optional, Dict, Any
from datetime import datetime, timezone
from functools import lru_cache
from fastapi import HTTPException, status
import logging

logger = logging.getLogger(__name__)

class AsgardeoJWTValidator:
    """JWT token validator for WSO2 Asgardeo tokens"""
    
    def __init__(self):
        self.asgardeo_base_url = os.getenv("ASGARDEO_BASE_URL")
        self.client_id = os.getenv("ASGARDEO_CLIENT_ID")
        self.jwks_cache = {}
        self.jwks_cache_ttl = 3600  # 1 hour cache
        
        if not self.asgardeo_base_url:
            logger.warning("ASGARDEO_BASE_URL not configured")
        if not self.client_id:
            logger.warning("ASGARDEO_CLIENT_ID not configured")
    
    @lru_cache(maxsize=1)
    def get_jwks_uri(self) -> str:
        """Get JWKS URI from Asgardeo discovery endpoint"""
        if not self.asgardeo_base_url:
            raise ValueError("ASGARDEO_BASE_URL not configured")
            
        discovery_url = f"{self.asgardeo_base_url}/oauth2/token/.well-known/openid-configuration"
        
        try:
            response = requests.get(discovery_url, timeout=10)
            response.raise_for_status()
            discovery_data = response.json()
            return discovery_data.get("jwks_uri")
        except requests.RequestException as e:
            logger.error(f"Failed to fetch discovery document: {e}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Unable to fetch authentication configuration"
            )
    
    def get_jwks(self) -> Dict[str, Any]:
        """Get JSON Web Key Set from Asgardeo"""
        current_time = datetime.now(timezone.utc).timestamp()
        
        # Check cache
        if (self.jwks_cache.get("data") and 
            self.jwks_cache.get("timestamp", 0) + self.jwks_cache_ttl > current_time):
            return self.jwks_cache["data"]
        
        jwks_uri = self.get_jwks_uri()
        if not jwks_uri:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="JWKS URI not available"
            )
        
        try:
            response = requests.get(jwks_uri, timeout=10)
            response.raise_for_status()
            jwks_data = response.json()
            
            # Cache the JWKS data
            self.jwks_cache = {
                "data": jwks_data,
                "timestamp": current_time
            }
            
            return jwks_data
        except requests.RequestException as e:
            logger.error(f"Failed to fetch JWKS: {e}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Unable to fetch authentication keys"
            )
    
    def get_signing_key(self, token_header: Dict[str, Any]) -> str:
        """Get the signing key for token validation"""
        jwks = self.get_jwks()
        
        # Find the key with matching kid
        kid = token_header.get("kid")
        if not kid:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token missing key ID"
            )
        
        for key in jwks.get("keys", []):
            if key.get("kid") == kid:
                # Convert JWK to PEM format
                try:
                    from jwt.algorithms import RSAAlgorithm
                    return RSAAlgorithm.from_jwk(key)
                except Exception as e:
                    logger.error(f"Failed to convert JWK to key: {e}")
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Invalid signing key"
                    )
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Signing key not found"
        )
    
    def validate_token(self, token: str) -> Dict[str, Any]:
        """Validate JWT token and return claims"""
        try:
            # Decode header without verification to get kid
            unverified_header = jwt.get_unverified_header(token)
            
            # Get signing key
            signing_key = self.get_signing_key(unverified_header)
            
            # Verify and decode token
            payload = jwt.decode(
                token,
                signing_key,
                algorithms=["RS256"],
                audience=self.client_id,
                options={
                    "verify_signature": True,
                    "verify_exp": True,
                    "verify_nbf": True,
                    "verify_iat": True,
                    "verify_aud": True,
                    "require": ["exp", "iat", "sub"]
                }
            )
            
            # Additional validation
            self._validate_claims(payload)
            
            return payload
            
        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired"
            )
        except jwt.InvalidAudienceError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token audience"
            )
        except jwt.InvalidSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token signature"
            )
        except jwt.InvalidTokenError as e:
            logger.error(f"Token validation error: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        except Exception as e:
            logger.error(f"Unexpected token validation error: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token validation failed"
            )
    
    def _validate_claims(self, payload: Dict[str, Any]) -> None:
        """Additional claim validation"""
        # Check if token is issued by expected issuer
        if self.asgardeo_base_url:
            expected_issuer = f"{self.asgardeo_base_url}/oauth2/token"
            if payload.get("iss") != expected_issuer:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token issuer"
                )
        
        # Check if subject exists
        if not payload.get("sub"):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token missing subject"
            )
    
    def extract_user_info(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Extract user information from token payload"""
        return {
            "user_id": payload.get("sub"),
            "username": payload.get("username"),
            "email": payload.get("email"),
            "given_name": payload.get("given_name"),
            "family_name": payload.get("family_name"),
            "groups": payload.get("groups", []),
            "roles": payload.get("roles", []),
            "scope": payload.get("scope", "").split() if payload.get("scope") else [],
            "client_id": payload.get("aud"),
            "issued_at": payload.get("iat"),
            "expires_at": payload.get("exp")
        }

# Global validator instance
jwt_validator = AsgardeoJWTValidator()

def validate_jwt_token(token: str) -> Dict[str, Any]:
    """Validate JWT token and return user info"""
    payload = jwt_validator.validate_token(token)
    return jwt_validator.extract_user_info(payload)

def get_user_from_token(token: str) -> Optional[Dict[str, Any]]:
    """Get user information from token, return None if invalid"""
    try:
        return validate_jwt_token(token)
    except HTTPException:
        return None
    except Exception as e:
        logger.error(f"Unexpected error validating token: {e}")
        return None