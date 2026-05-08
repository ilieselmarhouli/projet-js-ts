import type { HistoryPoint, Stock } from "../models/stock.js";

const API_URL = "https://keligmartin.github.io/api/stocks.json";

// Verifie qu'un element de l'historique contient bien une date, un prix et un volume.
function isHistoryPoint(value: unknown): value is HistoryPoint {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const point = value as Record<string, unknown>;
  return (
    typeof point.date === "string" &&
    typeof point.price === "number" &&
    typeof point.volume === "number"
  );
}

// Verifie qu'une action complete respecte la structure attendue par l'application.
function isStock(value: unknown): value is Stock {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const stock = value as Record<string, unknown>;
  return (
    typeof stock.symbol === "string" &&
    typeof stock.name === "string" &&
    typeof stock.sector === "string" &&
    typeof stock.currentPrice === "number" &&
    typeof stock.currency === "string" &&
    Array.isArray(stock.history) &&
    stock.history.every(isHistoryPoint)
  );
}

export async function fetchStocks(): Promise<Stock[]> {
  let response: Response;

  try {
    response = await fetch(API_URL);
  } catch {
    throw new Error("Erreur reseau : impossible de joindre l'API.");
  }

  if (!response.ok) {
    throw new Error(`Erreur API : HTTP ${response.status}.`);
  }

  const payload: unknown = await response.json();

  // On valide la structure avant d'utiliser les donnees dans l'interface.
  if (!Array.isArray(payload) || payload.length === 0) {
    throw new Error("Donnees invalides : la reponse API est vide ou incorrecte.");
  }

  if (!payload.every(isStock)) {
    throw new Error("Donnees invalides : la structure recue ne correspond pas au modele attendu.");
  }

  return payload;
}
