import { MembroId } from './MembroId';

export class Membro {
  private constructor(
    private readonly id: MembroId,
    private readonly nome: string
  ) {}

  static create(nome: string, id?: MembroId): Membro {
    if (nome.trim().length < 2)
      throw new Error('Nome do membro tem que ter pelo menos 2 caracteres');

    return new Membro(id ?? MembroId.create(), nome.trim());
  }

  getId(): MembroId {
    return this.id;
  }

  getNome(): string {
    return this.nome;
  }

  equals(outro: Membro): boolean {
    return this.id.equals(outro.id);
  }
}
