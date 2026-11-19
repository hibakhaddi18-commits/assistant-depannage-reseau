import { Globe, Users, FolderLock, Building2, Building, ShieldOff, Link2Off, Printer } from 'lucide-react';
import type { Flow } from './types';

export const problemeDns: Flow = {
  id: 'probleme-dns',
  title: "Les sites ne s'ouvrent pas par leur nom (DNS)",
  icon: Globe,
  start: 'comparaison',
  steps: {
    comparaison: {
      id: 'comparaison',
      title: 'L’adresse IP répond-elle alors que le nom ne répond pas ?',
      note: 'Lancez les deux pings : si « ping 8.8.8.8 » fonctionne mais « ping www.google.com » échoue, le problème est bien lié au DNS.',
      command: 'ping 8.8.8.8 && ping www.google.com',
      choices: [
        { label: 'Oui, l’IP répond mais pas le nom', next: 'nslookup' },
        { label: 'Non, ni l’IP ni le nom ne répondent', next: 'd:connexion-coupe' },
        { label: 'Non, les deux répondent', next: 'd:dns-ok' },
      ],
    },
    nslookup: {
      id: 'nslookup',
      title: 'Que répond la commande nslookup ?',
      note: 'Regardez la ligne « Serveur » : elle indique quel serveur DNS le poste interroge. Si la requête échoue ou retourne un mauvais serveur, le DNS est en cause.',
      command: 'nslookup www.google.com',
      choices: [
        { label: 'Le serveur DNS indiqué est incorrect ou ne répond pas', next: 'verifier-dns' },
        { label: 'Le bon serveur répond mais le nom ne se résout pas', next: 'flushdns' },
      ],
    },
    'verifier-dns': {
      id: 'verifier-dns',
      title: 'Quel serveur DNS est configuré sur le poste ?',
      note: 'Dans « ipconfig /all », regardez la ligne « Serveurs DNS ». Sur un réseau d’entreprise, il doit pointer vers le serveur du domaine, jamais vers une adresse aléatoire.',
      command: 'ipconfig /all',
      choices: [
        { label: 'Le serveur DNS configuré est faux (mauvaise adresse)', next: 'd:mauvais-dns' },
        { label: 'Le serveur DNS configuré semble correct', next: 'flushdns' },
      ],
    },
    flushdns: {
      id: 'flushdns',
      title: 'Après avoir vidé le cache DNS, la résolution fonctionne-t-elle ?',
      note: 'Puis testez à nouveau « ping www.google.com ».',
      command: 'ipconfig /flushdns',
      choices: [
        { label: 'Oui, les sites s’ouvrent à nouveau', next: 'd:cache-corrompu' },
        { label: 'Non, toujours pas de résolution de nom', next: 'd:service-dns' },
      ],
    },
  },
  diagnoses: {
    'connexion-coupe': {
      cause: 'Ce n’est pas un problème de DNS : le poste n’a plus d’accès réseau du tout.',
      solution:
        'Reprenez le diagnostic avec le parcours « Pas d’Internet » : vérification du câble, de l’adresse IP et de la passerelle.',
    },
    'dns-ok': {
      cause: 'Le DNS fonctionne : l’IP et le nom se résolvent tous les deux.',
      solution:
        'Le problème vient du navigateur ou du poste lui-même : vérifiez le proxy configuré dans le navigateur, les paramètres de pare-feu, ou testez avec un autre navigateur.',
    },
    'mauvais-dns': {
      cause: 'Le poste pointe vers un serveur DNS erroné (configuré à la main ou hérité d’une ancienne configuration).',
      solution:
        'Corrigez la carte réseau : en entreprise, laissez le DNS en automatique pour recevoir celui du domaine, ou saisissez l’adresse correcte du serveur DNS interne. Renouvelez l’adresse IP ensuite.',
    },
    'cache-corrompu': {
      cause: 'Le cache DNS du poste contenait une entrée obsolète ou corrompue.',
      solution:
        'Le vidage du cache a rétabli la résolution. Si cela revient souvent sur plusieurs postes, vérifiez la durée de vie (TTL) et les enregistrements sur le serveur DNS.',
    },
    'service-dns': {
      cause: 'Le serveur DNS lui-même est en panne ou son service est arrêté.',
      solution:
        'Sur le serveur DNS, vérifiez que le service est démarré et que la zone répond. En dépannage rapide, un DNS public (8.8.8.8) dépanne pour Internet, mais le DNS interne doit être rétabli pour le domaine.',
    },
  },
};

