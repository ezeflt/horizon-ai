import React, { useState, useEffect, useRef } from 'react';

const HorizonAI = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [token, setToken] = useState('');
  const [userId, setUserId] = useState('');
  
  // États pour les données
  const [monthlyCA, setMonthlyCA] = useState([]);
  const [totalCA, setTotalCA] = useState(0);
  const [employees, setEmployees] = useState([]);
  const [employer, setEmployer] = useState(null);
  const [loadingData, setLoadingData] = useState(false);
  
  // Constante pour les noms des mois
  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  
  // États pour l'analyse IA
  const [analysisQuery, setAnalysisQuery] = useState('');
  const [analysisResult, setAnalysisResult] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isChatMinimized, setIsChatMinimized] = useState(false);
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
      loadData(savedToken);
    }
    setIsLoading(false);
  }, []);

  // Scroll vers le bas pour l'analyse IA
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [analysisResult]);

  // Charger les données
  const loadData = async (authToken) => {
    setLoadingData(true);
    try {
      // Charger le CA
      const currentYear = new Date().getFullYear();
      const caRes = await fetch(`${apiUrl}/api/ca?year=${currentYear}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (caRes.ok) {
        const caData = await caRes.json();
        if (caData.success) {
          setMonthlyCA(caData.data.monthlyCA);
          setTotalCA(caData.data.totalCA);
        }
      }

      // Charger les employés
      const employeesRes = await fetch(`${apiUrl}/api/employees`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (employeesRes.ok) {
        const data = await employeesRes.json();
        if (data.success) {
          setEmployees(data.data.employees);
        }
      }

      // Charger l'employeur
      const employerRes = await fetch(`${apiUrl}/api/employees/employer`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (employerRes.ok) {
        const data = await employerRes.json();
        if (data.success) {
          setEmployer(data.data.employer);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoadingData(false);
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
        headers: { 'Content-Type': 'application/json' },
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
        
        await loadData(newToken);
      }
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };


  // Analyser avec IA
  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!analysisQuery.trim() || isAnalyzing) return;

    setIsAnalyzing(true);
    const userQuery = analysisQuery.trim();
    setAnalysisQuery('');

    try {
      const response = await fetch(`${apiUrl}/api/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: userQuery })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'analyse');
      }

      if (data.success && data.data) {
        setAnalysisResult(prev => {
          const separator = prev ? '\n\n' : '';
          return prev + `${separator}Vous: ${userQuery}\n\nIA: ${data.data.response}`;
        });
      }
    } catch (err) {
      setAnalysisResult(prev => prev + `\n\nErreur: ${err instanceof Error ? err.message : 'Une erreur est survenue'}`);
    } finally {
      setIsAnalyzing(false);
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
    setMonthlyCA([]);
    setTotalCA(0);
    setEmployees([]);
    setEmployer(null);
    setAnalysisResult('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // Page de login
  if (showLogin || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl mb-4">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Horizon AI</h1>
            <p className="text-gray-600">Analyse du Chiffre d'Affaires</p>
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
                placeholder="entreprise@exemple.com"
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
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{loginError}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 px-6 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-blue-700 transition-all"
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
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              {isRegister ? 'Déjà un compte ? Se connecter' : 'Créer un compte'}
            </button>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">🚀 Horizon AI</h1>
            <p className="text-sm text-gray-600">Analyse du Chiffre d'Affaires</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{email}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      {/* Chat IA fixé en bas à droite */}
      <div className="fixed bottom-6 right-6 z-50">
        {isChatMinimized ? (
          // Chat minimisé - Bouton pour ouvrir
          <button
            onClick={() => setIsChatMinimized(false)}
            className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-full w-16 h-16 shadow-2xl flex items-center justify-center hover:from-indigo-700 hover:to-blue-700 transition-all"
            title="Ouvrir le chat IA"
          >
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </button>
        ) : (
          // Chat ouvert
          <div className={`bg-white rounded-2xl shadow-2xl border border-gray-200 transition-all duration-300 ${analysisResult ? 'w-96 h-[600px]' : 'w-96 h-[500px]'} flex flex-col`}>
            {/* Header du chat */}
            <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">🤖 Chat IA</h3>
                  <p className="text-xs text-white/80">Analyse du CA</p>
                </div>
              </div>
              <button
                onClick={() => setIsChatMinimized(true)}
                className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                title="Minimiser le chat"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
            </div>

          {/* Messages du chat */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {!analysisResult && !isAnalyzing && (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">Posez une question sur votre CA, vos employés ou votre entreprise</p>
              </div>
            )}

            {analysisResult && (
              <div className="space-y-4">
                {analysisResult.split(/\n\n(?=Vous:|IA:|Erreur:)/).map((part, index) => {
                  if (part.trim() === '') return null;
                  const isUser = part.startsWith('Vous:');
                  const isError = part.startsWith('Erreur:');
                  const isIA = part.startsWith('IA:');
                  
                  let content = part;
                  if (isUser) {
                    content = part.replace(/^Vous:\s*/, '').trim();
                    return (
                      <div key={index} className="flex justify-end">
                        <div className="max-w-[80%] bg-indigo-600 text-white rounded-lg px-4 py-2">
                          <p className="text-sm whitespace-pre-wrap">{content}</p>
                        </div>
                      </div>
                    );
                  } else if (isError) {
                    content = part.replace(/^Erreur:\s*/, '').trim();
                    return (
                      <div key={index} className="flex justify-start">
                        <div className="max-w-[80%] bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                          <p className="text-sm text-red-800 whitespace-pre-wrap">{content}</p>
                        </div>
                      </div>
                    );
                  } else if (isIA) {
                    content = part.replace(/^IA:\s*/, '').trim();
                    return (
                      <div key={index} className="flex justify-start">
                        <div className="max-w-[80%] bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm">
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{content}</p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            )}

            {isAnalyzing && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                    <span className="text-sm text-gray-600">L'IA analyse...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input du chat */}
          <div className="border-t border-gray-200 p-4 bg-white rounded-b-2xl">
            <form onSubmit={handleAnalyze} className="flex gap-2">
              <input
                type="text"
                value={analysisQuery}
                onChange={(e) => setAnalysisQuery(e.target.value)}
                placeholder="Posez une question..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                disabled={isAnalyzing}
              />
              <button
                type="submit"
                disabled={!analysisQuery.trim() || isAnalyzing}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all text-sm"
              >
                {isAnalyzing ? '...' : 'Envoyer'}
              </button>
            </form>
          </div>
        </div>
        )}
      </div>

      {/* Contenu principal - Tout sur une page */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24">
        


        {/* Section: Chiffre d'Affaires */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Chiffre d'Affaires réalisé à l'année</h2>
            {loadingData && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>}
          </div>
          

          {/* Résumé */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-6">
              <p className="text-sm text-gray-600 mb-1">CA Total</p>
              <p className="text-3xl font-bold text-gray-900">{totalCA.toLocaleString('fr-FR')} €</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6">
              <p className="text-sm text-gray-600 mb-1">Mois avec CA</p>
              <p className="text-3xl font-bold text-gray-900">{monthlyCA.length}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6">
              <p className="text-sm text-gray-600 mb-1">Année</p>
              <p className="text-3xl font-bold text-gray-900">{monthlyCA.length > 0 ? monthlyCA[0].year : new Date().getFullYear()}</p>
            </div>
          </div>

          {/* Liste du CA par mois */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Chiffre d'affaires par mois</h3>
            {loadingData ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Chargement...</p>
              </div>
            ) : monthlyCA.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Aucune donnée disponible</p>
              </div>
            ) : (
              <div className="space-y-3">
                {monthlyCA.map((ca, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900">{ca.monthName}</h4>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-indigo-600">
                          {ca.ca.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {monthlyCA.length > 0 && (
                  <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border-2 border-indigo-200 rounded-lg p-4 mt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-gray-900">Total {monthlyCA.length > 0 ? monthlyCA[0].year : new Date().getFullYear()}</h4>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-indigo-600">
                          {totalCA.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Section: Employés - Affichage */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">👥 Employés</h2>
          {loadingData ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Chargement...</p>
            </div>
          ) : employees.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Aucun employé disponible</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prénom</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Âge</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {employees.map((emp, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-900 font-medium">{emp.nom}</td>
                      <td className="px-4 py-3 text-gray-900">{emp.prenom}</td>
                      <td className="px-4 py-3 text-right text-gray-900">{emp.age} ans</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4 text-sm text-gray-600">
                <p><strong>Nombre total d'employés :</strong> {employees.length}</p>
              </div>
            </div>
          )}
        </div>

        {/* Section: Employeur - Affichage */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">👔 Employeur</h2>
          {loadingData ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Chargement...</p>
            </div>
          ) : !employer ? (
            <div className="text-center py-8 text-gray-500">
              <p>Aucun employeur disponible</p>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Nom</p>
                  <p className="text-lg font-semibold text-gray-900">{employer.nom}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Prénom</p>
                  <p className="text-lg font-semibold text-gray-900">{employer.prenom}</p>
                </div>
              </div>
            </div>
          )}
        </div>

      </main>
    </div>
  );
};

export default HorizonAI;
