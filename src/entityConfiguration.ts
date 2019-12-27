import isEmpty from './utils/isEmpty'

const fetch = window.fetch || require('node-fetch')

export default class EntityConfiguration {
  protected parseUrl (url: string, params: any) {
    if (isEmpty(params)) {
      return url
    }

    const isBaseType = !(Object.getPrototypeOf(params) === Array.prototype || Object.getPrototypeOf(params) === Object.prototype)
    let newUrl = url

    if (isBaseType) {
      newUrl = newUrl.replace(/(\$[^/&$]+)/i, `${params}`)
    } else {
      Object.keys(params).forEach((key) => {
        newUrl = newUrl.replace(/(\$[^/&$]+)/i, `${Reflect.get(params, key)}`)
      })
    }

    return newUrl
  }

  public async fetchJSON (url: string, options: RequestInit, data: {}) {
    const hasDollar = !!(~url.indexOf('$'))
    if (hasDollar && isEmpty(data)) {
      return Promise.resolve(null)
      // return Promise.reject(new Error('缺失解析地址的参数'))
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
