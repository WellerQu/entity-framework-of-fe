import context, { MetadataType } from '../MetadataContext'
import ConstraintOption from '../../constants/constraintOption'

/**
 * 用来注解实体模型中的值约束
 *
 * @example
 * ```typescript
 * class Foo {
 *   @constraint(ConstraintOption.NON_EMPTY)
 *   bid: number = 0
 * }
 * ```
 *
 * @param constraints {ConstraintOption} 约束
 */
const constraint = (constraints: ConstraintOption) => (target: Object, propertyName: string) => {
  context.register<Constraints>(target, MetadataType.Constraint, {
    constraints,
    propertyName
  })
}

export default constraint
