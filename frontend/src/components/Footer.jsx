import React from 'react';
import { Mail, Phone, MapPin, Shield, FileText, Globe } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-white font-bold text-lg mb-4">Bank Statement Analyzer</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              AI-powered financial insights platform that transforms your bank statements into comprehensive reports and analytics.
            </p>
            <div className="flex space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <div className="bg-purple-600 p-2 rounded-lg">
                <Globe className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-white font-bold text-lg mb-4">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-blue-400" />
                <span className="text-sm">support@bankanalyzer.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-blue-400" />
                <span className="text-sm">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-blue-400" />
                <span className="text-sm">San Francisco, CA</span>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <h3 className="text-white font-bold text-lg mb-4">Features</h3>
            <ul className="space-y-2 text-sm">
              <li className="hover:text-white cursor-pointer transition-colors">AI-Powered Analysis</li>
              <li className="hover:text-white cursor-pointer transition-colors">PDF Report Generation</li>
              <li className="hover:text-white cursor-pointer transition-colors">CSV Data Export</li>
              <li className="hover:text-white cursor-pointer transition-colors">Advanced Analytics</li>
              <li className="hover:text-white cursor-pointer transition-colors">Bank Statement Validation</li>
            </ul>
          </div>

          {/* Legal & Security */}
          <div className="space-y-4">
            <h3 className="text-white font-bold text-lg mb-4">Legal & Security</h3>
            <ul className="space-y-2 text-sm">
              <li className="hover:text-white cursor-pointer transition-colors">Privacy Policy</li>
              <li className="hover:text-white cursor-pointer transition-colors">Terms of Service</li>
              <li className="hover:text-white cursor-pointer transition-colors">Data Security</li>
              <li className="hover:text-white cursor-pointer transition-colors">Cookie Policy</li>
            </ul>
            <div className="flex items-center space-x-2 mt-4">
              <Shield className="w-4 h-4 text-green-400" />
              <span className="text-xs text-gray-400">Bank-level Security</span>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer Section */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <h4 className="text-white font-semibold mb-2 flex items-center">
              <Shield className="w-4 h-4 mr-2 text-yellow-400" />
              Important Disclaimer
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              This tool is for informational purposes only and does not constitute financial advice. 
              Always verify results and consult with qualified financial professionals for important decisions. 
              Your data is processed securely and not stored permanently on our servers. 
              We recommend reviewing your bank statements and our analysis for accuracy.
            </p>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <div className="text-sm text-gray-400">
              © {new Date().getFullYear()} Bank Statement Analyzer. All rights reserved.
            </div>
            <div className="flex space-x-6 text-xs text-gray-500">
              <span className="hover:text-white cursor-pointer transition-colors">Made with Love</span>
              <span className="hover:text-white cursor-pointer transition-colors">Powered by React & FastAPI</span>
              <span className="hover:text-white cursor-pointer transition-colors">Version 2.0</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
