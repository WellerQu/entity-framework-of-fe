import manager, { MetadataType, MemberConstraints } from '../entityMetadataManager'
import Constraints from '../../constants/constraints'

/**
 * 用来注解实体模型中的值约束
 *
 * @example
 * ```typescript
 * class Foo {
 *   @constraint(Constraint.NON_EMPTY_ON_ADDED | Constraint.NON_EMPTY_ON_MODIFIED)
 *   bid: number = 0
 * }
 * ```
 *
 * @param constraints {Constraints} 约束
 */
const constraint = (constraints: Constraints) => (target: Object, propertyName: string) => {
  manager.register<MemberConstraints>(target, MetadataType.Constraint, {
    constraints,
    propertyName
  })
}

export default constraint
