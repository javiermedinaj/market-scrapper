import { gateway } from "ai";
import { normalize } from "./text";

export const MODEL_ID = process.env.AI_MODEL ?? "alibaba/qwen3.7-flash";
export const MAX_SEARCH_STEPS = 1;
export const MAX_ATTEMPTS = 3;
export const DEFAULT_BUDGET_ARS = 20000;
export const STALE_AFTER_DAYS = 7;

export function modelSettings() {
  const model = gateway(MODEL_ID);
  if (MODEL_ID.startsWith("alibaba/")) {
    return { model, providerOptions: { alibaba: { enableThinking: false } } };
  }
  return { model, reasoning: "none" as const };
}

export function resolveStores(arg: string): { label: string; stores: string[] } {
  const a = normalize(arg);
  if (a === "dia") return { label: "Día", stores: ["Día"] };
  if (a === "jumbo") return { label: "Jumbo", stores: ["Jumbo"] };
  return { label: "Día + Jumbo", stores: ["Día", "Jumbo"] };
}
