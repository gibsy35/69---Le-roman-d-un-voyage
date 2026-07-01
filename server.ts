import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import Stripe from "stripe";
import { BookOrder, SocialPost, AdCampaign, BookConfig, GuestbookMessage } from "./src/types";

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
  bookSubtitle: "C'EST POSSIBLE",
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
    message: "What a joy meeting Jean-Baptiste and Monique in New Zealand! We will never forget our chats about organic farming and of course, baking the banana cake for Monique. Good luck with the book!",
    location: "Reporoa, New Zealand",
    date: "2026-06-22"
  },
  {
    id: "gb-4",
    name: "Laurence & les p'tits enfants",
    message: "Bravo Papy et Mamie ! Vos récits sont tellement inspirants pour toute la famille. On a hâte de faire lire votre livre à l'école ! Gros bisous bretons.",
    location: "Acigné, France",
    date: "2026-06-18"
  }
];

// --- API ENDPOINTS ---

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
