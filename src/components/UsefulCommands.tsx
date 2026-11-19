import { ArrowLeft, BookOpenText, CheckCircle2, Copy, Lightbulb, Terminal } from 'lucide-react';
import { usefulCommands, type UsefulCommand } from '@/data/usefulCommands';
import { useCopyFeedback } from '@/lib/useCopyFeedback';

type UsefulCommandsProps = {
  onHome: () => void;
};

export default function UsefulCommands({ onHome }: UsefulCommandsProps) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-16 pt-6 sm:pt-10">
      <div className="mb-6 flex items-center justify-between gap-3">
        <button
          onClick={onHome}
          className="pill-btn flex items-center gap-2 border border-white/70 bg-white/55 px-4 py-2 text-sm font-semibold text-cocoa-700 shadow-[0_8px_20px_-12px_rgba(32,58,95,0.4)] backdrop-blur-xl hover:bg-white/75"
        >
          <ArrowLeft className="h-4 w-4" />
          Accueil
        </button>
        <span className="flex items-center gap-2 rounded-full bg-sand-500/15 px-4 py-2 text-xs font-semibold text-sand-600">
          <BookOpenText className="h-4 w-4" />
          Aide-mémoire
        </span>
      </div>

      <header className="animate-fade-up text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-cocoa-700 sm:text-3xl">
          Commandes utiles
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-warmgray-500">
          Les commandes réseau Windows utilisées dans les parcours de diagnostic,
          expliquées simplement. Cliquez sur « Copier » pour les coller dans
          l’invite de commandes (CMD).
        </p>
      </header>

      <div className="mt-8 space-y-4">
        {usefulCommands.map((item) => (
          <CommandCard key={item.command} item={item} />
        ))}
      </div>
    </div>
  );
}

function CommandCard({ item }: { item: UsefulCommand }) {
  const { copied, copy } = useCopyFeedback();

  return (
    <article className="glass animate-fade-up p-5 sm:p-6">
      <div className="cmd-block relative p-4 pr-24">
        <button
          onClick={() => copy(item.command)}
          aria-label={`Copier la commande ${item.command}`}
          className={
            copied
              ? 'pill-btn absolute right-3 top-3 flex items-center gap-1.5 bg-sage-400 px-3 py-1.5 text-xs font-semibold text-white'
              : 'pill-btn absolute right-3 top-3 flex items-center gap-1.5 border border-white/70 bg-white/60 px-3 py-1.5 text-xs font-semibold text-cocoa-700 hover:bg-white/90'
          }
        >
          {copied ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Copié !' : 'Copier'}
        </button>
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-warmgray-500">
          <Terminal className="h-3.5 w-3.5" />
          Commande (CMD)
        </div>
        <code className="block break-all font-mono text-sm font-semibold text-cocoa-700">
          {item.command}
        </code>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-cocoa-700">{item.explanation}</p>
      <p className="mt-2 flex items-start gap-2 text-sm leading-relaxed text-warmgray-500">
        <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-sand-500" />
        <span>{item.example}</span>
      </p>
    </article>
  );
}
