const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");

// Inicializa AWS leyendo las llaves de tu archivo .env
const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Endpoint seguro con CORS habilitado
exports.chatWithNovaBackend = onRequest({ cors: true }, async (req, res) => {
  try {
    const { userMessage } = req.body;

    if (!userMessage) {
      return res.status(400).json({ error: "No se proporcionó un mensaje." });
    }

    const payload = {
      inferenceConfig: { maxNextToken: 300, temperature: 0.7 },
      system: [{ text: "Eres Nova, la IA asistente de PitchDeck AI. Responde de forma muy breve (1 o 2 oraciones máximo), amigable y conversacional. Actúa como un experto de Silicon Valley que está ayudando a un emprendedor. Responde siempre en español." }],
      messages: [{ role: "user", content: [{ text: userMessage }] }],
    };

    const command = new InvokeModelCommand({
      modelId: "amazon.nova-pro-v1:0",
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify(payload),
    });

    const response = await client.send(command);
    const parsedResponse = JSON.parse(new TextDecoder().decode(response.body));
    const aiReply = parsedResponse.output.message.content[0].text;

    // Devuelve la respuesta de Nova al frontend
    res.status(200).json({ reply: aiReply });
  } catch (error) {
    logger.error("Error conectando con Amazon Nova:", error);
    res.status(500).json({ error: "Error interno del servidor al contactar con la IA." });
  }
});