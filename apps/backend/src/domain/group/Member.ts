import { MemberId } from './MemberId';

export class Member {
  private constructor(
    private readonly id: MemberId,
    private readonly name: string
  ) {}

  static create(name: string, id?: MemberId): Member {
    if (name.trim().length < 2)
      throw new Error('Nome do membro tem que ter pelo menos 2 caracteres');

    return new Member(id ?? MemberId.create(), name.trim());
  }

  getId(): MemberId {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  equals(outro: Member): boolean {
    return this.id.equals(outro.id);
  }
}
