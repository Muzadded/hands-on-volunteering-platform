import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { jwtDecode } from 'jwt-decode';
import HomePage from "../Pages/HomePage";
import Login from "../Pages/login";
import Registration from "../Pages/registration";
import Dashboard from "../Pages/Dashboard";

const AppRoute = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userId, setUserId] = useState(null);

    const setAuth = (boolean, id = null) => {
        setIsAuthenticated(boolean);
        setUserId(id);
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decoded = jwtDecode(token);
                const id = decoded.user;
                console.log("User ID from token:", id);
                setAuth(true, id);
            } catch (err) {
                console.error("Error decoding token:", err);
                localStorage.removeItem("token");
                setAuth(false, null);
            }
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
                    <Navigate to={`/dashboard/${userId}`} replace />
                } 
            />
            
            <Route 
                path="/register" 
                element={
                    !isAuthenticated ? 
                    <Registration  /> : 
                    <Navigate to={`/dashboard/${userId}`} replace />
                } 
            />  
            
            <Route 
                path="/dashboard/:id"
                element={
                    isAuthenticated ?
                    <Dashboard setAuth={setAuth} /> :
                    <Navigate to="/login" replace />
                } 
            />

            <Route 
                path="/dashboard"
                element={
                    isAuthenticated ?
                    <Navigate to={`/dashboard/${userId}`} replace /> :
                    <Navigate to="/login" replace />
                }
            />


        </Routes>
    );
};

export default AppRoute;
