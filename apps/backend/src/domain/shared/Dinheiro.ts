import { DomainError } from './DomainError';
import { Moeda } from './Moeda';

export class Dinheiro {
  private constructor(
    private readonly valor: number,
    private readonly moeda: Moeda
  ) {}

  static zero(moeda: Moeda): Dinheiro {
    return new Dinheiro(0, moeda);
  }

  static fromLowerUnit(valor: number, moeda: Moeda): Dinheiro {
    if (valor < 0) throw new TypeError('Valor não pode ser negativo.');

    return new Dinheiro(valor, moeda);
  }

  static fromSignedUnit(valor: number, moeda: Moeda): Dinheiro {
    return new Dinheiro(valor, moeda);
  }

  static fromDecimal(valor: string, moeda: Moeda): Dinheiro {
    const ajustado = valor.trim().replace(',', '.');
    if (!/^-?\d+(\.\d{1,2})?$/.test(ajustado))
      throw new DomainError(`Valor monetario inválido: ${valor}`);

    const negativo = ajustado.startsWith('-');
    const normalizado = negativo ? ajustado.slice(1) : ajustado;
    const [todo, fracao = ''] = normalizado.split('.');
    const fracaoDeslocada = fracao.padEnd(2, '0').slice(0, 2);
    const menorUnidade = Number.parseInt(todo + fracaoDeslocada);
    return negativo
      ? new Dinheiro(menorUnidade, moeda).negate()
      : new Dinheiro(menorUnidade, moeda);
  }

  getValor(): number {
    return this.valor;
  }

  getMoeda(): Moeda {
    return this.moeda;
  }

  isZero(): boolean {
    return this.valor === 0;
  }

  isNegative(): boolean {
    return this.valor < 0;
  }

  isPositive(): boolean {
    return this.valor > 0;
  }

  negate(): Dinheiro {
    return new Dinheiro(-this.valor, this.moeda);
  }

  abs(): Dinheiro {
    return this.valor < 0 ? this.negate() : this;
  }

  add(outro: Dinheiro): Dinheiro {
    this.assertMesmaMoeda(outro);

    return new Dinheiro(this.valor + outro.valor, this.moeda);
  }

  subtract(outro: Dinheiro): Dinheiro {
    this.assertMesmaMoeda(outro);

    return new Dinheiro(this.valor - outro.valor, this.moeda);
  }

  multiply(fator: number): Dinheiro {
    if (!Number.isFinite(fator))
      throw new DomainError('Fator deve ser um número finito.');

    const escala = Number(this.valor) * fator;
    const arredontado = Math.round(escala);

    return new Dinheiro(arredontado, this.moeda);
  }

  divide(divisor: number): Dinheiro {
    if (divisor === 0) throw new DomainError('Não pode dividir por 0.');

    const escala = Number(this.valor) / divisor;
    const arredondado = Math.round(escala);

    return new Dinheiro(arredondado, this.moeda);
  }

  equals(outro: Dinheiro): boolean {
    return this.valor === outro.valor && this.moeda.equals(outro.moeda);
  }

  isGreaterThan(outro: Dinheiro): boolean {
    this.assertMesmaMoeda(outro);

    return this.valor > outro.valor;
  }

  isLessThan(outro: Dinheiro): boolean {
    this.assertMesmaMoeda(outro);

    return this.valor < outro.valor;
  }

  toDecimalString(): string {
    const negativo = this.valor < 0;
    const abs = negativo ? -this.valor : this.valor;
    const str = abs.toString().padStart(3, '0');
    const total = str.slice(0, -2) || '0';
    const fracao = str.slice(-2);

    return negativo ? `-${total}.${fracao}` : `${total}.${fracao}`;
  }

  private assertMesmaMoeda(outro: Dinheiro): void {
    if (!this.moeda.equals(outro.moeda))
      throw new DomainError('Não pode calcular 2 moedas distintas.');
  }
}
