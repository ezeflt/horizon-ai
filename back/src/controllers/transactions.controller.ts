import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import {
  getAllTransactions,
  getChiffreAffairesByMonth,
  getChiffreAffairesTotal,
  createTransaction
} from '../services/transactions.service';

/**
 * Controller pour récupérer toutes les transactions
 */
export const getTransactions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const transactions = await getAllTransactions();
    
    res.status(200).json({
      success: true,
      data: { transactions }
    });
  } catch (error) {
    console.error('Erreur dans getTransactions:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
};

/**
 * Controller pour récupérer le chiffre d'affaires par mois
 */
export const getChiffreAffaires = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const year = parseInt(req.query.year as string) || new Date().getFullYear();
    const monthlyCA = await getChiffreAffairesByMonth(year);
    const totalCA = await getChiffreAffairesTotal(year);
    
    res.status(200).json({
      success: true,
      data: {
        year,
        monthlyCA,
        totalCA
      }
    });
  } catch (error) {
    console.error('Erreur dans getChiffreAffaires:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
};

/**
 * Controller pour créer une transaction (pour les données simulées)
 */
export const createTransactionCtrl = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { client, montant, date } = req.body;
    
    if (!client || typeof client !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Le champ "client" est requis'
      });
      return;
    }
    
    if (!montant || typeof montant !== 'number') {
      res.status(400).json({
        success: false,
        error: 'Le champ "montant" est requis et doit être un nombre'
      });
      return;
    }
    
    const transactionDate = date ? new Date(date) : new Date();
    const transaction = await createTransaction(client, montant, transactionDate);
    
    res.status(201).json({
      success: true,
      data: { transaction }
    });
  } catch (error) {
    console.error('Erreur dans createTransactionCtrl:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
};

