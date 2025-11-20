import { Router } from 'express';
import { getEmployees, getEmployerCtrl, createEmployeeCtrl, createEmployerCtrl } from '../controllers/employees.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

/**
 * Route GET /api/employees
 * Récupère tous les employés (décodés)
 */
router.get('/', authenticateToken, getEmployees);

/**
 * Route GET /api/employees/employer
 * Récupère l'employeur (décodé)
 */
router.get('/employer', authenticateToken, getEmployerCtrl);

/**
 * Route POST /api/employees
 * Crée un nouvel employé (encodé en BDD)
 */
router.post('/', authenticateToken, createEmployeeCtrl);

/**
 * Route POST /api/employees/employer
 * Crée ou met à jour l'employeur (encodé en BDD)
 */
router.post('/employer', authenticateToken, createEmployerCtrl);

export default router;

