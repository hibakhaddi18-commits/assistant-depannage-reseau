import {
  WifiOff,
  GlobeLock,
  Wifi,
  TriangleAlert,
  CopyX,
  SearchX,
  PowerOff,
} from 'lucide-react';
import type { Flow } from './types';

export const pasInternet: Flow = {
  id: 'pas-internet',
  title: "Pas d'Internet",
  icon: WifiOff,
  start: 'cable',
  steps: {
    cable: {
      id: 'cable',
      title: 'Le câble réseau est-il bien branché (ou le Wi-Fi activé) ?',
      note: 'Vérifiez le câble des deux côtés : le poste et la prise murale / le switch. Le voyant de la carte réseau clignote-t-il ?',
      choices: [
        { label: 'Oui, c’est branché et le voyant clignote', next: 'ipconfig' },
        { label: 'Non, rien ne clignote / câble débranché', next: 'd:cable-defaut' },
      ],
    },
    ipconfig: {
      id: 'ipconfig',
      title: 'Le poste a-t-il une adresse IP valide ?',
      note: 'Regardez la ligne « Adresse IPv4 ». Une adresse commençant par 169.254 signifie un échec DHCP : le poste ne reçoit pas d’adresse du serveur.',
      command: 'ipconfig',
      choices: [
        { label: 'IP normale (192.168.x.x ou autre, pas 169.254)', next: 'ping-gw' },
        { label: 'IP en 169.254.x.x', next: 'd:dhcp-echec' },
        { label: 'Aucune adresse IP', next: 'd:dhcp-echec' },
      ],
    },
    'ping-gw': {
      id: 'ping-gw',
      title: 'La passerelle répond-elle au ping ?',
      note: 'Remplacez 192.168.1.1 par l’adresse de « Passerelle par défaut » trouvée dans ipconfig. 4 réponses sur 4 = la passerelle est joignable.',
      command: 'ping 192.168.1.1',
      choices: [
        { label: 'Oui, la passerelle répond', next: 'ping-8888' },
        { label: 'Non, délai dépassé ou injoignable', next: 'd:gw-injoignable' },
      ],
    },
    'ping-8888': {
      id: 'ping-8888',
      title: 'Internet répond-il directement par son adresse IP ?',
      note: 'On teste une adresse IP publique connue (DNS Google). Si elle répond, la connexion Internet fonctionne.',
      command: 'ping 8.8.8.8',
      choices: [
        { label: 'Oui, 8.8.8.8 répond', next: 'ping-nom' },
        { label: 'Non, pas de réponse', next: 'd:internet-coupure' },
      ],
    },
    'ping-nom': {
      id: 'ping-nom',
      title: 'Un site répond-il par son nom ?',
      note: 'Si l’adresse IP répond mais pas le nom, le problème est lié au DNS : le poste n’arrive plus à traduire les noms de sites en adresses IP.',
      command: 'ping www.google.com',
      choices: [
        { label: 'Oui, le nom répond aussi', next: 'd:ok-local' },
        { label: 'Non, l’IP répond mais pas le nom', next: 'd:dns-panne' },
      ],
    },
  },
  diagnoses: {
    'cable-defaut': {
      cause: 'Le poste n’est pas physiquement raccordé au réseau : câble débranché, défectueux ou carte désactivée.',
      solution:
        'Rebranchez fermement le câble des deux côtés, essayez un autre câble ou un autre port du switch. En Wi-Fi, réactivez le Wi-Fi et reconnectez-vous au bon réseau.',
    },
    'dhcp-echec': {
      cause: 'Échec DHCP : le poste n’a pas reçu d’adresse IP du serveur (adresse 169.254 dite APIPA).',
      solution:
        'Lancez « ipconfig /release » puis « ipconfig /renew ». Si cela échoue, vérifiez le câble, le switch et le serveur DHCP (parcours « Pas d’adresse IP (DHCP) »).',
    },
    'gw-injoignable': {
      cause: 'Le poste a une adresse IP mais ne peut pas joindre la passerelle : problème de câble, de switch ou de configuration réseau locale.',
      solution:
        'Vérifiez le branchement et le switch, puis renouvelez l’adresse IP (ipconfig /release puis /renew). Si le problème persiste, redémarrez le switch ou la box.',
    },
    'internet-coupure': {
      cause: 'Le réseau local fonctionne mais Internet est coupé : la box, le routeur ou le fournisseur d’accès est en panne.',
      solution:
        'Redémarrez la box / le routeur (éteindre 30 secondes, rallumer). Si le problème persiste, contactez le fournisseur d’accès ou vérifiez l’état de l’abonnement.',
    },
    'dns-panne': {
      cause: 'Problème de DNS : le poste atteint Internet par adresse IP mais ne sait plus traduire les noms de sites.',
      solution:
        'Lancez « ipconfig /flushdns » pour vider le cache DNS, puis vérifiez le serveur DNS configuré avec « ipconfig /all ». Suivez le parcours « Les sites ne s’ouvrent pas par leur nom (DNS) » si besoin.',
    },
    'ok-local': {
      cause: 'Le réseau fonctionne correctement : câble, IP, passerelle, Internet et DNS répondent tous.',
      solution:
        'Le problème vient probablement de l’application elle-même (navigateur, pare-feu, proxy ou site spécifique). Testez un autre navigateur et vérifiez le proxy / pare-feu du poste.',
    },
  },
};

