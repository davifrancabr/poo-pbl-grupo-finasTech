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

  static menorUnidade(valor: number, moeda: Moeda): Dinheiro {
    if (valor < 0) throw new TypeError('Valor não pode ser negativo.');

    return new Dinheiro(valor, moeda);
  }

  static unidadeVerificada(valor: number, moeda: Moeda): Dinheiro {
    return new Dinheiro(valor, moeda);
  }

  static decimal(valor: string, moeda: Moeda): Dinheiro {
    const ajustado = valor.trim().replace(',', '.');
    if (!/^-?\d+(\.\d{1,2})?$/.test(ajustado))
      throw new DomainError(`Valor monetario inválido: ${valor}`);

    const negativo = ajustado.startsWith('-');
    const normalizado = negativo ? ajustado.slice(1) : ajustado;
    const [todo, fracao = ''] = normalizado.split('.');
    const fracaoDeslocada = fracao.padEnd(2, '0').slice(0, 2);
    const menorUnidade = Number.parseInt(todo + fracaoDeslocada);
    return negativo
      ? new Dinheiro(menorUnidade, moeda).negado()
      : new Dinheiro(menorUnidade, moeda);
  }

  get getValor(): number {
    return this.valor;
  }

  get getMoeda(): Moeda {
    return this.moeda;
  }

  isZero(): boolean {
    return this.valor === 0;
  }

  isNegativo(): boolean {
    return this.valor < 0;
  }

  isPositivo(): boolean {
    return this.valor > 0;
  }

  negado(): Dinheiro {
    return new Dinheiro(-this.valor, this.moeda);
  }

  abs(): Dinheiro {
    return this.valor < 0 ? this.negado() : this;
  }

  adicionar(outro: Dinheiro): Dinheiro {
    this.validacaoMesmoValor(outro);

    return new Dinheiro(this.valor + outro.valor, this.moeda);
  }

  subtrair(outro: Dinheiro): Dinheiro {
    this.validacaoMesmoValor(outro);

    return new Dinheiro(this.valor - outro.valor, this.moeda);
  }

  multiplicar(fator: number): Dinheiro {
    if (!Number.isFinite(fator))
      throw new DomainError('Fator deve ser um número finito.');

    const escala = Number(this.valor) * fator;
    const arredontado = Math.round(escala);

    return new Dinheiro(arredontado, this.moeda);
  }

  dividir(divisor: number): Dinheiro {
    if (divisor === 0) throw new DomainError('Não pode dividir por 0.');

    const escala = Number(this.valor) / divisor;
    const arredondado = Math.round(escala);

    return new Dinheiro(arredondado, this.moeda);
  }

  equals(outro: Dinheiro): boolean {
    return this.valor === outro.valor && this.moeda.equals(outro.moeda);
  }

  private validacaoMesmoValor(outro: Dinheiro): void {
    if (!this.moeda.equals(outro.moeda))
      throw new DomainError('Não pode calcular 2 moedas distintas.');
  }
}
