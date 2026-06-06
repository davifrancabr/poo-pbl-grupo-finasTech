import { EntityId } from '../shared/EntityId';

export class GoalId extends EntityId {
  private constructor(value: string) {
    super(value);
  }

  static create(value?: string): GoalId {
    return new GoalId(value ?? EntityId.generate());
  }
}
