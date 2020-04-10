import EntityContext from './entityContext';
export default class EntitySet<T extends Object> {
    private ctx;
    constructor(ctx: EntityContext, type: {
        new (): T;
    });
    private set;
    private ownNavigatorRequests;
    private otherNavigators;
    private entityMetadata;
    private attachOriginDataToEntitySet;
    private getRelatedEntitySet;
    readonly size: number;
    clean(): this;
    private cleanSet;
    private cleanNavigators;
    add(...entities: (T | undefined)[]): this;
    remove(...entities: (T | undefined)[]): this;
    attach(...entities: (T | undefined)[]): this;
    detach(...entities: (T | undefined)[]): this;
    /**
     * 通过传入的主键在数据集中查询实体实例, 参数的顺序为实体模型中被注解为 @[[primary]]() 的字段的顺序
     *
     * @example
     * ```typescript
     * class Foo {
     *   @primary()
     *   id: number = 0
     *   @primary()
     *   version: number = 0
     * }
     *
     * ctx.foo.find(1, 2)
     * // 参数 1 作为id, 参数 2 作为version
     * ```
     *
     * @param primaryKeys {...any[]} 主键字段
     * @returns
     */
    find(...primaryKeys: any[]): T | undefined;
    filter(fn: (n: T) => boolean): T[];
    toList(): T[];
    load(...args: any[]): Promise<Response>;
    loadAll(...args: any[]): Promise<Response>;
    include(navigatorName: string): this;
    entry(originData: {}): T;
    rawQuery(query: () => Promise<T[] | T>): Promise<T[]>;
    private synchronizeAddedState;
    private synchronizeDeletedState;
    private synchronizeModifiedState;
    synchronizeState(): Promise<any>[];
    private onPropertyChanged;
}
