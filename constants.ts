import { User, Exercise, Goal, ClubInfo, CoachInfo, SupplementProduct } from './types';

export const PROGRAM_DURATION_WEEKS = 7;
export const COACH_EMAIL = "contact@velatra.com";

// Configuration Commerce
export const COMMISSION_THRESHOLD = 300; 
export const LOYALTY_POINT_VALUE = 0.05; 
export const STOCK_ALERT_THRESHOLD = 3;

export const INIT_SUPPLEMENTS: SupplementProduct[] = [
  { id: "1", nom: "Pure Workout (1 Dose)", prixVente: 3.5, prixAchat: 2.1, stock: 0, cat: "Performance" },
  { id: "2", nom: "Whey Isolate Native Nature (750g)", prixVente: 34.9, prixAchat: 24.5, stock: 0, cat: "Protéines" },
  { id: "3", nom: "Shakeur Nutripure", prixVente: 5.9, prixAchat: 2.8, stock: 0, cat: "Accessoires" },
  { id: "4", nom: "Pure Glycine", prixVente: 12.9, prixAchat: 8.5, stock: 0, cat: "Santé" },
  { id: "5", nom: "Créatine 150 gélules", prixVente: 19.9, prixAchat: 13.2, stock: 0, cat: "Performance" },
  { id: "6", nom: "Arôme Naturel Whey (Vanille, Citron)", prixVente: 8.9, prixAchat: 5.2, stock: 0, cat: "Arômes" },
  { id: "7", nom: "Arôme Naturel Whey (Fraise, Coco, Banane)", prixVente: 5.9, prixAchat: 3.5, stock: 0, cat: "Arômes" },
  { id: "8", nom: "Pack Santé", prixVente: 58.23, prixAchat: 42.0, stock: 0, cat: "Packs" },
  { id: "9", nom: "Pure Granola 350g Chocolat", prixVente: 8.9, prixAchat: 5.5, stock: 0, cat: "Nutrition" },
  { id: "10", nom: "Créatine 150g", prixVente: 14.9, prixAchat: 9.8, stock: 0, cat: "Performance" },
  { id: "11", nom: "Huile de coco 400ml", prixVente: 6.9, prixAchat: 4.2, stock: 0, cat: "Nutrition" },
  { id: "12", nom: "Whey Native Bio 1kg", prixVente: 39.9, prixAchat: 28.5, stock: 0, cat: "Protéines" },
  { id: "13", nom: "Whey Isolate Native Aromatisée (750g)", prixVente: 39.9, prixAchat: 28.5, stock: 0, cat: "Protéines" },
  { id: "14", nom: "Farine de patate douce bio (750g)", prixVente: 13.9, prixAchat: 9.2, stock: 0, cat: "Nutrition" },
  { id: "15", nom: "Pure Granola 350g Multigraines", prixVente: 7.9, prixAchat: 4.8, stock: 0, cat: "Nutrition" },
  { id: "16", nom: "Pure Workout 315g", prixVente: 39.9, prixAchat: 27.5, stock: 0, cat: "Performance" },
  { id: "17", nom: "Peptides de collagène Natures (310g)", prixVente: 22.9, prixAchat: 15.8, stock: 0, cat: "Santé" },
  { id: "18", nom: "Magnésium 60 gélules", prixVente: 16.9, prixAchat: 11.2, stock: 0, cat: "Santé" },
  { id: "19", nom: "Multivitamines (60 gélules)", prixVente: 22.9, prixAchat: 15.5, stock: 0, cat: "Santé" },
  { id: "20", nom: "Oméga 3 (90 capsules)", prixVente: 24.9, prixAchat: 16.8, stock: 0, cat: "Santé" },
  { id: "21", nom: "Active Curcumine", prixVente: 29.9, prixAchat: 20.5, stock: 0, cat: "Santé" },
  { id: "22", nom: "Protéine Végétale 750g", prixVente: 29.9, prixAchat: 21.0, stock: 0, cat: "Protéines" },
  { id: "23", nom: "Pure Porridge 350g", prixVente: 6.9, prixAchat: 4.2, stock: 0, cat: "Nutrition" },
  { id: "24", nom: "T-Shirt Technique noir", prixVente: 24.9, prixAchat: 12.0, stock: 0, cat: "Textile" },
  { id: "25", nom: "T-Shirt Coton blanc écru", prixVente: 29.9, prixAchat: 14.5, stock: 0, cat: "Textile" },
  { id: "26", nom: "Polo Unisexe", prixVente: 34.9, prixAchat: 16.8, stock: 0, cat: "Textile" },
  { id: "27", nom: "Sweat Unisexe", prixVente: 49.9, prixAchat: 24.5, stock: 0, cat: "Textile" }
];

