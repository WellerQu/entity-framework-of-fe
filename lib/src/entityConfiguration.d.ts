export default abstract class EntityConfiguration {
    protected parseUrl(url: string, params: any): string;
    fetchJSON(url: string, options: RequestInit, data: {}): Promise<any>;
    abstract fetch<T = any>(url: string, options?: RequestInit): Promise<T>;
}
