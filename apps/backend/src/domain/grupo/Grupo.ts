import type { Dinheiro } from '../shared/Dinheiro';
import { DomainError } from '../shared/DomainError';
import { Moeda } from '../shared/Moeda';
import { FundoReserva } from './FundoReserva';
import { GrupoId } from './GrupoId';
import { Membro } from './Membro';
import type { MembroId } from './MembroId';

export class Grupo {
  private constructor(
    private readonly id: GrupoId,
    private readonly nome: string,
    private readonly moeda: Moeda,
    private readonly membros: Map<string, Membro>,
    private readonly fundoReserva: FundoReserva
  ) {}

  static create(nome: string, moeda: Moeda = Moeda.BRL): Grupo {
    if (nome.trim().length < 2)
      throw new DomainError(
        'Nome do grupo deve possuir pelo menos 2 caracteres'
      );

    return new Grupo(
      GrupoId.create(),
      nome.trim(),
      moeda,
      new Map(),
      FundoReserva.create(moeda)
    );
  }

  static reconstituicao(
    id: GrupoId,
    nome: string,
    moeda: Moeda,
    membros: Membro[],
    fundoReserva: FundoReserva
  ): Grupo {
    const grupo = new Grupo(id, nome, moeda, new Map(), fundoReserva);

    for (const membro of membros) {
      grupo.membros.set(membro.getId().getValue(), membro);
    }

    return grupo;
  }

  getId(): GrupoId {
    return this.id;
  }

  getNome(): string {
    return this.nome;
  }

  getMoeda(): Moeda {
    return this.moeda;
  }

  getMembros(): readonly Membro[] {
    return [...this.membros.values()];
  }

  getFundoReserva(): FundoReserva {
    return this.fundoReserva;
  }

  addMembro(nome: string): Membro {
    const membro = Membro.create(nome);
    this.membros.set(membro.getId().getValue(), membro);

    return membro;
  }

  getMembro(membroId: MembroId): Membro | undefined {
    return this.membros.get(membroId.getValue());
  }

  hasMembro(membroId: MembroId): boolean {
    return this.membros.has(membroId.getValue());
  }

  requerMembro(membroId: MembroId): Membro {
    const membro = this.getMembro(membroId);
    if (!membro) throw new DomainError('Membro não encontrado no grupo.');

    return membro;
  }

  contribuirParaReserva(
    membroId: MembroId,
    valor: Dinheiro,
    descricao: string
  ): void {
    this.requerMembro(membroId);
    this.fundoReserva.contribuicoes(membroId, valor, descricao);
  }

  saqueReserva(membroId: MembroId, valor: Dinheiro, descricao: string): void {
    this.requerMembro(membroId);
    this.fundoReserva.saque(valor, descricao, membroId);
  }
}
