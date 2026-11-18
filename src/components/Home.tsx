import { Network, Search } from 'lucide-react';
import { categories } from '@/data/categories';
import type { Category, Flow } from '@/data/types';

type HomeProps = {
  onSelect: (flow: Flow, category: Category) => void;
  query: string;
  onQueryChange: (q: string) => void;
};

export default function Home({ onSelect, query, onQueryChange }: HomeProps) {
  const q = query.trim().toLowerCase();
  const filtered = categories.map((cat) => ({
    ...cat,
    flows: cat.flows.filter((f) => f.title.toLowerCase().includes(q)),
  }));
  const hasResults = filtered.some((c) => c.flows.length > 0);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-16 pt-10 sm:pt-14">
      <header className="animate-fade-up text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-white/60 shadow-[0_14px_30px_-14px_rgba(120,105,85,0.4)] backdrop-blur-xl border border-white/70">
          <Network className="h-8 w-8 text-sage-400" strokeWidth={1.8} />
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-cocoa-700 sm:text-4xl">
          Assistant Dépannage Réseau
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-warmgray-500">
          Choisissez le symptôme que rencontre le poste : l’assistant vous guide
          étape par étape, avec les commandes exactes à exécuter, jusqu’au
          diagnostic et à la solution.
        </p>

        <div className="relative mx-auto mt-6 max-w-md">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-warmgray-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Rechercher un symptôme…"
            className="w-full rounded-full border border-white/70 bg-white/60 py-3 pl-11 pr-4 text-sm text-cocoa-700 placeholder:text-warmgray-400 shadow-[0_10px_25px_-15px_rgba(120,105,85,0.4)] backdrop-blur-xl outline-none transition focus:border-sage-300 focus:ring-2 focus:ring-sage-200"
          />
        </div>
      </header>

      {!hasResults && (
        <p className="mt-10 text-center text-sm text-warmgray-500">
          Aucun symptôme ne correspond à « {query} ».
        </p>
      )}

      <div className="mt-10 space-y-10">
        {filtered.map(
          (cat) =>
            cat.flows.length > 0 && (
              <section key={cat.id} className="animate-fade-up">
                <div className="mb-4 flex items-center gap-3 px-1">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sand-500/20 text-sand-600">
                    <cat.icon className="h-5 w-5" strokeWidth={1.9} />
                  </span>
                  <div>
                    <h2 className="text-lg font-semibold text-cocoa-700">{cat.title}</h2>
                    <p className="text-xs text-warmgray-500">{cat.description}</p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {cat.flows.map((flow) => (
                    <button
                      key={flow.id}
                      onClick={() => onSelect(flow, cat)}
                      className="glass pill-btn group flex items-center gap-3 rounded-3xl p-4 text-left hover:-translate-y-0.5 hover:bg-white/75 hover:shadow-[0_22px_45px_-18px_rgba(120,105,85,0.38)]"
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sage-100/80 text-sage-600 transition-colors group-hover:bg-sage-400 group-hover:text-white">
                        <flow.icon className="h-5 w-5" strokeWidth={1.9} />
                      </span>
                      <span className="text-sm font-semibold leading-snug text-cocoa-700">
                        {flow.title}
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            ),
        )}
      </div>
    </div>
  );
}
