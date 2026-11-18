export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

const WELCOME: ChatMessage = {
  role: 'assistant',
  content: 'Bonjour ! Décrivez votre problème de réseau, je vais vous guider.',
};

export { WELCOME };

export async function sendChat(
  history: ChatMessage[],
): Promise<{ ok: true; reply: string } | { ok: false; error: string }> {
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-assistant`;
  const headers = {
    Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ messages: history.slice(-20) }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      if (res.status === 503) {
        return { ok: false, error: 'L’assistant IA n’est pas encore activé. Une clé de service doit être ajoutée aux secrets du projet.' };
      }
      return {
        ok: false,
        error: typeof data?.error === 'string' ? data.error : 'Une erreur est survenue. Réessayez.',
      };
    }

    const data = await res.json();
    if (typeof data?.reply !== 'string' || data.reply.length === 0) {
      return { ok: false, error: 'Réponse inattendue de l’assistant. Réessayez.' };
    }
    return { ok: true, reply: data.reply };
  } catch {
    return { ok: false, error: 'Impossible de contacter l’assistant. Vérifiez la connexion.' };
  }
}
