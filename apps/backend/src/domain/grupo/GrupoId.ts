import { EntityId } from '../shared/EntityId';

export class GrupoId extends EntityId {
  private constructor(value: string) {
    super(value);
  }

  static create(value?: string): GrupoId {
    return new GrupoId(value ?? EntityId.generate());
  }
}
