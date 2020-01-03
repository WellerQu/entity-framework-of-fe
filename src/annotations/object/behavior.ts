import manager, { MetadataType, Method, Behavior, BehaviorName } from '../entityMetadataManager'

/**
 * 用于定义实体模型的行为
 *
 * @category annotations
 *
 * @param behaviorName {BehaviorName} 行为名称
 * @param url {string} 数据源地址
 * @param method {Method} 向数据源地址发起http请求时使用的HTTP谓词
 *
 * @example
 * ```typescript
 * @behavior('load', 'http://localhost:3000/foo/$id', 'GET')
 * class Foo {}
 * ```
 */
const behavior = <T = any>(
  behaviorName: BehaviorName,
  url: string,
  method: Method = 'GET',
  mapParameters?: (...args: any[]) => T,
  mapEntity?: (...args: any[]) => Promise<T>
) => (target: { new(): {} }) => {
    manager.register<Behavior<T>>(target.prototype, MetadataType.Behavior, { behaviorName, url, method, mapParameters, mapEntity })
  }

export default behavior
