import manager, { MetadataType, Member } from '../entityMetadataManager'

/**
 * 用来注解实体模型中的成员字段
 *
 * @param fieldName {string} 字段别名
 *
 * @example
 *
 * ```typescript
 * class Foo {
 *   @member()
 *   name: string = ''
 *
 *   other: string = ''
 * }
 *
 * const foo = ctx.foo.entry({name: 'fooName', other: 'test'})
 * // foo is {name: 'fooName'}
 * ```
 */
const member = (fieldName?: string) => (target: Object, propertyName: string) => {
  manager.register<Member>(target, MetadataType.Member, { fieldName: fieldName || propertyName, propertyName })
}

export default member
