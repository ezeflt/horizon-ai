import { Router } from 'express';
import {
  registerUser,
  loginUser
} from '../controllers/auth.controller';

const router = Router();

/**
 * Route POST /api/auth/register
 * Crée un utilisateur avec email/mot de passe
 */
router.post('/register', registerUser);

/**
 * Route POST /api/auth/login
 * Authentifie un utilisateur et retourne un token JWT
 */
router.post('/login', loginUser);

export default router;