export const pasAdresseIp: Flow = {
  id: 'pas-adresse-ip',
  title: "Pas d'adresse IP (DHCP)",
  icon: GlobeLock,
  start: 'release',
  steps: {
    release: {
      id: 'release',
      title: 'Après le renouvellement, le poste a-t-il reçu une adresse IP ?',
      note: 'Exécutez les deux commandes l’une après l’autre, puis vérifiez l’adresse IPv4 affichée. Elle ne doit pas être en 169.254.',
      command: 'ipconfig /release && ipconfig /renew',
      choices: [
        { label: 'Oui, une adresse valide est apparue', next: 'd:resolu' },
        { label: 'Non, toujours rien ou 169.254', next: 'service-dhcp' },
      ],
    },
    'service-dhcp': {
      id: 'service-dhcp',
      title: 'Le service DHCP est-il actif et le serveur joignable ?',
      note: 'Sur le serveur : vérifiez que l’étendue DHCP est bien « Active » et qu’il reste des adresses disponibles. Sur le poste, le service « Client DHCP » doit être démarré.',
      command: 'services.msc',
      choices: [
        { label: 'Le service DHCP était arrêté, je l’ai redémarré', next: 'd:service-redemarre' },
        { label: 'Le service est actif mais toujours pas d’adresse', next: 'cable-switch' },
      ],
    },
    'cable-switch': {
      id: 'cable-switch',
      title: 'Le câble et le switch sont-ils en bon état ?',
      note: 'Testez un autre câble, un autre port du switch et vérifiez que les voyants du port s’allument. Un port de switch mort ou un câble abîmé bloque le DHCP.',
      choices: [
        { label: 'Après changement de câble / port, ça fonctionne', next: 'd:cable-defaut' },
        { label: 'Rien ne change malgré le changement', next: 'd:dhcp-serveur' },
      ],
    },
  },
  diagnoses: {
    resolu: {
      cause: 'Le bail DHCP du poste avait expiré ou était corrompu.',
      solution:
        'Le renouvellement a rétabli l’adresse. Le problème est résolu ; si cela revient souvent, vérifiez la durée des baux DHCP et le nombre d’adresses disponibles sur le serveur.',
    },
    'service-redemarre': {
      cause: 'Le service Client DHCP du poste était arrêté, empêchant la demande d’adresse.',
      solution:
        'Redémarrez le service et renouvelez l’adresse (ipconfig /renew). Passez son démarrage en « Automatique » dans services.msc pour éviter que cela se reproduise.',
    },
    'cable-defaut': {
      cause: 'Le câble réseau ou le port du switch utilisé était défectueux.',
      solution:
        'Remplacez définitivement le câble ou changez le port du switch, puis marquez-le comme défectueux pour éviter qu’un autre technicien le réutilise.',
    },
    'dhcp-serveur': {
      cause: 'Le serveur DHCP ne répond plus : service arrêté, étendue saturée ou équipement intermédiaire (VLAN, relais DHCP) défaillant.',
      solution:
        'Vérifiez le serveur DHCP (service, étendue active, adresses libres), les relais DHCP sur les équipements réseau, et redémarrez le serveur si nécessaire.',
    },
  },
};

