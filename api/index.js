//api/index.js
import "dotenv/config";
import app from "../src/app.js";
import { connectToDB } from "../src/db/connect.js";

await connectToDB(); //Conectar a la base de datos antes de iniciar el servidor

export default app; //Express como handle para vercel, indica que archivo va a leer
