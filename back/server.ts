import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import analysisRoutes from './src/routes/analysis.route';
import authRoutes from './src/routes/auth.route';
import { initializeMongoDB, closeMongoDB, getDatabase } from './src/services/database.service';
import { initializeAuthService } from './src/services/auth.service';

// Charger les variables d'environnement
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Variable pour suivre l'état d'initialisation
let isInitialized = false;

// Initialiser MongoDB et les services
const initializeServices = async (): Promise<void> => {
  try {
    console.log('🔄 Initialisation de MongoDB...');
    await initializeMongoDB();
    
    // Initialiser le service d'authentification avec la base de données
    const db = getDatabase();
    initializeAuthService(db);
    
    isInitialized = true;
    console.log('✅ Tous les services sont initialisés');
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation des services:', error);
    console.error('⚠️  Le serveur ne peut pas fonctionner sans MongoDB');
    process.exit(1);
  }
};

// Gestion de l'arrêt propre
process.on('SIGINT', async () => {
  console.log('\n🛑 Arrêt du serveur...');
  await closeMongoDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Arrêt du serveur...');
  await closeMongoDB();
  process.exit(0);
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Middleware pour vérifier l'initialisation MongoDB
app.use('/api', (req, res, next) => {
  if (!isInitialized && req.path !== '/health') {
    return res.status(503).json({
      success: false,
      error: 'Service en cours d\'initialisation. Veuillez réessayer dans quelques instants.'
    });
  }
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', analysisRoutes);

// Route de santé
app.get('/health', (req, res) => {
  res.json({ 
    status: isInitialized ? 'ok' : 'initializing',
    message: isInitialized ? 'Horizon AI API is running' : 'Horizon AI API is initializing',
    mongodb: isInitialized ? 'connected' : 'connecting'
  });
});

// Démarrage du serveur
const startServer = async () => {
  try {
    // Initialiser les services avant de démarrer le serveur
    await initializeServices();
    
    app.listen(PORT, () => {
      console.log(`🚀 Serveur Horizon AI démarré sur le port ${PORT}`);
      console.log(`📡 API disponible sur http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Impossible de démarrer le serveur:', error);
    process.exit(1);
  }
};

startServer();

export default app;

