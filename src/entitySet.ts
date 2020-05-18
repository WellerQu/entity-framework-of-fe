import context, { ConstraintOption } from './annotations'

export default class EntitySet<T extends Object> {
  constructor (type: { new(): T}) {
    this.entityMetadata = { type }
  }

  private entityMetadata: {
    type: { new() : T },
  }

  /**
   * 将原始JSON数据反序列化成 Entity 实例
   * @param originData 原始数据
   * @param isomorphism 是否是同构数据, 默认为异构
   * @returns 填充数据的实例
   */
  public deserialize (originData: object | undefined, isomorphism = false): T | T[] | undefined {
    if (!originData) {
      return undefined
    }

    return context.entry(originData, this.entityMetadata.type, isomorphism) as T | T[]
  }

  /**
   * 将 Entity 实例序列化成JSON数据
   * @param entity 数据来源实体实例
   * @returns 原始数据
   */
  public serialize (entity: T | undefined, constraints?: ConstraintOption): Store | undefined {
    if (!entity) {
      return undefined
    }

    return context.revert(entity, this.entityMetadata.type, constraints)
  }
}
