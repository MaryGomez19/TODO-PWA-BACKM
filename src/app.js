import express from "express";
import cors from "cors";
import morgan from "morgan";
import authRoutes from "./routes/authRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
//import { connectToDB } from "./db/connect.js";

const app = express();

app.use(cors({
    origin:[
        "http://localhost:5173",
        process.env.FRONT_ORIGIN || "" 
    ].filter(Boolean),
    credentials: true
})

);

app.use(express.json());
app.use(morgan("dev"));

//conectar a la base de datos de mongodb
//app.use(async (_req, _res, next) => {
    
    //try {
        //await connectToDB(); next();
    //} catch (error) { next(error); }
//});

app.get("/", (_req, res) => res.json({ok:true, name: "Bienvenido a la API de tareas"})); 
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

export default app;
