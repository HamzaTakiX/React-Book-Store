import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBook } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [bounce, setBounce] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  const handleLogoHover = () => {
    setBounce(true);
    setTimeout(() => setBounce(false), 1000);
  };

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="nav-container">
        <Link 
          to="/" 
          className="nav-logo"
          onMouseEnter={handleLogoHover}
        >
          <FaBook className={`nav-logo-icon ${bounce ? 'bounce' : ''}`} />
          <span>BookStore</span>
        </Link>
        <div className="nav-links">
          <Link
            to="/books"
            className={`nav-button ${location.pathname === '/books' ? 'active' : ''}`}
          >
            Books
          </Link>
          <Link
            to="/clients"
            className={`nav-button ${location.pathname === '/clients' ? 'active' : ''}`}
          >
            Clients
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