export const neVoitPasOrdinateurs: Flow = {
  id: 'ne-voit-pas-ordinateurs',
  title: 'Le poste ne voit pas les autres ordinateurs',
  icon: Users,
  start: 'decouverte',
  steps: {
    decouverte: {
      id: 'decouverte',
      title: 'La découverte réseau est-elle activée sur le poste ?',
      note: 'Ouvrez le Centre Réseau et partage → « Modifier les paramètres de partage avancés » : activez la découverte réseau et le partage de fichiers pour le profil actuel (privé ou de domaine).',
      command: 'control.exe /name Microsoft.NetworkAndSharingCenter',
      choices: [
        { label: 'Oui, elle était désactivée, je l’ai activée', next: 'd:decouverte-desactivee' },
        { label: 'Oui, elle est déjà activée', next: 'ping-poste' },
      ],
    },
    'ping-poste': {
      id: 'ping-poste',
      title: 'Le poste voisin répond-il à son adresse IP ?',
      note: 'Testez avec l’adresse IP d’un autre poste connu. S’il répond, le réseau fonctionne mais c’est la visibilité qui manque.',
      command: 'ping 192.168.1.20',
      choices: [
        { label: 'Oui, le voisin répond', next: 'groupe-travail' },
        { label: 'Non, il ne répond pas', next: 'd:pings-bloques' },
      ],
    },
    'groupe-travail': {
      id: 'groupe-travail',
      title: 'Les postes sont-ils dans le même groupe de travail ou domaine ?',
      note: 'Clic droit sur « Ce PC » → Propriétés : comparez le « Groupe de travail » ou le domaine de chaque poste. Tous doivent être identiques.',
      choices: [
        { label: 'Non, les groupes sont différents, je les ai alignés', next: 'd:groupe-different' },
        { label: 'Oui, même groupe de travail / domaine', next: 'parefeu' },
      ],
    },
    parefeu: {
      id: 'parefeu',
      title: 'Le pare-feu bloque-t-il le partage ?',
      note: 'Dans le pare-feu Windows avec sécurité avancée, vérifiez que les règles « Partage de fichiers et d’imprimantes » et « Découverte réseau » sont activées pour le profil réseau en cours.',
      command: 'wf.msc',
      choices: [
        { label: 'Oui, après activation des règles, les postes apparaissent', next: 'd:parefeu-bloque' },
        { label: 'Oui, les règles sont actives mais rien ne change', next: 'service-partage' },
      ],
    },
    'service-partage': {
      id: 'service-partage',
      title: 'Les services de partage sont-ils démarrés ?',
      note: 'Dans services.msc, vérifiez les services « Publication des ressources de découverte de fonctionnalités » (FDResPub), « Hôte de périphérique UPnP » et « Serveur » : ils doivent être démarrés et en automatique.',
      command: 'services.msc',
      choices: [
        { label: 'Des services étaient arrêtés, je les ai démarrés', next: 'd:services-arretes' },
        { label: 'Tous les services tournent mais toujours rien', next: 'd:voisinage-panne' },
      ],
    },
  },
  diagnoses: {
    'decouverte-desactivee': {
      cause: 'La découverte réseau était désactivée sur le poste (profil réseau en public ou désactivation volontaire).',
      solution:
        'Activez la découverte réseau et le partage de fichiers pour le profil correspondant, et placez le réseau dans le profil « privé » ou « de domaine » plutôt que « public ».',
    },
    'pings-bloques': {
      cause: 'Le poste voisin ne répond pas : pare-feu strict, poste éteint, ou problème réseau entre les deux postes.',
      solution:
        'Vérifiez que le poste voisin est allumé, que son pare-feu autorise le ping (règle « Partage de fichiers et d’imprimantes (Echo Request) ») et que les deux postes sont sur le même réseau / VLAN.',
    },
    'groupe-different': {
      cause: 'Les postes n’appartenaient pas au même groupe de travail (ou domaine), donc ils n’apparaissent pas ensemble.',
      solution:
        'Alignez le groupe de travail sur tous les postes (Système → Renommer ce PC), puis redémarrez-les. En entreprise avec un domaine, vérifiez que tous les postes sont bien membres du domaine.',
    },
    'parefeu-bloque': {
      cause: 'Le pare-feu Windows bloquait les flux de découverte et de partage.',
      solution:
        'Activez durablement les règles « Découverte réseau » et « Partage de fichiers et d’imprimantes » via une stratégie de groupe pour l’appliquer à tous les postes du domaine.',
    },
    'services-arretes': {
      cause: 'Des services Windows nécessaires à la découverte et au partage étaient arrêtés.',
      solution:
        'Passez ces services en démarrage « Automatique » (FDResPub, Hôte UPnP, Serveur) pour éviter que le problème se reproduise après un redémarrage.',
    },
    'voisinage-panne': {
      cause: 'Le voisinage réseau reste vide malgré une configuration correcte : panne du navigateur d’exploration ou infrastructure réseau (maître d’exploration, SMB) défaillante.',
      solution:
        'Accédez aux postes directement par leur nom (\\NOM-POSTE) ou leur adresse IP plutôt que par la liste du voisinage. En dernier recours, vérifiez les enregistrements DNS / NetBIOS sur le serveur.',
    },
  },
};

