import { MongoClient, Db, Collection } from 'mongodb';

let client: MongoClient | null = null;
let db: Db | null = null;

/**
 * Obtient l'instance de la base de données MongoDB
 */
export const getDatabase = (): Db => {
  if (!db) {
    throw new Error('MongoDB n\'est pas initialisé. Appelez initializeMongoDB() au démarrage du serveur.');
  }
  return db;
};

/**
 * Interface pour les messages de chat
 */
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

/**
 * Interface pour les conversations de chat
 */
export interface ChatConversation {
  _id?: string;
  userId: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Initialise la connexion MongoDB
 */
export const initializeMongoDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI n\'est pas définie dans les variables d\'environnement');
    }

    client = new MongoClient(mongoUri);
    await client.connect();
    
    const dbName = process.env.MONGODB_DB_NAME || 'horizon-ai';
    db = client.db(dbName);
    
    console.log('✅ MongoDB connecté avec succès');
    
    // Créer les index pour améliorer les performances
    await createIndexes();
  } catch (error) {
    console.error('Erreur de connexion MongoDB:', error);
    throw new Error('Impossible de se connecter à MongoDB');
  }
};

/**
 * Crée les index nécessaires pour optimiser les requêtes
 */
const createIndexes = async (): Promise<void> => {
  if (!db) return;

  try {
    const conversationsCollection = db.collection<ChatConversation>('conversations');
    
    // Index sur userId pour les requêtes rapides par utilisateur
    await conversationsCollection.createIndex({ userId: 1 });
    
    // Index sur updatedAt pour le tri chronologique
    await conversationsCollection.createIndex({ updatedAt: -1 });
    
    // Index pour le chiffre d'affaires
    const caCollection = db.collection('chiffre_affaires');
    await caCollection.createIndex({ year: 1, month: 1 }, { unique: true });
    await caCollection.createIndex({ year: -1 });
    
    // Index pour les transactions
    const transactionsCollection = db.collection('transactions');
    await transactionsCollection.createIndex({ date: -1 });
    await transactionsCollection.createIndex({ createdAt: -1 });
    
    console.log('✅ Index MongoDB créés');
  } catch (error) {
    console.error('Erreur lors de la création des index:', error);
  }
};

/**
 * Obtient la collection des conversations
 */
export const getConversationsCollection = (): Collection<ChatConversation> => {
  if (!db) {
    throw new Error('MongoDB n\'est pas initialisé. Appelez initializeMongoDB() au démarrage du serveur.');
  }
  return db.collection<ChatConversation>('conversations');
};

/**
 * Crée ou récupère la conversation active d'un utilisateur
 */
export const getOrCreateConversation = async (userId: string): Promise<ChatConversation> => {
  try {
    const collection = getConversationsCollection();
    
    // Chercher une conversation existante pour cet utilisateur
    const existingConversation = await collection.findOne({ userId });
    
    if (existingConversation) {
      return {
        _id: existingConversation._id?.toString(),
        userId: existingConversation.userId,
        messages: existingConversation.messages,
        createdAt: existingConversation.createdAt,
        updatedAt: existingConversation.updatedAt
      };
    }
    
    // Créer une nouvelle conversation
    const newConversation: Omit<ChatConversation, '_id'> = {
      userId,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await collection.insertOne(newConversation);
    
    return {
      _id: result.insertedId.toString(),
      userId: newConversation.userId,
      messages: newConversation.messages,
      createdAt: newConversation.createdAt,
      updatedAt: newConversation.updatedAt
    };
  } catch (error) {
    console.error('Erreur lors de la récupération/création de la conversation:', error);
    throw new Error(`Impossible de récupérer la conversation: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
};

/**
 * Ajoute un message à la conversation
 */
export const addMessageToConversation = async (
  userId: string,
  role: 'user' | 'assistant',
  content: string
): Promise<void> => {
  try {
    const collection = getConversationsCollection();
    
    const message: ChatMessage = {
      role,
      content,
      timestamp: new Date()
    };
    
    await collection.updateOne(
      { userId },
      {
        $push: { messages: message },
        $set: { updatedAt: new Date() }
      },
      { upsert: true }
    );
    
    console.log(`✅ Message ajouté à la conversation de l'utilisateur ${userId}`);
  } catch (error) {
    console.error('Erreur lors de l\'ajout du message:', error);
    throw new Error(`Impossible d'ajouter le message: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
};

/**
 * Récupère l'historique des messages d'un utilisateur
 */
export const getConversationHistory = async (userId: string, limit: number = 50): Promise<ChatMessage[]> => {
  try {
    const collection = getConversationsCollection();
    const conversation = await collection.findOne({ userId });
    
    if (!conversation || !conversation.messages) {
      return [];
    }
    
    // Retourner les derniers messages (limite)
    return conversation.messages.slice(-limit);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique:', error);
    return [];
  }
};

/**
 * Ferme la connexion MongoDB
 */
export const closeMongoDB = async (): Promise<void> => {
  if (client) {
    await client.close();
    console.log('✅ Connexion MongoDB fermée');
  }
};

