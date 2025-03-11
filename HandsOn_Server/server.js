import express from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import jwtAuth from "./routes/jwtAuth.js";
import dashboard from "./routes/dashboard.js";

const app = express();

//Middleware
app.use(express.json());
app.use(cors());

//Routes//

//Register and Login
app.use("/auth", jwtAuth);

//API
app.use("/api", userRoutes);

//Dashboard
app.use("/dashboard", dashboard);

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});

