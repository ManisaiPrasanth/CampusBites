import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const CanteenOwnerRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '100vh' }}>
        <div className="spinner" style={{ width: '3rem', height: '3rem', borderWidth: '4px' }}></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'canteen_owner') {
    return <Navigate to="/menu" replace />;
  }

  return children;
};

export default CanteenOwnerRoute;

