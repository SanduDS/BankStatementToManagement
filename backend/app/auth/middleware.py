from fastapi import Request, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional, Dict, Any, List
import logging

from .jwt_validator import validate_jwt_token

logger = logging.getLogger(__name__)

# HTTP Bearer token scheme
security = HTTPBearer(auto_error=False)

class AuthenticationError(HTTPException):
    """Custom authentication error"""
    def __init__(self, detail: str = "Authentication required"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers={"WWW-Authenticate": "Bearer"}
        )

class AuthorizationError(HTTPException):
    """Custom authorization error"""
    def __init__(self, detail: str = "Insufficient permissions"):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=detail
        )

def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Optional[Dict[str, Any]]:
    """
    Get current user from JWT token (optional - returns None if no token or invalid)
    """
    if not credentials:
        return None
    
    try:
        user_info = validate_jwt_token(credentials.credentials)
        return user_info
    except HTTPException:
        return None
    except Exception as e:
        logger.error(f"Unexpected error in optional auth: {e}")
        return None

def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Dict[str, Any]:
    """
    Get current user from JWT token (required - raises exception if no token or invalid)
    """
    if not credentials:
        raise AuthenticationError("Authorization header missing")
    
    try:
        user_info = validate_jwt_token(credentials.credentials)
        return user_info
    except HTTPException as e:
        # Re-raise HTTP exceptions from JWT validation
        raise e
    except Exception as e:
        logger.error(f"Unexpected error in required auth: {e}")
        raise AuthenticationError("Authentication failed")

def require_roles(required_roles: List[str]):
    """
    Dependency factory for role-based access control
    """
    def check_roles(current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
        user_roles = current_user.get("roles", [])
        user_groups = current_user.get("groups", [])
        
        # Combine roles and groups for checking
        user_permissions = set(user_roles + user_groups)
        required_permissions = set(required_roles)
        
        # Check if user has any of the required roles/groups
        if not required_permissions.intersection(user_permissions):
            raise AuthorizationError(
                f"Access denied. Required roles: {', '.join(required_roles)}. "
                f"User roles: {', '.join(list(user_permissions))}"
            )
        
        return current_user
    
    return check_roles

def require_scopes(required_scopes: List[str]):
    """
    Dependency factory for scope-based access control
    """
    def check_scopes(current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
        user_scopes = set(current_user.get("scope", []))
        required_scope_set = set(required_scopes)
        
        # Check if user has all required scopes
        if not required_scope_set.issubset(user_scopes):
            missing_scopes = required_scope_set - user_scopes
            raise AuthorizationError(
                f"Access denied. Missing scopes: {', '.join(missing_scopes)}"
            )
        
        return current_user
    
    return check_scopes

def require_admin():
    """
    Dependency for admin-only access
    """
    return require_roles(["admin", "administrator"])

def require_user():
    """
    Dependency for authenticated user access (any valid user)
    """
    return get_current_user

# Middleware for logging authentication events
async def auth_logging_middleware(request: Request, call_next):
    """
    Middleware to log authentication events
    """
    # Extract authorization header
    auth_header = request.headers.get("authorization")
    user_info = None
    
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header[7:]  # Remove "Bearer " prefix
        try:
            user_info = validate_jwt_token(token)
            logger.info(f"Authenticated request: {request.method} {request.url.path} - User: {user_info.get('username', user_info.get('user_id'))}")
        except Exception:
            logger.warning(f"Invalid token in request: {request.method} {request.url.path}")
    
    # Add user info to request state for use in route handlers
    request.state.user = user_info
    
    response = await call_next(request)
    return response

# Utility functions for route handlers
def get_user_from_request(request: Request) -> Optional[Dict[str, Any]]:
    """
    Get user info from request state (set by middleware)
    """
    return getattr(request.state, 'user', None)

def is_authenticated(request: Request) -> bool:
    """
    Check if request is authenticated
    """
    return get_user_from_request(request) is not None

def has_role(request: Request, role: str) -> bool:
    """
    Check if authenticated user has specific role
    """
    user = get_user_from_request(request)
    if not user:
        return False
    
    user_roles = user.get("roles", [])
    user_groups = user.get("groups", [])
    return role in user_roles or role in user_groups

def has_scope(request: Request, scope: str) -> bool:
    """
    Check if authenticated user has specific scope
    """
    user = get_user_from_request(request)
    if not user:
        return False
    
    user_scopes = user.get("scope", [])
    return scope in user_scopes