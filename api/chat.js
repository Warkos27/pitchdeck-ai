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
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const userMessage = body?.userMessage;
    if (!userMessage) return res.status(400).json({ error: "No se proporcionó un mensaje." });

    const payload = {
      inferenceConfig: { max_new_tokens: 300, temperature: 0.7 },
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

    return res.status(200).json({ reply: aiReply });
  } catch (error) {
    console.error("Error conectando con Amazon Nova:", error);
    return res.status(500).json({ error: "Error interno del servidor al contactar con la IA." });
  }
}