import manager, { MetadataType, Method, Behavior, BehaviorName } from '../metadataManager'

export default <T = any>(
  behaviorName: BehaviorName,
  url: string,
  method: Method = 'GET',
  mapParameters?: (...args: any[]) => T,
  mapEntity?: (...args: any[]) => Promise<T>
) => (target: { new(): {} }) => {
  manager.register<Behavior<T>>(target.prototype, MetadataType.Behavior, { behaviorName, url, method, mapParameters, mapEntity })
}
