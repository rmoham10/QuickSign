import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem('befit_token');
  return token ? children : <Navigate to="/signin" replace />;
}