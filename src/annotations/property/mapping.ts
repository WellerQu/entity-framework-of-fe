import context from '../index'
import MetadataType from '../../constants/metadataType'

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
const mapping = (path: string) => (target: object, propertyName: string) => {
  context.register<Mapping>(target, MetadataType.Mapping, {
    path,
    propertyName
  })
}

export default mapping