export const dossierInaccessible: Flow = {
  id: 'dossier-inaccessible',
  title: 'Dossier partagé inaccessible',
  icon: FolderLock,
  start: 'ping-serveur',
  steps: {
    'ping-serveur': {
      id: 'ping-serveur',
      title: 'Le serveur ou poste qui héberge le dossier répond-il au ping ?',
      note: 'Testez d’abord par adresse IP, puis par nom. Si l’IP répond mais pas le nom, le problème est un DNS (voir parcours DNS).',
      command: 'ping 192.168.1.10 && ping SERVEUR',
      choices: [
        { label: 'Oui, le serveur répond (IP et nom)', next: 'acces-chimique' },
        { label: 'L’IP répond mais pas le nom', next: 'd:probleme-dns' },
        { label: 'Non, aucune réponse', next: 'd:serveur-joignable' },
      ],
    },
    'acces-chimique': {
      id: 'acces-chimique',
      title: 'Le chemin réseau saisi est-il correct ?',
      note: 'Testez l’ouverture directe du partage avec la syntaxe \\\\SERVEUR\\Dossier. Vous pouvez lister les partages disponibles avec la commande net view.',
      command: 'net view \\\\SERVEUR',
      choices: [
        { label: 'Le dossier s’ouvre avec le bon chemin', next: 'd:chemin-incorrect' },
        { label: 'Le chemin est bon mais l’accès est refusé', next: 'identifiants' },
      ],
    },
    identifiants: {
      id: 'identifiants',
      title: 'Vos identifiants et permissions sont-ils corrects ?',
      note: 'Le message « accès refusé » indique un problème de droits : identifiant / mot de passe incorrects, ou compte non autorisé sur ce partage. Testez avec « net use » pour voir la session ouverte.',
      command: 'net use',
      choices: [
        { label: 'Une ancienne session est restée connectée', next: 'd:session-obsolette' },
        { label: 'Les identifiants sont bons mais le partage reste refusé', next: 'smb' },
      ],
    },
    smb: {
      id: 'smb',
      title: 'Le service SMB est-il actif sur le poste ?',
      note: 'Dans services.msc, vérifiez le service « Station de travail » (Workstation) côté client, et le service « Serveur » (Server) côté machine qui héberge le partage.',
      command: 'services.msc',
      choices: [
        { label: 'Un service était arrêté, je l’ai démarré', next: 'd:smb-arrete' },
        { label: 'Les services tournent mais l’accès reste refusé', next: 'd:droits-partage' },
      ],
    },
  },
  diagnoses: {
    'probleme-dns': {
      cause: 'Le poste ne résout pas le nom du serveur : problème de DNS.',
      solution:
        'Vérifiez le serveur DNS configuré (ipconfig /all), videz le cache (ipconfig /flushdns) et suivez le parcours « Les sites ne s’ouvrent pas par leur nom (DNS) ».',
    },
    'serveur-joignable': {
      cause: 'Le serveur n’est pas joignable : il est éteint, déconnecté, ou un équipement réseau entre le poste et lui est en panne.',
      solution:
        'Vérifiez que le serveur est allumé et raccordé au réseau, testez depuis un autre poste, puis contrôlez le switch / VLAN intermédiaire.',
    },
    'chemin-incorrect': {
      cause: 'Le chemin réseau saisi était incorrect (faute de frappe, mauvais nom, ou nom du partage différent du nom visible).',
      solution:
        'Le bon chemin rétablit l’accès. Pour éviter les erreurs, mappez le lecteur réseau avec « net use Z: \\\\SERVEUR\\Dossier /persistent:yes » ou via une stratégie de groupe.',
    },
    'session-obsolette': {
      cause: 'Le poste avait mémorisé une ancienne session (identifiants obsolètes) vers le serveur.',
      solution:
        'Supprimez la session avec « net use * /delete », puis reconnectez-vous avec les identifiants valides. Pour un accès permanent, utilisez « net use ... /user:DOMAINE\\utilisateur » ou les gestionnaires d’identifiants.',
    },
    'smb-arrete': {
      cause: 'Le service SMB (Station de travail côté client ou Serveur côté hôte) était arrêté.',
      solution:
        'Redémarrez le service concerné et remettez-le en démarrage automatique. Vérifiez aussi que la version de SMB activée (SMB1 / SMB2) est cohérente entre le poste et le serveur.',
    },
    'droits-partage': {
      cause: 'Les permissions NTFS ou de partage n’autorisent pas ce compte d’utilisateur.',
      solution:
        'Sur le serveur, vérifiez les deux niveaux de droits : l’onglet « Partage » ET les permissions NTFS du dossier. Ajoutez le groupe concerné en lecture / modification selon le besoin, côté serveur uniquement.',
    },
  },
};

