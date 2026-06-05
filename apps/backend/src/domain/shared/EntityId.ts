import { v4 as uuidv4 } from 'uuid';

export abstract class EntityId {
  protected constructor(private readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('EntityId não pode ficar em branco.');
    }
  }

  static generate(): string {
    return uuidv4();
  }

  getValue(): string {
    return this.value;
  }

  equals(other: EntityId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
