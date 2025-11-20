import { Router } from 'express';
import { sendMessage, getHistory } from '../controllers/analysis.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

/**
 * Route POST /api/chat/message
 * Endpoint pour envoyer un message dans le chat
 * Requiert une authentification JWT (middleware)
 */
router.post('/chat/message', authenticateToken, sendMessage);

/**
 * Route GET /api/chat/history
 * Endpoint pour récupérer l'historique de conversation
 * Requiert une authentification JWT (middleware)
 */
router.get('/chat/history', authenticateToken, getHistory);

export default router;