export const wifiInstable: Flow = {
  id: 'wifi-instable',
  title: 'Wi-Fi qui ne se connecte pas ou se déconnecte',
  icon: Wifi,
  start: 'avion',
  steps: {
    avion: {
      id: 'avion',
      title: 'Le mode avion est-il désactivé et le Wi-Fi réactivé ?',
      note: 'Vérifiez l’icône réseau en bas à droite : le mode avion coupe toutes les connexions sans fil, y compris le Wi-Fi.',
      choices: [
        { label: 'Oui, le mode avion est désactivé', next: 'distance' },
        { label: 'Non, le mode avion était activé', next: 'd:avion-actif' },
      ],
    },
    distance: {
      id: 'distance',
      title: 'Le poste est-il proche du point d’accès ?',
      note: 'Éloignez-vous de moins de quelques mètres du point d’accès / de la box pour tester. Les murs épais et les étages affaiblissent fortement le signal.',
      choices: [
        { label: 'Oui, tout près, et toujours instable', next: 'motdepasse' },
        { label: 'Non, loin : ça marche en se rapprochant', next: 'd:portee' },
      ],
    },
    motdepasse: {
      id: 'motdepasse',
      title: 'Le mot de passe Wi-Fi est-il correct et le profil recréé ?',
      note: 'Supprimez le réseau mémorisé (« Oublier »), puis reconnectez-vous en saisissant à nouveau le mot de passe. Un profil corrompu provoque des échecs répétés.',
      choices: [
        { label: 'Oui, après avoir oublié et ressaisi le mot de passe, ça se connecte', next: 'd:profil-wifi' },
        { label: 'Non, « mot de passe incorrect » ou échec de connexion', next: 'box-restart' },
      ],
    },
    'box-restart': {
      id: 'box-restart',
      title: 'La box / le point d’accès a-t-elle été redémarrée ?',
      note: 'Éteignez la box (débranchez l’alimentation 30 secondes), puis rallumez-la et attendez que les voyants redeviennent stables.',
      choices: [
        { label: 'Oui, et après redémarrage ça fonctionne', next: 'd:box-chargee' },
        { label: 'Oui, mais les déconnexions continuent', next: 'interferences' },
      ],
    },
    interferences: {
      id: 'interferences',
      title: 'Y a-t-il des interférences autour du point d’accès ?',
      note: 'Sources fréquentes : micro-ondes, téléphones sans fil, enceintes Bluetooth, réseaux voisins nombreux sur le même canal. Testez en changeant de canal ou en passant en 5 GHz.',
      choices: [
        { label: 'Oui, en changeant de canal / passant en 5 GHz, c’est stable', next: 'd:interferences' },
        { label: 'Non, les déconnexions persistent partout', next: 'd:carte-wifi' },
      ],
    },
  },
  diagnoses: {
    'avion-actif': {
      cause: 'Le mode avion était activé : toutes les communications sans fil du poste étaient coupées.',
      solution:
        'Désactivez le mode avion et reconnectez-vous au réseau Wi-Fi. Vérifiez aussi le raccourci clavier (touche Fn + touche avion) qui peut l’activer par erreur.',
    },
    portee: {
      cause: 'Portée Wi-Fi insuffisante : le signal est trop faible à l’endroit où se trouve le poste.',
      solution:
        'Rapprochez le poste du point d’accès ou installez un répéteur / point d’accès supplémentaire pour couvrir la zone. Privilégiez le 5 GHz en proximité et le 2,4 GHz à distance.',
    },
    'profil-wifi': {
      cause: 'Profil Wi-Fi mémorisé corrompu ou mot de passe obsolète enregistré sur le poste.',
      solution:
        'Le profil recréé a rétabli la connexion. Pensez à refaire « Oublier ce réseau » sur les autres postes qui rencontreraient le même souci après un changement de mot de passe.',
    },
    'box-chargee': {
      cause: 'La box / le point d’accès était en état instable (mémoire saturée ou surcharge).',
      solution:
        'Le redémarrage a rétabli la situation. Si le problème revient régulièrement, planifiez un redémarrage automatique ou remplacez l’équipement s’il est ancien.',
    },
    interferences: {
      cause: 'Interférences radio sur le canal Wi-Fi utilisé (réseaux voisins, appareils électroménagers, périphériques sans fil).',
      solution:
        'Fixez un canal libre sur le point d’accès (analyse Wi-Fi pour le choisir) ou basculez les postes sensibles sur le 5 GHz. Éloignez le point d’accès des sources d’interférences.',
    },
    'carte-wifi': {
      cause: 'La carte Wi-Fi du poste elle-même est défaillante ou son pilote est instable.',
      solution:
        'Mettez à jour le pilote de la carte Wi-Fi depuis le site du fabricant. Testez avec un adaptateur Wi-Fi USB : si la connexion devient stable, remplacez la carte.',
    },
  },
};

