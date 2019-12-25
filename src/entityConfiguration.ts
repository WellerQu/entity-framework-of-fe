import isEmpty from './utils/isEmpty'

export default class EntityConfiguration {
  public fetch = window.fetch || require('node-fetch')

  private parseUrl (url: string, params: any) {
    if (isEmpty(params)) {
      return url
    }

    const isBaseType = !(Object.getPrototypeOf(params) === Array.prototype || Object.getPrototypeOf(params) === Object.prototype)
    let newUrl = url

    if (isBaseType) {
      newUrl = newUrl.replace(/(\$[^/]+)/i, `${params}`)
    } else {
      Object.keys(params).forEach((key) => {
        newUrl = newUrl.replace(/(\$[^/]+)/i, `${Reflect.get(params, key)}`)
      })
    }

    return newUrl
  }

  public async fetchJSON (url: string, options: RequestInit, data: {}) {
    let fetchTarget = url
    const fetchOptions = {
      ...options,
      headers: {
        ...options.headers,
        'Content-Type': 'application/json'
      }
    }

    if (options.method === 'GET') {
      fetchTarget = this.parseUrl(url, data)
    } else {
      options.body = JSON.stringify(data)
    }

    return this.fetch(fetchTarget, fetchOptions).then(res => res.json())
  }
}
