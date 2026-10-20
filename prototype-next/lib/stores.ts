const STORE_KEYS: Record<string, string> = {
  dia: "dia",
  jumbo: "jumbo",
  farmacity: "farmacity",
  farma: "farma",
  farmaonline: "farma",
};

export function storeKey(store: string): string | null {
  const normalized = store
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
  return STORE_KEYS[normalized] ?? null;
}
