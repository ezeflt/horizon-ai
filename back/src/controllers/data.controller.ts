import { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.middleware';
import { createOrUpdateCA } from '../services/ca.service';
import { createEmployee, createOrUpdateEmployer } from '../services/employees.service';

/**
 * Controller pour ajouter toutes les données simulées
 * Insère le CA pour septembre (100k€), octobre (10k€), novembre (300k€)
 * + 4 employés + 1 employeur
 */
export const addData = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const results = {
      ca: 0,
      employees: 0,
      employer: false
    };

    // 1. Insérer l'employeur
    const employer = await createOrUpdateEmployer('Dupont', 'Jean');
    results.employer = !!employer;

    // 2. Insérer 4 employés
    const employeesData = [
      { nom: 'Martin', prenom: 'Pierre', age: 32 },
      { nom: 'Bernard', prenom: 'Marie', age: 28 },
      { nom: 'Dubois', prenom: 'Thomas', age: 35 },
      { nom: 'Laurent', prenom: 'Sophie', age: 30 }
    ];

    for (const emp of employeesData) {
      await createEmployee(emp.nom, emp.prenom, emp.age);
      results.employees++;
    }

    // 3. Insérer le CA pour septembre (100k€)
    await createOrUpdateCA(2024, 9, 100000);
    results.ca++;

    // 4. Insérer le CA pour octobre (10k€)
    await createOrUpdateCA(2024, 10, 10000);
    results.ca++;

    // 5. Insérer le CA pour novembre (300k€)
    await createOrUpdateCA(2024, 11, 300000);
    results.ca++;

    res.status(201).json({
      success: true,
      data: {
        message: 'Données ajoutées avec succès',
        results
      }
    });
  } catch (error) {
    console.error('Erreur dans addData:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
};
