import { EntityId } from '../shared/EntityId';

export class MemberId extends EntityId {
  private constructor(value: string) {
    super(value);
  }

  static create(value?: string): MemberId {
    return new MemberId(value ?? EntityId.generate());
  }
}
