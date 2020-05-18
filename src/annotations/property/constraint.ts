import context from '../index'
import ConstraintOption from '../../constants/constraintOption'
import MetadataType from '../../constants/metadataType'

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
const constraint = (constraints: ConstraintOption) => (target: object, propertyName: string) => {
  context.register<Constraints>(target, MetadataType.Constraint, {
    constraints,
    propertyName
  })
}

export default constraint
