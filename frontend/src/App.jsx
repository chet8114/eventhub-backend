import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import EventList from './pages/user/EventList';
import EventDetail from './pages/user/EventDetail';
import BookingHistory from './pages/user/BookingHistory';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageEvents from './pages/admin/ManageEvents';
import ManageUsers from './pages/admin/ManageUsers';
import AttendanceLogs from './pages/admin/AttendanceLogs';
import StaffDashboard from './pages/staff/StaffDashboard';
import ScannerPage from './pages/staff/ScannerPage';

const AppRoutes = () => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-spinner" style={{ minHeight: '100vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={isAuthenticated ? <Navigate to={user.role === 'admin' ? '/admin' : user.role === 'staff' ? '/staff' : '/events'} /> : <Login />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/events" /> : <Register />} />

      {/* User */}
      <Route path="/events" element={<><Navbar /><EventList /></>} />
      <Route path="/events/:id" element={<><Navbar /><EventDetail /></>} />
      <Route path="/bookings" element={<ProtectedRoute roles={['user']}><Navbar /><BookingHistory /></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin" element={<ProtectedRoute roles={['admin']}><Navbar /><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/events" element={<ProtectedRoute roles={['admin']}><Navbar /><ManageEvents /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><Navbar /><ManageUsers /></ProtectedRoute>} />
      <Route path="/admin/attendance" element={<ProtectedRoute roles={['admin']}><Navbar /><AttendanceLogs /></ProtectedRoute>} />

      {/* Staff */}
      <Route path="/staff" element={<ProtectedRoute roles={['staff']}><Navbar /><StaffDashboard /></ProtectedRoute>} />
      <Route path="/staff/scan" element={<ProtectedRoute roles={['staff']}><Navbar /><ScannerPage /></ProtectedRoute>} />

      {/* Default */}
      <Route path="/" element={<Navigate to={isAuthenticated ? (user?.role === 'admin' ? '/admin' : user?.role === 'staff' ? '/staff' : '/events') : '/login'} />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e1b4b',
              color: '#f1f5f9',
              border: '1px solid rgba(99, 102, 241, 0.2)',
              borderRadius: '12px',
              fontSize: '0.9rem',
            },
            success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
