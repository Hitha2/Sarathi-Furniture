import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Home from './pages/Home';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import Wishlist from './pages/Wishlist';
import Footer from './components/Footer';
import Profile from './pages/Profile';
import ResetPassword from './pages/ResetPassword';
import ForgotPassword from './pages/ForgotPassword';
import LoginSuccess from './pages/LoginSuccess';
import ProductsPage from './pages/ProductsPage';
import ProductDetails from './pages/ProductDetails';
import VerifyOtp from './pages/VerifyOtp';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import OrderDetails from './pages/OrderDetails';
import Payment from './pages/Payment';
import ProtectedRoute from "./components/ProtectedRoute";

/* ✅ Layout */
const Layout = ({ search, setSearch, category, setCategory, cart }) => {
  const location = useLocation();

  const hideNavbarRoutes = [
    "/verify-otp",
    "/forgot-password",
    "/reset-password",
  ];

    const hideFooterRoutes = [
    "/login",
    "/register",
    "/verify-otp",
    "/forgot-password",
    "/reset-password"
  ];

  const hideNavbar = hideNavbarRoutes.includes(location.pathname);

  return (
    <>
      {!hideNavbar && (
        <Navbar
          search={search}
          setSearch={setSearch}
          setCategory={setCategory}
          cart={cart}
        />
      )}

      <div className="maincontent">
        <Routes>
          <Route path="/" element={<Home search={search} category={category} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/orders/:orderId/:productId" element={<ProtectedRoute><OrderDetails/></ProtectedRoute>}/>
          <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/login-success" element={<LoginSuccess />} />
          <Route path="/productpage" element={<ProductsPage />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/payment" element={<Payment />} />
        </Routes>
      </div>

      {!hideFooterRoutes.includes(location.pathname) && <Footer />}
    </>
  );
};

/* ✅ App component */
const App = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [cart, setCart] = useState([]);

  return (
    <BrowserRouter>
    <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="light"
      />
      <Layout
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
        cart={cart}
      />
    </BrowserRouter>
  );
};

export default App;