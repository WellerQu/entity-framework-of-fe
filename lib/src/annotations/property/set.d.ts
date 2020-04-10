/**
 * 用来注解上下文模型中的数据集字段
 *
 * @example
 * ```typescript
 * class YourContext extends EntityContext {
 *   @set()
 *   foo = new EntitySet(this, Foo)
 *   @set('bar)
 *   barSet = new EntitySet(this, Bar)
 * }
 * ```
 *
 * @param navigatorName {string} 导航别名
 */
declare const set: (navigatorName?: string | undefined) => (target: Object, property: string) => void;
export default set;