export const ressourcesDomaine: Flow = {
  id: 'ressources-domaine',
  title: 'Ressources du domaine inaccessibles mais Internet OK',
  icon: Building2,
  start: 'ping-dc',
  steps: {
    'ping-dc': {
      id: 'ping-dc',
      title: 'Le contrôleur de domaine répond-il au ping ?',
      note: 'Testez le serveur du domaine par son nom. Internet fonctionne, donc le réseau local est a priori bon : ciblez le serveur du domaine.',
      command: 'ping CONTROLEUR-DOMAINE',
      choices: [
        { label: 'Oui, il répond', next: 'dns-domaine' },
        { label: 'Non, il ne répond pas', next: 'd:dc-joignable' },
      ],
    },
    'dns-domaine': {
      id: 'dns-domaine',
      title: 'Le DNS du poste pointe-t-il bien vers le serveur du domaine ?',
      note: 'Dans « ipconfig /all », la ligne « Serveurs DNS » doit indiquer le contrôleur de domaine (pas un DNS public comme 8.8.8.8). C’est LA cause n°1 de ce symptôme.',
      command: 'ipconfig /all',
      choices: [
        { label: 'Non, le DNS pointe ailleurs (ex. 8.8.8.8)', next: 'd:dns-public' },
        { label: 'Oui, le DNS pointe vers le contrôleur de domaine', next: 'nslookup-domaine' },
      ],
    },
    'nslookup-domaine': {
      id: 'nslookup-domaine',
      title: 'Le domaine se résout-il correctement ?',
      note: 'La requête doit être renvoyée par le serveur DNS du domaine. Vérifiez que le nom du domaine et des ressources (ex. \\SERVEUR\Partage) répondent.',
      command: 'nslookup mondomaine.local',
      choices: [
        { label: 'Oui, mais l’accès reste bloqué', next: 'heure' },
        { label: 'Non, la résolution du domaine échoue', next: 'd:zone-dns' },
      ],
    },
    heure: {
      id: 'heure',
      title: 'L’heure du poste est-elle synchronisée avec celle du serveur ?',
      note: 'Un écart de plus de 5 minutes casse l’authentification Kerberos : les accès au domaine sont refusés même si tout le reste est correct.',
      command: 'w32tm /query /status',
      choices: [
        { label: 'L’heure était décalée, je l’ai resynchronisée', next: 'd:heure-decalee' },
        { label: 'L’heure est correcte', next: 'd:session-expiree' },
      ],
    },
  },
  diagnoses: {
    'dc-joignable': {
      cause: 'Le contrôleur de domaine est injoignable : serveur éteint, en panne, ou problème réseau / VLAN entre le poste et lui.',
      solution:
        'Vérifiez physiquement le serveur (allumé, réseau), testez depuis un autre poste, puis contrôlez le switch et les VLAN intermédiaires.',
    },
    'dns-public': {
      cause: 'Le poste utilise un DNS public au lieu du serveur DNS du domaine : il ne peut plus localiser le contrôleur de domaine (Internet fonctionne, mais pas le domaine).',
      solution:
        'Remettez l’adresse du contrôleur de domaine comme serveur DNS sur la carte réseau (en automatique si le DHCP est bien configuré), puis « ipconfig /flushdns » et redémarrez la session.',
    },
    'zone-dns': {
      cause: 'La zone DNS du domaine ne répond plus correctement (service DNS arrêté, enregistrements manquants).',
      solution:
        'Sur le contrôleur de domaine, vérifiez le service DNS et la zone du domaine. Vérifiez que les enregistrements SRV (_ldap._tcp) existent : « nslookup -type=srv _ldap._tcp.mondomaine.local ».',
    },
    'heure-decalee': {
      cause: 'L’heure du poste était décalée de plus de 5 minutes : l’authentification Kerberos au domaine était refusée.',
      solution:
        'Resynchronisez l’heure avec « w32tm /resync » et vérifiez que le service Temps Windows pointe bien vers le contrôleur de domaine. Redémarrez ensuite la session de l’utilisateur.',
    },
    'session-expiree': {
      cause: 'La session d’ordinateur ou le mot de passe du compte machine dans l’Active Directory est désynchronisé.',
      solution:
        'Connectez-vous en local sur le poste, puis réinitialisez le compte machine dans l’Active Directory (ou exécutez « netdom resetpwd » si disponible), puis redémarrez et reconnectez-vous au domaine.',
    },
  },
};

