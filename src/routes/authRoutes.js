import {Router} from 'express';
import {register, login, profile} from '../controllers/authController.js';
import {auth} from '../middleware/auth.js';

console.log('✅ authRoutes cargado');

const router = Router();
router.post('/register', register);  //Registrar un nuevo usuario
router.post('/login', login);  //Iniciar sesión de usuario / login de usuario
router.get('/profile', auth, profile);//Obtener el perfil del usuario autenticado

export default router;