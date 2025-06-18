// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [authToken, setAuthToken] = useState(null);
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true); // True until initial token check is done

    // Function to process a token and update state
    const processToken = useCallback((token) => {
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                if (decodedToken.exp * 1000 < Date.now()) {
                    console.log("AuthContext: Token expired.");
                    localStorage.removeItem('token');
                    setAuthToken(null);
                    setUser(null);
                } else {
                    console.log("AuthContext: Token valid, setting user.", decodedToken);
                    setAuthToken(token); // Ensure authToken state is also up-to-date
                    setUser({
                        userId: decodedToken.userId,
                        userType: decodedToken.userType,
                    });
                }
            } catch (error) {
                console.error("AuthContext: Invalid token.", error);
                localStorage.removeItem('token');
                setAuthToken(null);
                setUser(null);
            }
        } else {
            // No token means no authenticated user
            setAuthToken(null);
            setUser(null);
        }
        setAuthLoading(false); // Done with processing attempt
        console.log("AuthContext: processToken finished. AuthLoading:", false, "User:", user, "Token:", authToken);
    }, []); // 'user' and 'authToken' are updated via setAuthToken/setUser, not direct dependencies here

    // Initial load: Try to get token from localStorage
    useEffect(() => {
        console.log("AuthContext: Initializing from localStorage.");
        const storedToken = localStorage.getItem('token');
        processToken(storedToken);
    }, [processToken]); // processToken is memoized

    const login = useCallback((token) => {
        console.log("AuthContext: login function called.");
        localStorage.setItem('token', token);
        processToken(token); // Use the same logic to set states
    }, [processToken]);

    const logout = useCallback(() => {
        console.log("AuthContext: logout function called.");
        localStorage.removeItem('token');
        setAuthToken(null);
        setUser(null);
        setAuthLoading(false); // Ensure loading is false on logout
    }, []);

    // This is a render-blocking check if you want to ensure children ONLY render
    // when auth is fully resolved (either to authenticated or unauthenticated).
    // For some apps, showing a generic loading screen here is fine.
    // For others, they might want children to render and handle their own loading based on context.
    if (authLoading) {
        console.log("AuthContext: Root level authLoading is true, rendering global loading screen.");
        return <div className="min-h-screen flex items-center justify-center"><p className="animate-pulse">Initializing session...</p></div>;
    }

    return (
        <AuthContext.Provider value={{ authToken, user, authLoading, login, logout, setUser /* for manual user updates if needed */ }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};