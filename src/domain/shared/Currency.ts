export class Currency {
  private constructor(private readonly code: string) {}

  static readonly BRL = new Currency('BRL');
  static readonly USD = new Currency('USD');
  static readonly EUR = new Currency('EUR');

  static fromCode(type: string): Currency {
    const normalizado = type.toUpperCase().trim();

    if (!/^[A-Z]{3}$/.test(normalizado)) {
      throw new TypeError(`Tipo de moeda inválido: ${type}`);
    }

    return new Currency(normalizado);
  }

  getCode(): string {
    return this.code;
  }

  equals(other: Currency): boolean {
    return this.code === other.code;
  }

  toString(): string {
    return this.code;
  }
}
