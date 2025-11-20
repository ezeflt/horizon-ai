import jwt, { SignOptions } from 'jsonwebtoken';
import type { StringValue } from 'ms';
import bcrypt from 'bcryptjs';
import { MongoClient, Db, Collection } from 'mongodb';

/**
 * Interface pour les utilisateurs
 */
export interface User {
  _id?: string;
  userId: string;
  email?: string;
  password?: string;
  createdAt: Date;
  lastLogin?: Date;
}

let usersCollection: Collection<User> | null = null;

/**
 * Initialise la collection des utilisateurs
 */
export const initializeAuthService = (db: Db): void => {
  usersCollection = db.collection<User>('users');
  
  // Créer un index unique sur userId
  usersCollection.createIndex({ userId: 1 }, { unique: true }).catch(console.error);
};

/**
 * Génère un token JWT pour un utilisateur
 */
export const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    throw new Error('JWT_SECRET n\'est pas définie dans les variables d\'environnement');
  }

  const expiresIn = (process.env.JWT_EXPIRES_IN || '7d') as StringValue | number;
  const options: SignOptions = { expiresIn };
  
  return jwt.sign(
    { userId: userId },
    secret,
    options
  );
};

/**
 * Vérifie et décode un token JWT
 */
export const verifyToken = (token: string): { userId: string } => {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    throw new Error('JWT_SECRET n\'est pas définie dans les variables d\'environnement');
  }

  try {
    const decoded = jwt.verify(token, secret) as { userId: string };
    return decoded;
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Token invalide');
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expiré');
    }
    throw new Error('Erreur de vérification du token');
  }
};

/**
 * Crée un utilisateur avec email et mot de passe
 */
export const createUser = async (email: string, password: string): Promise<{ userId: string; token: string }> => {
  if (!usersCollection) {
    throw new Error('Service d\'authentification non initialisé');
  }

  // Vérifier si l'email existe déjà
  const existingUser = await usersCollection.findOne({ email });
  if (existingUser) {
    throw new Error('Cet email est déjà utilisé');
  }

  // Hasher le mot de passe
  const hashedPassword = await bcrypt.hash(password, 10);
  const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  // Créer l'utilisateur
  await usersCollection.insertOne({
    userId: userId,
    email: email,
    password: hashedPassword,
    createdAt: new Date()
  });

  // Générer le token
  const token = generateToken(userId);

  return { userId, token };
};

/**
 * Authentifie un utilisateur avec email et mot de passe
 */
export const authenticateUser = async (email: string, password: string): Promise<{ userId: string; token: string }> => {
  if (!usersCollection) {
    throw new Error('Service d\'authentification non initialisé');
  }

  const user = await usersCollection.findOne({ email });
  if (!user || !user.password) {
    throw new Error('Email ou mot de passe incorrect');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error('Email ou mot de passe incorrect');
  }

  // Mettre à jour la dernière connexion
  await usersCollection.updateOne(
    { userId: user.userId },
    { $set: { lastLogin: new Date() } }
  );

  const token = generateToken(user.userId);

  return { userId: user.userId, token };
};

/**
 * Récupère un utilisateur par son userId
 */
export const getUserById = async (userId: string): Promise<User | null> => {
  if (!usersCollection) {
    throw new Error('Service d\'authentification non initialisé');
  }

  return await usersCollection.findOne({ userId });
};

