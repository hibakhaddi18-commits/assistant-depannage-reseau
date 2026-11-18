import type { LucideIcon } from 'lucide-react';

export type Choice = {
  label: string;
  next: string; // step id, or "d:<diagnosisId>" for a final diagnosis
};

export type Step = {
  id: string;
  title: string;
  note?: string;
  command?: string;
  choices: Choice[];
};

export type Diagnosis = {
  cause: string;
  solution: string;
};

export type Flow = {
  id: string;
  title: string;
  icon: LucideIcon;
  start: string;
  steps: Record<string, Step>;
  diagnoses: Record<string, Diagnosis>;
};

export type Category = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  flows: Flow[];
};
