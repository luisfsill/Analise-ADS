/** Converte texto digitado no padrão brasileiro ("1.200", "6,5", "R$ 50,00") em número. */
export function num(v: unknown): number | null {
  let s = String(v ?? "").replace(/R\$|\s|%|×|x/gi, "");
  if (!s) return null;
  if (s.indexOf(",") > -1) s = s.replace(/\./g, "").replace(",", ".");
  else if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, "");
  const n = parseFloat(s);
  return isFinite(n) ? n : null;
}
export const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export const int = (v: number) => Math.round(v).toLocaleString("pt-BR");
export const dec = (v: number, d = 1) => v.toLocaleString("pt-BR", { maximumFractionDigits: d });
