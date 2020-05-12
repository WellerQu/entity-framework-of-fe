import manager, { Member } from '../entityMetadataManager'
import MetadataType from '../metadataType'

/**
 * 用来注解实体模型中的成员字段
 *
 * @param fieldName {string} 字段别名
 * @param dataType {{new(): object}} 非基本数据类型
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
const member = (fieldName?: string, dataType?: () => { new(): object }) => (target: Object, propertyName: string) => {
  manager.register<Member>(target, MetadataType.Member, {
    fieldName: fieldName || propertyName,
    propertyName,
    dataType: dataType
  })
}

export default member
