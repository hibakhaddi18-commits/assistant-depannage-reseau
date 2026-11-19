export type UsefulCommand = {
  command: string;
  explanation: string;
  example: string;
};

export const usefulCommands: UsefulCommand[] = [
  {
    command: 'ipconfig',
    explanation:
      'Affiche la configuration réseau du poste : adresse IP, masque de sous-réseau, passerelle et serveurs DNS.',
    example:
      'Exemple : tapez « ipconfig /all » pour le détail complet, et repérez une adresse en 169.254.x.x, signe que le DHCP n’a pas répondu.',
  },
  {
    command: 'ipconfig /release',
    explanation:
      'Libère l’adresse IP actuelle du poste, obtenue automatiquement par le serveur DHCP.',
    example:
      'Exemple : en cas de conflit d’adresse IP, libérez l’adresse avec « ipconfig /release » avant de la renouveler.',
  },
  {
    command: 'ipconfig /renew',
    explanation:
      'Demande une nouvelle adresse IP au serveur DHCP, juste après l’avoir libérée.',
    example:
      'Exemple : « ipconfig /renew » si le poste affiche « Connecté, pas d’Internet » ou une adresse en 169.254.x.x.',
  },
  {
    command: 'ipconfig /flushdns',
    explanation:
      'Vide le cache DNS du poste, qui garde en mémoire d’anciennes correspondances nom → adresse IP.',
    example:
      'Exemple : un site a changé d’adresse et ne s’ouvre plus par son nom, alors que « ping » vers son IP répond.',
  },
  {
    command: 'ping',
    explanation:
      'Teste si une machine répond sur le réseau, et mesure le temps de réponse.',
    example:
      'Exemple : « ping 192.168.1.1 » pour tester la passerelle, puis « ping 8.8.8.8 » pour tester Internet sans passer par les noms.',
  },
  {
    command: 'tracert',
    explanation:
      'Montre le chemin suivi par les paquets, routeur par routeur, jusqu’à la destination.',
    example:
      'Exemple : « tracert www.google.com » pour repérer à quel saut la connexion se perd quand un site est inaccessible.',
  },
  {
    command: 'nslookup',
    explanation:
      'Interroge directement le serveur DNS pour traduire un nom de site en adresse IP.',
    example:
      'Exemple : « nslookup www.google.com » échoue alors que « ping 8.8.8.8 » répond ? Le problème vient du DNS, pas de la connexion.',
  },
  {
    command: 'netstat',
    explanation:
      'Liste les connexions réseau en cours et les ports ouverts sur le poste.',
    example:
      'Exemple : « netstat -ano » pour voir quel programme utilise un port, par exemple le port 445 du partage de fichiers.',
  },
];
