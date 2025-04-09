import { Routes, Route } from 'react-router-dom';
import LoginPage from '../pages/LoginPage/LoginPage';
import SignupPage from '../pages/LoginPage/SignupPage';

const LoginRoutes = () => (
  <Routes>
    <Route path="/signin" element={<LoginPage />} />
    <Route path="/signup" element={<SignupPage />} />
  </Routes>
);

export default LoginRoutes;