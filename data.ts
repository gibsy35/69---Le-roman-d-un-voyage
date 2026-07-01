import { Chapter } from './types';

export const TRIPS_DATA: Chapter[] = [
  {
    id: "chap-1",
    title: "Dimanche de Folie - Le Grand Départ",
    date: "16 Mars 2025",
    location: "Rennes",
    country: "France",
    anecdote: "Départ sous les larmes (mitigées de bonheur et tristesse) de notre fille et de nos petits-enfants à la gare de Rennes. Un agent compréhensif nous laisse passer sur le quai interdit malgré nos lourdes valises de 20 kg. Cap sur Roissy CDG, notre voyage commence !",
    illustrated: "gare_rennes_j",
    stats: {
      distance: 350,
      iconicPlace: "Gare de Rennes & Roissy Terminal 3"
    }
  },
  {
    id: "chap-2",
    title: "Le Choc d'Orient et nos Premiers Pas Perdus",
    date: "18 Mars 2025",
    location: "Hong Kong",
    country: "Hong Kong",
    anecdote: "Malgré un décollage fêté le jour de ma fête, et une course folle lors du transfert de 45 minutes à Shanghai, nous arrivons sains et saufs à Hong Kong. Première promenade et premiers échanges de 'mots doux' entre Mam et moi : nos GPS perdent le nord et nous marchons 4 km en rond sans trouver notre métro ! On termine la soirée réconciliés devant des gambas géantes dégustées au Bubba Gump de la Peak Tower.",
    illustrated: "hong_kong_peak",
    stats: {
      distance: 9600,
      flightHours: 11,
      iconicPlace: "Victoria Peak & Wan Chai"
    }
  },
  {
    id: "chap-3",
    title: "Le Gros Point sur le 'I' à la Préfecture",
    date: "20 Mars 2025",
    location: "Haikou",
    country: "Chine",
    anecdote: "Escale de 9 heures interminable à Haikou. L'immigration nous retient car la préfecture d'Ille-et-Vilaine a commis une erreur de frappe sur mon passeport, écrivant un point (Jean.Baptiste) à la place d'un tiret. Les douaniers chinois me soupçonnent d'avoir 4 prénoms au lieu de 3 ! Mam bouillonne de colère, persuadée que c'est à cause des photos que je prends partout.",
    illustrated: "haikou_airport",
    stats: {
      distance: 1400,
      flightHours: 2.5,
      iconicPlace: "Haikou Meilan International Airport"
    }
  },
  {
    id: "chap-4",
    title: "La Malédiction du 4x4 Néo-Zélandais",
    date: "21 Mars 2025",
    location: "Auckland",
    country: "Nouvelle-Zélande",
    anecdote: "À peine débarqués, grand bol d'air pur mais... je gare notre gros 4x4 en stationnement minute et claque le pneu gauche sur le trottoir. Pneu éclaté, je suis furax contre moi-même. On résout la solitude du jet-lag avec un bon verre de vin blanc de Villa Maria.",
    illustrated: "auckland_harbour",
    stats: {
      distance: 9300,
      flightHours: 12,
      iconicPlace: "Baie d'Auckland"
    }
  },
  {
    id: "chap-5",
    title: "Les Dauphins et le Trou du Rocher",
    date: "25 Mars 2025",
    location: "Paihia (Bay of Islands)",
    country: "Nouvelle-Zélande",
    anecdote: "Inoubliable croisière vers 'Hole on the Rocks'. Des centaines de dauphins dansent autour de la proue de notre bateau, s'amusant avec les remous. Adrénaline pure, mes yeux brillent et même Mam, d'habitude si sereine, a des lueurs d'extase face à cette valse marine sauvage.",
    illustrated: "paihia_dolphins",
    stats: {
      distance: 240,
      iconicPlace: "Hole on the Rocks"
    }
  },
  {
    id: "chap-6",
    title: "La Rencontre de Stephen & Ruth et de la Traite du Soir",
    date: "28 Mars 2025",
    location: "Reporoa",
    country: "Nouvelle-Zélande",
    anecdote: "Après avoir lutté avec le clapet d'essence de notre 4x4 dans une station-service, un agriculteur local, Stephen, m'aide. En discutant, il apprend que j'ai travaillé toute ma carrière dans l'agriculture Bio en France. Il nous invite chez lui à Reporoa ! Nous mangeons un délicieux gâteau à la banane fait par Ruth, et assistons émerveillés à la traite rotative de leurs 1000 vaches. Un moment d'humanité pure.",
    illustrated: "reporoa_farm",
    stats: {
      distance: 400,
      iconicPlace: "Ferme laitière de Stephen & Ruth"
    }
  },
  {
    id: "chap-7",
    title: "Le Drame du Sèche-Linge et l'Art Déco de Napier",
    date: "30 Mars 2025",
    location: "Wellington",
    country: "Nouvelle-Zélande",
    anecdote: "Le feuilleton de la lessive continue ! Dans notre chambre de Wellington mitoyenne de la laverie, je lance un sèche-linge géant. Mon jean déteint sur le t-shirt de Mam et mon bermuda favori. Colère mémorable de la surveillante générale ! Nous nous consolons en visitant le superbe musée Te Papa.",
    illustrated: "napier_art_deco",
    stats: {
      distance: 320,
      iconicPlace: "Musée Te Papa & Napier"
    }
  },
  {
    id: "chap-8",
    title: "Daniel Lebrun : Le Français Fou du Champagne",
    date: "1 Avril 2025",
    location: "Blenheim",
    country: "Nouvelle-Zélande",
    anecdote: "Visite magique chez Daniel Lebrun, un Français installé en Nouvelle-Zélande depuis 40 ans pour produire de la 'méthode traditionnelle' d'excellence. On déguste ses cuvées de prestige (N°1 Family Estate). Un immense respect pour ce vigneron d'exception. Pique-nique de l'extrême sur une plage déserte sur la route de Kaikoura, en buvant du blanc refroidi dans l'écume de la mer !",
    illustrated: "blenheim_vineyards",
    stats: {
      distance: 130,
      iconicPlace: "N°1 Family Estate & Marlborough"
    }
  },
  {
    id: "chap-9",
    title: "Les Chercheurs d'Or et la Soirée Court-Circuit",
    date: "5 Avril 2025",
    location: "Altona (Melbourne)",
    country: "Australie",
    anecdote: "Logés chez notre ami Jérôme et sa petite Lola de 11 ans. Visite des magnifiques villes de la ruée vers l'or (Daylesford, Castlemaine). Mais la nuit, c'est le choc : Mam ferme la lumière de sa lampe de chevet... BOUM ! Une explosion illumine la chambre et fait sauter les plombs de tout le quartier. Mam, en vraie 'warrior', a coupée le courant de plusieurs blocs !",
    illustrated: "great_ocean_road",
    stats: {
      distance: 8200,
      flightHours: 3.5,
      iconicPlace: "Altona Beach & Daylesford"
    }
  },
  {
    id: "chap-10",
    title: "Cottage Solitaire au Phare de l'Extrême",
    date: "6 Avril 2025",
    location: "Cape Otway",
    country: "Australie",
    anecdote: "Jérôme nous a réservé une surprise : dormir dans la maison d'époque du gardien du phare de Cape Otway. Arrivée de nuit compliquée (code d'accès perdu). Au petit matin, réveillé à 5h sous la tempête, j'assiste seul au lever de soleil grandiose sur l'Océan Pacifique, entouré de dizaines de kangourous qui sortent de la forêt autour du gîte.",
    illustrated: "cape_otway_lighthouse",
    stats: {
      distance: 220,
      iconicPlace: "Phare de Cape Otway"
    }
  },
  {
    id: "chap-11",
    title: "Le Bagno et le Diable de Tasmanie",
    date: "11 Avril 2025",
    location: "Port Arthur",
    country: "Australie (Tasmanie)",
    anecdote: "Vol vers Hobart. Nous partons explorer le dramatique bagne de Port Arthur, entouré d'eaux infestées de requins. Mark, notre guide moustachu passionné d'histoire locale, nous raconte la dure vie des 12 500 bagnards déportés. Passage devant l'isthme d'Eagle Hawk Neck et sa fameuse ligne de chiens féroces.",
    illustrated: "port_arthur_tasmania",
    stats: {
      distance: 1200,
      flightHours: 1.2,
      iconicPlace: "Bagne de Port Arthur"
    }
  },
  {
    id: "chap-12",
    title: "Le Musée Souterrain d'un Milliardaire Excentrique",
    date: "13 Avril 2025",
    location: "Hobart (MONA)",
    country: "Australie (Tasmanie)",
    anecdote: "Visite du MONA, immense musée creusé à même la falaise de grès. Conçu par David Walsh, un mathématicien génial qui a fait fortune dans les jeux en ligne en prédisant l'issue des courses de chevaux. Un anti-musée provoquant, fantastique mélange de technologie, d'érotisme et de mort, adossé à son domaine viticole.",
    illustrated: "mona_museum",
    stats: {
      distance: 50,
      iconicPlace: "Museum of Old and New Arts"
    }
  },
  {
    id: "chap-13",
    title: "Le Vol Plané du Fortuner dans le Bush",
    date: "19 Avril 2025",
    location: "Hermannsburg",
    country: "Australie (Outback)",
    anecdote: "Cap sur le 'Red Center'. Arrivée sous une chaleur étouffante de 36°C et assaillis par des nuées de moustiques et de mouches. Nous louons un gros Toyota Fortuner et décidons de couper à travers les pistes aborigènes. Passage d'un gué inondé : le trou est si profond que notre gros 4x4 quitte le sol pour retomber 3 mètres plus loin ! Frayeur de sa vie pour Mam.",
    illustrated: "outback_dust",
    stats: {
      distance: 2800,
      flightHours: 3.0,
      iconicPlace: "Uluru & Hermannsburg Track"
    }
  },
  {
    id: "chap-14",
    title: "Première Classe pour Singapour et Sagesse de Dedi",
    date: "25 Avril 2025",
    location: "Yogyakarta",
    country: "Indonésie (Java)",
    anecdote: "Surprise royale : l'hôtesse de la compagnie nous surclasse en Première Classe pour notre vol de 8h ! Sièges couchettes, hublots teintés, champagne. Mais dès l'arrivée à Yogyakarta, le choc de l'Asie nous cueille : formalités de douane compliquées par un formulaire électronique omis. Heureusement, nous retrouvons notre guide Dedi, un jeune homme de 26 ans amoureux de Molière et de théologie, et notre chauffeur Setyo, jardinier spécialiste des bonsaïs.",
    illustrated: "singapore_luxurious",
    stats: {
      distance: 6200,
      flightHours: 8.5,
      iconicPlace: "Temple de Borobudur"
    }
  },
  {
    id: "chap-15",
    title: "Le Calvaire Brûlant du Mont Bromo",
    date: "29 Avril 2025",
    location: "Mont Bromo",
    country: "Indonésie (Java)",
    anecdote: "Réveil cruel à 1h du matin. Montée étroite en vieux Land Cruiser bruyant au milieu de 400 jeeps crachant de la fumée noire. Au sommet, la température ressentie chute à -2°C. Mam suffoque à cause de l'altitude et des vapeurs de soufre, son cœur s'emballe à 150 BPM. Décision sage de redescendre sans attendre le lever de soleil. Je fais l'ascension finale du cratère à cheval.",
    illustrated: "mount_bromo_volcano",
    stats: {
      distance: 180,
      iconicPlace: "Caldeira du Mont Bromo"
    }
  },
  {
    id: "chap-16",
    title: "La Jungle des Orangs-Outans et nos Baskets Neuves",
    date: "6 Mai 2025",
    location: "Bukit Lawang",
    country: "Indonésie (Sumatra)",
    anecdote: "Trek d'exploration dans le parc de Gunung Leuser. Traversée de nuit d'une passerelle suspendue bringuebalante dans le noir absolu. Le lendemain, sous une pluie battante et dans une boue épaisse, nous approchons nos cousins les Orangs-Outans dans la canopée d'eucalyptus. Les baskets toutes neuves de Mam finissent la journée prêtes pour une retraite bien méritée !",
    illustrated: "orangoutan_jungle",
    stats: {
      distance: 2200,
      flightHours: 2.1,
      iconicPlace: "Parc National de Gunung Leuser"
    }
  },
  {
    id: "chap-17",
    title: "La Diète Japonaise et les Yakuzas Tatoués",
    date: "16 Mai 2025",
    location: "Tokyo (Asakusa)",
    country: "Japon",
    anecdote: "Landing à Tokyo, accueillis par une réception robotisée sans humanité. Nous partons visiter le temple Senso-ji et tombons par pur hasard en pleine procession annuelle de Sanja Matsuri. Nous admirons des hommes arborant des chefs-d'œuvre de tatouages (Irezumi) sur tout le corps : des parrains du clan Yakuza qui dansent nus sur des palanquins géants !",
    illustrated: "tokyo_sensoji",
    stats: {
      distance: 5300,
      flightHours: 7.2,
      iconicPlace: "Temple Senso-ji & Asakusa"
    }
  },
  {
    id: "chap-18",
    title: "La Tempête Sacrée de Nikko",
    date: "17 Mai 2025",
    location: "Nikko",
    country: "Japon",
    anecdote: "Réveil à 5h30 sous une pluie battante pour rejoindre Nikko. Notre guide espagnole Paula nous conte avec passion les légendes du pont Shinkyo rouge laqué et du mausolée de la dynastie Tokugawa. Nous finissons trempés jusqu'aux os devant les chutes de Kegon grandioses de 100 mètres.",
    illustrated: "nikko_bridge",
    stats: {
      distance: 160,
      iconicPlace: "Mausolée Toshogu & Chutes de Kegon"
    }
  },
  {
    id: "chap-19",
    title: "La Sagesse de la Dame au Bambou et le Pavillon d'Or",
    date: "23 Mai 2025",
    location: "Kyoto",
    country: "Japon",
    anecdote: "Découverte de la somptueuse forêt de bambous géants de Sagano à Arashiyama, puis contemplation du Pavillon d'Or (Kinkaku-ji) étincelant recouvert de 20 kg de feuilles d'or. Mam fatigue sous le soleil de plomb. Soirée compliquée devant un dîner de tripes commandées par erreur par Mam qui pensait s'offrir une soupe Pho !",
    illustrated: "kyoto_kinkakuji",
    stats: {
      distance: 450,
      iconicPlace: "Bambouseraie d'Arashiyama & Pavillon d'Or"
    }
  },
  {
    id: "chap-20",
    title: "Le Vœu de Réussite sur la Lanterne Rouge de Shifen",
    date: "6 Juin 2025",
    location: "Shifen & Jiufen",
    country: "Taïwan",
    anecdote: "Traversée mémorable de Taipei vers le village de montagne de Shifen. Nous écrivons à l'encre de Chine nos vœux de santé et de prospérité sur notre lanterne céleste rouge, que nous faisons s'envoler au-dessus des rails dans un ciel brumeux, avec une pensée de réussite pour l'entreprise Kujé de notre fille Alix !",
    illustrated: "shifen_lantern",
    stats: {
      distance: 2100,
      flightHours: 3.0,
      iconicPlace: "Cascades de Shifen & Vieille rue de Jiufen"
    }
  },
  {
    id: "chap-21",
    title: "Le Classeur Magique qui n'avait plus rien de Magique !",
    date: "11 Juin 2025",
    location: "Kaohsiung à Hong Kong",
    country: "Taïwan à Hong Kong",
    anecdote: "Panique absolue ! Mam m'assure toute la matinée que notre vol retour est à 15h15, fier de son classeur d'or. Je suspecte un problème et consulte mon téléphone sous la douche : le vol décolle à 10h15 ! Il est 9h30, l'enregistrement ferme dans 15 minutes. Valises en vrac, course folle en taxi Tesla aux portes papillon, nous rachetons des billets sur Eva Air pour 336 €. Mam est en larmes, mais je la console d'un baiser. C'est ça l'aventure !",
    illustrated: "airport_kaohsiung",
    stats: {
      distance: 350,
      iconicPlace: "Terminal de Kaohsiung & Aéroport HK"
    }
  },
  {
    id: "chap-22",
    title: "Rennes de Retour - 3 Mois de Légende",
    date: "14 Juin 2025",
    location: "Rennes",
    country: "France",
    anecdote: "Atterrissage à Roissy, TGV bondé par les grèves habituelles... et enfin, l'arrivée sur le quai de la gare de Rennes. Toute notre grande famille est là pour nous accueillir et nous aider avec notre montagne de 60 kg de bagages. Nous l'avons fait ! 69 ans, 69 000 km, 69 heures de vol et des souvenirs coulés en or pour le restant de nos jours.",
    illustrated: "rennes_return",
    stats: {
      distance: 9800,
      flightHours: 12.5,
      iconicPlace: "La Maison de Famille"
    }
  }
];

export const DAD_QUOTES = [
  "C'EST POSSIBLE à n'importe quel âge. Ne lâchez rien !",
  "Le spécialiste du Tetris a encore frappé avec nos 5 valises de 20 kg !",
  "À 18 heures, c'est l'heure immuable du petit vin blanc pour le petit père tranquille.",
  "Mam a toujours raison, même quand mon GPS perd le nord !",
  "Procrastiner sur le billet TGV de retour nous a coûté un détour par Montparnasse... mais quel bonheur ce petit-déjeuner parisien !",
  "Pas de frites chapardées dans mon assiette s'il te plaît, Mam ! Oh et puis si, prends-les..."
];
