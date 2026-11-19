import { useState } from 'react';
import { ArrowLeft, Terminal, CheckCircle2, RotateCcw, Stethoscope, Lightbulb, Copy, Share2 } from 'lucide-react';
import type { Category, Diagnosis, Flow, Step } from '@/data/types';
import { countSteps } from '@/data/countSteps';
import { useCopyFeedback } from '@/lib/useCopyFeedback';

type DiagnosisFlowProps = {
  flow: Flow;
  category: Category;
  onHome: () => void;
  onSwitchFlow: (flow: Flow, category: Category) => void;
};

type HistoryEntry = { stepId: string; choiceIndex: number };

export default function DiagnosisFlow({ flow, category, onHome, onSwitchFlow }: DiagnosisFlowProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const currentId = history.length === 0
    ? flow.start
    : resolveNext(flow, history[history.length - 1]);

  const current: Step | Diagnosis | undefined =
    currentId.startsWith('d:')
      ? flow.diagnoses[currentId.slice(2)]
      : flow.steps[currentId];

  const isDiagnosis = currentId.startsWith('d:');
  const step = !isDiagnosis ? (current as Step | undefined) : undefined;
  const diagnosis = isDiagnosis ? (current as Diagnosis | undefined) : undefined;
  const progress = isDiagnosis ? 100 : Math.min(95, Math.round((history.length / Math.max(countSteps(flow), 1)) * 100));

  function choose(choiceIndex: number) {
    setHistory((h) => [...h, { stepId: currentId, choiceIndex }]);
  }

  function goBack() {
    setHistory((h) => h.slice(0, -1));
  }

  function restart() {
    setHistory([]);
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-16 pt-6 sm:pt-10">
      <div className="mb-5 flex items-center justify-between gap-3">
        <button
          onClick={onHome}
          className="pill-btn flex items-center gap-2 border border-white/70 bg-white/55 px-4 py-2 text-sm font-semibold text-cocoa-700 shadow-[0_8px_20px_-12px_rgba(120,105,85,0.4)] backdrop-blur-xl hover:bg-white/75"
        >
          <ArrowLeft className="h-4 w-4" />
          Accueil
        </button>
        <span className="flex items-center gap-2 rounded-full bg-sand-500/15 px-4 py-2 text-xs font-semibold text-sand-600">
          <category.icon className="h-4 w-4" />
          {category.title}
        </span>
      </div>

      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-xs font-semibold text-warmgray-500">
          <span className="flex items-center gap-2">
            <flow.icon className="h-4 w-4 text-sage-400" />
            {flow.title}
          </span>
          <span>{isDiagnosis ? 'Terminé' : `Étape ${history.length + 1}`}</span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/60 border border-white/70">
          <div
            className="h-full rounded-full bg-sage-400 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {step && (
        <div key={step.id} className="glass animate-fade-up p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-sand-500">
            Vérification à effectuer
          </p>
          <h2 className="mt-2 text-xl font-semibold leading-snug text-cocoa-700 sm:text-2xl">
            {step.title}
          </h2>

          {step.note && (
            <p className="mt-3 text-sm leading-relaxed text-warmgray-500">{step.note}</p>
          )}

          {step.command && <CommandBlock command={step.command} />}

          <div className="mt-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-warmgray-400">
              Que constatez-vous ?
            </p>
            <div className="flex flex-col gap-3">
              {step.choices.map((choice, i) => (
                <button
                  key={i}
                  onClick={() => choose(i)}
                  className={
                    i === 0
                      ? 'pill-btn w-full bg-sage-400 px-5 py-3.5 text-sm font-semibold text-white shadow-[0_12px_25px_-12px_rgba(138,155,132,0.7)] hover:bg-sage-500'
                      : 'pill-btn w-full border border-white/80 bg-white/60 px-5 py-3.5 text-sm font-semibold text-cocoa-700 backdrop-blur-xl shadow-[0_10px_22px_-14px_rgba(120,105,85,0.45)] hover:bg-white/85'
                  }
                >
                  {choice.label}
                </button>
              ))}
            </div>
          </div>

          {history.length > 0 && (
            <button
              onClick={goBack}
              className="pill-btn mt-6 flex items-center gap-2 px-4 py-2 text-sm font-semibold text-warmgray-500 hover:text-cocoa-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour à l’étape précédente
            </button>
          )}
        </div>
      )}

      {diagnosis && (
        <div className="animate-fade-up space-y-4">
          <div className="glass rounded-3xl border border-sage-300/70 p-6 sm:p-8">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sage-400 text-white shadow-[0_10px_22px_-10px_rgba(138,155,132,0.8)]">
                <CheckCircle2 className="h-6 w-6" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-sage-500">
                  Diagnostic terminé
                </p>
                <h2 className="text-lg font-semibold text-cocoa-700">{flow.title}</h2>
              </div>
            </div>

            <div className="mb-4 rounded-2xl bg-white/50 p-4">
              <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-sand-600">
                <Stethoscope className="h-4 w-4" />
                Cause probable
              </p>
              <p className="text-sm leading-relaxed text-cocoa-700">{diagnosis.cause}</p>
            </div>

            <div className="rounded-2xl bg-white/50 p-4">
              <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-sage-500">
                <Lightbulb className="h-4 w-4" />
                Solution
              </p>
              <p className="text-sm leading-relaxed text-cocoa-700">{diagnosis.solution}</p>
            </div>

            <ShareButton flowTitle={flow.title} cause={diagnosis.cause} solution={diagnosis.solution} />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={restart}
              className="pill-btn flex flex-1 items-center justify-center gap-2 bg-sage-400 px-5 py-3.5 text-sm font-semibold text-white shadow-[0_12px_25px_-12px_rgba(138,155,132,0.7)] hover:bg-sage-500"
            >
              <RotateCcw className="h-4 w-4" />
              Nouveau diagnostic
            </button>
            <button
              onClick={onHome}
              className="pill-btn flex flex-1 items-center justify-center gap-2 border border-white/80 bg-white/60 px-5 py-3.5 text-sm font-semibold text-cocoa-700 backdrop-blur-xl hover:bg-white/85"
            >
              <ArrowLeft className="h-4 w-4" />
              Choisir un autre symptôme
            </button>
          </div>
        </div>
      )}

      {!current && (
        <div className="glass p-6 text-center">
          <p className="text-sm text-warmgray-500">
            Ce parcours est incomplet. Revenez à l’accueil et choisissez un autre symptôme.
          </p>
          <button
            onClick={onHome}
            className="pill-btn mt-4 bg-sage-400 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sage-500"
          >
            Retour à l’accueil
          </button>
        </div>
      )}
    </div>
  );
}

