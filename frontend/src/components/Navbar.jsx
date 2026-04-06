import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiOutlineCalendar, HiOutlineTicket, HiOutlineChartBar, HiOutlineQrcode, HiOutlineLogout, HiOutlineUser, HiOutlineMenu, HiOutlineX } from 'react-icons/hi';
import { useState } from 'react';
import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileOpen(false);
  };

  const navLinks = {
    user: [
      { to: '/events', label: 'Events', icon: <HiOutlineCalendar /> },
      { to: '/bookings', label: 'My Bookings', icon: <HiOutlineTicket /> },
    ],
    admin: [
      { to: '/admin', label: 'Dashboard', icon: <HiOutlineChartBar /> },
      { to: '/admin/events', label: 'Events', icon: <HiOutlineCalendar /> },
      { to: '/admin/users', label: 'Users', icon: <HiOutlineUser /> },
      { to: '/admin/attendance', label: 'Attendance', icon: <HiOutlineTicket /> },
    ],
    staff: [
      { to: '/staff', label: 'Dashboard', icon: <HiOutlineChartBar /> },
      { to: '/staff/scan', label: 'Scan QR', icon: <HiOutlineQrcode /> },
    ],
  };

  const links = user ? navLinks[user.role] || [] : [];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to={user ? (user.role === 'admin' ? '/admin' : user.role === 'staff' ? '/staff' : '/events') : '/'} className="navbar-brand">
          <span className="navbar-logo">✦</span>
          <span className="navbar-title">EventHub</span>
        </Link>

        {isAuthenticated && (
          <>
            <div className={`navbar-links ${mobileOpen ? 'open' : ''}`}>
              {links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`nav-link ${location.pathname === link.to ? 'active' : ''}`}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              ))}
              <div className="nav-divider"></div>
              <div className="nav-user-info">
                <div className="nav-user-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
                <div className="nav-user-details">
                  <span className="nav-user-name">{user?.name}</span>
                  <span className={`badge badge-${user?.role}`}>{user?.role}</span>
                </div>
              </div>
              <button className="nav-link nav-logout" onClick={handleLogout}>
                <HiOutlineLogout />
                <span>Logout</span>
              </button>
            </div>
            <button className="navbar-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <HiOutlineX /> : <HiOutlineMenu />}
            </button>
          </>
        )}

        {!isAuthenticated && (
          <div className="navbar-links">
            <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
