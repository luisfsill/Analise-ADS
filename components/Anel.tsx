import type { Status } from "@/lib/analise/tipos";

export const statusCor = (s: Status) => (s === "none" ? "muted" : s);

/** Anel de progresso até a meta (1 = meta batida). Usado no painel e na prévia da apresentação. */
export default function Anel({ pct, status }: { pct: number | null; status: Status }) {
  const C = 2 * Math.PI * 40;
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="50" cy="50" r="40" fill="none" stroke="var(--soft)" strokeWidth="10" />
      {pct != null && (
        <circle cx="50" cy="50" r="40" fill="none" stroke={`var(--${statusCor(status)})`} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={`${Math.max(0.02, Math.min(1, pct)) * C} ${C}`} transform="rotate(-90 50 50)" />
      )}
    </svg>
  );
}
