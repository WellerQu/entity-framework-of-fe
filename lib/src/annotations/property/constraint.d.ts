import Constraints from '../../constants/constraints';
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
declare const constraint: (constraints: Constraints) => (target: Object, propertyName: string) => void;
export default constraint;
