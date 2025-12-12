import { createBrowserRouter, RouterProvider } from 'react-router';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import BrowseProducts from './pages/BrowseProducts';
import OrderDetails from './pages/OrderDetails';
import ProfileSettings from './pages/ProfileSettings';
import CartPage from './pages/CartPage';
import './App.css'

let router = createBrowserRouter([
  {
    path: '/',
    Component: LandingPage,
  },
  {
    path: '/login',
    Component: LoginPage,
  },
  {
    path: '/register',
    Component: RegisterPage,
  },
  {
    path: '/home',
    Component: Dashboard,
  },
  {
    path: '/browse',
    Component: BrowseProducts,
  },
  {
    path: '/orders/:id',
    Component: OrderDetails,
  },
  {
    path: '/profile',
    Component: ProfileSettings,
  },
  {
    path: '/cart',
    Component: CartPage,
  },
]);

function App() {
  return (
    <RouterProvider router={router} />
  );
}

export default App