/**
 * 用来注解实体模型中的外键字段
 *
 * @example
 * ```typescript
 * class Foo {
 *   @foreign()
 *   bid: number = 0
 * }
 * ```
 *
 * @param constructor {{ new(): T }} 外键关联实体的构造函数
 * @param navigatorName {string} 导航名称
 * @param fieldName {string} 字段别名
 */
declare const foreign: (constructor: new () => {}, navigatorName: string, fieldName?: string | undefined) => (target: Object, property: string) => void;
export default foreign;
