import isEmpty from './utils/isEmpty'

export default abstract class EntityConfiguration {
  constructor () {
    this.fetchData = this.fetchData.bind(this)
  }

  protected parseUrl (url: string, params: any): string {
    if (isEmpty(params)) {
      return url
    }

    let newUrl = url

    const prototype = Object.getPrototypeOf(params)
    if (prototype === Array.prototype) {
      newUrl = params.reduce((url: string, param: any) => {
        return url.replace(/(\$[^/&$]+)/i, param)
      }, newUrl)
    } else if (prototype === Object.prototype) {
      newUrl = Object.entries(params).reduce((url: string, param: any) => {
        return url.replace(new RegExp(`(\\$${param[0]})\\b`, 'i'), param[1])
      }, newUrl)
    } else {
      newUrl = url.replace(/(\$[^/&$]+)/i, params)
    }

    return newUrl
  }

  public fetchData (url: string, options: RequestInit, data?: {}) {
    const hasDollar = !!(~url.indexOf('$'))
    if (hasDollar && isEmpty(data)) {
      const msg = 'fetchData时存在$变量, 但缺少数据'
      console.error(msg) // eslint-disable-line no-console
      throw new Error(msg)
    }

    const fetchTarget = this.parseUrl(url, data)
    const fetchOptions = {
      ...options,
      headers: {
        ...options.headers,
        'Content-Type': 'application/json'
      }
    }

    if (fetchOptions.method !== 'GET') {
      fetchOptions.body = JSON.stringify(data)
    }

    return this.fetch(fetchTarget, fetchOptions)
  }

  protected abstract fetch(url: string, options?: RequestInit): Promise<Response>;
}
