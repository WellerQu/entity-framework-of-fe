import manager, { MetadataType, PrimaryKey } from '../metadataManager'

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
const primary = () => (target: Object, propertyName: string) => {
  manager.register<PrimaryKey>(target, MetadataType.PrimaryKey, { fieldName: propertyName, propertyName })
}

export default primary
