export const keyPathGetter = <T = any>(keyPath: string, defaultValue?: T) => {
  return (target: Store) => {
    return (keyPath
      .split('.')
      .reduce(
        (middle: any, key: string) => middle ? middle[key] : undefined,
        target
      ) || defaultValue) as T
  }
}

export const keyPathSetter = <T= any>(keyPath: string) => {
  return (target: Store, value: T) => {
    return keyPath.split('.').reduce((middle: Store, key: string, index: number, keys: string[]) => {
      if (index === keys.length - 1) {
        middle[key] = value
      }

      if (!middle[key]) {
        middle[key] = {}
      }

      return middle[key]
    }, target) as T
  }
}
