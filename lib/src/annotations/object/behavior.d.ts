import { Method, BehaviorName } from '../entityMetadataManager';
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
declare const behavior: <T = any>(behaviorName: BehaviorName, url: string, method?: Method, mapParameters?: ((...args: any[]) => T) | undefined, mapEntity?: ((...args: any[]) => Promise<T>) | undefined) => (target: new () => {}) => void;
export default behavior;
