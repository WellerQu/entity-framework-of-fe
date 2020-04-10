/**
 * 用来注解实体模型中的主键字段
 *
 * @example
 *
 * ```typescript
 * class Foo {
 *   @primary()
 *   id: number = 0
 * }
 *
 * ctx.foo.find(1)
 * ```
 */
declare const primary: () => (target: Object, propertyName: string) => void;
export default primary;
