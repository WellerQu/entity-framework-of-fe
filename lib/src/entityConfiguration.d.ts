export default abstract class EntityConfiguration {
    protected parseUrl(url: string, params: any): string;
    fetchData(url: string, options: RequestInit, data?: {}): Promise<Response>;
    protected abstract fetch(url: string, options?: RequestInit): Promise<Response>;
}