export const connexionDomaine: Flow = {
  id: 'connexion-domaine',
  title: 'Connexion au domaine impossible',
  icon: Building,
  start: 'membre-domaine',
  steps: {
    'membre-domaine': {
      id: 'membre-domaine',
      title: 'Le poste figure-t-il encore comme membre du domaine ?',
      note: '« Système » affiche « Domaine : xxx » si le poste est membre. Le message « Relation de confiance échouée » signale un compte machine désynchronisé.',
      command: 'systeminfo | findstr /C:"Domaine"',
      choices: [
        { label: 'Message « Relation de confiance échouée »', next: 'd:relation-confiance' },
        { label: 'Le poste est sorti du domaine / jamais joint', next: 'verif-reseau' },
      ],
    },
    'verif-reseau': {
      id: 'verif-reseau',
      title: 'Le poste atteint-il le contrôleur de domaine ?',
      note: 'Vérifiez le câble, l’adresse IP et surtout le DNS : il doit pointer vers le contrôleur de domaine, sinon la jonction échouera.',
      command: 'ping CONTROLEUR-DOMAINE && nslookup mondomaine.local',
      choices: [
        { label: 'Non, le contrôleur ne répond pas', next: 'd:dc-joignable' },
        { label: 'Oui, il répond mais la jonction échoue', next: 'compte-ad' },
      ],
    },
    'compte-ad': {
      id: 'compte-ad',
      title: 'Le compte d’ordinateur est-il actif dans l’Active Directory ?',
      note: 'Dans « Utilisateurs et ordinateurs Active Directory », cherchez le nom du poste : le compte ne doit pas être désactivé (flèche grise). Vérifiez aussi vos droits de jonction au domaine.',
      command: 'dsa.msc',
      choices: [
        { label: 'Le compte était désactivé, je l’ai réactivé', next: 'd:compte-desactive' },
        { label: 'Le compte est actif mais la jonction échoue encore', next: 'd:dns-ou-heure' },
      ],
    },
  },
  diagnoses: {
    'relation-confiance': {
      cause: 'La relation de confiance entre le poste et le domaine est rompue : le mot de passe du compte machine est désynchronisé.',
      solution:
        'Connectez-vous en local (.\\utilisateur), puis réinitialisez le compte machine dans l’Active Directory ou exécutez « netdom resetpwd », puis redémarrez. En dernier recours : sortir le poste du domaine et le réintégrer.',
    },
    'dc-joignable': {
      cause: 'Le contrôleur de domaine est injoignable depuis le poste : réseau, VLAN ou serveur en panne.',
      solution:
        'Vérifiez le câble, l’adresse IP et le switch, puis l’état du contrôleur de domaine lui-même. La jonction au domaine est impossible tant que le serveur ne répond pas.',
    },
    'compte-desactive': {
      cause: 'Le compte d’ordinateur était désactivé dans l’Active Directory (souvent après un nettoyage des objets obsolètes).',
      solution:
        'La réactivation du compte a rétabli la connexion. Pour éviter la récurrence, vérifiez les règles de nettoyage automatique des objets ordinateurs du domaine.',
    },
    'dns-ou-heure': {
      cause: 'La jonction échoue malgré un serveur joignable : DNS du poste incorrect ou écart d’heure bloquant l’authentification.',
      solution:
        'Vérifiez le DNS du poste (il doit pointer vers le contrôleur de domaine) et resynchronisez l’heure (w32tm /resync). Si la jonction échoue encore, retirez le poste du domaine en « Groupe de travail », redémarrez, puis réintégrez-le.',
    },
  },
};

