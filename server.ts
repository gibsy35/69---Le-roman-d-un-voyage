import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import Stripe from "stripe";
import { BookOrder, SocialPost, AdCampaign, BookConfig, GuestbookMessage } from "./types";
import { ARCHIVE_SITUATIONS } from "./situations69";

dotenv.config();

const app = express();
const PORT = 3000;

// Lazy Stripe Initialization
let stripeClient: Stripe | null = null;
function getStripe(): Stripe | null {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey || secretKey === "MY_STRIPE_SECRET_KEY") {
    return null;
  }
  if (!stripeClient) {
    stripeClient = new Stripe(secretKey, {
      apiVersion: "2025-01-27.acacia" as any,
    });
  }
  return stripeClient;
}

app.use(express.json());

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "MOCK_KEY_FOR_TESTING",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Pre-populated data for Sales Tracker
let orderDatabase: BookOrder[] = [];

// Pre-populated marketing posts
let postDatabase: SocialPost[] = [
  {
    id: "post-1",
    platform: "facebook",
    content: "Nous l'avons fait ! 69 ans, 69 000 km, 69 heures de vol et 69 raisons d'aller au bout du monde. Notre livre est dorénavant disponible en d'élégantes éditions brochées et illustrées ou en téléchargement direct. Prêts à embarquer à bord de la Team 69 ? 🌍🎒✈️ #69CestPossible #DaronVoyageur #WorldTour",
    status: "published",
    scheduledDate: "2026-06-15"
  },
  {
    id: "post-2",
    platform: "instagram",
    content: "Aperçu de notre périple : au milieu de 400 jeeps au Mont Bromo sous -2°C, ou fuyant les vagues devant le trou du rocher de Paihia entourés de dauphins... Des souvenirs plein les yeux, et désormais coulés dans mon carnet de voyage ! 📘✨ Lien en bio pour commander le livre '69' ! #Team69 #Aventure #Outback #NewZealand",
    status: "scheduled",
    scheduledDate: "2026-06-18"
  }
];

// Pre-populated advertising campaigns
let adCampDatabase: AdCampaign[] = [
  {
    id: "ad-1",
    title: "Vente Livre 69 - Retraités Actifs & Seniors Voyageurs",
    audience: "Seniors (55-80), Intérêts pour Voyage, Randonnée, Photographie, Littérature, France/Europe",
    budget: 5,
    status: "active",
    clicks: 1420,
    impressions: 24500,
    conversions: 112,
    adText: "« À 69 ans, c'est encore POSSIBLE ! » Découvrez le périple fou de 3 mois de Patrice et Mam à travers l'Asie et l'Océanie. Un livre d'aventure authentique, drôle, humain, plein d'anecdotes et de conseils précieux. Commandez votre exemplaire papier ou livre numérique d'urgence !"
  },
  {
    id: "ad-2",
    title: "Vente Livre 69 - Enfants de parents baroudeurs (Cadeau)",
    audience: "Adultes (30-50), Intérêts pour Cadeaux Parents, Fête des pères, Récits de Voyages, Esprit baroudeur",
    budget: 3,
    status: "paused",
    clicks: 410,
    impressions: 9800,
    conversions: 24,
    adText: "Offrez le plus beau cadeau inspirant à vos parents ! '69' est le livre de bord d'un périple inoubliable de deux darons bretons de 69 ans partis réaliser leur rêve de gosse. Cliquez pour commander l'édition premium reliée."
  }
];

// Pre-populated inventory stock
let inventoryDatabase = [
  { format: "printed", name: "Édition Brochée", stock: 124, threshold: 20, weightGrams: 420, shelfLocation: "Armoire Breizh - Étagère A1" },
  { format: "hardcover", name: "Luxe Illustré (Édit. Limitée)", stock: 35, threshold: 10, weightGrams: 980, shelfLocation: "Armoire Breizh - Étagère B2" },
  { format: "pdf", name: "Édition Numérique (PDF)", stock: 99999, threshold: 0, weightGrams: 0, shelfLocation: "Serveur Cloud (Digital)" }
];

// Configurable Book Metadata & Cover
let bookConfigDatabase: BookConfig = {
  coverImageUrl: "preset-miyajima",
  coverBorderColor: "#FD3D63",
  authorName: "PATRICE LEQUIME",
  bookTitle: "69",
  bookSubtitle: "LE ROMAN D'UN VOYAGE",
  topBadge: "69 ANS • 69 000 KM • 69 HEURES DE VOL",
  bottomLine: "69 LIEUX ÉTONNANTS • 69 RAISONS D'Y CROIRE...",
  backQuote: "« Poursuivez vos rêves. À 69 ans, tout est possible. »",
  backAboutTitle: "À PROPOS DE CE LIVRE",
  backAboutSubtitle: "Le livre à offrir à vos parents ou vos grands-parents",
  backAboutContent: "Ce bouquin est sans prétentions.\nNi un livre de photos, ni un guide touristique,\nni un roman d'aventures.\n\nJuste un récit dont l'ambition est de vous donner envie de toujours poursuivre vos rêves sans rien lâcher, en vous prouvant que « c'est possible » à n'importe quel âge.\n\nSi nous y sommes parvenus, alors vous aussi pouvez y parvenir."
};

// Guestbook comments
let guestbookDatabase: GuestbookMessage[] = [
  {
    id: "gb-1",
    name: "Monique (la Momo)",
    message: "Quel site de rêve ! Mais dis-moi mon cher Patrice, as-tu fini de ranger ton fameux 'Tetris' de valises ? N'oublie pas qu'on doit repartir bientôt ! 😘 Un grand merci à notre fils pour ce bel hommage.",
    location: "Rennes, Bretagne",
    date: "2026-06-28"
  },
  {
    id: "gb-2",
    name: "Jérôme, Lola & Lola-fille",
    message: "On rigole encore en pensant à la fameuse nuit du court-circuit à Altona ! La lampe de chevet s'en souvient encore. Une aventure extraordinaire, des darons exceptionnels ! Le livre est une merveille.",
    location: "Melbourne, Australie",
    date: "2026-06-25"
  },
  {
    id: "gb-3",
    name: "Stephen & Ruth",
    message: "What a joy meeting Patrice and Monique in New Zealand! We will never forget our chats about organic farming and of course, baking the banana cake for Monique. Good luck with the book!",
    location: "Reporoa, New Zealand",
    date: "2026-06-22"
  },
  {
    id: "gb-4",
    name: "Manu & les p'tits enfants",
    message: "Bravo Papy et Mamie ! Vos récits sont tellement inspirants pour toute la famille. On a hâte de faire lire votre livre à l'école ! Gros bisous bretons.",
    location: "Acigné, France",
    date: "2026-06-18"
  }
];

// Database of all 69 authentic book situations from situations69.ts
let bookSituationsDatabase = ARCHIVE_SITUATIONS;

