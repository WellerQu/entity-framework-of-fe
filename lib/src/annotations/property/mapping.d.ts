/**
 * 用来注解实体模型中的值位置映射
 *
 * @example
 * ```typescript
 * class Foo {
 *   @mapping('a.b.c)
 *   bid: number = 0
 * }
 * ```
 *
 * @param path {string} 位置描述字符串
 */
declare const mapping: (path: string) => (target: object, propertyName: string) => void;
export default mapping;
