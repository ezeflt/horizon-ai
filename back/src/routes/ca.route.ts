import { Router } from 'express';
import { getCA, createCACtrl, getAllCACtrl } from '../controllers/ca.controller';
import { addData } from '../controllers/data.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

/**
 * Route GET /api/ca
 * Récupère le chiffre d'affaires pour une année donnée (query param: year)
 */
router.get('/', authenticateToken, getCA);

/**
 * Route GET /api/ca/all
 * Récupère tous les chiffres d'affaires
 */
router.get('/all', authenticateToken, getAllCACtrl);

/**
 * Route POST /api/ca
 * Crée ou met à jour le chiffre d'affaires pour un mois donné (encodé en BDD)
 */
router.post('/', authenticateToken, createCACtrl);

/**
 * Route POST /api/ca/add-data
 * Ajoute toutes les données simulées (CA + employés + employeur)
 */
router.post('/add-data', authenticateToken, addData);

export default router;

