export const generatePitchDeckWithNova = async ({ problem, solution, target }) => {
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ problem, solution, target }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Error al generar el pitch deck');
    
    return data.pitchDeck;
  } catch (error) {
    console.error("Error al invocar generación en Vercel:", error);
    throw error;
  }
};

export const chatWithNova = async (userMessage) => {
  try {
    const response = await fetch('./api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userMessage }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Error en el chat');
    
    return data.reply;
  } catch (error) {
    console.error("Error en chat conversacional Nova:", error);
    return "Lo siento, tuve un problema de conexión. ¿Puedes repetirlo?";
  }
};