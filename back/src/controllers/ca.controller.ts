import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import {
  getCAByYear,
  getTotalCAByYear,
  createOrUpdateCA,
  getAllCA
} from '../services/ca.service';

/**
 * Controller pour récupérer le chiffre d'affaires par année
 */
export const getCA = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const year = parseInt(req.query.year as string) || new Date().getFullYear();
    const monthlyCA = await getCAByYear(year);
    const totalCA = await getTotalCAByYear(year);
    
    res.status(200).json({
      success: true,
      data: {
        year,
        monthlyCA,
        totalCA
      }
    });
  } catch (error) {
    console.error('Erreur dans getCA:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
};

/**
 * Controller pour créer ou mettre à jour le chiffre d'affaires
 */
export const createCACtrl = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let { year, month, ca } = req.body;
    
    // Convertir en nombres si nécessaire (car JSON peut envoyer des strings)
    year = typeof year === 'string' ? parseInt(year, 10) : year;
    month = typeof month === 'string' ? parseInt(month, 10) : month;
    ca = typeof ca === 'string' ? parseFloat(ca) : ca;
    
    if (!year || isNaN(year) || typeof year !== 'number') {
      res.status(400).json({
        success: false,
        error: 'Le champ "year" est requis et doit être un nombre valide'
      });
      return;
    }
    
    if (!month || isNaN(month) || typeof month !== 'number' || month < 1 || month > 12) {
      res.status(400).json({
        success: false,
        error: 'Le champ "month" est requis et doit être un nombre entre 1 et 12'
      });
      return;
    }
    
    if (ca === undefined || ca === null || isNaN(ca) || typeof ca !== 'number' || ca < 0) {
      res.status(400).json({
        success: false,
        error: 'Le champ "ca" est requis et doit être un nombre positif'
      });
      return;
    }
    
    console.log(`📊 Ajout du CA: Année=${year}, Mois=${month}, CA=${ca}`);
    
    const caData = await createOrUpdateCA(year, month, ca);
    
    console.log(`✅ CA ajouté avec succès: ${caData.monthName} ${caData.year} = ${caData.ca}€`);
    
    res.status(201).json({
      success: true,
      data: { ca: caData }
    });
  } catch (error) {
    console.error('❌ Erreur dans createCACtrl:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
};

/**
 * Controller pour récupérer tous les chiffres d'affaires
 */
export const getAllCACtrl = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const allCA = await getAllCA();
    
    res.status(200).json({
      success: true,
      data: { ca: allCA }
    });
  } catch (error) {
    console.error('Erreur dans getAllCACtrl:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
};