let _legacySituations = [
  {
    id: "sit-1",
    pageNum: 7,
    chapterTitle: "Le Grand Départ à la Gare de Rennes (Jour J)",
    date: "16 Mars 2025",
    location: "Rennes",
    country: "France",
    category: "transports",
    categoryLabel: "✈️ Départ & Logistique",
    photoUrl: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&q=80&w=800",
    photoCaption: "Photo du manuscrit p. 7 : Presque toute la famille à la gare de Rennes pour le Jour J",
    cameraInfo: "Cliché d'archive Manuscrit p. 7 • Rennes",
    excerpt: "Presque toute la famille (il manque Raphael) nous accompagne à la gare y compris le dernier de nos petits fils de 4 ans en fauteuil roulant pour nous dire au revoir. Nous pouvons dire qu’il s’agit du moment émotion de la journée car notre fille extrêmement sensible a qq larmes avant même notre descente sur le quai de la gare. Il est normalement interdit aux non voyageurs mais un agent très compréhensif devant la tristesse de notre fille et nos lourds bagages, accepte de les faire entrer par la passerelle d’accès au quai afin de nous accompagner et nous aider.",
    quote: "« Le premier pas d'un long voyage demande toujours un peu de bravoure et beaucoup de valises. »",
    stats: { distanceKm: 350, iconicSite: "Gare de Rennes & Roissy Terminal 3" }
  },
  {
    id: "sit-2",
    pageNum: 9,
    chapterTitle: "Se perdre dans la Baie de Hong Kong",
    date: "18 Mars 2025",
    location: "Hong Kong",
    country: "Hong Kong",
    category: "rencontres",
    categoryLabel: "🤝 Rencontres & Escale",
    photoUrl: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&q=80&w=800",
    photoCaption: "Photo du manuscrit p. 9 : Baie de HongKong vue du Peak Victoria (Pic Victoria)",
    cameraInfo: "Cliché d'archive Manuscrit p. 9 • Hong Kong",
    excerpt: "Hgkg est une RAS chinoise (Région Administrative Spéciale) qui compte 7.5 millions d’habitants sur une surface 10 x grande comme Paris... Nous voilà partis mais manifestement pas dans la bonne direction et la, commencent les échanges de mots doux entre Mam et moi. Nous arrivons à nous perdre après avoir fait au moins 3 ou 4 km en tournant en rond...",
    quote: "« Se perdre ensemble à 69 ans, c'est encore la meilleure manière de se retrouver. »",
    stats: { distanceKm: 9600, iconicSite: "Victoria Peak & Wan Chai" }
  },
  {
    id: "sit-3",
    pageNum: 14,
    chapterTitle: "Le Feuilleton du passeport à Haikou",
    date: "20 Mars 2025",
    location: "Haikou",
    country: "Chine",
    category: "transports",
    categoryLabel: "✈️ Transports & Péripéties",
    photoUrl: "https://images.unsplash.com/photo-1542296332-2e4473faf563?auto=format&fit=crop&q=80&w=800",
    photoCaption: "Photo du manuscrit p. 14 : Haikou Meilan International Airport (Chine)",
    cameraInfo: "Cliché d'archive Manuscrit p. 14 • Haikou",
    excerpt: "23H 15 enregistrement debute sans souci pile a l’heure indiquée et nous sommes dans la file d’attente pendant 30 mn environ puis arrive notre tour... Cette erreur emanne en fait de la Prefecture d’Ille et Vilaine qui a écrit un point au lieu d’un tiret a mon prenom jean-baptiste . Cette erreur a pour consequense que les services de l’immigration chinoise et neo zelandaise me baptisent de 4 prenoms et non de 3 .",
    quote: "« Un simple point de frappe administrative peut déclencher un incident diplomatique en Asie ! »",
    stats: { distanceKm: 1400, iconicSite: "Haikou Meilan International Airport" }
  },
  {
    id: "sit-4",
    pageNum: 16,
    chapterTitle: "La Malédiction du 4x4 à Auckland",
    date: "21 Mars 2025",
    location: "Auckland",
    country: "Nouvelle-Zélande",
    category: "4x4",
    categoryLabel: "🤠 Péripéties & 4x4",
    photoUrl: "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?auto=format&fit=crop&q=80&w=800",
    photoCaption: "Photo du manuscrit p. 16 : Baie d'Auckland — Ca commence mal au pays des kiwis",
    cameraInfo: "Cliché d'archive Manuscrit p. 16 • Auckland",
    excerpt: "J’avais garé le 4X4 devant l’hotel en stationnement minute mais ne pouvais pas le laisser a cet endroit pour la nuit... Est-ce l’ennervement ou la fatigue du « jet stream » car il est déjà tres tard, mais en me garant au meme endroit j’éclate le pneu gauche sur le trottoir. Je suis furax contre moi meme et dois remonter expliquer tt ca a Mam qui ne manquera surement pas de s’exprimer.",
    quote: "« Ca commence mal au pays des kiwis, mais un bon verre de Villa Maria répare tout. »",
    stats: { distanceKm: 9300, iconicSite: "Auckland Harbour & Waitemata" }
  },
  {
    id: "sit-5",
    pageNum: 28,
    chapterTitle: "Fabuleuse Valse des Dauphins à Paihia",
    date: "25 Mars 2025",
    location: "Paihia (Bay of Islands)",
    country: "Nouvelle-Zélande",
    category: "nature",
    categoryLabel: "🦘 Faune & Nature",
    photoUrl: "https://images.unsplash.com/photo-1570459027562-4a916cc6113f?auto=format&fit=crop&q=80&w=800",
    photoCaption: "Photo du manuscrit p. 28 : Fabuleuse valse des dauphins au large de Paihia",
    cameraInfo: "Cliché d'archive Manuscrit p. 28 • Paihia",
    excerpt: "Puis lorsque des centaines de dauphins nous accompagnent vers le « Hole on the Rocks » ( trou du rocher en francais), Ils executent une danse aussi fascinante qu’émouvante en passant et repassant a droite a gauche devant derriere et sous le bateau comme pour nous dire qu’ils aiment jouer avec les remous provoqués par les turbines. C’est genial je descends me mettre a la proue du bateau.",
    quote: "« Quand les dauphins escortent votre bateau, vous comprenez la magie de ce monde. »",
    stats: { distanceKm: 240, iconicSite: "Hole in the Rock & Bay of Islands" }
  },
  {
    id: "sit-6",
    pageNum: 41,
    chapterTitle: "La Rencontre de Stephen & Ruth à Reporoa",
    date: "28 Mars 2025",
    location: "Reporoa",
    country: "Nouvelle-Zélande",
    category: "rencontres",
    categoryLabel: "🤝 Rencontres & Hospitalité",
    photoUrl: "https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&q=80&w=800",
    photoCaption: "Photo du manuscrit p. 43 : 1ere tournée : 170 vaches descendent pour la traite du soir",
    cameraInfo: "Cliché d'archive Manuscrit p. 41-43 • Reporoa",
    excerpt: "Nous arrivons donc chez eux en 25 mn et nous sommes merveilleusement accueillis dans leur belle petite maison avec une tasse de café et un gateau a la banane. Il est a noter car «tout ce qui est rare est a noter» (ah!ah!ah!), que meme Mam qui ne mange jamais de banane trouvera ce gateau excellent et en prendra 2x... Au moment de partir ils nous proposent d’assister à la traite d’un 1 er groupe de 170 betes.",
    quote: "« Deux agriculteurs bretons au milieu du lait néo-zélandais : la vraie richesse du voyage. »",
    stats: { distanceKm: 400, iconicSite: "Ferme Laitière de Reporoa" }
  },
  {
    id: "sit-7",
    pageNum: 55,
    chapterTitle: "Wellington la Venteuse & Le Musée Te Papa",
    date: "30 Mars 2025",
    location: "Wellington",
    country: "Nouvelle-Zélande",
    category: "rituels",
    categoryLabel: "🍷 Rituels & Culture",
    photoUrl: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800",
    photoCaption: "Photo du manuscrit p. 55 : Musée Te Papa (art & culture et traditions maori)",
    cameraInfo: "Cliché d'archive Manuscrit p. 55 • Wellington",
    excerpt: "A noter que Wellington est la capitale de la NZ depuis 1875. Elle compte un peu plus de 200000 habitants et se situe au point le plus meridional de l’ile du Nord dans le detroit du capitaine james Cook qui a decouvert l’ile en 1769 . Sa position geographique en fait une ville tres venteuse qui lui donne dailleurs son surnom de «Windy Wellington» traduit en francais par «Wellington la venteuse».",
    quote: "« La réputation de la capitale culturelle maorie n'est vraiment pas surfaite. »",
    stats: { distanceKm: 320, iconicSite: "Musée Te Papa & Port de Wellington" }
  },
  {
    id: "sit-8",
    pageNum: 64,
    chapterTitle: "Chez Daniel Lebrun & Pique-nique à la Robinson",
    date: "1er Avril 2025",
    location: "Blenheim & Kaikoura",
    country: "Nouvelle-Zélande",
    category: "rituels",
    categoryLabel: "🍷 Rituels & Dégustations",
    photoUrl: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=800",
    photoCaption: "Photo du manuscrit p. 65 : Petit arrêt surprise après Seldon sur la route de Kaikoura",
    cameraInfo: "Cliché d'archive Manuscrit p. 64-65 • Blenheim",
    excerpt: "Le cas de Daniel Lebrun fondateur de N°1 Familly estate est pourtant particulier car apres ses etudes d’œnologie il souhaite s’emanciper et part en NZ tres jeune... On s’arrete sur la route a l’improviste sur un chemin de terre... On trouve un arbre en guise de fauteuil et de grosses pierres pour faire une table et apres une bonne promenade les pieds dans l'eau, on picnic a la Robinson Crusoé sans couverts avec ce luxe d’un bon verre de blanc raffraichit dans l'eau de mer.",
    quote: "« Refroidir son vin blanc dans l'Océan Pacifique à 69 ans : la vraie définition du luxe. »",
    stats: { distanceKm: 130, iconicSite: "N°1 Family Estate Marlborough" }
  },
  {
    id: "sit-9",
    pageNum: 87,
    chapterTitle: "Le Court-Circuit Géant d'Altona",
    date: "5 Avril 2025",
    location: "Altona (Melbourne)",
    country: "Australie",
    category: "rituels",
    categoryLabel: "🍷 Rituels & Humour",
    photoUrl: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&q=80&w=800",
    photoCaption: "Photo du manuscrit p. 83 : Jérôme devant chez lui à Altona",
    cameraInfo: "Cliché d'archive Manuscrit p. 87 • Altona",
    excerpt: "Mam ferme la lumiere avec l’interupteur de la lampe de chevet qui se trouve sur la table a coté d’elle et … BOUM …Un enorme bruit, un eclair et comme une explosion dans la chambre et Mam qui pense s’etre brulée... Je constate ensuite que c’est bien un court circuit qui a fait disjoncter le compteur de la maison. Nous sortons dans la rue et constatons que le quartier entier est privé d’electricité ! Decidement Mam est vraiment une «warrior» !",
    quote: "« Quand Mam touche un interrupteur en Australie, tout le quartier passe dans le noir ! »",
    stats: { distanceKm: 8200, iconicSite: "Altona Beach & Daylesford" }
  },
  {
    id: "sit-10",
    pageNum: 101,
    chapterTitle: "Lever de Soleil & Kangourous au Phare de Cape Otway",
    date: "7 Avril 2025",
    location: "Cape Otway",
    country: "Australie",
    category: "nature",
    categoryLabel: "🦘 Faune & Lieux Magiques",
    photoUrl: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&q=80&w=800",
    photoCaption: "Photo du manuscrit p. 101 : Cape Otway natural reserve — Kangourous au petit matin",
    cameraInfo: "Cliché d'archive Manuscrit p. 101 • Cape Otway",
    excerpt: "5h00 le reveil sonne... Je vais admirer le lever du soleil sur le phare avec le ressas des vagues de l’ocean pacifique en musique de fond accompagné de la douceur de la pluie. Croyez moi c’est un moment hors du temps, c’est sublimissime. Puis qq mn apres le lever du soleil les kangourous sortent de partout pour se ballader autour de la maison.",
    quote: "« Prendre son café du matin au milieu des kangourous sous le phare de l'Océan Indien. »",
    stats: { distanceKm: 220, iconicSite: "Phare historique de Cape Otway" }
  },
  {
    id: "sit-11",
    pageNum: 127,
    chapterTitle: "La Dog Line et le Bagne de Port Arthur",
    date: "11 Avril 2025",
    location: "Port Arthur (Tasmanie)",
    country: "Australie",
    category: "nature",
    categoryLabel: "🦘 Patrimoine & Histoire",
    photoUrl: "https://images.unsplash.com/photo-1528728329032-2972f65dfb3f?auto=format&fit=crop&q=80&w=800",
    photoCaption: "Photo du manuscrit p. 127 : Cellules des bagnards et tour de garde au Bagne de Port Arthur",
    cameraInfo: "Cliché d'archive Manuscrit p. 127 • Port Arthur",
    excerpt: "À Eaglehawk Neck, ( l' isthme qui mene a port Arthur) , le chemin de mer de 30 mètres de large, qu'on appelle le cou de l'aigle faucon, est le seul passage terrestre, alors pour empêcher les évasions, les autorités ont installé une ligne de chiens agressifs... Durant 44 ans de 1833 a 1877 ce sont 12500 bagnards qui ont été envoyés a Port Arthur pour participer a la construction.",
    quote: "« Un pan poignant d'histoire gravé dans la pierre sauvage de Tasmanie. »",
    stats: { distanceKm: 1200, iconicSite: "Bagne historique de Port Arthur" }
  },
  {
    id: "sit-12",
    pageNum: 137,
    chapterTitle: "Le Génie Excentrique du MONA à Hobart",
    date: "13 Avril 2025",
    location: "Hobart (Tasmanie)",
    country: "Australie",
    category: "rencontres",
    categoryLabel: "🤝 Culture & Lieux Insolites",
    photoUrl: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&q=80&w=800",
    photoCaption: "Photo du manuscrit p. 138 : Adossé au MONA Domaine viticole de Moorilla",
    cameraInfo: "Cliché d'archive Manuscrit p. 137-138 • MONA Hobart",
    excerpt: "David Walsh est un jeune homme issu d’une famille pauvre... Il devient un joueur invétéré qui compte les cartes a l’université de Tasmanie... Son musée sera donc souterrain, creusé dans la falaise de grés «Le contraire d’un temple qui domine et ecrase le visiteur car l’ART est en dessous». MONA devient alors une success story qui attire plus de 350000 visiteurs par an.",
    quote: "« La création n'a aucune limite quand la passion rencontre l'excentricité. »",
    stats: { distanceKm: 50, iconicSite: "MONA Museum Hobart" }
  },
  {
    id: "sit-13",
    pageNum: 163,
    chapterTitle: "Le Vol Plané du Fortuner sur la Piste Aborigène",
    date: "19 Avril 2025",
    location: "Hermannsburg Track (Outback)",
    country: "Australie",
    category: "4x4",
    categoryLabel: "🤠 Péripéties & 4x4",
    photoUrl: "https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?auto=format&fit=crop&q=80&w=800",
    photoCaption: "Photo du manuscrit p. 163 : Sur les pistes de la réserve aborigène",
    cameraInfo: "Cliché d'archive Manuscrit p. 163 • Hermannsburg",
    excerpt: "lorsque nous passons un gue dans lequel je pense qu’il n’y a que peu d’eau, le trou est si profond que la voiture decolle pour retombée 3 metres plus loin en faisant a Mam la frayeur de sa vie. C’est alors qu’elle cherche a m’embrouiller en disant n’importe quoi que je lui dit « STOP LAISSE MOI CONDUIRE ».",
    quote: "« Voler à 3 mètres du sol en 4x4 dans l'Outback : la plus grande frayeur de Mam ! »",
    stats: { distanceKm: 2800, iconicSite: "Uluru & Track d'Hermannsburg" }
  },
  {
    id: "sit-14",
    pageNum: 194,
    chapterTitle: "Spiritualité à Borobudur et Sagesse de Dedi",
    date: "26 Avril 2025",
    location: "Yogyakarta",
    country: "Indonésie",
    category: "rencontres",
    categoryLabel: "🤝 Rencontres & Sérénité",
    photoUrl: "https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&q=80&w=800",
    photoCaption: "Photo du manuscrit p. 194 : Temple de Borobudur à Java",
    cameraInfo: "Cliché d'archive Manuscrit p. 194 • Borobudur",
    excerpt: "Ce temple Inscrit au patrimoine mondial de l’UNESCO en 1991, fut construit entre le 8eme et le 9eme siecle et est encore aujourd’hui le plus grand du monde et reste le plus visité en Asie... Dedy, ce jeune homme de 26 ans qui en fait 18 est en francais un « self made man » . Il a appris seul notre langue car c’est un amoureux de Moliere.",
    quote: "« La vraie richesse d'un voyage réside dans l'âme de ceux qui vous guident. »",
    stats: { distanceKm: 6200, iconicSite: "Borobudur Temple Java" }
  },
  {
    id: "sit-15",
    pageNum: 208,
    chapterTitle: "Ascension Glaciale et Frayeur au Mont Bromo",
    date: "29 Avril 2025",
    location: "Mont Bromo (Java)",
    country: "Indonésie",
    category: "volcans",
    categoryLabel: "🌋 Volcans & Panoramas",
    photoUrl: "https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&q=80&w=800",
    photoCaption: "Photo du manuscrit p. 208 : Notre carrosse à 1h du matin au Mont Bromo",
    cameraInfo: "Cliché d'archive Manuscrit p. 208-212 • Bromo",
    excerpt: "Debout 1heure du mat comme prevu... On embarque donc avec Dedy et le chauffeur qui nous conduit vers le mont Bromo qui culmine a 2329 metres... Au sommet, la température ressentie descend à -2°C. Bref la situation n’est pas geniale lorsque soudainement Mam a le cœur qui s’emballe a plus de 150 bpm et quand elle se blotit contre moi meurtie par le froid et l’angoisse, elle semble s’étouffer alors je dois reagir vite.",
    quote: "« Affronter un volcan en éruption à 69 ans demande de l'humilité et du courage. »",
    stats: { distanceKm: 180, iconicSite: "Caldeira du Mont Bromo" }
  },
  {
    id: "sit-16",
    pageNum: 220,
    chapterTitle: "Peno Homestay & Dégustation de Café à Sumberbuluh",
    date: "30 Avril 2025",
    location: "Gombengsari (Sumberbuluh)",
    country: "Indonésie",
    category: "rencontres",
    categoryLabel: "🤝 Rencontres & Écotourisme",
    photoUrl: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&q=80&w=800",
    photoCaption: "Photo du manuscrit p. 221 : Hospitalité de Peno et de sa femme après la visite",
    cameraInfo: "Cliché d'archive Manuscrit p. 220-221 • Gombengsari",
    excerpt: "Bref, en arrivant chez Peno, Nous decouvrons une famille indonesienne qui propose , dans le petit village de « Sumberbuluh », perdu au milieu de nulle part, deux gites merveilleux... Peno connait cela , il en avait l’habitude et c’est ce pourquoi il a voulu construire ce gite un peu different et il se met à nous raconter son cursus extremement passionnant. Il est ingenieur agricole et a travaillé dans la grosse plantation de café.",
    quote: "« L'écotourisme responsable : une rencontre authentique et humaine au cœur de Java. »",
    stats: { distanceKm: 50, iconicSite: "Peno Homestay Gombengsari" }
  },
  {
    id: "sit-17",
    pageNum: 225,
    chapterTitle: "Villa Dua Bintang & Cours de Cuisine chez Ely",
    date: "1er Mai 2025",
    location: "Munduk (Bali)",
    country: "Indonésie",
    category: "rituels",
    categoryLabel: "🍷 Gastronomie & Nature",
    photoUrl: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800",
    photoCaption: "Photo du manuscrit p. 225 : Hôtel avec terrasse sur la jungle à Munduk",
    cameraInfo: "Cliché d'archive Manuscrit p. 225-232 • Munduk",
    excerpt: "L’hotel écoresponsable se trouve au beau milieu de la foret .Ttes les chambres ont une terrasse avec vue magnifique sur la splendide piscine a debordement et la jungle... Nous terminons cette journée, en decidant de faire une immersion dans la culture Balinaise à travers un cours de cuisine traditionnelle chez Rico & Ely.",
    quote: "« Cuisiner un Nasi Goreng maison sous la jungle balinaise : pur enchantement. »",
    stats: { distanceKm: 120, iconicSite: "Villa Dua Bintang Munduk" }
  },
  {
    id: "sit-18",
    pageNum: 248,
    chapterTitle: "Séance Épique chez le Guérisseur à Gianyar",
    date: "4 Mai 2025",
    location: "Gianyar (Bali)",
    country: "Indonésie",
    category: "rencontres",
    categoryLabel: "🤝 Rituels & Tradition",
    photoUrl: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&q=80&w=800",
    photoCaption: "Photo du manuscrit p. 249 : Demeure et cabinet de notre médecin guérisseur",
    cameraInfo: "Cliché d'archive Manuscrit p. 248-249 • Gianyar",
    excerpt: "Nick nous conduit chez son copain le guerisseur. Sur le chemin nous decouvrons une maison magnifique... Nous avons droit a la ceremonie d’acceuil avec les offrandes puis je passe dans la salle du « billard » sur lequel je m’assied. En face de moi je peux voir des dessins de corps humains... Nick fait meme une courte video dans laquelle on me voit hurler de douleur !",
    quote: "« Il veut éradiquer le mal me dit-il tout en me faisant hurler de douleur ! »",
    stats: { distanceKm: 40, iconicSite: "Cabinet du Guérisseur Gianyar" }
  },
  {
    id: "sit-19",
    pageNum: 265,
    chapterTitle: "Trek dans la Jungle des Orangs-Outans à Bukit Lawang",
    date: "6 Mai 2025",
    location: "Bukit Lawang (Sumatra)",
    country: "Indonésie",
    category: "nature",
    categoryLabel: "🦘 Faune & Jungle Sauvage",
    photoUrl: "https://images.unsplash.com/photo-1535083783855-76ae62b2914e?auto=format&fit=crop&q=80&w=800",
    photoCaption: "Photo du manuscrit p. 265 : Merveilleuse rencontre avec nos cousins les plus proches",
    cameraInfo: "Cliché d'archive Manuscrit p. 265 • Bukit Lawang",
    excerpt: "Puis petit a petit ce sont plusieurs de ces grands singes qui rejoignent leur congenere lorsqu’ils s’apercoivent que nous ne representons aucun danger et nous les acompagnons longtemps dans leur lente ascension dans ces arbres jusqu’à 50 metres de hauteur. Ce que nous admirons ressemble au spectacle de danse d’une choregraphie completement irréelle.",
    quote: "« Regarder un orang-outan dans les yeux au milieu de la canopée efface toute fatigue. »",
    stats: { distanceKm: 2200, iconicSite: "Parc National de Gunung Leuser" }
  },
  {
    id: "sit-20",
    pageNum: 268,
    chapterTitle: "Mam et son Copain Thomas le Macaque",
    date: "6 Mai 2025",
    location: "Bukit Lawang Ecolodge",
    country: "Indonésie",
    category: "nature",
    categoryLabel: "🦘 Faune & Complice",
    photoUrl: "https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&q=80&w=800",
    photoCaption: "Photo du manuscrit p. 268 : Mam et son copain Thomas",
    cameraInfo: "Cliché d'archive Manuscrit p. 268 • Bukit Lawang",
    excerpt: "Juste avant de franchir la porte, Mam a l’impression que qq’un a deposé qq chose devant notre porte... Son copain « macaque » veut jouer avec elle et l’attend sur la rembarde de notre chambre. Elle m’appelle pour voir la scene et lorsqu’a mon tour je sors nous entamons une improbable partie de cache cache entre les barreaux !",
    quote: "« Une partie de cache-cache improbable avec un macaque sur le balcon de notre écolodge. »",
    stats: { distanceKm: 0, iconicSite: "Écolodge de Bukit Lawang" }
  },
  {
    id: "sit-21",
    pageNum: 326,
    chapterTitle: "Festival du Sanja Matsuri & Tatouages Yakuzas à Asakusa",
    date: "16 Mai 2025",
    location: "Tokyo (Asakusa)",
    country: "Japon",
    category: "rencontres",
    categoryLabel: "🤝 Culture & Traditions",
    photoUrl: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&q=80&w=800",
    photoCaption: "Photo du manuscrit p. 326 : La police ouvre les festivités de Sanja Matsuri",
    cameraInfo: "Cliché d'archive Manuscrit p. 326 • Asakusa",
    excerpt: "Le « Sanja Matsuri » est un des principaux festivals « Shinto » à « Tokyo », il rend hommage aux trois fondateurs du « Senso-ji »... Des porteurs de palanquins de ts les quartiers, en habits de fête se mettent alors en ordre de marche... On remarque aussi quelques hommes arborant de merveilleux tatouages dans le cou et sur les bras... un jeune garcon a coté de nous, nous dit que ce sont vraissemblablement des « yakusas » !",
    quote: "« Être au bon endroit au bon moment : le miracle permanent du voyageur. »",
    stats: { distanceKm: 5300, iconicSite: "Temple Senso-ji Asakusa" }
  },
  {
    id: "sit-22",
    pageNum: 334,
    chapterTitle: "La Tempête Sacrée du Pont Shinkyo & Toshogu à Nikko",
    date: "17 Mai 2025",
    location: "Nikko",
    country: "Japon",
    category: "volcans",
    categoryLabel: "🌋 Lieux Sacrés & Pluie",
    photoUrl: "https://images.unsplash.com/photo-1578637387939-43c525550085?auto=format&fit=crop&q=80&w=800",
    photoCaption: "Photo du manuscrit p. 336 : Visite du temple de Toshogu sous la pluie",
    cameraInfo: "Cliché d'archive Manuscrit p. 334-336 • Nikko",
    excerpt: "En sortant du bus, nous marchons 15 mn vers le pont « Shinkyo » d’un rouge vif éclatant et dont Paula nous raconte la légende... Nous commençons par l’imposant « Toshogu », où art et histoire se mêlent au milieu de cette majestueuse foret de cèdres plusieurs fois centenaires. On y admire ses ornements et cet or qui scintille de tte part puis aussi son célèbre trio de singes sages.",
    quote: "« La pluie du Japon ne mouille pas les vêtements, elle baptise l'esprit ! »",
    stats: { distanceKm: 160, iconicSite: "Pont Shinkyo & Toshogu" }
  },
  {
    id: "sit-23",
    pageNum: 353,
    chapterTitle: "Le Cliché Magique de la Pagode Chureito & Fujiyama",
    date: "19 Mai 2025",
    location: "Fujiyoshida (Mont Fuji)",
    country: "Japon",
    category: "volcans",
    categoryLabel: "🌋 Volcans & Panoramas",
    photoUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=800",
    photoCaption: "Photo du manuscrit p. 352 : Et voila le celebre Mont Fujiyama",
    cameraInfo: "Cliché d'archive Manuscrit p. 352-353 • Fujiyoshida",
    excerpt: "La pagode « Chureito » qui est l’une des 1300 propriétés du sanctuaire « Arakurayama Sengen », situé à « Fujiyoshida »... Malgré le temps maussade, on eu dit que La déesse « Konohanasakuya-hime », protectrice des fleurs et des arbres du « Mont Fuji » était avec nous, car, tout d’un coup les nuages et la pluie laissent passer qq brins de lumière comme par miracle pour que je puisse faire ce pour quoi nous sommes montés.",
    quote: "« Quand les nuages s'écartent enfin pour révéler le sommet sacré du Fujiyama. »",
    stats: { distanceKm: 110, iconicSite: "Pagode Chureito & Lac Kawaguchi" }
  },
  {
    id: "sit-24",
    pageNum: 381,
    chapterTitle: "L'Éclat du Pavillon d'Or (Kinkaku-ji) à Kyoto",
    date: "23 Mai 2025",
    location: "Kyoto",
    country: "Japon",
    category: "nature",
    categoryLabel: "🦘 Merveilles du Monde",
    photoUrl: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&q=80&w=800",
    photoCaption: "Photo du manuscrit p. 380 : Le Kinkaku ou pavillon d'or",
    cameraInfo: "Cliché d'archive Manuscrit p. 380-381 • Kyoto",
    excerpt: "C’est .un bâtiment à vraiment couper le souffle tellement il « claque aux yeux » des visiteurs avec ses 20 kilos de feuilles d’or qui couvrent la toiture. Il inspire le respect et respire la sérénité. Il porte le nom de « Kinkaku-ji » qui est le nom habituel des temples bouddhistes » Rokuon-ji » mais tout le monde s’accorde pour l’appeler « le pavillon d’or ».",
    quote: "« S'émerveiller devant 20 kilos de feuilles d'or scintillant sur l'étang de Kyoto. »",
    stats: { distanceKm: 450, iconicSite: "Kinkaku-ji & Arashiyama" }
  },
  {
    id: "sit-25",
    pageNum: 395,
    chapterTitle: "Le Sanctuaire Céleste de Miyajima (Photo de Couverture)",
    date: "24 Mai 2025",
    location: "Miyajima (Hiroshima)",
    country: "Japon",
    category: "volcans",
    categoryLabel: "🌋 Paysages Féeriques",
    photoUrl: "preset-miyajima",
    photoCaption: "Photo du manuscrit p. 1 & 395 : Itsukushima-jinja Ō Torii (Grand tori du sanctuaire sur la mer) - Couverture officielle du livre",
    cameraInfo: "Cliché d'archive Manuscrit p. 1 & 395 • Miyajima",
    excerpt: "C’est au travers d’une brume épaisse que nous traversons la mer intérieure de « Seto ».. « Miyajima » est le nom adopté par les japonais pour l'île d' « Itsukushima »... A mi-parcours, nous commençons a peine de distinguer le célèbre « torii » rouge qui semble comme flotter sur l’eau et nous sommes emprunts d’émotion... Ce pourrait bien être celle choisie pour le livre.",
    quote: "« Devant la porte céleste de Miyajima, le temps s'arrête et laisse place à la paix. »",
    stats: { distanceKm: 310, iconicSite: "Sanctuaire d'Itsukushima" }
  },
  {
    id: "sit-26",
    pageNum: 465,
    chapterTitle: "L'Exposition Universelle Osaka 2025 sur le Grand Ring",
    date: "31 Mai 2025",
    location: "Osaka (Yumeshima)",
    country: "Japon",
    category: "rencontres",
    categoryLabel: "🤝 Événements Mondiaux",
    photoUrl: "https://images.unsplash.com/photo-1542296332-2e4473faf563?auto=format&fit=crop&q=80&w=800",
    photoCaption: "Photo du manuscrit p. 467 : Présentation aléatoire de quelques pavillons autour du Ring",
    cameraInfo: "Cliché d'archive Manuscrit p. 465-467 • Osaka",
    excerpt: "Le plus impressionnant reste cet anneau d’un diametre de presque 700 mètres et d’une circonférence de 2 km environ , aussi étrange que pénétrant qu’ils appellent le «Ring» et représente la connexion et la communion des cultures du monde entier sous les memes cieux. La construction de ce monument entièrement pensé en bois, devait être réalisée selon les methodes traditionnelles ancestrales.",
    quote: "« Se promener à 20 mètres de hauteur sur le plus grand anneau en bois du monde. »",
    stats: { distanceKm: 50, iconicSite: "Ring de l'Expo 2025 Osaka" }
  },
  {
    id: "sit-27",
    pageNum: 532,
    chapterTitle: "L'Envol de la Lanterne à Shifen & les Ruelles de Jiufen",
    date: "6 Juin 2025",
    location: "Shifen & Jiufen",
    country: "Taïwan",
    category: "rencontres",
    categoryLabel: "🤝 Traditions & Famille",
    photoUrl: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&q=80&w=800",
    photoCaption: "Photo du manuscrit p. 534 : Tradition du lancé de lanterne dans le village de Shifen",
    cameraInfo: "Cliché d'archive Manuscrit p. 532-534 • Shifen",
    excerpt: "Nous sommes nombreux à déssiner a l’encre noire nos vœux de santé bonheur amour et prosperité sur chacunes des faces de ces lanternes... Mam porte son attention sur la famille et l’amour lorsqu’elle ecrit qq mots sur le papier rouge alors que je porte la mienne sur le bonnheur et la reussite de Kujé et Riv (business de ma fille)... Le spectacle se déroule au milieu des rails de la ligne de chemin de fer.",
    quote: "« Envoyer nos vœux d'amour et de réussite dans le ciel de Taïwan sur une lanterne rouge. »",
    stats: { distanceKm: 2100, iconicSite: "Vieille Rue de Shifen & Jiufen" }
  },
  {
    id: "sit-28",
    pageNum: 596,
    chapterTitle: "Retour Triomphal à Rennes après 90 Jours",
    date: "14 Juin 2025",
    location: "Gare de Rennes",
    country: "France",
    category: "rencontres",
    categoryLabel: "🤝 Retrouvailles Familiales",
    photoUrl: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=800",
    photoCaption: "Photo du manuscrit p. 596 : Retrouvailles familiales à la gare de Rennes — Un peu de nostalgie, mais heureux !",
    cameraInfo: "Cliché d'archive Manuscrit p. 596 • Rennes",
    excerpt: "A la gare ils sont nombreux pour nous accueillir et les retrouvailles sont émouvantes puis nous rentrons tous ensemble chez Alix... Nous avons tt de meme bravé le destin pour prouver a nos enfants et petits enfants que C’EST POSSIBLE malgré les soucis que tous rencontrent un jour ou l’autre dans la vie. Il faut tjrs persévérer et aller jusqu’au bout de ses reves.",
    quote: "« 69 ans, 69 000 km, 69 heures de vol : C'EST POSSIBLE à n'importe quel âge ! »",
    stats: { distanceKm: 9800, iconicSite: "La Gare de Rennes & Maison d'Alix" }
  }
];

