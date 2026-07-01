import type { VercelRequest, VercelResponse } from '@vercel/node';

// ── In-memory stores (reset on cold start — comportement identique au serveur local) ──
interface BookOrder {
  id: string; customerName: string; customerEmail: string;
  bookFormat: string; price: number; date: string; status: string;
  destinationCountry?: string; dedicationRequest?: string;
  carrier?: string; trackingNumber?: string; weightGrams?: number;
  packaging?: string; shippingCost?: number;
}
interface GuestbookMessage { id: string; name: string; message: string; location: string; date: string; }
interface SocialPost { id: string; platform: string; content: string; status: string; scheduledDate: string; }
interface AdCampaign { id: string; title: string; audience: string; budget: number; status: string; clicks: number; impressions: number; conversions: number; adText: string; }
interface BookConfig {
  coverImageUrl: string; coverBorderColor: string; authorName: string;
  bookTitle: string; bookSubtitle: string; topBadge: string; bottomLine: string;
  backQuote: string; backAboutTitle: string; backAboutSubtitle: string; backAboutContent: string;
}

let bookConfigStore: BookConfig = {
  coverImageUrl: 'preset-miyajima', coverBorderColor: '#8E5A3C',
  authorName: 'PATRICE LEQUIME', bookTitle: '69', bookSubtitle: "C'EST POSSIBLE",
  topBadge: '69 ANS • 69 000 KM • 69 HEURES DE VOL',
  bottomLine: '69 LIEUX ÉTONNANTS • 69 RAISONS D\'Y CROIRE...',
  backQuote: '« Poursuivez vos rêves. À 69 ans, tout est possible. »',
  backAboutTitle: 'À PROPOS DE CE LIVRE',
  backAboutSubtitle: 'Le livre à offrir à vos parents ou vos grands-parents',
  backAboutContent: 'Ce bouquin est sans prétentions.\nNi un livre de photos, ni un guide touristique,\nni un roman d\'aventures.\n\nJuste un récit dont l\'ambition est de vous donner envie de toujours poursuivre vos rêves sans rien lâcher, en vous prouvant que « c\'est possible » à n\'importe quel âge.\n\nSi nous y sommes parvenus, alors vous aussi pouvez y parvenir.',
};

let ordersStore: BookOrder[] = [];

let guestbookStore: GuestbookMessage[] = [
  { id: 'gb-1', name: 'Monique (la Momo)', message: 'Quel site de rêve ! Mais dis-moi mon cher Patrice, as-tu fini de ranger ton fameux Tetris de valises ? Un grand merci à notre fils pour ce bel hommage.', location: 'Rennes, Bretagne', date: '2026-06-28' },
  { id: 'gb-2', name: 'Jérôme, Lola & Lola-fille', message: 'On rigole encore en pensant à la fameuse nuit du court-circuit à Altona ! Une aventure extraordinaire, des darons exceptionnels !', location: 'Melbourne, Australie', date: '2026-06-25' },
  { id: 'gb-3', name: 'Stephen & Ruth', message: 'What a joy meeting you in New Zealand! We will never forget our chats and baking the banana cake for Monique. Good luck with the book!', location: 'Reporoa, New Zealand', date: '2026-06-22' },
];

let postsStore: SocialPost[] = [
  { id: 'post-1', platform: 'facebook', content: 'Nous l\'avons fait ! 69 ans, 69 000 km, 69 heures de vol. Notre livre est désormais disponible ! 🌍🎒✈️ #69CestPossible', status: 'published', scheduledDate: '2026-06-15' },
];

let adsStore: AdCampaign[] = [
  { id: 'ad-1', title: 'Vente Livre 69 - Retraités Actifs', audience: 'Seniors (55-80), Voyage, France/Europe', budget: 5, status: 'active', clicks: 1420, impressions: 24500, conversions: 112, adText: '« À 69 ans, c\'est encore POSSIBLE ! » Découvrez le périple fou de 3 mois de Patrice et Mam à travers l\'Asie et l\'Océanie.' },
];

