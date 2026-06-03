import { Dinheiro } from '../shared/Dinheiro';
import { DomainError } from '../shared/DomainError';
import type { Moeda } from '../shared/Moeda';
import type { MembroId } from './MembroId';

export interface TransacaoReserva {
  membroId: MembroId;
  valor: Dinheiro;
  tipo: 'contribuição' | 'Saque';
  descricao: string;
  ocorridoEm: Date;
}

export class FundoReserva {
  private saldo: Dinheiro;
  private readonly transacoes: TransacaoReserva[] = [];

  private constructor(moeda: Moeda) {
    this.saldo = Dinheiro.zero(moeda);
  }

  static create(moeda: Moeda): FundoReserva {
    return new FundoReserva(moeda);
  }

  static reconstituicao(
    moeda: Moeda,
    saldo: Dinheiro,
    transacoes: TransacaoReserva[]
  ): FundoReserva {
    const fundo = new FundoReserva(moeda);

    fundo.saldo = saldo;
    fundo.transacoes.push(...transacoes);
    return fundo;
  }

  get getSaldo(): Dinheiro {
    return this.saldo;
  }

  get getTransacoes(): readonly TransacaoReserva[] {
    return [...this.transacoes];
  }

  contribuicoes(membroId: MembroId, valor: Dinheiro, descricao: string): void {
    if (!valor.isPositive())
      throw new DomainError('Contribuição deve ser positivo.');

    this.saldo = this.saldo.add(valor);
    this.transacoes.push({
      membroId,
      valor,
      tipo: 'contribuição',
      descricao,
      ocorridoEm: new Date()
    });
  }

  saque(valor: Dinheiro, descricao: string, membroId: MembroId): void {
    if (!valor.isPositive()) throw new DomainError('Saque deve ser positivo.');

    if (this.saldo.isLessThan(valor))
      throw new DomainError('Saldo insuficiente do fundo de reserva.');

    this.saldo = this.saldo.subtract(valor);
    this.transacoes.push({
      membroId,
      valor,
      tipo: 'Saque',
      descricao,
      ocorridoEm: new Date()
    });
  }
}