// --- API ENDPOINTS ---

// Situations & Archives Database Endpoint
app.get("/api/situations", (req, res) => {
  const { category, country } = req.query;
  let results = bookSituationsDatabase;
  if (category && category !== 'all') {
    results = results.filter(s => s.category === category);
  }
  if (country && country !== 'all') {
    results = results.filter(s => s.country === country);
  }
  res.json(results);
});

app.patch("/api/situations/:id", (req, res) => {
  const { id } = req.params;
  const { chapterTitle, photoCaption, quote, location } = req.body;
  const sit = bookSituationsDatabase.find(s => s.id === id);
  if (sit) {
    if (chapterTitle !== undefined) sit.chapterTitle = chapterTitle;
    if (photoCaption !== undefined) sit.photoCaption = photoCaption;
    if (quote !== undefined) sit.quote = quote;
    if (location !== undefined) sit.location = location;
    res.json(sit);
  } else {
    res.status(404).json({ error: "Situation introuvable" });
  }
});

app.delete("/api/situations/:id", (req, res) => {
  const { id } = req.params;
  bookSituationsDatabase = bookSituationsDatabase.filter(s => s.id !== id);
  res.json({ success: true, deletedId: id });
});

// Book Configuration Endpoints
app.get("/api/book-config", (req, res) => {
  res.json(bookConfigDatabase);
});

