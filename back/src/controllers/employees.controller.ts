import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import {
  getAllEmployees,
  createEmployee,
  getEmployer,
  createOrUpdateEmployer
} from '../services/employees.service';

/**
 * Controller pour récupérer tous les employés
 */
export const getEmployees = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const employees = await getAllEmployees();
    
    res.status(200).json({
      success: true,
      data: { employees }
    });
  } catch (error) {
    console.error('Erreur dans getEmployees:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
};

/**
 * Controller pour récupérer l'employeur
 */
export const getEmployerCtrl = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const employer = await getEmployer();
    
    res.status(200).json({
      success: true,
      data: { employer }
    });
  } catch (error) {
    console.error('Erreur dans getEmployerCtrl:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
};

/**
 * Controller pour créer un employé
 */
export const createEmployeeCtrl = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { nom, prenom, age } = req.body;
    
    if (!nom || typeof nom !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Le champ "nom" est requis'
      });
      return;
    }
    
    if (!prenom || typeof prenom !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Le champ "prenom" est requis'
      });
      return;
    }
    
    if (!age || typeof age !== 'number') {
      res.status(400).json({
        success: false,
        error: 'Le champ "age" est requis et doit être un nombre'
      });
      return;
    }
    
    const employee = await createEmployee(nom, prenom, age);
    
    res.status(201).json({
      success: true,
      data: { employee }
    });
  } catch (error) {
    console.error('Erreur dans createEmployeeCtrl:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
};

/**
 * Controller pour créer ou mettre à jour l'employeur
 */
export const createEmployerCtrl = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { nom, prenom } = req.body;
    
    if (!nom || typeof nom !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Le champ "nom" est requis'
      });
      return;
    }
    
    if (!prenom || typeof prenom !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Le champ "prenom" est requis'
      });
      return;
    }
    
    const employer = await createOrUpdateEmployer(nom, prenom);
    
    res.status(201).json({
      success: true,
      data: { employer }
    });
  } catch (error) {
    console.error('Erreur dans createEmployerCtrl:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
};