export const connectePasInternet: Flow = {
  id: 'connecte-pas-internet',
  title: '« Connecté, pas d’Internet » (réseau non identifié)',
  icon: TriangleAlert,
  start: 'triangle',
  steps: {
    triangle: {
      id: 'triangle',
      title: 'L’icône réseau affiche-t-elle bien un triangle jaune / « pas d’accès Internet » ?',
      note: 'Le poste est raccordé au réseau mais Windows considère qu’il n’a pas d’accès à Internet. On commence par examiner la configuration IP.',
      choices: [
        { label: 'Oui, c’est exactement ça', next: 'ipconfig-all' },
        { label: 'Non, c’est un autre symbole', next: 'd:autre-probleme' },
      ],
    },
    'ipconfig-all': {
      id: 'ipconfig-all',
      title: 'L’adresse IPv4 est-elle correcte (pas en 169.254) ?',
      note: 'Dans le résultat, relevez l’« Adresse IPv4 » et la « Passerelle par défaut ». Une adresse 169.254.x.x = échec DHCP.',
      command: 'ipconfig /all',
      choices: [
        { label: 'Adresse valide avec passerelle', next: 'renouveler' },
        { label: 'Adresse en 169.254.x.x', next: 'd:dhcp-echec' },
      ],
    },
    renouveler: {
      id: 'renouveler',
      title: 'Après le renouvellement, l’accès Internet est-il revenu ?',
      note: 'Exécutez les deux commandes, attendez la fin du renouvellement, puis testez l’ouverture d’un site.',
      command: 'ipconfig /release && ipconfig /renew',
      choices: [
        { label: 'Oui, Internet fonctionne à nouveau', next: 'd:bail-expire' },
        { label: 'Non, toujours « pas d’Internet »', next: 'carte-reset' },
      ],
    },
    'carte-reset': {
      id: 'carte-reset',
      title: 'Après désactivation puis réactivation de la carte réseau, ça fonctionne ?',
      note: 'Ouvrez « ncpa.cpl », clic droit sur la carte (Ethernet ou Wi-Fi) → Désactiver, attendez 5 secondes, puis Activer.',
      command: 'ncpa.cpl',
      choices: [
        { label: 'Oui, c’est revenu', next: 'd:carte-bloquee' },
        { label: 'Non, toujours pas d’accès', next: 'box-restart' },
      ],
    },
    'box-restart': {
      id: 'box-restart',
      title: 'Après redémarrage de la box / du routeur, l’accès est-il rétabli ?',
      note: 'Débranchez l’alimentation de la box pendant 30 secondes, puis rebranchez et attendez le retour complet des voyants (2 à 3 minutes).',
      choices: [
        { label: 'Oui, ça fonctionne', next: 'd:box-plantee' },
        { label: 'Non, plusieurs postes sont aussi touchés', next: 'd:liaison-fai' },
      ],
    },
  },
  diagnoses: {
    'autre-probleme': {
      cause: 'Le symbole affiché ne correspond pas à un « réseau non identifié » : le problème est d’une autre nature.',
      solution:
        'Reprennez le diagnostic depuis l’écran d’accueil avec le symptôme qui correspond le mieux : « Pas d’Internet », « Wi-Fi qui se déconnecte » ou « Aucun réseau détecté ».',
    },
    'dhcp-echec': {
      cause: 'Échec DHCP : le poste n’a pas reçu d’adresse IP valide (adresse 169.254 auto-attribuée).',
      solution:
        'Vérifiez le câble et le switch, puis renouvelez l’adresse IP. Si tous les postes d’une zone sont en 169.254, le serveur DHCP ou le relais est en panne.',
    },
    'bail-expire': {
      cause: 'Le bail DHCP du poste avait expiré sans être renouvelé, d’où le statut « Connecté, pas d’Internet ».',
      solution:
        'Le renouvellement a rétabli l’accès. Si cela se reproduit souvent sur plusieurs postes, vérifiez la durée des baux et la charge du serveur DHCP.',
    },
    'carte-bloquee': {
      cause: 'La carte réseau du poste était dans un état bloqué (pilote figé après une mise en veille prolongée).',
      solution:
        'La désactivation / réactivation a débloqué la situation. Pour éviter la récurrence, mettez à jour le pilote de la carte et désactivez l’économie d’énergie sur la carte (Gestionnaire de périphériques → Gestion de l’alimentation).',
    },
    'box-plantee': {
      cause: 'La box / le routeur était planté : il répondait au niveau local mais ne routait plus vers Internet.',
      solution:
        'Le redémarrage a rétabli la liaison. Si les plantages se répètent, vérifiez la température et l’alimentation de l’équipement, ou faites-le remplacer.',
    },
    'liaison-fai': {
      cause: 'La liaison Internet de l’établissement est coupée (fournisseur d’accès, ligne, ou matériel de liaison).',
      solution:
        'Vérifiez les voyants « Internet » de la box (ils doivent être fixes et non rouges), testez le filtre / la prise murale, puis contactez le fournisseur d’accès avec les informations de l’abonnement.',
    },
  },
};

