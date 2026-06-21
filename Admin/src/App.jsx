import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Sidebar from "./components/Sidebar";
import AdminHeader from "./components/AdminHeader";
import AdminFooter from "./components/AdminFooter";
import ProtectedRoute from "./components/ProtectedRoute";

import CategoryManage from "./pages/CategoryManage";
import AddProduct from "./pages/AddProduct";
import Manage_orders from "./pages/Manage_orders";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import AccountManagement from "./pages/AccountManagement";
import AdminLogin from "./pages/AdminLogin";
import AccountManagement1 from "./pages/AccountManagement1";


/* Layout */
import { Outlet } from "react-router-dom";

/* ================= ADMIN LAYOUT ================= */
function AdminLayout() {
  return (
    <div className="appLayout">
      <Sidebar />
      <AdminHeader />

      <div className="mainContent">
        <Outlet />
      </div>

      <AdminFooter />
    </div>
  );
}

/* ================= APP ================= */
const App = () => {
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
      <Routes>

        {/* LOGIN (PUBLIC) */}
        <Route path="/admin-login" element={<AdminLogin />} />

        {/* PROTECTED ADMIN AREA */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >

          {/* DASHBOARD */}
          <Route index element={<Dashboard />} />

          {/* ADMIN PAGES */}
          <Route path="category" element={<CategoryManage />} />
          <Route path="product" element={<AddProduct />} />
          <Route path="manageorders" element={<Manage_orders />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="customermanagement" element={<AccountManagement />} />
          <Route path="accountmanagement" element={<AccountManagement1 />} />
          
          {/* SEARCH PAGE */}
          

        </Route>

      </Routes>
    </BrowserRouter>
  );
};

export default App;