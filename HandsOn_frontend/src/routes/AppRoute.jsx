import { Routes, Route } from "react-router-dom";
import HomePage from "../Pages/HomePage";
import Login from "../Pages/login";
import Registration from "../Pages/registration";

const AppRoute = () => {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Registration />} />
        </Routes>
    )
}


export default AppRoute;
