export class Moeda {
  private constructor(private readonly tipo: string) {}

  static readonly BRL = new Moeda('BRL');
  static readonly USD = new Moeda('USD');

  static fromCode(tipo: string): Moeda {
    const normalizado = tipo.toUpperCase().trim();

    if (!/^[A-Z]{3}$/.test(normalizado)) {
      throw new TypeError(`Tipo de moeda inválido: ${tipo}`);
    }

    return new Moeda(normalizado);
  }

  get getTipo(): string {
    return this.tipo;
  }

  equals(outro: Moeda): boolean {
    return this.tipo === outro.tipo;
  }

  toString(): string {
    return this.tipo;
  }
}
