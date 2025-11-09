import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { getCartItemsCount } = useCart();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Products', href: '/products' },
    { name: 'Cart', href: '/cart' },
  ];

  const isActive = (path) => location.pathname === path;

  // Safe cart count - ensure it's always a number
  const cartItemsCount = typeof getCartItemsCount === 'function' ? getCartItemsCount() : 0;

  return (
    <nav style={{ background: 'white', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', position: 'sticky', top: 0, zIndex: 50 }}>
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '4rem' }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '2rem', height: '2rem', background: '#2563eb', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'white', fontWeight: 'bold', fontSize: '0.875rem' }}>SS</span>
            </div>
            <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827' }}>ShopSphere</span>
          </Link>

          {/* Desktop Navigation */}
          <div style={{ display: 'none', alignItems: 'center', gap: '2rem' }}>
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                  ...(isActive(item.href)
                    ? { color: '#2563eb', background: '#dbeafe' }
                    : { color: '#374151' })
                }}
                onMouseEnter={(e) => {
                  if (!isActive(item.href)) {
                    e.target.style.color = '#2563eb';
                    e.target.style.background = '#f3f4f6';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive(item.href)) {
                    e.target.style.color = '#374151';
                    e.target.style.background = 'transparent';
                  }
                }}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop User Menu */}
          <div style={{ display: 'none', alignItems: 'center', gap: '1rem' }}>
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {/* Admin Dashboard Link */}
                {isAdmin && (
                  <Link
                    to="/admin"
                    style={{
                      padding: '0.5rem 0.75rem',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#7c3aed',
                      background: '#f3f4f6',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#e9d5ff';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = '#f3f4f6';
                    }}
                  >
                    Admin Dashboard
                  </Link>
                )}
                
                <span style={{ color: '#374151' }}>Hello, {user.name}</span>
                
                {/* Profile and Orders Links */}
                <Link
                  to="/profile"
                  style={{
                    padding: '0.5rem 0.75rem',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    transition: 'all 0.2s',
                    ...(isActive('/profile')
                      ? { color: '#2563eb', background: '#dbeafe' }
                      : { color: '#374151' })
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive('/profile')) {
                      e.target.style.color = '#2563eb';
                      e.target.style.background = '#f3f4f6';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive('/profile')) {
                      e.target.style.color = '#374151';
                      e.target.style.background = 'transparent';
                    }
                  }}
                >
                  Profile
                </Link>
                <Link
                  to="/orders"
                  style={{
                    padding: '0.5rem 0.75rem',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    transition: 'all 0.2s',
                    ...(isActive('/orders')
                      ? { color: '#2563eb', background: '#dbeafe' }
                      : { color: '#374151' })
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive('/orders')) {
                      e.target.style.color = '#2563eb';
                      e.target.style.background = '#f3f4f6';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive('/orders')) {
                      e.target.style.color = '#374151';
                      e.target.style.background = 'transparent';
                    }
                  }}
                >
                  Orders
                </Link>
                
                {/* Cart with item count */}
                <Link
                  to="/cart"
                  style={{ position: 'relative', padding: '0.5rem', color: '#374151', transition: 'color 0.2s' }}
                  onMouseEnter={(e) => {
                    e.target.style.color = '#2563eb';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = '#374151';
                  }}
                >
                  🛒
                  {cartItemsCount > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '-0.25rem',
                      right: '-0.25rem',
                      background: '#ef4444',
                      color: 'white',
                      fontSize: '0.75rem',
                      borderRadius: '50%',
                      width: '1.25rem',
                      height: '1.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {cartItemsCount}
                    </span>
                  )}
                </Link>
                
                <button
                  onClick={logout}
                  style={{
                    background: '#e5e7eb',
                    color: '#374151',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#d1d5db';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#e5e7eb';
                  }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Link 
                  to="/login" 
                  style={{
                    background: '#e5e7eb',
                    color: '#374151',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#d1d5db';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#e5e7eb';
                  }}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  style={{
                    background: '#2563eb',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#1d4ed8';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#2563eb';
                  }}
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              style={{
                padding: '0.5rem',
                borderRadius: '0.375rem',
                color: '#374151',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.color = '#2563eb';
                e.target.style.background = '#f3f4f6';
              }}
              onMouseLeave={(e) => {
                e.target.style.color = '#374151';
                e.target.style.background = 'transparent';
              }}
            >
              {isMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div style={{ padding: '1rem 0', borderTop: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '0.375rem',
                    fontSize: '1rem',
                    fontWeight: '500',
                    transition: 'all 0.2s',
                    ...(isActive(item.href)
                      ? { color: '#2563eb', background: '#dbeafe' }
                      : { color: '#374151' })
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive(item.href)) {
                      e.target.style.color = '#2563eb';
                      e.target.style.background = '#f3f4f6';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive(item.href)) {
                      e.target.style.color = '#374151';
                      e.target.style.background = 'transparent';
                    }
                  }}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Mobile Admin Dashboard Link */}
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setIsMenuOpen(false)}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '0.375rem',
                    fontSize: '1rem',
                    fontWeight: '500',
                    color: '#7c3aed',
                    background: '#f3f4f6',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#e9d5ff';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#f3f4f6';
                  }}
                >
                  Admin Dashboard
                </Link>
              )}
              
              {user ? (
                <>
                  {/* Mobile Profile and Orders Links */}
                  <Link
                    to="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    style={{
                      padding: '0.75rem',
                      borderRadius: '0.375rem',
                      fontSize: '1rem',
                      fontWeight: '500',
                      transition: 'all 0.2s',
                      ...(isActive('/profile')
                        ? { color: '#2563eb', background: '#dbeafe' }
                        : { color: '#374151' })
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive('/profile')) {
                        e.target.style.color = '#2563eb';
                        e.target.style.background = '#f3f4f6';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive('/profile')) {
                        e.target.style.color = '#374151';
                        e.target.style.background = 'transparent';
                      }
                    }}
                  >
                    Profile
                  </Link>
                  <Link
                    to="/orders"
                    onClick={() => setIsMenuOpen(false)}
                    style={{
                      padding: '0.75rem',
                      borderRadius: '0.375rem',
                      fontSize: '1rem',
                      fontWeight: '500',
                      transition: 'all 0.2s',
                      ...(isActive('/orders')
                        ? { color: '#2563eb', background: '#dbeafe' }
                        : { color: '#374151' })
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive('/orders')) {
                        e.target.style.color = '#2563eb';
                        e.target.style.background = '#f3f4f6';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive('/orders')) {
                        e.target.style.color = '#374151';
                        e.target.style.background = 'transparent';
                      }
                    }}
                  >
                    Orders
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    style={{
                      padding: '0.75rem',
                      borderRadius: '0.375rem',
                      fontSize: '1rem',
                      fontWeight: '500',
                      color: '#374151',
                      textAlign: 'left',
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.color = '#2563eb';
                      e.target.style.background = '#f3f4f6';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.color = '#374151';
                      e.target.style.background = 'transparent';
                    }}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    style={{
                      padding: '0.75rem',
                      borderRadius: '0.375rem',
                      fontSize: '1rem',
                      fontWeight: '500',
                      color: '#374151',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.color = '#2563eb';
                      e.target.style.background = '#f3f4f6';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.color = '#374151';
                      e.target.style.background = 'transparent';
                    }}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMenuOpen(false)}
                    style={{
                      padding: '0.75rem',
                      borderRadius: '0.375rem',
                      fontSize: '1rem',
                      fontWeight: '500',
                      color: '#374151',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.color = '#2563eb';
                      e.target.style.background = '#f3f4f6';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.color = '#374151';
                      e.target.style.background = 'transparent';
                    }}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;