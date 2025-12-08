import { createBrowserRouter, RouterProvider } from 'react-router';
import { Component, useState } from 'react';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
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
  }
]);

function App() {
  return (
    <RouterProvider router={router} />
  );
}

export default App