app.post("/api/book-config", (req, res) => {
  bookConfigDatabase = { ...bookConfigDatabase, ...req.body };
  res.json(bookConfigDatabase);
});

// Guestbook Endpoints
app.get("/api/guestbook", (req, res) => {
  res.json(guestbookDatabase);
});

app.post("/api/guestbook", (req, res) => {
  const { name, message, location } = req.body;
  if (!name || !message) {
    res.status(400).json({ error: "Le nom et le message sont obligatoires." });
    return;
  }
  const newMessage: GuestbookMessage = {
    id: `gb-${Date.now()}`,
    name,
    message,
    location: location || "France",
    date: new Date().toISOString().split('T')[0]
  };
  guestbookDatabase.unshift(newMessage);
  res.status(201).json(newMessage);
});

// Inventory Endpoints
app.get("/api/inventory", (req, res) => {
  res.json(inventoryDatabase);
});

app.post("/api/inventory/update", (req, res) => {
  const { format, stock, threshold } = req.body;
  const item = inventoryDatabase.find(i => i.format === format);
  if (item) {
    if (typeof stock === "number") item.stock = stock;
    if (typeof threshold === "number") item.threshold = threshold;
    res.json(item);
  } else {
    res.status(404).json({ error: "Format introuvable" });
  }
});

