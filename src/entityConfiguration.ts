import isEmpty from './utils/isEmpty'

const fetch = window.fetch || require('node-fetch')

export default class EntityConfiguration {
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

  public async fetchJSON (url: string, options: RequestInit, data: {}) {
    const hasDollar = !!(~url.indexOf('$'))
    if (hasDollar && isEmpty(data)) {
      return Promise.resolve(null)
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

    return fetch(fetchTarget, fetchOptions).then(res => res.json())
  }
}
