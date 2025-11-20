import { Router } from 'express';
import { getTransactions, getChiffreAffaires, createTransactionCtrl } from '../controllers/transactions.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

/**
 * Route GET /api/transactions
 * Récupère toutes les transactions (décodées)
 */
router.get('/', authenticateToken, getTransactions);

/**
 * Route GET /api/transactions/ca
 * Récupère le chiffre d'affaires par mois
 */
router.get('/ca', authenticateToken, getChiffreAffaires);

/**
 * Route POST /api/transactions
 * Crée une nouvelle transaction (encodée en BDD)
 */
router.post('/', authenticateToken, createTransactionCtrl);

export default router;

