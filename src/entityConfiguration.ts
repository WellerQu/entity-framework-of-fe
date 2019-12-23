export default class EntityConfiguration {
  public fetch = window.fetch || require('node-fetch')

  private parseUrl (url: string, params: {}) {
    let newUrl = url
    Object.keys(params).forEach((key) => {
      newUrl = newUrl.replace(/\/(:[^/]+)/i, `/${Reflect.get(params, key)}`)
    })

    return newUrl
  }

  public fetchJSON <T> (url: string, options: RequestInit, data: {}) {
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
