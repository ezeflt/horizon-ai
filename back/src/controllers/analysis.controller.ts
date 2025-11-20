import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { sendChatMessage, getChatHistory } from '../services/analysis.service';

/**
 * Controller pour envoyer un message dans le chat
 * Valide les données d'entrée et appelle le service
 * Le userId est extrait du token JWT via le middleware d'authentification
 */
export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Validation des données d'entrée
    const { message } = req.body;
    const userId = req.userId; // Récupéré du middleware d'authentification

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      res.status(400).json({
        success: false,
        error: 'Le champ "message" est requis et doit être une chaîne de caractères non vide'
      });
      return;
    }

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Utilisateur non authentifié'
      });
      return;
    }

    // Appel du service pour le chat
    const result = await sendChatMessage(message.trim(), userId);

    // Retour de la réponse
    res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Erreur dans le controller sendMessage:', error);
    
    // Gestion des erreurs
    const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue';
    const statusCode = errorMessage.includes('API') || errorMessage.includes('MongoDB') ? 500 : 400;

    res.status(statusCode).json({
      success: false,
      error: errorMessage
    });
  }
};

/**
 * Controller pour récupérer l'historique de conversation
 */
export const getHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Utilisateur non authentifié'
      });
      return;
    }

    const history = await getChatHistory(userId);

    res.status(200).json({
      success: true,
      data: {
        messages: history
      }
    });
  } catch (error) {
    console.error('Erreur dans le controller getHistory:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue';
    res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
};

