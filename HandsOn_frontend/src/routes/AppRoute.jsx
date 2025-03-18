import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { jwtDecode } from 'jwt-decode';
import HomePage from "../Pages/HomePage";
import Login from "../Pages/login";
import Registration from "../Pages/registration";
import Dashboard from "../Pages/Dashboard";
import EditProfile from "../Pages/EditProfile";
import CreateEvent from "../Pages/CreateEvent";
import Events from "../Pages/Events";
import HelpReq from "../Pages/HelpReq";
import CreateHelpPost from "../Pages/CreateHelpPost";
import Teams from "../Pages/Teams";
import CreateTeams from "../Pages/CreateTeams";
import TeamDash from "../Pages/TeamDash";

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

            <Route 
                path="/edit-profile/:id" 
                element={
                    isAuthenticated ? 
                    <EditProfile setAuth={setAuth} /> : 
                    <Navigate to="/login" replace />
                } 
            />

            <Route 
                path="/events-feed" 
                element={
                    isAuthenticated ? 
                    <Events setAuth={setAuth} /> : 
                    <Navigate to="/login" replace />
                } 
            />

            <Route 
                path="/create-event" 
                element={
                    isAuthenticated ? 
                    <CreateEvent setAuth={setAuth} /> : 
                    <Navigate to="/login" replace />
                } 
            />

            <Route 
                path="/help-request" 
                element={
                    isAuthenticated ? 
                    <HelpReq setAuth={setAuth} /> : 
                    <Navigate to="/login" replace />
                } 
            />

            <Route 
                path="/create-help-post" 
                element={
                    isAuthenticated ? 
                    <CreateHelpPost setAuth={setAuth} /> : 
                    <Navigate to="/login" replace />
                } 
            />
             <Route 
                path="/teams" 
                element={
                    isAuthenticated ? 
                    <Teams setAuth={setAuth} /> : 
                    <Navigate to="/login" replace />
                } 
            />
              <Route 
                path="/create-team" 
                element={
                    isAuthenticated ? 
                    <CreateTeams setAuth={setAuth} /> : 
                    <Navigate to="/login" replace />
                } 
            />
            <Route
                path="/team-details/:id"
                element={
                    isAuthenticated ?
                    <TeamDash setAuth={setAuth} /> :
                    <Navigate to="/login" replace />
                }
            />
            <Route path="/team/:teamId" element={<TeamDash setAuth={setAuth} />} />

        </Routes>
    );
};

export default AppRoute;
