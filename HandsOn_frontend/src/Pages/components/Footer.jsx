import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaGithub, FaHeart } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-base-100 shadow-sm bg-blue-500 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold mb-4">HandsOn</h3>
            <p className="text-blue-100 text-sm leading-relaxed">
              Connecting volunteers with meaningful opportunities to make a difference.
              Join our community and be part of positive change in society.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-blue-100 text-sm">
              <li>
                <Link to="/dashboard" className="hover:text-white transition-colors">
                  Find Events
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-white transition-colors">
                  Join Teams
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-white transition-colors">
                  Help Posts
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">Contact Us</h3>
            <ul className="space-y-2 text-blue-100 text-sm">
              <li>Email: contact@handson.com</li>
              <li>Phone: (123) 456-7890</li>
              <li>Address: 123 Volunteer Street</li>
              <li>City, State 12345</li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-xl font-bold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a
                href=""
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-300 transition-colors"
              >
                <FaFacebook size={24} />
              </a>
              <a
                href=""
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-300 transition-colors"
              >
                <FaTwitter size={24} />
              </a>
              <a
                href=""
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-300 transition-colors"
              >
                <FaInstagram size={24} />
              </a>
              <a
                href=""
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-300 transition-colors"
              >
                <FaLinkedin size={24} />
              </a>
              <a
                href=""
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-300 transition-colors"
              >
                <FaGithub size={24} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-blue-700">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-blue-100">
            <div className="mb-4 md:mb-0">
              © {currentYear} HandsOn. All rights reserved.
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link to="/dashboard" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
              <span className="flex items-center">
                Made by HandsOn Team
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
