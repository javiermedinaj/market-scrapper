import type { Diet } from "./diet";
import type { Recipe } from "./recipe";

export interface PlanParams {
  servings: number;
  budgetArs: number;
  stores: string[];
  storeLabel: string;
  diet: Diet;
  log?: (message: string) => void;
}

export interface PricedIngredient {
  name: string;
  quantity: number;
  unit: string;
  productId: string;
  productName?: string;
  store?: string;
  price?: number;
  cost?: number;
  pantry?: boolean;
  saleFormat?: string;
  packages?: number;
  image?: string;
  link?: string;
  scrapedAt?: string;
}

export interface TokenUsage {
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  reasoningTokens?: number;
  textTokens?: number;
}

export interface Timings {
  totalMs: number;
  loadProductsMs: number;
  phaseAMs: number;
  phaseBMs: number[];
  searchMs: number;
  searchCount: number;
  modelRequests: number;
  reasoningTokens: number;
}

export interface PlanResult {
  model: string;
  dataSource: string;
  storeLabel: string;
  diet: Diet;
  recipe: Recipe;
  ingredients: PricedIngredient[];
  total: number;
  overBudget: boolean;
  attempts: number;
  steps: number;
  toolCalls: number;
  candidates: number;
  semanticWarnings: string[];
  dietViolations: string[];
  priceAgeDays: number | null;
  stale: boolean;
  newestScrapedAt: string | null;
  attemptLog: string[];
  usage: TokenUsage;
  timings: Timings;
}