export const conflitIp: Flow = {
  id: 'conflit-ip',
  title: "Conflit d'adresse IP",
  icon: CopyX,
  start: 'message',
  steps: {
    message: {
      id: 'message',
      title: 'Windows affiche-t-il le message « une autre machine du réseau utilise cette adresse » ?',
      note: 'Ce message confirme qu’un second poste utilise déjà l’adresse IP de celui-ci.',
      choices: [
        { label: 'Oui, c’est ce message', next: 'renouveler' },
        { label: 'Non, autre message', next: 'd:autre-probleme' },
      ],
    },
    renouveler: {
      id: 'renouveler',
      title: 'Le poste est-il en adresse fixe ou en automatique (DHCP) ?',
      note: 'Vérifiez dans « ncpa.cpl » → clic droit sur la carte → Propriétés → Protocole Internet version 4 : l’option « Obtenir une adresse IP automatiquement » est-elle cochée ?',
      command: 'ncpa.cpl',
      choices: [
        { label: 'Automatique (DHCP)', next: 'release-renew' },
        { label: 'Adresse fixe saisie à la main', next: 'ip-fixe' },
      ],
    },
    'release-renew': {
      id: 'release-renew',
      title: 'Après renouvellement, le conflit a-t-il disparu ?',
      note: 'La libération puis le renouvellement demandent une nouvelle adresse libre au serveur DHCP.',
      command: 'ipconfig /release && ipconfig /renew',
      choices: [
        { label: 'Oui, plus de message d’erreur', next: 'd:resolu' },
        { label: 'Non, le conflit revient aussitôt', next: 'scanner' },
      ],
    },
    'ip-fixe': {
      id: 'ip-fixe',
      title: 'Cette adresse fixe est-elle aussi distribuée par le DHCP ?',
      note: 'Une adresse fixe doit être HORS de la plage distribuée par le serveur DHCP (ou faire l’objet d’une réservation). Vérifiez la plage sur le serveur DHCP.',
      choices: [
        { label: 'Oui, elle est dans la plage DHCP : je vais la changer', next: 'd:ip-fixe-plage' },
        { label: 'Non, elle est hors plage mais le conflit persiste', next: 'scanner' },
      ],
    },
    scanner: {
      id: 'scanner',
      title: 'Un autre équipement utilise-t-il cette adresse ?',
      note: 'Éteignez le poste en conflit, puis depuis un autre poste lancez un ping vers l’adresse : s’il répond, un autre équipement (imprimante, caméra, poste figé) l’utilise. « arp -a » montre l’adresse MAC correspondante.',
      command: 'ping 192.168.1.50 && arp -a',
      choices: [
        { label: 'Oui, un équipement répond avec cette adresse', next: 'd:equipement-doublon' },
        { label: 'Non, personne ne répond', next: 'd:reservation' },
      ],
    },
  },
  diagnoses: {
    'autre-probleme': {
      cause: 'Le message affiché ne correspond pas à un conflit d’adresse IP.',
      solution:
        'Notez le message exact et reprenez le diagnostic avec le symptôme le plus proche sur l’écran d’accueil.',
    },
    resolu: {
      cause: 'Deux postes avaient obtenu la même adresse à cause d’un bail expiré réattribué trop vite.',
      solution:
        'Le renouvellement a réattribué une adresse libre. Sur le serveur DHCP, augmentez légèrement la durée des baux si les conflits se répètent.',
    },
    'ip-fixe-plage': {
      cause: 'Une adresse IP fixe a été saisie à l’intérieur de la plage distribuée automatiquement par le DHCP : deux machines peuvent donc recevoir la même adresse.',
      solution:
        'Sortez l’adresse fixe de la plage DHCP (choisissez une adresse en fin de plage), ou créez sur le serveur DHCP une réservation liée à l’adresse MAC du poste.',
    },
    'equipement-doublon': {
      cause: 'Un autre équipement (imprimante, terminal, poste resté allumé) utilise la même adresse IP que le poste en conflit.',
      solution:
        'Identifiez l’équipement grâce à son adresse MAC (commande arp -a), puis changez son adresse ou créez une réservation DHCP pour chacun des deux équipements.',
    },
    reservation: {
      cause: 'Gestion des adresses défaillante : aucune traçabilité des adresses fixes et baux DHCP mélangés.',
      solution:
        'Créez sur le serveur DHCP une réservation par adresse MAC pour tous les équipements à adresse stable, et documentez les plages fixes / dynamiques pour éviter tout nouveau conflit.',
    },
  },
};

