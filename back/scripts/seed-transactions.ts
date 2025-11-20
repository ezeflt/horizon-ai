/**
 * Script pour insérer des données simulées de transactions
 * Septembre: 100k€
 * Octobre: 10k€
 * Novembre: 300k€
 */

import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import { encrypt } from '../src/services/encryption.service';

dotenv.config();

const MONTHS = {
  septembre: { month: 9, year: 2024, targetCA: 100000 },
  octobre: { month: 10, year: 2024, targetCA: 10000 },
  novembre: { month: 11, year: 2024, targetCA: 300000 }
};

const CLIENTS = [
  'Client A', 'Client B', 'Client C', 'Client D', 'Client E',
  'Client F', 'Client G', 'Client H', 'Client I', 'Client J',
  'Entreprise X', 'Entreprise Y', 'Entreprise Z', 'Société Alpha', 'Société Beta'
];

async function seedTransactions() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI n\'est pas définie');
  }

  const client = new MongoClient(mongoUri);
  
  try {
    await client.connect();
    const dbName = process.env.MONGODB_DB_NAME || 'horizon-ai';
    const db = client.db(dbName);
    const collection = db.collection('transactions');

    // Vider la collection existante
    await collection.deleteMany({});
    console.log('✅ Collection vidée');

    const allTransactions: any[] = [];

    // Générer des transactions pour chaque mois
    for (const [monthName, { month, year, targetCA }] of Object.entries(MONTHS)) {
      console.log(`\n📊 Génération des transactions pour ${monthName} (CA cible: ${targetCA.toLocaleString('fr-FR')}€)`);
      
      let totalGenerated = 0;
      const transactions: any[] = [];
      
      // Générer des transactions jusqu'à atteindre le CA cible
      while (totalGenerated < targetCA) {
        const clientName = CLIENTS[Math.floor(Math.random() * CLIENTS.length)];
        // Montant aléatoire entre 100 et 10000€
        const montant = Math.floor(Math.random() * 9900) + 100;
        
        // S'assurer qu'on ne dépasse pas le CA cible
        const remaining = targetCA - totalGenerated;
        const finalMontant = montant > remaining ? remaining : montant;
        
        // Date aléatoire dans le mois
        const daysInMonth = new Date(year, month, 0).getDate();
        const day = Math.floor(Math.random() * daysInMonth) + 1;
        const date = new Date(year, month - 1, day, Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
        
        // Chiffrer les données
        const transaction = {
          clientEncrypted: encrypt(clientName),
          montantEncrypted: encrypt(finalMontant.toString()),
          date: date,
          createdAt: new Date()
        };
        
        transactions.push(transaction);
        totalGenerated += finalMontant;
      }
      
      allTransactions.push(...transactions);
      console.log(`  ✓ ${transactions.length} transactions générées (CA: ${totalGenerated.toLocaleString('fr-FR')}€)`);
    }

    // Insérer toutes les transactions
    if (allTransactions.length > 0) {
      await collection.insertMany(allTransactions);
      console.log(`\n✅ ${allTransactions.length} transactions insérées avec succès !`);
    }

    // Vérification
    const count = await collection.countDocuments();
    console.log(`\n📈 Total de transactions en base: ${count}`);

  } catch (error) {
    console.error('❌ Erreur:', error);
    throw error;
  } finally {
    await client.close();
    console.log('\n✅ Connexion fermée');
  }
}

// Exécuter le script
seedTransactions()
  .then(() => {
    console.log('\n🎉 Script terminé avec succès !');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Erreur fatale:', error);
    process.exit(1);
  });

