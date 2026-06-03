import { EntityId } from '../shared/EntityId';

export class MembroId extends EntityId {
  private constructor(value: string) {
    super(value);
  }

  static create(value?: string): MembroId {
    return new MembroId(value ?? EntityId.generate());
  }
}
