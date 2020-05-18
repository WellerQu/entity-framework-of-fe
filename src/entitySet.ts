import context, { ConstraintOption } from './annotations'

export default class EntitySet<T extends Object> {
  constructor (type: { new(): T}) {
    this.entityMetadata = { type }
  }

  private entityMetadata: {
    type: { new() : T },
  }

  /**
   * 将 原始数据 反序列化成 实体数据
   * @param originData 原始数据
   * @param isomorphism 是否是同构数据, 默认为异构
   * @returns 实体数据
   */
  public deserialize (originData: object | undefined, isomorphism = false): T | T[] | undefined {
    if (!originData) {
      return undefined
    }

    return context.entry(originData, this.entityMetadata.type, isomorphism) as T | T[]
  }

  /**
   * 将 实体数据 序列化成 原始数据
   * @param entity 实体数据
   * @returns 原始数据
   */
  public serialize (entity: T | undefined, constraints?: ConstraintOption): Store | undefined {
    if (!entity) {
      return undefined
    }

    return context.revert(entity, this.entityMetadata.type, constraints)
  }
}