function resolveNext(flow: Flow, entry: HistoryEntry): string {
  const step = flow.steps[entry.stepId];
  return step?.choices[entry.choiceIndex]?.next ?? '__introuvable__';
}

function CommandBlock({ command }: { command: string }) {
  const { copied, copy } = useCopyFeedback();

  return (
    <div className="cmd-block relative mt-5 p-4 pr-24">
      <button
        onClick={() => copy(command)}
        aria-label="Copier la commande"
        className={
          copied
            ? 'pill-btn absolute right-3 top-3 flex items-center gap-1.5 bg-sage-400 px-3 py-1.5 text-xs font-semibold text-white'
            : 'pill-btn absolute right-3 top-3 flex items-center gap-1.5 border border-white/70 bg-white/60 px-3 py-1.5 text-xs font-semibold text-cocoa-700 hover:bg-white/90'
        }
      >
        {copied ? (
          <CheckCircle2 className="h-3.5 w-3.5" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
        {copied ? 'Copié !' : 'Copier'}
      </button>
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-warmgray-500">
        <Terminal className="h-3.5 w-3.5" />
        Commande à exécuter (CMD)
      </div>
      <code className="block break-all font-mono text-sm font-semibold text-cocoa-700">
        {command}
      </code>
    </div>
  );
}

function ShareButton({ flowTitle, cause, solution }: { flowTitle: string; cause: string; solution: string }) {
  const { copied, copy } = useCopyFeedback();
  const text = [
    `Diagnostic réseau : ${flowTitle}`,
    '',
    `Cause probable : ${cause}`,
    '',
    `Solution : ${solution}`,
    '',
    '— Assistant de Diagnostic Réseau',
  ].join('\n');

  return (
    <button
      onClick={() => copy(text)}
      className="pill-btn mt-5 flex w-full items-center justify-center gap-2 border border-sage-300/80 bg-sage-50/70 px-5 py-3 text-sm font-semibold text-sage-600 hover:bg-sage-100"
    >
      {copied ? <CheckCircle2 className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
      {copied ? 'Copié !' : 'Partager le diagnostic'}
    </button>
  );
}
