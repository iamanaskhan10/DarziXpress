// src/App.js
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import LandingPage from "./pages/landingPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import SignUpPage from "./pages/SignUpPage.jsx";
import CustomerLayout from "./layouts/CustomerLayout";
import CustomerDashboard from "./pages/customer/CustomerDashboard.jsx";
import Orders from "./pages/customer/Orders";
import Profile from "./pages/customer/ProfileInfo";
import Measurements from "./pages/customer/Measurements";
import TailorListing from "./pages/customer/TailorListing";
import CustomerManagement from "./pages/admin/CustomerManagement.jsx";
import ChangePassword from "./pages/ChangePassword.jsx";
import ServiceDetailPage from "./pages/ServiceDetailPage.jsx";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import TailorLayout from "./layouts/TailorLayout.jsx";
import TailorDashboard from "./pages/tailor/TailorDashboard.jsx";
import ManageOrders from "./pages/tailor/ManageOrders.jsx";
import MyListings from "./pages/tailor/MyListings.jsx";
import PostServiceForm from "./pages/tailor/PostServiceForm.jsx";
import MyEarnings from "./pages/tailor/MyEarnings.jsx";
import OrderDetails from "./pages/tailor/OrderDetails.jsx";
import TailorManagement from "./pages/admin/TailorManagement.jsx";

import { AuthProvider } from "./context/AuthContext";
import AuthWrapper from "./components/AuthWrapper"; // Import the wrapper

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />

          {/* Customer Routes */}
          <Route
            path="/customer"
            element={
              <AuthWrapper allowedRoles={["customer"]}>
                <CustomerLayout />
              </AuthWrapper>
            }
          >
            <Route index element={<Navigate to="dashboard" />} />
            <Route path="dashboard" element={<CustomerDashboard />} />
            <Route path="orders" element={<Orders />} />
            <Route path="profile" element={<Profile />} />
            <Route path="measurements" element={<Measurements />} />
            <Route path="changePassword" element={<ChangePassword />} />
            <Route path="listing" element={<TailorListing />} />
            <Route path="service-details/:serviceId" element={<ServiceDetailPage />} />
          </Route>

          {/* Tailor Routes */}
          <Route
            path="/tailor"
            element={
              <AuthWrapper allowedRoles={["tailor"]}>
                <TailorLayout />
              </AuthWrapper>
            }
          >
            <Route index element={<Navigate to="dashboard" />} />
            <Route path="dashboard" element={<TailorDashboard />} />
            <Route path="orders" element={<ManageOrders />} />
            <Route path="listings" element={<MyListings />} />
            <Route path="post-service" element={<PostServiceForm />} />
            <Route path="earnings" element={<MyEarnings />} />
            <Route path="orders/:id" element={<OrderDetails />} />
            <Route path="changePassword" element={<ChangePassword />} />
            <Route
              path="edit-service/:serviceId"
              element={<PostServiceForm />}
            />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <AuthWrapper allowedRoles={["admin"]}>
                <AdminLayout />
              </AuthWrapper>
            }
          >
            <Route index element={<Navigate to="dashboard" />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="customers" element={<CustomerManagement />} />
            <Route path="tailors" element={<TailorManagement />} />
            <Route path="changePassword" element={<ChangePassword />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
