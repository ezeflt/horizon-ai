/**
 * Service de chiffrement/déchiffrement Base64 pour les données sensibles
 * Base64 n'est pas un vrai chiffrement, mais encode les données pour qu'elles ne soient pas en clair
 */

/**
 * Encode une chaîne de caractères en Base64
 */
export const encrypt = (text: string): string => {
  try {
    const buffer = Buffer.from(text, 'utf8');
    return buffer.toString('base64');
  } catch (error) {
    console.error('Erreur lors de l\'encodage:', error);
    throw new Error('Impossible d\'encoder les données');
  }
};

/**
 * Décode une chaîne de caractères depuis Base64
 */
export const decrypt = (encodedText: string): string => {
  try {
    const buffer = Buffer.from(encodedText, 'base64');
    return buffer.toString('utf8');
  } catch (error) {
    console.error('Erreur lors du décodage:', error);
    throw new Error('Impossible de décoder les données');
  }
};

