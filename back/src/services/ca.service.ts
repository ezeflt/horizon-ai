import { Collection } from 'mongodb';
import { getDatabase } from './database.service';
import { encrypt, decrypt } from './encryption.service';

/**
 * Interface pour le chiffre d'affaires (stocké encodé en BDD)
 */
export interface CADocument {
  _id?: string;
  year: number;
  month: number;
  caEncoded: string; // Chiffre d'affaires encodé
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface pour le chiffre d'affaires (pour l'UI)
 */
export interface CA {
  _id?: string;
  year: number;
  month: number;
  ca: number;
  monthName: string;
  createdAt: Date;
  updatedAt: Date;
}

const monthNames = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

/**
 * Obtient la collection du chiffre d'affaires
 */
export const getCACollection = (): Collection<CADocument> => {
  try {
    const db = getDatabase();
    return db.collection<CADocument>('chiffre_affaires');
  } catch (error) {
    console.error('❌ Erreur lors de l\'accès à la collection CA:', error);
    throw new Error('Impossible d\'accéder à la collection chiffre_affaires');
  }
};

/**
 * Crée ou met à jour le chiffre d'affaires pour un mois donné
 */
export const createOrUpdateCA = async (
  year: number,
  month: number,
  ca: number
): Promise<CA> => {
  try {
    console.log(`🔄 Création/mise à jour du CA: année=${year}, mois=${month}, ca=${ca}`);
    
    const collection = getCACollection();
    
    // Encoder le CA
    const caEncoded = encrypt(ca.toString());
    console.log(`✅ CA encodé en Base64: ${caEncoded.substring(0, 20)}...`);
    
    const caDoc: Omit<CADocument, '_id'> = {
      year,
      month,
      caEncoded,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Chercher si existe déjà
    const existing = await collection.findOne({ year, month });
    
    if (existing) {
      console.log(`📝 CA existant trouvé, mise à jour...`);
      // Mettre à jour
      const updateResult = await collection.updateOne(
        { year, month },
        {
          $set: {
            caEncoded,
            updatedAt: new Date()
          }
        }
      );
      
      console.log(`✅ CA mis à jour: ${updateResult.modifiedCount} document(s) modifié(s)`);
      
      return {
        _id: existing._id?.toString(),
        year,
        month,
        ca,
        monthName: monthNames[month - 1],
        createdAt: existing.createdAt,
        updatedAt: new Date()
      };
    } else {
      console.log(`➕ Nouveau CA, création...`);
      // Créer
      const result = await collection.insertOne(caDoc);
      
      console.log(`✅ CA créé avec l'ID: ${result.insertedId}`);
      
      return {
        _id: result.insertedId.toString(),
        year,
        month,
        ca,
        monthName: monthNames[month - 1],
        createdAt: caDoc.createdAt,
        updatedAt: caDoc.updatedAt
      };
    }
  } catch (error) {
    console.error('❌ Erreur lors de la création/mise à jour du CA:', error);
    if (error instanceof Error) {
      console.error('Détails de l\'erreur:', error.message);
      console.error('Stack trace:', error.stack);
    }
    throw new Error(`Impossible de créer/mettre à jour le CA: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
};

/**
 * Récupère le chiffre d'affaires pour une année donnée
 */
export const getCAByYear = async (year: number): Promise<CA[]> => {
  try {
    const collection = getCACollection();
    const caDocs = await collection.find({ year }).sort({ month: 1 }).toArray();
    
    // Décoder les données
    return caDocs.map(doc => ({
      _id: doc._id?.toString(),
      year: doc.year,
      month: doc.month,
      ca: parseFloat(decrypt(doc.caEncoded)),
      monthName: monthNames[doc.month - 1],
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération du CA:', error);
    throw new Error(`Impossible de récupérer le CA: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
};

/**
 * Calcule le chiffre d'affaires total pour une année
 */
export const getTotalCAByYear = async (year: number): Promise<number> => {
  try {
    const caList = await getCAByYear(year);
    return caList.reduce((total, ca) => total + ca.ca, 0);
  } catch (error) {
    console.error('Erreur lors du calcul du CA total:', error);
    throw new Error(`Impossible de calculer le CA total: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
};

/**
 * Récupère tous les chiffres d'affaires
 */
export const getAllCA = async (): Promise<CA[]> => {
  try {
    const collection = getCACollection();
    const caDocs = await collection.find({}).sort({ year: -1, month: 1 }).toArray();
    
    // Décoder les données
    return caDocs.map(doc => ({
      _id: doc._id?.toString(),
      year: doc.year,
      month: doc.month,
      ca: parseFloat(decrypt(doc.caEncoded)),
      monthName: monthNames[doc.month - 1],
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération de tous les CA:', error);
    throw new Error(`Impossible de récupérer les CA: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
};

