import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, user, logout, isAdmin, isCanteenOwner } = useAuth();
  const { getCartItemsCount, toggleCart } = useCart();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <header className="navbar">
        <div className="container flex-between">
          <div className="site-title flex gap-2">
            <Link to={isAuthenticated ? '/menu' : '/'}>
              <h1>
                <span className="text-white">Campus</span>
                <span className="text-accent">Bites</span>
              </h1>
            </Link>
            
            <div className="toggle-bars" onClick={toggleMobileMenu}>
              <div className={`bars bar-1 ${isMobileMenuOpen ? 'active' : ''}`}></div>
              <div className={`bars bar-2 ${isMobileMenuOpen ? 'active' : ''}`}></div>
              <div className={`bars bar-3 ${isMobileMenuOpen ? 'active' : ''}`}></div>
            </div>
          </div>

          <nav className={`site-nav ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
            <ul className="flex gap-2">
              {isAuthenticated ? (
                <>
                  {!isAdmin() && !isCanteenOwner() && (
                    <>
                      <li>
                        <Link to="/menu">
                          <i className="fas fa-utensils"></i> Menu
                        </Link>
                      </li>
                      <li>
                        <Link to="/orders">
                          <i className="fas fa-shopping-bag"></i> My Orders
                        </Link>
                      </li>
                    </>
                  )}
                  
                  {isAdmin() && (
                    <li>
                      <Link to="/admin">
                        <i className="fas fa-user-shield"></i> Admin Dashboard
                      </Link>
                    </li>
                  )}
                  
                  {isCanteenOwner() && (
                    <li>
                      <Link to="/canteen-owner">
                        <i className="fas fa-store"></i> My Canteen
                      </Link>
                    </li>
                  )}
                  
                  <li>
                    <Link to="/profile">
                      <i className="fas fa-user"></i> {user?.fullName}
                    </Link>
                  </li>
                  <li>
                    <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
                      <i className="fas fa-sign-out-alt"></i> Logout
                    </button>
                  </li>
                  
                  {!isAdmin() && !isCanteenOwner() && (
                    <li>
                      <button className="cart-icon-btn" onClick={toggleCart}>
                        <i className="fas fa-shopping-cart"></i>
                        {getCartItemsCount() > 0 && (
                          <span className="cart-badge">{getCartItemsCount()}</span>
                        )}
                      </button>
                    </li>
                  )}
                </>
              ) : (
                <>
                  <li>
                    <Link to="/login" className="btn btn-secondary btn-sm">
                      Login
                    </Link>
                  </li>
                  <li>
                    <Link to="/signup" className="btn btn-primary btn-sm">
                      Sign Up
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="mobile-overlay" onClick={toggleMobileMenu}></div>
      )}
    </>
  );
};

export default Navbar;

