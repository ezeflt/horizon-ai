import { Request, Response } from 'express';
import {
  createUser,
  authenticateUser
} from '../services/auth.service';

/**
 * Controller pour créer un utilisateur avec email/mot de passe
 */
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      res.status(400).json({
        success: false,
        error: 'Un email valide est requis'
      });
      return;
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      res.status(400).json({
        success: false,
        error: 'Le mot de passe doit contenir au moins 6 caractères'
      });
      return;
    }

    const { userId, token } = await createUser(email, password);

    res.status(201).json({
      success: true,
      data: {
        userId: userId,
        token: token
      }
    });
  } catch (error) {
    console.error('Erreur dans registerUser:', error);
    const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue';
    
    const statusCode = errorMessage.includes('déjà utilisé') ? 409 : 500;
    res.status(statusCode).json({
      success: false,
      error: errorMessage
    });
  }
};

/**
 * Controller pour authentifier un utilisateur
 */
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: 'Email et mot de passe sont requis'
      });
      return;
    }

    const { userId, token } = await authenticateUser(email, password);

    res.status(200).json({
      success: true,
      data: {
        userId: userId,
        token: token
      }
    });
  } catch (error) {
    console.error('Erreur dans loginUser:', error);
    const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue';
    
    res.status(401).json({
      success: false,
      error: errorMessage
    });
  }
};

