import { Relationship } from '../entityMetadataManager';
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
declare const navigator: (relationship: Relationship, navigatorName: string) => (target: Object, propertyName: string) => void;
export default navigator;
