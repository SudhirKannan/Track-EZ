import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext'; // ✅ fixed import path

// Import components
import LoadingSpinner from './components/LoadingSpinner';
import AdminDashboard from './pages/AdminDashboard';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserDashboard from './pages/UserDashboard';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();

    if (loading) return <LoadingSpinner />;
    if (!user) return <Navigate to='/login' replace />;
    if (allowedRoles && !allowedRoles.includes(user.role))
        return <Navigate to='/' replace />;

    return children;
};

// Public Route Component
const PublicRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) return <LoadingSpinner />;

    if (user) {
        // Redirect to respective dashboard based on role
        if (user.role === 'admin') {
            return <Navigate to='/admin' replace />;
        } else {
            // All other roles (student, parent, staff) go to user dashboard
            return <Navigate to='/user' replace />;
        }
    }

    return children;
};

function AppRoutes() {
    return (
        <Routes>
            <Route path='/' element={<HomePage />} />

            <Route
                path='/login'
                element={
                    <PublicRoute>
                        <LoginPage />
                    </PublicRoute>
                }
            />

            <Route
                path='/register'
                element={
                    <PublicRoute>
                        <RegisterPage />
                    </PublicRoute>
                }
            />

            <Route
                path='/admin/*'
                element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <AdminDashboard />
                    </ProtectedRoute>
                }
            />

            <Route
                path='/user'
                element={
                    <ProtectedRoute
                        allowedRoles={['student', 'parent', 'staff']}
                    >
                        <UserDashboard />
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
}

function App() {
    return (
        <div className='min-h-screen bg-background'>
            <AppRoutes />
        </div>
    );
}

export default App;
