import manager, { MetadataType, EntitySet } from '../entityMetadataManager'

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
const set = (navigatorName?: string) => (target: Object, property: string) => {
  manager.register<EntitySet>(target, MetadataType.Entity, {
    fieldName: navigatorName || property,
    propertyName: property
  })
}

export default set