// Orders
app.get("/api/orders", (req, res) => {
  res.json(orderDatabase);
});

// Order Lookup for Buyers
app.get("/api/orders/lookup", (req, res) => {
  const search = req.query.search as string;
  if (!search) {
    res.status(400).json({ error: "Recherche requise." });
    return;
  }
  const query = search.trim().toLowerCase();
  const matches = orderDatabase.filter(o => 
    o.id.toLowerCase() === query || 
    o.customerEmail.toLowerCase() === query
  );
  res.json(matches);
});

app.post("/api/orders", (req, res) => {
  const { customerName, customerEmail, bookFormat, price, destinationCountry, dedicationRequest } = req.body;
  if (!customerName || !customerEmail || !bookFormat) {
    res.status(400).json({ error: "Champs obligatoires manquants." });
    return;
  }
  const country = destinationCountry || (customerEmail.endsWith(".nz") ? "Nouvelle-Zélande" : customerEmail.endsWith(".tw") ? "Taïwan" : "France");
  const newOrder: BookOrder = {
    id: `ord-${Date.now()}`,
    customerName,
    customerEmail,
    bookFormat,
    price: price || (bookFormat === 'printed' ? 22 : bookFormat === 'hardcover' ? 39 : 9.9),
    date: new Date().toISOString().split('T')[0],
    status: 'pending',
    destinationCountry: country,
    dedicationRequest: dedicationRequest || undefined
  };
  orderDatabase.unshift(newOrder);
  res.status(201).json(newOrder);
});