export const aucunReseau: Flow = {
  id: 'aucun-reseau',
  title: 'Aucun réseau détecté (câble ou carte)',
  icon: SearchX,
  start: 'cable-voyant',
  steps: {
    'cable-voyant': {
      id: 'cable-voyant',
      title: 'Le câble est-il branché et le voyant du switch s’allume-t-il sur ce port ?',
      note: 'Vérifiez le câble côté poste ET côté prise murale / switch. Le voyant du port du switch doit s’allumer (vert ou orange, fixe ou clignotant).',
      choices: [
        { label: 'Oui, le voyant du port s’allume', next: 'carte-activee' },
        { label: 'Non, aucun voyant ne s’allume', next: 'autre-port' },
      ],
    },
    'autre-port': {
      id: 'autre-port',
      title: 'Avec un autre câble et un autre port du switch, le voyant s’allume-t-il ?',
      note: 'Testez les deux séparément : d’abord changer le câble, puis changer le port, pour identifier le coupable.',
      choices: [
        { label: 'Oui, ça remonte avec un autre câble', next: 'd:cable-morte' },
        { label: 'Oui, avec un autre port du switch', next: 'd:port-morte' },
        { label: 'Non, rien ne s’allume dans tous les cas', next: 'carte-activee' },
      ],
    },
    'carte-activee': {
      id: 'carte-activee',
      title: 'La carte réseau est-elle activée dans le Gestionnaire de périphériques ?',
      note: 'Ouvrez « devmgmt.msc », dépliez « Cartes réseau » : la carte ne doit être ni désactivée (flèche vers le bas) ni absente. Clic droit → Activer si besoin.',
      command: 'devmgmt.msc',
      choices: [
        { label: 'Elle était désactivée, je l’ai réactivée', next: 'd:carte-desactivee' },
        { label: 'Elle est activée mais aucun réseau n’apparaît', next: 'pilote' },
        { label: 'Elle apparaît avec un triangle jaune', next: 'pilote' },
      ],
    },
    pilote: {
      id: 'pilote',
      title: 'La carte et son pilote sont-ils en bon état ?',
      note: 'Dans le Gestionnaire de périphériques : clic droit sur la carte → Propriétés → l’état doit être « ce périphérique fonctionne correctement ». Sinon, réinstallez le pilote depuis le site du fabricant.',
      choices: [
        { label: 'Après mise à jour / réinstallation du pilote, ça fonctionne', next: 'd:pilote-defectueux' },
        { label: 'Le pilote est correct mais toujours aucun réseau', next: 'd:carte-morte' },
      ],
    },
  },
  diagnoses: {
    'cable-morte': {
      cause: 'Le câble réseau est défectueux (conducteur coupé, connecteur abîmé).',
      solution:
        'Remplacez le câble par un câble testé et retirez le câble défectueux du service. Un testeur de câble permet de le confirmer rapidement.',
    },
    'port-morte': {
      cause: 'Le port du switch utilisé est hors service.',
      solution:
        'Branchez le poste sur un autre port et signalez le port défectueux au responsable réseau pour remplacement ou échange du switch.',
    },
    'carte-desactivee': {
      cause: 'La carte réseau avait été désactivée (volontairement, par un logiciel de sécurité ou par erreur).',
      solution:
        'La réactivation a rétabli le réseau. Vérifiez qu’aucun outil de gestion ne désactive les cartes à distance, et informez l’utilisateur de ne pas la désactiver.',
    },
    'pilote-defectueux': {
      cause: 'Le pilote de la carte réseau était manquant ou corrompu (fréquent après une réinstallation de Windows ou une mise à jour).',
      solution:
        'Conservez une copie du pilote validé sur un partage réseau ou une clé, afin de pouvoir le réinstaller rapidement sur les postes identiques.',
    },
    'carte-morte': {
      cause: 'La carte réseau du poste est défaillante (panne matérielle).',
      solution:
        'Testez avec un adaptateur USB pour confirmer, puis faites réparer le poste ou remplacez la carte. En attendant, un adaptateur USB Ethernet dépanne immédiatement l’utilisateur.',
    },
  },
};

