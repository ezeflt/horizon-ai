import { 
  getConversationHistory, 
  addMessageToConversation,
  ChatMessage 
} from './database.service';

/**
 * Appelle l'API OpenRouter pour générer une réponse via Gemini
 * Utilise l'historique de conversation pour un contexte continu
 */
const callOpenRouterAPI = async (
  userMessage: string, 
  conversationHistory: ChatMessage[]
): Promise<string> => {
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
  
  if (!OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY n\'est pas définie dans les variables d\'environnement');
  }

  const systemInstruction = `Tu es un assistant IA utile, amical et professionnel. 
Réponds de manière claire et concise aux questions de l'utilisateur.`;

  // Construire les messages avec l'historique
  const messages: Array<{ role: string; content: string }> = [
    {
      role: "system",
      content: systemInstruction
    }
  ];

  // Ajouter l'historique de conversation (limité aux 10 derniers messages pour le contexte)
  const recentHistory = conversationHistory.slice(-10);
  recentHistory.forEach(msg => {
    messages.push({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    });
  });

  // Ajouter le nouveau message de l'utilisateur
  messages.push({
    role: "user",
    content: userMessage
  });

  // Modèle configurable via variable d'environnement, avec fallback
  const model = process.env.OPENROUTER_MODEL || "google/gemini-2.0-flash-exp:free";
  
  const requestBody = {
    model: model,
    messages: messages
  };

  // Fonction de retry avec backoff exponentiel
  const retryWithBackoff = async (attempt: number = 1, maxRetries: number = 3): Promise<Response> => {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
          'X-Title': 'Horizon AI Chat'
        },
        body: JSON.stringify(requestBody)
      });

      // Si rate limit (429), retry avec backoff
      if (response.status === 429 && attempt < maxRetries) {
        const waitTime = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
        console.log(`⏳ Rate limit atteint, nouvelle tentative dans ${waitTime}ms (tentative ${attempt}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        return retryWithBackoff(attempt + 1, maxRetries);
      }

      return response;
    } catch (error) {
      if (attempt < maxRetries) {
        const waitTime = Math.pow(2, attempt) * 1000;
        console.log(`⏳ Erreur réseau, nouvelle tentative dans ${waitTime}ms (tentative ${attempt}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        return retryWithBackoff(attempt + 1, maxRetries);
      }
      throw error;
    }
  };

  try {
    const response = await retryWithBackoff();

    if (!response.ok) {
      let errorData: any;
      try {
        errorData = await response.json();
      } catch {
        const errorText = await response.text();
        errorData = { error: { message: errorText } };
      }
      
      // Message d'erreur plus clair pour les rate limits
      if (response.status === 429) {
        throw new Error('Le service est temporairement surchargé. Veuillez réessayer dans quelques instants. Si le problème persiste, le modèle gratuit peut être limité - consultez la documentation pour utiliser un autre modèle.');
      }
      
      throw new Error(`Erreur API OpenRouter: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json() as {
      choices?: Array<{
        message?: {
          content?: string;
        };
      }>;
    };
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Format de réponse invalide de l\'API OpenRouter');
    }

    return data.choices[0].message.content || 'Aucune réponse générée';
  } catch (error) {
    console.error('Erreur lors de l\'appel à OpenRouter:', error);
    
    // Message d'erreur plus user-friendly
    if (error instanceof Error) {
      if (error.message.includes('429') || error.message.includes('rate limit')) {
        throw new Error('Le service est temporairement surchargé. Veuillez réessayer dans quelques instants.');
      }
      throw error;
    }
    
    throw new Error(`Erreur lors de l'appel à l'API LLM: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
};

/**
 * Service principal pour le chat IA
 * @param userMessage - Le message de l'utilisateur
 * @param userId - L'identifiant de l'utilisateur authentifié
 * @returns La réponse générée par le LLM
 */
export const sendChatMessage = async (
  userMessage: string, 
  userId: string
): Promise<{ response: string; timestamp: string }> => {
  try {
    // Récupérer l'historique de conversation
    const conversationHistory = await getConversationHistory(userId);
    
    // Enregistrer le message de l'utilisateur
    await addMessageToConversation(userId, 'user', userMessage);
    
    // Appel à l'API OpenRouter avec l'historique
    const assistantResponse = await callOpenRouterAPI(userMessage, conversationHistory);
    
    // Enregistrer la réponse de l'assistant
    await addMessageToConversation(userId, 'assistant', assistantResponse);

    return {
      response: assistantResponse,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Erreur dans sendChatMessage:', error);
    throw error;
  }
};

/**
 * Récupère l'historique de conversation d'un utilisateur
 */
export const getChatHistory = async (userId: string): Promise<ChatMessage[]> => {
  return await getConversationHistory(userId);
};

