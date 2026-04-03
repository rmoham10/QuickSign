import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Signup        from './pages/Signup';
import Signin        from './pages/Signin';
import VerifyPhone   from './pages/VerifyPhone';
import Dashboard     from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"             element={<Navigate to="/signin" replace />} />
        <Route path="/signup"       element={<Signup />} />
        <Route path="/signin"       element={<Signin />} />
        <Route path="/verify-phone" element={<VerifyPhone />} />
        <Route path="/dashboard"    element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}