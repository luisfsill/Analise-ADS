import { describe, expect, it } from "vitest";
import { brl, dec, int, num } from "../lib/analise/formato";

describe("num: leitura do que o usuário digita", () => {
  it.each([
    ["1.200", 1200],
    ["1.200.300", 1200300],
    ["50.000", 50000],
    ["1.5", 1.5],
    ["6,5", 6.5],
    ["1.234,56", 1234.56],
    ["R$ 50,00", 50],
    ["R$1.234,56", 1234.56],
    ["12x", 12],
    ["10×", 10],
    ["6,5%", 6.5],
    [" 1 200 ", 1200],
    ["0", 0],
    [0, 0],
    [42, 42],
  ])("%j vira %d", (entrada, esperado) => {
    expect(num(entrada)).toBe(esperado);
  });

  it.each([[""], ["   "], ["abc"], ["R$"], ["%"], [null], [undefined], ["-5"], ["-0,5"], [-3], [NaN], [Infinity]])("%j vira vazio (null)", (entrada) => {
    expect(num(entrada)).toBeNull();
  });
});

describe("formatação brasileira", () => {
  it("moeda em reais", () => {
    expect(brl(1234.5)).toMatch(/^R\$\s1\.234,50$/);
    expect(brl(0)).toMatch(/^R\$\s0,00$/);
  });
  it("inteiro arredondado com separador de milhar", () => {
    expect(int(1234.6)).toBe("1.235");
    expect(int(999.4)).toBe("999");
  });
  it("decimal com vírgula e casas configuráveis", () => {
    expect(dec(6.56)).toBe("6,6");
    expect(dec(6.556, 2)).toBe("6,56");
    expect(dec(10)).toBe("10");
  });
});
