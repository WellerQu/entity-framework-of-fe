import manager, { MetadataType, Method, Behavior } from '../metadataManager'

export default (
  behaviorName: 'load' | 'loadAll',
  url: string,
  method: Method = 'GET',
  mapRequestParameters?: (...args: any[]) => any,
  mapResponseData?: (...args: any[]) => any
) => (target: { new(): {} }) => {
  manager.register<Behavior>(target.prototype, MetadataType.Behavior, { behaviorName, url, method, mapRequestParameters, mapEntityData: mapResponseData })
}
