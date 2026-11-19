import { Gauge, Video, Clock } from 'lucide-react';
import type { Flow } from './types';

export const reseauLent: Flow = {
  id: 'reseau-lent',
  title: 'Réseau très lent',
  icon: Gauge,
  start: 'cable-vs-wifi',
  steps: {
    'cable-vs-wifi': {
      id: 'cable-vs-wifi',
      title: 'En câble Ethernet, la vitesse est-elle meilleure qu’en Wi-Fi ?',
      note: 'Branchez temporairement un câble et refaites la même action (copie de fichier, ouverture de site). Un Wi-Fi saturé ou faible est lent, un câble sain est rapide.',
      choices: [
        { label: 'Oui, en câble c’est rapide : le Wi-Fi est en cause', next: 'd:wifi-faible' },
        { label: 'Non, c’est lent même en câble', next: 'ping-latence' },
      ],
    },
    'ping-latence': {
      id: 'ping-latence',
      title: 'Que donne un ping continu vers la passerelle (latence et pertes) ?',
      note: 'Laissez tourner 30 secondes puis arrêtez avec Ctrl+C. Regardez « temps » (latence en ms, doit rester < 5 ms en local) et « perdus » (doit être 0 %).',
      command: 'ping -t 192.168.1.1',
      choices: [
        { label: 'Il y a des pertes de paquets ou des pics de latence', next: 'consommateurs' },
        { label: 'Latence stable et 0 % de perte', next: 'consommateurs' },
      ],
    },
    consommateurs: {
      id: 'consommateurs',
      title: 'Un programme consomme-t-il la bande passante ?',
      note: 'Fermez les téléchargements en cours, la synchronisation cloud, les mises à jour Windows et les flux vidéo. Dans le Gestionnaire des tâches, l’onglet « Performance » / « Réseau » montre l’activité.',
      command: 'taskmgr',
      choices: [
        { label: 'Oui, après fermeture des programmes, c’est rapide', next: 'd:programme-gourmand' },
        { label: 'Non, rien ne consomme mais c’est toujours lent', next: 'redemarrage' },
      ],
    },
    redemarrage: {
      id: 'redemarrage',
      title: 'Après redémarrage du switch et de la box, la vitesse est-elle rétablie ?',
      note: 'Éteignez 30 secondes puis rallumez. Un équipement dont la table est saturée (switch, box) ralentit tout le réseau.',
      choices: [
        { label: 'Oui, la vitesse est revenue', next: 'd:equipement-sature' },
        { label: 'Non, le réseau reste lent pour plusieurs postes', next: 'd:lent-generalise' },
      ],
    },
  },
  diagnoses: {
    'wifi-faible': {
      cause: 'Le Wi-Fi est en cause : signal faible, canal saturé ou nombre important d’appareils connectés.',
      solution:
        'Rapprochez le poste du point d’accès, basculez sur le 5 GHz, changez de canal si besoin, ou installez un point d’accès supplémentaire. Pour les postes fixes, privilégiez le câble.',
    },
    'programme-gourmand': {
      cause: 'Un programme (téléchargement, synchronisation cloud, mise à jour, vidéo) consommait toute la bande passante du poste.',
      solution:
        'Planifiez les mises à jour et synchronisations hors heures ouvrées, et apprenez aux utilisateurs à identifier la consommation via le Gestionnaire des tâches.',
    },
    'equipement-sature': {
      cause: 'Le switch ou la box était dans un état dégradé (table saturée, surchauffe) et ralentissait tout le réseau.',
      solution:
        'Le redémarrage a rétabli la vitesse. Si cela revient, vérifiez la charge de l’équipement, sa ventilation et envisagez son remplacement.',
    },
    'lent-generalise': {
      cause: 'La lenteur touche plusieurs postes : cause globale (liaison Internet saturée, équipement défaillant, câblage dégradé, boucle réseau).',
      solution:
        'Mesurez le débit Internet pour distinguer saturation de la ligne et problème local, vérifiez les débits négociés des cartes (100 Mb/s vs 1 Gb/s dans ncpa.cpl), et faites contrôler le câblage si besoin.',
    },
  },
};

