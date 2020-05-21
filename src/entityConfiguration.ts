import isEmpty from './utils/isEmpty'

export default abstract class EntityConfiguration {
  constructor () {
    this.fetchData = this.fetchData.bind(this)
  }

  protected parseUrl (url: string, params: any): string {
    if (isEmpty(params)) {
      return url
    }

    const prototype = Object.getPrototypeOf(params)

    if (prototype === Array.prototype) {
      const newUrl = params.reduce((url: string, param: any) => {
        return url.replace(/(\$[^/&$]+)/i, isEmpty(param) ? '' : param)
      }, url)
      return newUrl
    }

    if (prototype === Object.prototype) {
      const newUrl = Object.entries(params).reduce((url: string, param: [string, any]) => {
        const [key, value] = param
        return url.replace(new RegExp(`(\\$${key})\\b`, 'i'), isEmpty(value) ? '' : value)
      }, url)
      return newUrl
    }

    const newUrl = url.replace(/(\$[^/&$]+)/i, isEmpty(params) ? '' : params)
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
        'Content-Type': 'application/json',
        ...options.headers
      }
    }

    if (fetchOptions.method !== 'GET' && fetchOptions.headers['Content-Type'] === 'application/json') {
      fetchOptions.body = JSON.stringify(data)
    }

    return this.fetch(fetchTarget, fetchOptions)
  }

  protected abstract fetch(url: string, options?: RequestInit): Promise<Response>;
}
