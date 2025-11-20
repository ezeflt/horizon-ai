import React, { useState, useEffect, useRef } from 'react';

const HorizonAIChat = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [token, setToken] = useState('');
  const [userId, setUserId] = useState('');
  
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  // Vérifier l'authentification au chargement
  useEffect(() => {
    const savedToken = localStorage.getItem('horizon_ai_token');
    const savedUserId = localStorage.getItem('horizon_ai_userId');

    if (savedToken && savedUserId) {
      setToken(savedToken);
      setUserId(savedUserId);
      setIsAuthenticated(true);
      setShowLogin(false);
      loadChatHistory(savedToken);
    }
    setIsLoading(false);
  }, []);

  // Scroll vers le bas quand de nouveaux messages arrivent
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Charger l'historique du chat
  const loadChatHistory = async (authToken) => {
    try {
      const response = await fetch(`${apiUrl}/api/chat/history`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.messages) {
          setMessages(data.data.messages);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error);
    }
  };

  // Gestion de l'authentification
  const handleAuth = async (e) => {
    e.preventDefault();
    setLoginError('');

    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const response = await fetch(`${apiUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur d\'authentification');
      }

      if (data.success && data.data) {
        const { userId: newUserId, token: newToken } = data.data;
        setToken(newToken);
        setUserId(newUserId);
        setIsAuthenticated(true);
        setShowLogin(false);
        
        localStorage.setItem('horizon_ai_token', newToken);
        localStorage.setItem('horizon_ai_userId', newUserId);
        
        await loadChatHistory(newToken);
      }
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  // Envoyer un message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || isSending) return;

    const userMessage = {
      role: 'user',
      content: inputMessage.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsSending(true);

    try {
      const response = await fetch(`${apiUrl}/api/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: userMessage.content })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'envoi du message');
      }

      if (data.success && data.data) {
        const assistantMessage = {
          role: 'assistant',
          content: data.data.response,
          timestamp: data.data.timestamp
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (err) {
      console.error('Erreur:', err);
      const errorMessage = {
        role: 'assistant',
        content: `Erreur: ${err instanceof Error ? err.message : 'Une erreur est survenue'}`
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
    }
  };

  // Déconnexion
  const handleLogout = () => {
    localStorage.removeItem('horizon_ai_token');
    localStorage.removeItem('horizon_ai_userId');
    setToken('');
    setUserId('');
    setIsAuthenticated(false);
    setShowLogin(true);
    setMessages([]);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // Page de login/register
  if (showLogin || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">🚀 Horizon AI</h1>
            <p className="text-gray-600">Chat IA avec authentification</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="votre@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="••••••••"
              />
            </div>

            {loginError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{loginError}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 px-6 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              {isRegister ? 'Créer un compte' : 'Se connecter'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setLoginError('');
              }}
              className="text-sm text-indigo-600 hover:text-indigo-700"
            >
              {isRegister 
                ? 'Déjà un compte ? Se connecter' 
                : 'Pas de compte ? Créer un compte'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Interface de chat
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">🚀 Horizon AI Chat</h1>
            <p className="text-sm text-gray-600">Assistant IA intelligent</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">User: {userId.substring(0, 8)}...</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto max-w-4xl w-full mx-auto px-4 py-6">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💬</div>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">Commencez une conversation</h2>
              <p className="text-gray-500">Posez une question et l'IA vous répondra</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-800 shadow-sm border border-gray-200'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                </div>
              </div>
            ))
          )}
          {isSending && (
            <div className="flex justify-start">
              <div className="bg-white rounded-lg px-4 py-3 shadow-sm border border-gray-200">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Tapez votre message..."
              disabled={isSending}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isSending}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isSending ? '...' : 'Envoyer'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default HorizonAIChat;

