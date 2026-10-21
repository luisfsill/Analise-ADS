/** Datas do painel admin. O vencimento é sempre o fim do dia no horário de Brasília. */
const TZ = "America/Sao_Paulo";

/** ISO do banco → "AAAA-MM-DD" para <input type="date">, no dia de Brasília (não no dia UTC). */
export function dataParaInput(iso: string | null): string {
  return iso ? new Date(iso).toLocaleDateString("en-CA", { timeZone: TZ }) : "";
}

/** "AAAA-MM-DD" do <input type="date"> → ISO de 23:59:59 desse dia em Brasília (vazio = sem vencimento). */
export function inputParaFimDoDia(valor: string): string | null {
  return /^\d{4}-\d{2}-\d{2}$/.test(valor) ? new Date(valor + "T23:59:59-03:00").toISOString() : null;
}
