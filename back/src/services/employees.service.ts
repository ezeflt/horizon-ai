import { Collection } from 'mongodb';
import { getDatabase } from './database.service';
import { encrypt, decrypt } from './encryption.service';

/**
 * Interface pour un employé (stocké encodé en BDD)
 */
export interface EmployeeDocument {
  _id?: string;
  nomEncoded: string;
  prenomEncoded: string;
  ageEncoded: string;
  createdAt: Date;
}

/**
 * Interface pour un employé (pour l'UI)
 */
export interface Employee {
  _id?: string;
  nom: string;
  prenom: string;
  age: number;
  createdAt: Date;
}

/**
 * Interface pour l'employeur (stocké encodé en BDD)
 */
export interface EmployerDocument {
  _id?: string;
  nomEncoded: string;
  prenomEncoded: string;
  createdAt: Date;
}

/**
 * Interface pour l'employeur (pour l'UI)
 */
export interface Employer {
  _id?: string;
  nom: string;
  prenom: string;
  createdAt: Date;
}

/**
 * Obtient la collection des employés
 */
export const getEmployeesCollection = (): Collection<EmployeeDocument> => {
  const db = getDatabase();
  return db.collection<EmployeeDocument>('employees');
};

/**
 * Obtient la collection de l'employeur
 */
export const getEmployerCollection = (): Collection<EmployerDocument> => {
  const db = getDatabase();
  return db.collection<EmployerDocument>('employer');
};

/**
 * Crée un employé (encode les données)
 */
export const createEmployee = async (
  nom: string,
  prenom: string,
  age: number
): Promise<Employee> => {
  try {
    const collection = getEmployeesCollection();
    
    // Encoder les données
    const nomEncoded = encrypt(nom);
    const prenomEncoded = encrypt(prenom);
    const ageEncoded = encrypt(age.toString());
    
    const employee: Omit<EmployeeDocument, '_id'> = {
      nomEncoded,
      prenomEncoded,
      ageEncoded,
      createdAt: new Date()
    };
    
    const result = await collection.insertOne(employee);
    
    // Retourner l'employé décodé
    return {
      _id: result.insertedId.toString(),
      nom,
      prenom,
      age,
      createdAt: employee.createdAt
    };
  } catch (error) {
    console.error('Erreur lors de la création de l\'employé:', error);
    throw new Error(`Impossible de créer l'employé: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
};

/**
 * Récupère tous les employés (décodés)
 */
export const getAllEmployees = async (): Promise<Employee[]> => {
  try {
    const collection = getEmployeesCollection();
    const employees = await collection.find({}).toArray();
    
    // Décoder les données
    return employees.map(emp => ({
      _id: emp._id?.toString(),
      nom: decrypt(emp.nomEncoded),
      prenom: decrypt(emp.prenomEncoded),
      age: parseInt(decrypt(emp.ageEncoded), 10),
      createdAt: emp.createdAt
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération des employés:', error);
    throw new Error(`Impossible de récupérer les employés: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
};

/**
 * Crée ou met à jour l'employeur (encode les données)
 */
export const createOrUpdateEmployer = async (
  nom: string,
  prenom: string
): Promise<Employer> => {
  try {
    const collection = getEmployerCollection();
    
    // Encoder les données
    const nomEncoded = encrypt(nom);
    const prenomEncoded = encrypt(prenom);
    
    // Supprimer l'ancien employeur s'il existe
    await collection.deleteMany({});
    
    const employer: Omit<EmployerDocument, '_id'> = {
      nomEncoded,
      prenomEncoded,
      createdAt: new Date()
    };
    
    const result = await collection.insertOne(employer);
    
    // Retourner l'employeur décodé
    return {
      _id: result.insertedId.toString(),
      nom,
      prenom,
      createdAt: employer.createdAt
    };
  } catch (error) {
    console.error('Erreur lors de la création de l\'employeur:', error);
    throw new Error(`Impossible de créer l'employeur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
};

/**
 * Récupère l'employeur (décodé)
 */
export const getEmployer = async (): Promise<Employer | null> => {
  try {
    const collection = getEmployerCollection();
    const employer = await collection.findOne({});
    
    if (!employer) {
      return null;
    }
    
    // Décoder les données
    return {
      _id: employer._id?.toString(),
      nom: decrypt(employer.nomEncoded),
      prenom: decrypt(employer.prenomEncoded),
      createdAt: employer.createdAt
    };
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'employeur:', error);
    throw new Error(`Impossible de récupérer l'employeur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
};

