// src/components/AuthWrapper.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AuthWrapper = ({ allowedRoles, children }) => {
    const { user, authLoading } = useAuth();

    // Show a loading state while authentication is being checked
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="animate-pulse">Checking authentication...</p>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!user) {
        return <Navigate to="/login" />;
    }

    // Redirect if the user doesn't have the right role
    if (allowedRoles && !allowedRoles.includes(user.userType)) {
        switch (user.userType) {
            case "customer":
                return <Navigate to="/customer/dashboard" />;
            case "tailor":
                return <Navigate to="/tailor/dashboard" />;
            case "admin":
                return <Navigate to="/admin/dashboard" />;
            default:
                return <Navigate to="/" />;
        }
    }

    return children;
};

export default AuthWrapper;