export const vpnBloque: Flow = {
  id: 'vpn-bloque',
  title: 'VPN qui ne se connecte pas',
  icon: ShieldOff,
  start: 'sans-vpn',
  steps: {
    'sans-vpn': {
      id: 'sans-vpn',
      title: 'Internet fonctionne-t-il normalement sans le VPN ?',
      note: 'Déconnectez le VPN et ouvrez un site web. Si Internet ne fonctionne pas sans VPN, le problème est la connexion elle-même.',
      choices: [
        { label: 'Oui, Internet fonctionne sans VPN', next: 'identifiants' },
        { label: 'Non, Internet est coupé même sans VPN', next: 'd:internet-coupe' },
      ],
    },
    identifiants: {
      id: 'identifiants',
      title: 'Vos identifiants VPN sont-ils valides et acceptés ?',
      note: 'Le message « identifiants incorrects » indique un mot de passe erroné ou un compte expiré / verrouillé. Vérifiez aussi que le compte n’a pas dépassé sa date d’expiration.',
      choices: [
        { label: 'Les identifiants étaient en cause, ça se connecte maintenant', next: 'd:identifiants' },
        { label: 'Les identifiants sont bons mais la connexion échoue', next: 'parefeu' },
      ],
    },
    parefeu: {
      id: 'parefeu',
      title: 'Un pare-feu ou un antivirus bloque-t-il le VPN ?',
      note: 'Désactivez temporairement le pare-feu / antivirus tiers pour tester. Vérifiez aussi que le port du VPN n’est pas bloqué (ex. UDP 500/4500 pour IPsec, UDP 1194 pour OpenVPN).',
      command: 'wf.msc',
      choices: [
        { label: 'Oui, en désactivant le pare-feu, le VPN se connecte', next: 'd:parefeu-bloque' },
        { label: 'Non, le blocage persiste', next: 'service-vpn' },
      ],
    },
    'service-vpn': {
      id: 'service-vpn',
      title: 'Le service VPN du poste est-il démarré ?',
      note: 'Dans services.msc, vérifiez « Routage et accès distant » (RemoteAccess) et le service propre au client VPN utilisé. Redémarrez aussi le client VPN lui-même.',
      command: 'services.msc',
      choices: [
        { label: 'Le service était arrêté, ça fonctionne après redémarrage', next: 'd:service-arrete' },
        { label: 'Le service tourne mais la connexion échoue', next: 'autre-reseau' },
      ],
    },
    'autre-reseau': {
      id: 'autre-reseau',
      title: 'Le VPN se connecte-t-il depuis un autre réseau (partage de connexion mobile) ?',
      note: 'Certains réseaux (hotels, entreprises, box avec pare-feu strict) bloquent les protocoles VPN. Ce test les identifie immédiatement.',
      choices: [
        { label: 'Oui, ça se connecte depuis un autre réseau', next: 'd:reseau-bloque' },
        { label: 'Non, ça échoue aussi depuis un autre réseau', next: 'd:serveur-vpn' },
      ],
    },
  },
  diagnoses: {
    'internet-coupe': {
      cause: 'Ce n’est pas le VPN : la connexion Internet du poste est coupée.',
      solution:
        'Reprenez le parcours « Pas d’Internet » (câble, IP, passerelle, DNS) avant de retester le VPN.',
    },
    identifiants: {
      cause: 'Les identifiants VPN étaient invalides (mot de passe erroné, compte expiré ou verrouillé).',
      solution:
        'Le compte fonctionne à nouveau. Si le mot de passe du domaine vient d’être changé, pensez à le ressaisir dans le client VPN et à déverrouiller le compte dans l’Active Directory.',
    },
    'parefeu-bloque': {
      cause: 'Le pare-feu ou l’antivirus du poste bloquait les flux du VPN.',
      solution:
        'Créez une règle permanente autorisant le client VPN dans le pare-feu plutôt que de désactiver la protection. Sur les antivirus tiers, ajoutez le client en exclusion.',
    },
    'service-arrete': {
      cause: 'Le service VPN du poste (Routage et accès distant ou service du client) était arrêté.',
      solution:
        'Remettez le service en démarrage automatique et redémarrez le client VPN. Si le service s’arrête de lui-même, réinstallez le client VPN.',
    },
    'reseau-bloque': {
      cause: 'Le réseau utilisé bloque les protocoles VPN (pare-feu de la box, réseau d’entreprise ou hôtelier restrictif).',
      solution:
        'Depuis ce réseau, essayez un protocole alternatif (SSL / TLS sur le port 443) si le serveur VPN le propose, ou utilisez un autre réseau. Sur la box, activez le passage VPN (IPsec / PPTP passthrough).',
    },
    'serveur-vpn': {
      cause: 'Le VPN échoue depuis plusieurs réseaux : le serveur VPN ou la passerelle distante est en panne.',
      solution:
        'Vérifiez que d’autres utilisateurs se connectent. Si personne ne se connecte, contrôlez la passerelle VPN (service, certificats expirés, quota de sessions) auprès de l’administrateur.',
    },
  },
};

