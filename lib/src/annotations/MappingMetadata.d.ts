import MetadataType from '../constants/metadataType';
export declare class MappingMetadata implements IMetadata<Mapping> {
    private ctx;
    constructor(ctx: IMetadataContext, next?: IMetadata<{}>);
    next?: IMetadata<{}> | undefined;
    setData(type: MetadataType, prototype: object, meta: Mapping): void;
    getData(type: MetadataType, prototype: object, ...args: any[]): any;
}
