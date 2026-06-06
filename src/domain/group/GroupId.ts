import { EntityId } from '../shared/EntityId';

export class GroupId extends EntityId {
  private constructor(value: string) {
    super(value);
  }

  static create(value?: string): GroupId {
    return new GroupId(value ?? EntityId.generate());
  }
}
