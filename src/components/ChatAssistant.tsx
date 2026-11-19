import { useEffect, useRef, useState } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { sendChat, WELCOME, type ChatMessage } from '@/lib/chat';

const QUICK_PROMPTS = [
  'Pas d’Internet',
  'Wi-Fi lent',
  'Erreur DNS',
  'Adresse 169.254',
  'Imprimante introuvable',
];

export default function ChatAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading, open]);

  async function sendText(raw: string) {
    const text = raw.trim();
    if (!text || loading) return;

    const next: ChatMessage[] = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setInput('');
    setError(null);
    setLoading(true);

    const result = await sendChat(next.filter((m) => m !== WELCOME));

    if (result.ok) {
      setMessages((m) => [...m, { role: 'assistant', content: result.reply }]);
    } else {
      setError(result.error);
    }
    setLoading(false);
  }

  function handleSend() {
    sendText(input);
  }

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Fermer l’assistant' : 'Ouvrir l’assistant de dépannage'}
        className="pill-btn fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-sage-400 text-white shadow-[0_16px_35px_-12px_rgba(138,155,132,0.8)] hover:bg-sage-500 sm:bottom-6 sm:right-6"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {open && (
        <div className="animate-fade-up fixed bottom-24 right-4 z-50 flex h-[70vh] max-h-[560px] w-[calc(100%-2rem)] max-w-sm flex-col overflow-hidden rounded-3xl border border-white/70 bg-white/70 shadow-[0_25px_60px_-20px_rgba(120,105,85,0.45)] backdrop-blur-xl sm:bottom-24 sm:right-6">
          <div className="flex items-center gap-3 border-b border-white/70 bg-white/50 px-5 py-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sage-400 text-white">
              <MessageCircle className="h-4.5 w-4.5" strokeWidth={1.9} />
            </span>
            <div>
              <p className="text-sm font-semibold text-cocoa-700">Assistant Dépannage</p>
              <p className="text-xs text-warmgray-500">Diagnostic réseau par la conversation</p>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={
                    msg.role === 'user'
                      ? 'max-w-[85%] rounded-2xl rounded-br-md bg-sage-400 px-4 py-2.5 text-sm leading-relaxed text-white shadow-[0_8px_18px_-10px_rgba(138,155,132,0.8)]'
                      : 'max-w-[85%] rounded-2xl rounded-bl-md border border-white/80 bg-white/75 px-4 py-2.5 text-sm leading-relaxed text-cocoa-700'
                  }
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-white/80 bg-white/75 px-4 py-2.5 text-sm text-warmgray-500">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  en train d’écrire…
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-2xl border border-[#d8b8a8]/60 bg-[#f3e4da]/80 px-4 py-2.5 text-xs leading-relaxed text-[#8a5c48]">
                {error}
              </div>
            )}
          </div>

          <div className="border-t border-white/70 bg-white/50 p-3">
            <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wide text-warmgray-400">
              Problèmes fréquents
            </p>
            <div className="mb-2.5 flex flex-wrap gap-1.5">
              {QUICK_PROMPTS.map((label) => (
                <button
                  key={label}
                  onClick={() => sendText(label)}
                  disabled={loading}
                  className="pill-btn border border-sage-300/70 bg-sage-50/80 px-3 py-1.5 text-xs font-semibold text-sage-600 hover:bg-sage-100 disabled:opacity-40 disabled:hover:bg-sage-50/80"
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                rows={1}
                placeholder="Décrivez votre problème…"
                className="max-h-24 flex-1 resize-none rounded-2xl border border-white/80 bg-white/70 px-4 py-2.5 text-sm text-cocoa-700 placeholder:text-warmgray-400 outline-none transition focus:border-sage-300 focus:ring-2 focus:ring-sage-200"
              />
              <button
                onClick={handleSend}
                disabled={loading || input.trim().length === 0}
                aria-label="Envoyer le message"
                className="pill-btn flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sage-400 text-white shadow-[0_10px_20px_-10px_rgba(138,155,132,0.8)] transition hover:bg-sage-500 disabled:opacity-40 disabled:hover:bg-sage-400"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
