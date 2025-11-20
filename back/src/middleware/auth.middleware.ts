import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/auth.service';

/**
 * Interface pour étendre Request avec les données d'authentification
 */
export interface AuthRequest extends Request {
  userId?: string;
}

/**
 * Middleware d'authentification JWT
 * Vérifie le token JWT dans le header Authorization
 */
export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Token d\'authentification manquant. Utilisez le header: Authorization: Bearer <token>'
      });
      return;
    }

    // Vérifier et décoder le token
    const decoded = verifyToken(token);
    req.userId = decoded.userId;
    
    next();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur d\'authentification';
    res.status(401).json({
      success: false,
      error: errorMessage
    });
  }
};