export const siteUniqueBloque: Flow = {
  id: 'site-unique-bloque',
  title: 'Un seul site ou service inaccessible',
  icon: Link2Off,
  start: 'ailleurs',
  steps: {
    ailleurs: {
      id: 'ailleurs',
      title: 'Le site fonctionne-t-il depuis un autre poste ou un autre réseau ?',
      note: 'Testez depuis un poste voisin, puis depuis un smartphone en 4G. Cela détermine si le problème est local au poste ou lié au site lui-même.',
      choices: [
        { label: 'Non, le site est en panne pour tout le monde', next: 'd:site-en-panne' },
        { label: 'Oui, il marche ailleurs mais pas sur ce poste', next: 'flushdns' },
      ],
    },
    flushdns: {
      id: 'flushdns',
      title: 'Après avoir vidé le cache DNS, le site s’ouvre-t-il ?',
      note: 'Le cache DNS du poste peut contenir une adresse obsolète pour ce site précis.',
      command: 'ipconfig /flushdns',
      choices: [
        { label: 'Oui, le site s’ouvre maintenant', next: 'd:cache-site' },
        { label: 'Non, toujours inaccessible', next: 'hosts' },
      ],
    },
    hosts: {
      id: 'hosts',
      title: 'Le site est-il bloqué dans le fichier hosts ?',
      note: 'Ouvrez le fichier C:\\Windows\\System32\\drivers\\etc\\hosts avec le Bloc-notes (en administrateur) : une ligne contenant l’adresse du site (souvent 127.0.0.1) le bloque localement.',
      command: 'notepad C:\\Windows\\System32\\drivers\\etc\\hosts',
      choices: [
        { label: 'Oui, une ligne bloquait le site, je l’ai retirée', next: 'd:fichier-hosts' },
        { label: 'Non, le fichier hosts est vierge', next: 'parefeu-proxy' },
      ],
    },
    'parefeu-proxy': {
      id: 'parefeu-proxy',
      title: 'Un pare-feu ou un proxy bloque-t-il ce site ?',
      note: 'Vérifiez le pare-feu (wf.msc) et les paramètres de proxy du poste et du navigateur. Un filtrage web d’entreprise peut bloquer certaines catégories de sites.',
      command: 'wf.msc',
      choices: [
        { label: 'Oui, une règle / le proxy bloquait le site', next: 'd:filtrage' },
        { label: 'Non, rien ne bloque côté pare-feu / proxy', next: 'navigateur' },
      ],
    },
    navigateur: {
      id: 'navigateur',
      title: 'Le site s’ouvre-t-il dans un autre navigateur ?',
      note: 'Testez avec un second navigateur ou en navigation privée. Si cela fonctionne, videz le cache du navigateur d’origine ou désactivez ses extensions.',
      choices: [
        { label: 'Oui, ça marche dans un autre navigateur', next: 'd:cache-navigateur' },
        { label: 'Non, aucun navigateur n’ouvre le site', next: 'd:blocage-antivirus' },
      ],
    },
  },
  diagnoses: {
    'site-en-panne': {
      cause: 'Le site lui-même est en panne (ou son service d’hébergement).',
      solution:
        'Aucune action locale nécessaire : attendez le rétablissement. Vérifiez éventuellement un site d’état de service ou l’annonce faite par l’éditeur.',
    },
    'cache-site': {
      cause: 'Le cache DNS du poste contenait une adresse obsolète pour ce site.',
      solution:
        'Le vidage a rétabli l’accès. Si cela se reproduit souvent sur ce site, l’éditeur change fréquemment ses adresses : rien à corriger côté poste.',
    },
    'fichier-hosts': {
      cause: 'Une entrée dans le fichier hosts redirigeait le site vers une adresse morte (blocage volontaire ou résidu d’un logiciel).',
      solution:
        'La ligne a été retirée. Certains logiciels de sécurité / filtrage réécrivent ce fichier : vérifiez qu’aucun outil ne la recrée après redémarrage.',
    },
    filtrage: {
      cause: 'Le site était bloqué par une règle de pare-feu ou la politique de filtrage web / proxy.',
      solution:
        'Selon la politique de l’entreprise, demandez une exception de filtrage au responsable réseau, ou corrigez la règle locale si elle a été créée par erreur.',
    },
    'cache-navigateur': {
      cause: 'Le cache ou une extension du navigateur d’origine bloquait l’affichage du site.',
      solution:
        'Videz le cache et les cookies du navigateur en cause, puis désactivez ses extensions une à une pour identifier celle qui pose problème.',
    },
    'blocage-antivirus': {
      cause: 'Un logiciel de sécurité (antivirus, contrôle parental, filtrage) bloque ce site au niveau du poste.',
      solution:
        'Consultez les journaux de l’antivirus / du filtrage, ajoutez le site en exclusion si c’est légitime, et vérifiez que le site n’est pas classé dans une catégorie bloquée.',
    },
  },
};

