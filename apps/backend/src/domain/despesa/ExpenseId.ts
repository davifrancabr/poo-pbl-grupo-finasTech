import { EntityId } from '../shared/EntityId';

export class ExpenseId extends EntityId {
  private constructor(value: string) {
    super(value);
  }

  static create(value?: string) {
    return new ExpenseId(value ?? EntityId.generate());
  }
}
