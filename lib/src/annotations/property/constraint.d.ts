import ConstraintOption from '../../constants/constraintOption';
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
declare const constraint: (constraints: ConstraintOption) => (target: object, propertyName: string) => void;
export default constraint;