export const visioCoupe: Flow = {
  id: 'visio-coupe',
  title: 'Visioconférence qui coupe (Teams/Zoom)',
  icon: Video,
  start: 'debit',
  steps: {
    debit: {
      id: 'debit',
      title: 'Quel débit obtenez-vous lors d’un test de débit ?',
      note: 'Un appel vidéo exige environ 3 à 5 Mb/s en montée et en descente. Faites le test sans autre activité sur le réseau.',
      choices: [
        { label: 'Le débit est très faible (< 3 Mb/s) ou très instable', next: 'cable' },
        { label: 'Le débit est correct mais l’appel coupe quand même', next: 'ping-pertes' },
      ],
    },
    cable: {
      id: 'cable',
      title: 'En passant en câble Ethernet, la visio est-elle stable ?',
      note: 'Le Wi-Fi est la première cause de coupures en visioconférence : variations de signal, interférences, saturation.',
      choices: [
        { label: 'Oui, en câble c’est fluide : le Wi-Fi était en cause', next: 'd:wifi-visio' },
        { label: 'Non, ça coupe aussi en câble', next: 'ping-pertes' },
      ],
    },
    'ping-pertes': {
      id: 'ping-pertes',
      title: 'Le ping continu montre-t-il des pertes de paquets ?',
      note: 'Laissez tourner pendant un appel si possible. Des « délais d’attente dépassés » ou des pertes > 2 % expliquent les coupures et le son saccadé.',
      command: 'ping -t 8.8.8.8',
      choices: [
        { label: 'Oui, il y a des pertes de paquets', next: 'telechargements' },
        { label: 'Non, aucune perte, connexion stable', next: 'd:probleme-logiciel' },
      ],
    },
    telechargements: {
      id: 'telechargements',
      title: 'D’autres téléchargements ou flux consomment-ils la bande passante ?',
      note: 'Fermez les téléchargements, les mises à jour, la sauvegarde cloud et les autres appels / streaming sur le même poste et sur les postes voisins.',
      command: 'taskmgr',
      choices: [
        { label: 'Oui, après fermeture, la visio devient stable', next: 'd:bande-passante-saturee' },
        { label: 'Non, rien ne consomme et ça coupe encore', next: 'box-visio' },
      ],
    },
    'box-visio': {
      id: 'box-visio',
      title: 'Après redémarrage de la box, la visio est-elle stable ?',
      note: 'Débranchez la box 30 secondes puis rebranchez. Une box dont la ligne est dégradée produit des micro-coupures invisibles en navigation mais fatales en visio.',
      choices: [
        { label: 'Oui, c’est stable après redémarrage', next: 'd:box-degradee' },
        { label: 'Non, les coupures persistent', next: 'd:liaison-instable' },
      ],
    },
  },
  diagnoses: {
    'wifi-visio': {
      cause: 'Le Wi-Fi causait les coupures : signal variable ou interférences pendant les appels.',
      solution:
        'Utilisez le câble Ethernet pour les postes qui font beaucoup de visio, ou améliorez la couverture Wi-Fi (point d’accès supplémentaire, 5 GHz).',
    },
    'probleme-logiciel': {
      cause: 'La connexion est saine : le problème vient du logiciel (client Teams/Zoom, webcam, pilote audio/vidéo) ou du poste.',
      solution:
        'Mettez à jour le client de visioconférence, redémarrez le poste, testez un casque / autre webcam. Désactivez le chiffrement ou les effets vidéo gourmands si activés.',
    },
    'bande-passante-saturee': {
      cause: 'La bande passante était saturée par d’autres usages (téléchargements, sauvegardes, streaming simultanés).',
      solution:
        'Planifiez les sauvegardes et mises à jour hors heures de réunion, et activez si possible une priorisation de la visioconférence (QoS) sur la box / le routeur.',
    },
    'box-degradee': {
      cause: 'La box était dans un état dégradé produisant des micro-coupures de la ligne.',
      solution:
        'Le redémarrage a stabilisé la ligne. Si les micro-coupures reviennent, faites vérifier la ligne par le fournisseur d’accès (atténuation, erreurs).',
    },
    'liaison-instable': {
      cause: 'La liaison Internet est instable (ligne dégradée, fournisseur en difficulté, câblage interne défectueux).',
      solution:
        'Documentez les coupures (heures, durée) et ouvrez un incident auprès du fournisseur d’accès. En attendant, proposez un poste en câble sur une autre prise ou une liaison 4G de secours.',
    },
  },
};