export const INIT_USERS: User[] = [
  {
    id: 1,
    code: "coach",
    pwd: "velatra2025",
    name: "Coach Velatra",
    role: "coach",
    avatar: "CN",
    gender: "M",
    age: 30,
    weight: 85,
    height: 185,
    objectifs: ["Performance sportive"],
    notes: "Administrateur principal",
    createdAt: new Date().toISOString(),
    xp: 0,
    streak: 0,
    pointsFidelite: 0
  }
];

export const GOALS: Goal[] = [
  "Perte de poids", "Prise de masse", "Sport santé bien-être", "Prépa physique",
  "Remise en forme", "Performance sportive", "Renforcement musculaire",
  "Souplesse et mobilité", "Autre"
];

export const EXERCISE_CATEGORIES = [
  "Jambes", "Poitrine", "Dos", "Épaules", "Bras", "Abdos", "Cardio", "Mobilité"
];

export const INIT_EXERCISES: Exercise[] = [
  { id: 1, name: "Squat barre", cat: "Jambes", equip: "Barre", photo: null, perfId: "squat" },
  { id: 11, name: "Développé couché", cat: "Poitrine", equip: "Barre", photo: null, perfId: "dc_barre" },
  { id: 21, name: "Tractions", cat: "Dos", equip: "Poids du corps", photo: null, perfId: "tractions" },
  { id: 31, name: "Développé militaire", cat: "Épaules", equip: "Barre", photo: null, perfId: "dm" },
  { id: 41, name: "Curl barre EZ", cat: "Bras", equip: "Barre", photo: null, perfId: "curl" },
  { id: 51, name: "Crunch au sol", cat: "Abdos", equip: "Poids du corps", photo: null, perfId: "crunch" },
  { id: 61, name: "Tapis de course", cat: "Cardio", equip: "Machine", photo: null, perfId: "tapis" }
];

export const CLUB_INFO: ClubInfo = {
  phone: "07 43 10 37 90",
  email: "contact@velatra.com",
  googleReview: "https://g.page/r/CaxeYGUYMVkREBM/review",
  description: "Velatra est un logiciel SaaS pour les salles de sport premium. Nous proposons des outils de gestion de coaching personnalisé, de suivi des membres et de communication.",
  horaires: "Accès autonome avec badge 7j/7.\nLundi - Vendredi : 5h30 - 23h30\nWeek-end : 7h - 20h",
  adresse: "155 route de Brignais, 69230 Saint-Genis-Laval",
  mapsLink: "https://www.google.com/maps"
};

export const COACHES: CoachInfo[] = [
  { id: 1, name: "Thomas", role: "Coach & Gérant", whatsapp: "+33743103790", photo: null },
  { id: 2, name: "Victor", role: "Conseiller Sportif", whatsapp: "+33743103790", photo: null },
  { id: 3, name: "Tristan", role: "Coach Sportif", whatsapp: "+33743103790", photo: null },
  { id: 4, name: "Evan", role: "Coach Sportif", whatsapp: "+33743103790", photo: null }
];
