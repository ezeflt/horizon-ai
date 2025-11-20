import { Collection } from 'mongodb';
import { getDatabase } from './database.service';
import { encrypt, decrypt } from './encryption.service';

/**
 * Interface pour une transaction (stockée chiffrée en BDD)
 */
export interface TransactionDocument {
  _id?: string;
  clientEncrypted: string;  // Client chiffré
  montantEncrypted: string; // Montant chiffré
  date: Date;
  createdAt: Date;
}

/**
 * Interface pour une transaction déchiffrée (pour l'UI)
 */
export interface Transaction {
  _id?: string;
  client: string;
  montant: number;
  date: Date;
  createdAt: Date;
}

/**
 * Obtient la collection des transactions
 */
export const getTransactionsCollection = (): Collection<TransactionDocument> => {
  const db = getDatabase();
  return db.collection<TransactionDocument>('transactions');
};

/**
 * Crée une transaction (chiffre les données sensibles)
 */
export const createTransaction = async (
  client: string,
  montant: number,
  date: Date
): Promise<Transaction> => {
  try {
    const collection = getTransactionsCollection();
    
    // Chiffrer les données sensibles
    const clientEncrypted = encrypt(client);
    const montantEncrypted = encrypt(montant.toString());
    
    const transaction: Omit<TransactionDocument, '_id'> = {
      clientEncrypted,
      montantEncrypted,
      date,
      createdAt: new Date()
    };
    
    const result = await collection.insertOne(transaction);
    
    // Retourner la transaction déchiffrée
    return {
      _id: result.insertedId.toString(),
      client,
      montant,
      date,
      createdAt: transaction.createdAt
    };
  } catch (error) {
    console.error('Erreur lors de la création de la transaction:', error);
    throw new Error(`Impossible de créer la transaction: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
};

/**
 * Récupère toutes les transactions (déchiffrées)
 */
export const getAllTransactions = async (): Promise<Transaction[]> => {
  try {
    const collection = getTransactionsCollection();
    const transactions = await collection.find({}).sort({ date: -1 }).toArray();
    
    // Déchiffrer les données
    return transactions.map(tx => ({
      _id: tx._id?.toString(),
      client: decrypt(tx.clientEncrypted),
      montant: parseFloat(decrypt(tx.montantEncrypted)),
      date: tx.date,
      createdAt: tx.createdAt
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération des transactions:', error);
    throw new Error(`Impossible de récupérer les transactions: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
};

/**
 * Récupère les transactions par mois
 */
export const getTransactionsByMonth = async (year: number, month: number): Promise<Transaction[]> => {
  try {
    const collection = getTransactionsCollection();
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    
    const transactions = await collection.find({
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ date: -1 }).toArray();
    
    // Déchiffrer les données
    return transactions.map(tx => ({
      _id: tx._id?.toString(),
      client: decrypt(tx.clientEncrypted),
      montant: parseFloat(decrypt(tx.montantEncrypted)),
      date: tx.date,
      createdAt: tx.createdAt
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération des transactions par mois:', error);
    throw new Error(`Impossible de récupérer les transactions: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
};

/**
 * Calcule le chiffre d'affaires par mois
 */
export const getChiffreAffairesByMonth = async (year: number): Promise<{ month: number; monthName: string; ca: number; transactionCount: number }[]> => {
  try {
    const allTransactions = await getAllTransactions();
    
    // Filtrer par année
    const yearTransactions = allTransactions.filter(tx => {
      const txYear = new Date(tx.date).getFullYear();
      return txYear === year;
    });
    
    // Grouper par mois
    const monthlyData: { [key: number]: { month: number; monthName: string; ca: number; transactionCount: number } } = {};
    
    const monthNames = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    
    yearTransactions.forEach(tx => {
      const month = new Date(tx.date).getMonth() + 1;
      
      if (!monthlyData[month]) {
        monthlyData[month] = {
          month,
          monthName: monthNames[month - 1],
          ca: 0,
          transactionCount: 0
        };
      }
      
      monthlyData[month].ca += tx.montant;
      monthlyData[month].transactionCount += 1;
    });
    
    // Convertir en tableau et trier par mois
    return Object.values(monthlyData).sort((a, b) => a.month - b.month);
  } catch (error) {
    console.error('Erreur lors du calcul du CA par mois:', error);
    throw new Error(`Impossible de calculer le CA: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
};

/**
 * Calcule le chiffre d'affaires total de l'année
 */
export const getChiffreAffairesTotal = async (year: number): Promise<number> => {
  try {
    const allTransactions = await getAllTransactions();
    
    // Filtrer par année et sommer
    const yearTransactions = allTransactions.filter(tx => {
      const txYear = new Date(tx.date).getFullYear();
      return txYear === year;
    });
    
    return yearTransactions.reduce((total, tx) => total + tx.montant, 0);
  } catch (error) {
    console.error('Erreur lors du calcul du CA total:', error);
    throw new Error(`Impossible de calculer le CA total: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
};

