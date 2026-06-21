import React from "react";
import "../styles/Footer.css";

const Footer = () => {
  return (
    <footer className="footer">

      {/* Top Section */}
      <div className="footer-container">

        {/* Brand */}
        <div className="footer-box">
          <h2 className="flogo">Sarathi <span>Furniture</span></h2>
          <p>
            We provide stylish and comfortable furniture for modern homes.
            Quality, elegance, and affordability all in one place.
          </p>
        </div>

        {/* Quick Links */}
        <div className="footer-box">
          <h3>Quick Links</h3>
          <ul>
            <li><a href="#">Home</a></li>
            <li><a href="#">Shop</a></li>
            <li><a href="#">About</a></li>
            <li><a href="#">Contact</a></li>
          </ul>
        </div>

        {/* Services */}
        <div className="footer-box">
          <h3>Our Services</h3>
          <ul>
            <li>Custom Furniture</li>
            <li>Home Delivery</li>
            <li>Interior Design</li>
            <li>24/7 Support</li>
          </ul>
        </div>

        {/* Contact */}
        <div className="footer-box">
          <h3>Contact Us</h3>
          <p>Email: sarathifurniture@gmail.com</p>
          <p>Phone: +91 98765 43210</p>
          <p>Location: India</p>
        </div>

      </div>

      {/* Bottom */}
      <div className="footer-bottom">
        <p>© 2026 Sarathi Furniture. All rights reserved.</p>
      </div>

    </footer>
  );
};

export default Footer;