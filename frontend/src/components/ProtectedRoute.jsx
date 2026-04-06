import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    // Redirect to appropriate dashboard
    const dashboardMap = {
      admin: '/admin',
      staff: '/staff',
      user: '/events',
    };
    return <Navigate to={dashboardMap[user.role] || '/events'} replace />;
  }

  return children;
};

export default ProtectedRoute;