export const panneTotale: Flow = {
  id: 'panne-totale',
  title: 'Panne totale (plus aucun poste n’a de réseau)',
  icon: PowerOff,
  start: 'switch',
  steps: {
    switch: {
      id: 'switch',
      title: 'Le switch est-il allumé et ses voyants actifs ?',
      note: 'Vérifiez le voyant d’alimentation du switch et les voyants des ports. Un switch éteint ou figé coupe tout le réseau local.',
      choices: [
        { label: 'Oui, le switch est allumé et les ports clignotent', next: 'box' },
        { label: 'Non, le switch est éteint / sans voyant', next: 'alim-switch' },
      ],
    },
    'alim-switch': {
      id: 'alim-switch',
      title: 'Le switch est-il alimenté (prise, multiprise, onduleur) ?',
      note: 'Vérifiez la prise murale, la multiprise et l’onduleur éventuel. Branchez le switch directement sur une prise murale connue comme fonctionnelle.',
      choices: [
        { label: 'Après vérification de l’alimentation, le switch redémarre', next: 'd:alim-defaillante' },
        { label: 'Le switch reste mort même sur une prise saine', next: 'd:switch-morte' },
      ],
    },
    box: {
      id: 'box',
      title: 'La box / le routeur est-il allumé avec ses voyants Internet normaux ?',
      note: 'Le voyant « Internet » / « WAN » doit être fixe (souvent blanc ou vert). Un voyant rouge ou éteint signale une coupure de la ligne.',
      choices: [
        { label: 'Oui, les voyants sont normaux', next: 'redemarrage-ordre' },
        { label: 'Non, voyant Internet rouge ou éteint', next: 'redemarrage-ordre' },
      ],
    },
    'redemarrage-ordre': {
      id: 'redemarrage-ordre',
      title: 'Après redémarrage dans l’ordre (box d’abord, puis switch), le réseau est-il revenu ?',
      note: 'Éteignez tout. Rallumez d’abord la box / le routeur et attendez que ses voyants soient stables, puis allumez le switch, puis testez un poste.',
      choices: [
        { label: 'Oui, le réseau est revenu', next: 'd:equipement-fige' },
        { label: 'Non, toujours rien après redémarrage complet', next: 'prise' },
      ],
    },
    prise: {
      id: 'prise',
      title: 'L’alimentation générale de la baie / du local est-elle correcte ?',
      note: 'Vérifiez la prise murale, l’onduleur et les disjoncteurs du local technique. Une coupure électrique ou un disjoncteur sauté explique une panne totale.',
      choices: [
        { label: 'Un disjoncteur était sauté / un onduleur déchargé', next: 'd:courant-coupe' },
        { label: 'Tout est alimenté mais Internet reste coupé', next: 'd:liaison-fai' },
      ],
    },
  },
  diagnoses: {
    'alim-defaillante': {
      cause: 'L’alimentation du switch était défaillante (multiprise, onduleur ou adaptateur secteur).',
      solution:
        'Le switch redémarre : sécurisez son alimentation sur un onduleur fiable et remplacez l’adaptateur ou la multiprise défaillante.',
    },
    'switch-morte': {
      cause: 'Le switch est en panne matérielle complète.',
      solution:
        'Faites remplacer le switch. En dépannage immédiat, raccordez les postes critiques sur un switch de secours ou sur le routeur si celui-ci dispose de ports libres.',
    },
    'equipement-fige': {
      cause: 'Un équipement central (box, routeur ou switch) était figé après un dysfonctionnement ou une coupure de courant.',
      solution:
        'Le redémarrage ordonné a rétabli le réseau. Pour fiabiliser, placez les équipements sur onduleur et documentez la procédure de redémarrage dans l’ordre.',
    },
    'courant-coupe': {
      cause: 'L’alimentation électrique du local technique était coupée : tout l’équipement réseau était éteint.',
      solution:
        'Réarmez le disjoncteur / rechargez l’onduleur et vérifiez ce qui a provoqué la coupure (surcharge, incident électrique). Installez une alerte de coupure sur l’onduleur.',
    },
    'liaison-fai': {
      cause: 'La liaison Internet du fournisseur d’accès est coupée alors que le réseau local est correct.',
      solution:
        'Vérifiez l’état de la ligne auprès du fournisseur d’accès (espace client, numéro de support) et ouvrez un incident en citant les voyants observés et les tests réalisés.',
    },
  },
};