let inventoryStore = [
  { format: 'printed',   name: 'Édition Brochée',              stock: 124,   threshold: 20, weightGrams: 420,  shelfLocation: 'Armoire Breizh - Étagère A1' },
  { format: 'hardcover', name: 'Luxe Illustré (Édit. Limitée)',stock: 35,    threshold: 10, weightGrams: 980,  shelfLocation: 'Armoire Breizh - Étagère B2' },
  { format: 'pdf',       name: 'Édition Numérique (PDF)',       stock: 99999, threshold: 0,  weightGrams: 0,    shelfLocation: 'Serveur Cloud (Digital)' },
];

// ── Handler principal ──
export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  const url = (req.url || '').replace(/^\/api/, '');
  const method = req.method || 'GET';

  // GET /api/book-config
  if (url === '/book-config' && method === 'GET') {
    return res.status(200).json(bookConfigStore);
  }

  // POST /api/book-config
  if (url === '/book-config' && method === 'POST') {
    bookConfigStore = { ...bookConfigStore, ...(req.body || {}) };
    return res.status(200).json(bookConfigStore);
  }

  // GET /api/guestbook
  if (url === '/guestbook' && method === 'GET') {
    return res.status(200).json(guestbookStore);
  }

  // POST /api/guestbook
  if (url === '/guestbook' && method === 'POST') {
    const { name, message, location } = req.body || {};
    if (!name || !message) return res.status(400).json({ error: 'Nom et message requis.' });
    const msg: GuestbookMessage = { id: `gb-${Date.now()}`, name, message, location: location || 'France', date: new Date().toISOString().split('T')[0] };
    guestbookStore.unshift(msg);
    return res.status(201).json(msg);
  }

  // GET /api/orders
  if (url === '/orders' && method === 'GET') {
    return res.status(200).json(ordersStore);
  }

  // POST /api/orders
  if (url === '/orders' && method === 'POST') {
    const { customerName, customerEmail, bookFormat, price, destinationCountry, dedicationRequest } = req.body || {};
    if (!customerName || !customerEmail || !bookFormat) return res.status(400).json({ error: 'Champs obligatoires manquants.' });
    const order: BookOrder = {
      id: `ord-${Date.now()}`, customerName, customerEmail, bookFormat,
      price: price || (bookFormat === 'printed' ? 22 : bookFormat === 'hardcover' ? 39 : 9.9),
      date: new Date().toISOString().split('T')[0], status: 'pending',
      destinationCountry: destinationCountry || 'France',
      dedicationRequest: dedicationRequest || undefined,
    };
    ordersStore.unshift(order);
    return res.status(201).json(order);
  }

  // GET /api/orders/lookup
  if (url.startsWith('/orders/lookup') && method === 'GET') {
    const search = String(req.query?.search || '').toLowerCase().trim();
    if (!search) return res.status(400).json({ error: 'Recherche requise.' });
    const matches = ordersStore.filter(o => o.id.toLowerCase() === search || o.customerEmail.toLowerCase() === search);
    return res.status(200).json(matches);
  }

  // POST /api/orders/:id/ship
  const shipMatch = url.match(/^\/orders\/([^/]+)\/ship$/);
  if (shipMatch && method === 'POST') {
    const id = shipMatch[1];
    const order = ordersStore.find(o => o.id === id);
    if (!order) return res.status(404).json({ error: 'Commande non trouvée.' });
    const { carrier, trackingNumber, weightGrams, packaging, shippingCost } = req.body || {};
    order.status = 'shipped';
    if (carrier) order.carrier = carrier;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (weightGrams) order.weightGrams = Number(weightGrams);
    if (packaging) order.packaging = packaging;
    if (shippingCost) order.shippingCost = Number(shippingCost);
    const stockItem = inventoryStore.find(i => i.format === order.bookFormat);
    if (stockItem && stockItem.format !== 'pdf') stockItem.stock = Math.max(0, stockItem.stock - 1);
    return res.status(200).json(order);
  }

  // GET /api/inventory
  if (url === '/inventory' && method === 'GET') {
    return res.status(200).json(inventoryStore);
  }

  // POST /api/inventory/update
  if (url === '/inventory/update' && method === 'POST') {
    const { format, stock, threshold } = req.body || {};
    const item = inventoryStore.find(i => i.format === format);
    if (!item) return res.status(404).json({ error: 'Format introuvable.' });
    if (typeof stock === 'number') item.stock = stock;
    if (typeof threshold === 'number') item.threshold = threshold;
    return res.status(200).json(item);
  }

  // GET /api/posts
  if (url === '/posts' && method === 'GET') {
    return res.status(200).json(postsStore);
  }

  // POST /api/posts
  if (url === '/posts' && method === 'POST') {
    const { platform, content, scheduledDate, status } = req.body || {};
    if (!platform || !content) return res.status(400).json({ error: 'Plateforme et contenu requis.' });
    const post: SocialPost = { id: `post-${Date.now()}`, platform, content, status: status || 'draft', scheduledDate: scheduledDate || new Date().toISOString().split('T')[0] };
    postsStore.push(post);
    return res.status(201).json(post);
  }

  // DELETE /api/posts/:id
  const deletePostMatch = url.match(/^\/posts\/([^/]+)$/);
  if (deletePostMatch && method === 'DELETE') {
    const id = deletePostMatch[1];
    postsStore = postsStore.filter(p => p.id !== id);
    return res.status(200).json({ success: true });
  }

  // GET /api/ads
  if (url === '/ads' && method === 'GET') {
    return res.status(200).json(adsStore);
  }

  // POST /api/ads
  if (url === '/ads' && method === 'POST') {
    const { title, audience, budget, adText, status } = req.body || {};
    if (!title || !adText) return res.status(400).json({ error: 'Titre et texte requis.' });
    const ad: AdCampaign = { id: `ad-${Date.now()}`, title, audience: audience || 'Tout public', budget: Number(budget) || 2, status: status || 'draft', clicks: 0, impressions: 0, conversions: 0, adText };
    adsStore.push(ad);
    return res.status(201).json(ad);
  }

  // POST /api/ads/:id/toggle
  const toggleAdMatch = url.match(/^\/ads\/([^/]+)\/toggle$/);
  if (toggleAdMatch && method === 'POST') {
    const id = toggleAdMatch[1];
    const ad = adsStore.find(a => a.id === id);
    if (!ad) return res.status(404).json({ error: 'Campagne inconnue.' });
    ad.status = ad.status === 'active' ? 'paused' : 'active';
    return res.status(200).json(ad);
  }

  // POST /api/create-checkout-session → Stripe non configuré en statique
  if (url === '/create-checkout-session' && method === 'POST') {
    return res.status(200).json({ error: 'stripe_not_configured' });
  }

  // POST /api/generate-content → fallback local
  if (url === '/generate-content' && method === 'POST') {
    const { theme } = req.body || {};
    const content = `🌍 **UNE SOUVENIR DE FOLIE !** 🎒\n\nAh, la Momo nationale et moi s'en rappelleront toute notre vie... Sur le thème "${theme || 'notre aventure'}", je ne peux m'empêcher de sourire en repensant à nos péripéties bretonnes au bout du monde !\n\nÀ 69 ans, c'est encore POSSIBLE de vivre de tels périples. Tout notre voyage est à lire dans le livre '69' — commandez votre exemplaire dès maintenant ! ✨\n\n#69CestPossible #Team69 #DaronBaroudeur`;
    return res.status(200).json({ content, isFallback: true });
  }

  return res.status(404).json({ error: `Route inconnue: ${method} ${url}` });
}
