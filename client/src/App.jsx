import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext'; // ✅ fixed import path

// Import components
import LoadingSpinner from './components/LoadingSpinner';
import AdminDashboard from './pages/AdminDashboard';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ParentDashboard from './pages/ParentDashboard';
import RegisterPage from './pages/RegisterPage';
import StaffDashboard from './pages/StaffDashboard';
import StudentDashboard from './pages/StudentDashboard';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;

  return children;
};

// Public Route Component
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;

  if (user) {
    // Redirect to respective dashboard
    switch (user.role) {
      case 'admin':
        return <Navigate to="/admin" replace />;
      case 'student':
        return <Navigate to="/student" replace />;
      case 'parent':
        return <Navigate to="/parent" replace />;
      case 'staff':
        return <Navigate to="/staff" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />

      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/parent"
        element={
          <ProtectedRoute allowedRoles={['parent']}>
            <ParentDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/staff"
        element={
          <ProtectedRoute allowedRoles={['staff']}>
            <StaffDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-background">
      <AppRoutes />
    </div>
  );
}

export default App;
