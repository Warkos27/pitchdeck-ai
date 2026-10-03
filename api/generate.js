import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  try {
    const { problem, solution, target } = req.body;
    const modelId = "amazon.nova-pro-v1:0";


    
    const systemPrompt = `Eres un experto de Silicon Valley. Crea un Pitch Deck masivo y detallado de 10 diapositivas.
        REGLA 1 (DINÁMICO): Inventa títulos ÚNICOS basados en el proyecto.
        REGLA 2 (VARIEDAD): Debes usar los 6 layouts disponibles de forma intercalada para que el diseño no se repita seguido. Layouts permitidos: "center-hero", "grid", "large-text", "split", "big-stat", "cards".
        REGLA 3 (ESPACIO): Los textos en "points" deben ser directos (máximo 15 palabras).
        Esquema JSON esperado: {"slides": [{"layout": "center-hero", "title": "...", "subtitle": "...", "points": ["..."]}, ... 9 diapositivas más ...], "script": "..."}`;

    const userContent = `Problema: ${problem}\nSolución: ${solution}\nMercado/Target: ${target}`;
    const payload = {
      inferenceConfig: { max_new_tokens: 2000, temperature: 0.7, topP: 0.9 },
      system: [{ text: systemPrompt }],
      messages: [{ role: "user", content: [{ text: userContent }] }]
    };

    const command = new InvokeModelCommand({
      modelId, contentType: "application/json", accept: "application/json", body: JSON.stringify(payload)
    });

    const response = await client.send(command);
    const parsedResponse = JSON.parse(new TextDecoder().decode(response.body));
    const rawText = parsedResponse.output.message.content[0].text;
    const cleanJsonString = rawText.replace(/```json/g, "").replace(/```/g, "").trim();

    return res.status(200).json({ pitchDeck: JSON.parse(cleanJsonString) });
  } catch (error) {
    console.error("Error al generar pitch deck en servidor:", error);
    return res.status(500).json({ error: "Error interno del servidor al procesar el pitch deck." });
  }
}