export const heureFausses: Flow = {
  id: 'heure-fausses',
  title: 'Heure du poste fausse, connexion refusée',
  icon: Clock,
  start: 'comparaison',
  steps: {
    comparaison: {
      id: 'comparaison',
      title: 'L’heure du poste est-elle décalée par rapport à celle du serveur / domaine ?',
      note: 'Comparez l’horloge du poste à celle d’un serveur de référence. Un écart de plus de 5 minutes suffit à faire refuser l’authentification au domaine (Kerberos).',
      choices: [
        { label: 'Oui, l’heure est décalée (de plusieurs minutes ou heures)', next: 'sync-auto' },
        { label: 'Non, l’heure semble juste mais les connexions sont refusées', next: 'd:heure-correcte' },
      ],
    },
    'sync-auto': {
      id: 'sync-auto',
      title: 'La synchronisation automatique de l’heure est-elle activée et fonctionnelle ?',
      note: 'Paramètres → Heure et langue → Date et heure : activez « Régler l’heure automatiquement ». Sur un domaine, le poste doit se synchroniser sur le contrôleur de domaine.',
      command: 'w32tm /resync',
      choices: [
        { label: 'Oui, l’heure s’est remise à l’heure après resynchronisation', next: 'redemarrer' },
        { label: 'Non, la resynchronisation échoue', next: 'pile-cmos' },
      ],
    },
    'pile-cmos': {
      id: 'pile-cmos',
      title: 'L’heure se décale-t-elle à chaque arrêt / redémarrage du poste ?',
      note: 'Si l’heure retombe en arrière après une nuit éteinte (et que le BIOS perd aussi l’heure), la pile CMOS de la carte mère est usée.',
      choices: [
        { label: 'Oui, l’heure retombe après chaque extinction', next: 'd:pile-cmos' },
        { label: 'Non, l’heure reste juste, c’était un décalage ponctuel', next: 'd:fuseau-horaire' },
      ],
    },
    redemarrer: {
      id: 'redemarrer',
      title: 'Après redémarrage de la session (ou du poste), l’accès au domaine fonctionne-t-il ?',
      note: 'Une fois l’heure corrigée, verrouillez la session puis reconnectez-vous, ou redémarrez le poste, pour renouveler l’authentification.',
      choices: [
        { label: 'Oui, la connexion au domaine est rétablie', next: 'd:resolu' },
        { label: 'Non, l’authentification échoue encore', next: 'd:motdepasse-machine' },
      ],
    },
  },
  diagnoses: {
    'heure-correcte': {
      cause: 'L’heure est correcte : le refus de connexion a une autre cause (compte verrouillé, mot de passe expiré, problème de canal sécurisé).',
      solution:
        'Vérifiez le compte de l’utilisateur dans l’Active Directory (verrouillage, expiration) et consultez le parcours « Ressources du domaine inaccessibles ».',
    },
    'fuseau-horaire': {
      cause: 'Le décalage venait du fuseau horaire du poste (décalage d’heures entières) ou d’un réglage manuel erroné.',
      solution:
        'Vérifiez le fuseau horaire (Paramètres → Heure) et activez l’heure d’été / hiver automatique. Déployez le bon fuseau par stratégie de groupe si plusieurs postes sont touchés.',
    },
    'pile-cmos': {
      cause: 'La pile CMOS de la carte mère est usée : l’heure et le BIOS se réinitialisent à chaque coupure d’alimentation.',
      solution:
        'Remplacez la pile CMOS (pile bouton CR2032 sur la plupart des postes). En attendant, laissez le poste allumé et la synchronisation automatique active.',
    },
    resolu: {
      cause: 'L’heure décalée faisait refuser l’authentification Kerberos au domaine.',
      solution:
        'L’heure corrigée et la session relancée ont rétabli l’accès. Vérifiez que le poste se synchronise bien sur le contrôleur de domaine (service Temps Windows) pour éviter la récidive.',
    },
    'motdepasse-machine': {
      cause: 'L’heure est corrigée mais le compte machine est désynchronisé avec l’Active Directory.',
      solution:
        'Réinitialisez le compte machine dans l’Active Directory ou réintégrez le poste au domaine (sortie en groupe de travail, redémarrage, puis réintégration), puis redémarrez.',
    },
  },
};
