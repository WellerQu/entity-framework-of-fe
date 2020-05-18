type Store = {
  [key: string]: any
}

/**
 * 注解实体模型的字段元数据
 *
 * @category annotations
 */
interface Property {
  /**
   * 属性名称
   */
  propertyName: string;
}

/**
 * 注解实体模型的成员字段元数据, 通过添加注解 @[[member]]() 产生
 *
 * @category annotations
 */
interface Member extends Property {
  /**
   * 字段名称
   */
  fieldName: string;
  /**
   * 属性类型
   */
  propertyDataType?: () => { new(): object }
}

interface Mapping extends Property {
  /**
   * object中的位置
   */
  path: string;
}

/**
 * 成员数据值得约束
 *
 * @category annotations
 */
interface Constraints extends Property {
  /**
   * 成员值约束
   */
  constraints: ConstraintOption,
}

enum MetadataType {
  Member = 1,
  Constraint = 2,
  Mapping = 3
}

interface IMetadataContext {
  model: WeakMap<object, {}>
}

interface IMetadata<T> {
  next?: IMetadata<{}>
  setData(type: MetadataType, prototype: object, meta: T)
  getData(type: MetadataType, prototype: object, ...args: any[])
}
