// Route serveur : relaie la conversation vers Ollama et renvoie la réponse en streaming (texte brut).

const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? "qwen2.5:3b";

const SYSTEM_PROMPT = `Tu es Nota, un petit flacon d'échantillon de parfum joyeux qui guide les utilisateurs de l'application "Le Voyage Olfactif" de Givaudan.
Le voyage compte 5 étapes : 1. Votre projet (l'idée de parfum, le produit et la cible : à qui il s'adresse), 2. Les contraintes (budget, réglementation, délais, format), 3. Famille olfactive (floral, boisé, hespéridé, oriental, fougère, chypré, gourmand…), 4. Votre brief (synthèse de tout le parcours), 5. Vos échantillons. La maison (la marque du client) est connue depuis son inscription.
Ton rôle : aider à transformer une idée en brief parfum. Réponds toujours en français, avec chaleur et simplicité, en 2 à 4 phrases maximum. Vouvoie l'utilisateur. Pose une question à la fois pour faire avancer le brief.`;

type Message = { role: "user" | "assistant"; content: string };

export async function POST(req: Request) {
  const { messages, context } = (await req.json()) as { messages: Message[]; context?: string };
  const system = context ? `${SYSTEM_PROMPT}\n\nContexte actuel : ${context}` : SYSTEM_PROMPT;

  let upstream: Response;
  try {
    upstream = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        stream: true,
        messages: [{ role: "system", content: system }, ...messages.slice(-12)],
        options: { temperature: 0.7 },
      }),
    });
  } catch {
    return new Response("Oups, je n'arrive pas à joindre Ollama. Est-il bien lancé ?", { status: 503 });
  }

  if (!upstream.ok || !upstream.body) {
    return new Response(`Ollama a répondu une erreur (${upstream.status}).`, { status: 502 });
  }

  // Ollama renvoie du NDJSON : une ligne JSON par morceau. On n'en garde que le texte.
  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";

  const stream = new ReadableStream<Uint8Array>({
    async pull(controller) {
      const { done, value } = await reader.read();
      if (done) {
        controller.close();
        return;
      }
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.trim()) continue;
        const chunk = JSON.parse(line) as { message?: { content?: string } };
        const text = chunk.message?.content;
        if (text) controller.enqueue(encoder.encode(text));
      }
    },
    cancel() {
      reader.cancel();
    },
  });

  return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
