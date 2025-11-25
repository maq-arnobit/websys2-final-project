// App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Homepage from './pages/Homepage';
import Register from './pages/Register';

function App() {
  // You'll eventually check if user is logged in
  const isAuthenticated = false; // Replace with actual auth logic later

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected route - only accessible when logged in */}
        <Route 
          path="/dashboard" 
          element={isAuthenticated ? <Homepage /> : <Navigate to="/login" />} 
        />
        
        {/* Catch all - redirect to landing */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;