/* Appel de Nota (route /api/nota → Ollama) avec lecture du texte en streaming. */

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  /** Texte affiché à la place de `content` (ex. une question courte pour un message long). */
  display?: string;
};

export async function streamNota(
  messages: ChatMessage[],
  onText: (fullText: string) => void,
  context?: string,
): Promise<string> {
  const res = await fetch("/api/nota", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: messages.map(({ role, content }) => ({ role, content })),
      context,
    }),
  });
  if (!res.body) throw new Error("Pas de réponse");
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let text = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    text += decoder.decode(value, { stream: true });
    onText(text);
  }
  return text;
}
