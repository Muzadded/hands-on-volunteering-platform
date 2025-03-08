import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import HomePage from "../Pages/HomePage";
import Login from "../Pages/login";
import Registration from "../Pages/registration";
import Dashboard from "../Pages/Dashboard";

const AppRoute = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const setAuth = (boolean) => {
        setIsAuthenticated(boolean);
    };

    // Check if user is authenticated on component mount
    useEffect(() => {
        // Check if token exists in localStorage
        const token = localStorage.getItem("token");
        if (token) {
            // You might want to verify the token with your backend here
            setIsAuthenticated(true);
        }
    }, []);

    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            
            <Route 
                path="/login" 
                element={
                    !isAuthenticated ? 
                    <Login setAuth={setAuth} /> : 
                    <Navigate to="/dashboard" replace />
                } 
            />
            
            <Route 
                path="/register" 
                element={
                    !isAuthenticated ? 
                    <Registration setAuth={setAuth} /> : 
                    <Navigate to="/dashboard" replace />
                } 
            />
            
            <Route 
                path="/dashboard" 
                element={
                    isAuthenticated ? 
                    <Dashboard setAuth={setAuth} /> : 
                    <Navigate to="/login" replace />
                } 
            />
        </Routes>
    );
};

export default AppRoute;
