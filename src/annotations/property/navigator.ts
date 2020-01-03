import manager, { MetadataType, Relationship, Navigator } from '../entityMetadataManager'

/**
 * 用来注解实体模型中的导航字段
 *
 * @example
 *
 * ```typescript
 * class Foo {
 *   @navigator(Relationship.One, 'bar')
 *   bar?: Bar
 *
 *   @navigator(Relationship.Many, 'jar')
 *   jar?: Jar
 * }
 * ```
 *
 * @param relationship {Relationship} 实体间关系
 * @param navigatorName {string} 导航名称
 */
const navigator = (relationship: Relationship, navigatorName: string) => (target: Object, propertyName: string) => {
  manager.register<Navigator>(target, MetadataType.Navigator, { fieldName: propertyName, relationship, navigatorName, propertyName })
}

export default navigator
