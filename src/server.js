//carga las variables de entorno
import 'dotenv/config'; 
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';
import {v2 as cloudinary} from 'cloudinary';

import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import e from 'cors';

cloudinary.config({
    secure: true,
    //cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    //api_key: process.env.CLOUDINARY_API_KEY,
    //api_secret: process.env.CLOUDINARY_API_SECRET
});

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.post('/test', (req, res) => {res.json({ ok: true });});
app.get('/', (req, res) => res.json({ok: true, name: 'Brandon Todo API'}));
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

const {PORT = 5555, MONGO_URI} = process.env;
mongoose.connect(process.env.MONGO_URI, {dbName: 'BackPWA'})
    .then(() => {
        console.log('Cloudinary configurado con seguridad');
        console.log('Conectado a mongoDB', mongoose.connection.name);
        app.listen(PORT, () => console.log(`Servidor ejecutandose por: ${PORT}`));
    })
    .catch(err =>{
        console.error('Error conectado a mongoDB', err);
        process.exit(1);
    });