export const imprimanteInaccessible: Flow = {
  id: 'imprimante-inaccessible',
  title: 'Imprimante réseau introuvable',
  icon: Printer,
  start: 'etat-imprimante',
  steps: {
    'etat-imprimante': {
      id: 'etat-imprimante',
      title: 'L’imprimante est-elle allumée et connectée au réseau ?',
      note: 'Vérifiez le voyant réseau de l’imprimante (ou son écran → Paramètres réseau). Notez son adresse IP affichée à l’écran ou sur sa page de configuration.',
      choices: [
        { label: 'Oui, elle est allumée avec le voyant réseau actif', next: 'ping-imprimante' },
        { label: 'Non, pas de voyant réseau / écran vide', next: 'd:imprimante-eteinte' },
      ],
    },
    'ping-imprimante': {
      id: 'ping-imprimante',
      title: 'L’imprimante répond-elle à son adresse IP ?',
      note: 'Remplacez 192.168.1.100 par l’adresse IP de l’imprimante. Si l’IP répond, le réseau est bon : le problème est côté file d’attente ou pilote.',
      command: 'ping 192.168.1.100',
      choices: [
        { label: 'Oui, elle répond au ping', next: 'file-attente' },
        { label: 'Non, elle ne répond pas', next: 'd:ip-imprimante' },
      ],
    },
    'file-attente': {
      id: 'file-attente',
      title: 'La file d’attente d’impression est-elle bloquée ?',
      note: 'Ouvrez « printmanagement.msc » ou Paramètres → Imprimantes : si des documents restent « en cours d’impression », videz la file puis redémarrez le service Spouleur d’impression.',
      command: 'net stop spooler && net start spooler',
      choices: [
        { label: 'Oui, après vidage de la file et redémarrage du spouleur, ça imprime', next: 'd:file-bloquee' },
        { label: 'Non, l’impression échoue toujours', next: 'pilote' },
      ],
    },
    pilote: {
      id: 'pilote',
      title: 'Après réinstallation de l’imprimante et de son pilote, ça fonctionne ?',
      note: 'Supprimez l’imprimante du poste, téléchargez le pilote correspondant au modèle exact sur le site du fabricant, puis réinstallez-la sur son port réseau (adresse IP).',
      choices: [
        { label: 'Oui, l’impression fonctionne', next: 'd:pilote-imprimante' },
        { label: 'Non, toujours aucune impression', next: 'd:imprimante-panne' },
      ],
    },
  },
  diagnoses: {
    'imprimante-eteinte': {
      cause: 'L’imprimante est éteinte, en veille profonde, ou son câble réseau est débranché.',
      solution:
        'Allumez l’imprimante (réveillez-la), vérifiez son câble réseau et le port du switch. Si elle reste morte, vérifiez son alimentation électrique.',
    },
    'ip-imprimante': {
      cause: 'L’imprimante n’est plus joignable à son adresse IP : adresse changée (DHCP), conflit, ou carte réseau de l’imprimante en panne.',
      solution:
        'Imprimez la page de configuration réseau de l’imprimante pour connaître sa nouvelle adresse, puis recréez le port d’impression avec la bonne IP. Créez une réservation DHCP pour l’imprimante afin qu’elle ne change plus.',
    },
    'file-bloquee': {
      cause: 'La file d’attente d’impression était bloquée par un document corrompu.',
      solution:
        'Le redémarrage du spouleur a débloqué la situation. Identifiez l’application qui a envoyé le document corrompu si cela se répète, et videz la file dès qu’un blocage apparaît.',
    },
    'pilote-imprimante': {
      cause: 'Le pilote d’impression du poste était corrompu ou inadapté au modèle.',
      solution:
        'La réinstallation a rétabli l’impression. Centralisez les pilotes validés sur un partage réseau pour les futurs déploiements.',
    },
    'imprimante-panne': {
      cause: 'L’imprimante elle-même est en panne (carte réseau interne, spouleur interne, panne matérielle).',
      solution:
        'Redémarrez électriquement l’imprimante une fois (éteinte 1 minute), et si l’échec persiste, ouvrez un incident auprès du fournisseur ou faites jouer la maintenance.',
    },
  },
};