app.post("/api/orders/:id/ship", (req, res) => {
  const { id } = req.params;
  const { carrier, trackingNumber, weightGrams, packaging, shippingCost } = req.body;
  const order = orderDatabase.find(o => o.id === id);
  if (order) {
    order.status = 'shipped';
    if (carrier) order.carrier = carrier;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (weightGrams) order.weightGrams = Number(weightGrams);
    if (packaging) order.packaging = packaging;
    if (shippingCost) order.shippingCost = Number(shippingCost);
    
    // Auto-decrement physical stock items
    const stockItem = inventoryDatabase.find(i => i.format === order.bookFormat);
    if (stockItem && stockItem.format !== 'pdf') {
      stockItem.stock = Math.max(0, stockItem.stock - 1);
    }
    
    res.json(order);
  } else {
    res.status(404).json({ error: "Commande non trouvée." });
  }
});

// Real Stripe Checkout Session Endpoint
app.post("/api/create-checkout-session", async (req, res) => {
  const { customerName, customerEmail, bookFormat, dedicationRequest } = req.body;

  if (!customerName || !customerEmail || !bookFormat) {
    res.status(400).json({ error: "Champs obligatoires manquants." });
    return;
  }

  // Check if Stripe is configured
  const stripe = getStripe();
  if (!stripe) {
    res.json({ error: "stripe_not_configured" });
    return;
  }

  // Determine pricing and descriptions
  let name = "";
  let priceCents = 0;
  let description = "";

  if (bookFormat === "printed") {
    name = "69 C'est Possible ! - Édition Brochée";
    priceCents = 2200; // 22.00 EUR
    description = "Livre broché haute qualité retraçant nos 69 000 km d'aventures (Pré-commande)";
  } else if (bookFormat === "hardcover") {
    name = "69 C'est Possible ! - Luxe Illustré (Édit. Limitée)";
    priceCents = 3900; // 39.00 EUR
    description = "Livre relié rigide grand format et pages intérieures entièrement illustrées (Pré-commande)";
  } else {
    name = "69 C'est Possible ! - Édition Numérique";
    priceCents = 990; // 9.90 EUR
    description = "Livre au format PDF optimisé avec téléchargement immédiat après validation";
  }

  try {
    const origin = req.headers.origin || req.headers.referer || "http://localhost:3000";
    
    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: customerEmail,
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: name,
              description: description,
              images: ["https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400"],
            },
            unit_amount: priceCents,
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/?success_stripe=true&format=${bookFormat}&email=${encodeURIComponent(customerEmail)}&name=${encodeURIComponent(customerName)}&dedication=${encodeURIComponent(dedicationRequest || '')}`,
      cancel_url: `${origin}/?cancel_stripe=true`,
    });

    res.json({ url: session.url });
  } catch (error: any) {
    console.error("Failed to create Stripe Checkout session:", error);
    res.status(500).json({ error: error.message });
  }
});

// Posts
app.get("/api/posts", (req, res) => {
  res.json(postDatabase);
});

app.post("/api/posts", (req, res) => {
  const { platform, content, scheduledDate, status } = req.body;
  if (!platform || !content) {
    res.status(400).json({ error: "La plateforme et le contenu sont requis." });
    return;
  }
  const newPost: SocialPost = {
    id: `post-${Date.now()}`,
    platform,
    content,
    status: status || 'draft',
    scheduledDate: scheduledDate || new Date().toISOString().split('T')[0]
  };
  postDatabase.push(newPost);
  res.status(201).json(newPost);
});

app.delete("/api/posts/:id", (req, res) => {
  const { id } = req.params;
  const initialLength = postDatabase.length;
  postDatabase = postDatabase.filter(p => oId(p.id) !== id && p.id !== id);
  res.json({ success: postDatabase.length < initialLength });
});

function oId(item: string) {
  return item;
}

// Ads Campaigns
app.get("/api/ads", (req, res) => {
  res.json(adCampDatabase);
});

app.post("/api/ads", (req, res) => {
  const { title, audience, budget, adText, status } = req.body;
  if (!title || !adText) {
    res.status(400).json({ error: "Le titre et le texte de l'annonce sont obligatoires." });
    return;
  }
  const newAd: AdCampaign = {
    id: `ad-${Date.now()}`,
    title,
    audience: audience || "Tout public",
    budget: Number(budget) || 2,
    status: status || 'draft',
    clicks: 0,
    impressions: 0,
    conversions: 0,
    adText
  };
  adCampDatabase.push(newAd);
  res.status(201).json(newAd);
});

app.post("/api/ads/:id/toggle", (req, res) => {
  const { id } = req.params;
  const ad = adCampDatabase.find(a => a.id === id);
  if (ad) {
    ad.status = ad.status === 'active' ? 'paused' : 'active';
    res.json(ad);
  } else {
    res.status(404).json({ error: "Campagne d'annonce inconnue." });
  }
});

// AI Generator Endpoint using Gemini
app.post("/api/generate-content", async (req, res) => {
  const { theme, keywords, tone } = req.body;
  if (!theme) {
    res.status(400).json({ error: "Le thème est obligatoire pour générer un post." });
    return;
  }

  // Ensure key is present
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    // Graceful fallback content if no API key is specified so application remains usable
    const fallbackMessage = generateLocalPost(theme, keywords || "", tone || "humoristique");
    res.json({ content: fallbackMessage, isFallback: true });
    return;
  }

  try {
    const promptMessage = `Rôle: Tu es un consultant en marketing digital chargé d'aider Patrice, un fantastique retraité français de 69 ans. Il aide et vend son livre de voyage intitulé "69" ou "69 c'est possible", décrivant son périple sauvage de 3 mois fait de 69 000 km, 69 heures de vol et 69 raisons et 69 sites étonnants en Asie et Océanie avec son épouse "MAM" (Monique), dite la Momo nationale ou la surveillante générale ou la cocotte-minute d'inquiétude.
Patrice écrit avec un ton très humain, breton, autoditacte, un peu maladroit envers la technologie (il s'autoproclame le "spécialiste du Tetris" pour ranger les valises, et adore prendre son immuable verre de vin blanc de 18h).

On te demande de rédiger un post de réseau social attractif pour Facebook ou Instagram destiné à faire de la publicité ou donner envie d'acheter le livre.

Thème de l'anecdote/du post : "${theme}"
Mots-clés optionnels additionnels : "${keywords}"
Ton désiré du post : "${tone}" (par exemple: touchant, humoristique, baroudeur, authentique)

Règles impératives de rédaction :
1. Rédige en français.
2. Utilise le point de vue de Patrice ("je", "nous" avec Mam).
3. Doit inclure des anecdotes loufoques et tendres (comme le pneu crevé à Auckland le premier jour, la voiture qui décolle d'un gué dans le Bush, le déteignage de chemise à cause du sèche-linge, ou l'erreur magique de billet d'avion de Mam).
4. Le post doit se terminer par un appel constructif à acheter le livre "69".
5. Style accrocheur, scannable avec des émojis évocateurs de voyage, mais authentiquement un "ton daron" breton sympathique et énergique (pas de blabla IA pompeux, reste humble, amusant et concret).`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptMessage,
      config: {
        temperature: 0.85,
      }
    });

    const generatedText = response.text;
    res.json({ content: generatedText, isFallback: false });
  } catch (error: any) {
    console.error("Gemini API call failed:", error);
    // Fallback on error
    const fallbackMessage = generateLocalPost(theme, keywords || "", tone || "humoristique");
    res.json({ content: fallbackMessage, isFallback: true, error: error.message });
  }
});

// Helper for generating posts without API keys
function generateLocalPost(theme: string, keywords: string, tone: string) {
  const cleanKeywords = keywords ? ` en mettant l'accent sur ${keywords}` : "";
  return `🌍 **UNE SOUVENIR DE FOLIE !** 🎒\n\nAh, la Momo nationale (ma chère Mam) et moi s'en rappellerons toute notre vie... Alors qu'on planifiait ce post sur le thème "${theme}", je ne pouvais m'empêcher de rigoler en pensant à nos péripéties${cleanKeywords}. \n\nQue ce soit la fois où notre 4x4 a littéralement décollé de 3 mètres dans un gué de la brousse australienne, ou notre fameux 'lapsus' de billet d'avion retour à Kaohsiung où la Momo pensait décoller à 15h alors que le vol était à 10h ! 🚨 On a redoublé de diplomatie (et de câlins) pour survivre sous les 36°C étouffants.\n\nMais savez-vous quoi ? À 69 ans, c'est encore possible de vivre de tels périples et d'en rire ! Tout notre voyage de 90 jours, nos moments chauds, nos rituels de petit vin blanc à 18h, sont à lire d'urgence dans notre livre '69'. \n\n👉 Commandez-le vite sur notre site en format papier ou PDF et dites-nous si vous aussi vous êtes de vrais aventuriers ! ✨\n#69CestPossible #Team69 #DaronBaroudeur #VoyageDeFolie`;
}

// Set up Vite dev server or static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in development mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in production mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on port ${PORT}`);
    console.log(`Development preview accessible on port 3000.`);
  });
}

startServer();
