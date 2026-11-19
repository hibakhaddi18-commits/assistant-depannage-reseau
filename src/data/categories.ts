import { Wifi, Wrench, Gauge } from 'lucide-react';
import { pasInternet, pasAdresseIp, wifiInstable, connectePasInternet, conflitIp, aucunReseau, panneTotale } from './flowsConnexion';
import { problemeDns, neVoitPasOrdinateurs, dossierInaccessible, ressourcesDomaine, connexionDomaine, vpnBloque, siteUniqueBloque, imprimanteInaccessible } from './flowsServices';
import { reseauLent, visioCoupe, heureFausses } from './flowsPerformance';
import type { Category } from './types';

export const categories: Category[] = [
  {
    id: 'connexion',
    title: 'Connexion',
    description: 'Le poste n’arrive pas à se raccorder au réseau ou à Internet.',
    icon: Wifi,
    flows: [pasInternet, pasAdresseIp, wifiInstable, connectePasInternet, conflitIp, aucunReseau, panneTotale],
  },
  {
    id: 'services',
    title: 'Services et accès',
    description: 'Les ressources (sites, partages, domaine, VPN) ne répondent pas.',
    icon: Wrench,
    flows: [problemeDns, neVoitPasOrdinateurs, dossierInaccessible, ressourcesDomaine, connexionDomaine, vpnBloque, siteUniqueBloque, imprimanteInaccessible],
  },
  {
    id: 'performance',
    title: 'Performance et usage',
    description: 'Le réseau fonctionne mais tout va trop lentement ou coupe.',
    icon: Gauge,
    flows: [reseauLent, visioCoupe, heureFausses],
  },
];

export const allFlows = categories.flatMap((c) => c.flows);

export function findFlow(id: string) {
  return allFlows.find((f) => f.id === id);
}
