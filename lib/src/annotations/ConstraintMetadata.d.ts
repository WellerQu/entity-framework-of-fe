import MetadataType from '../constants/metadataType';
export declare class ConstraintMetadata implements IMetadata<Constraints> {
    private ctx;
    constructor(ctx: IMetadataContext, next?: IMetadata<{}>);
    next?: IMetadata<{}> | undefined;
    setData(type: MetadataType, prototype: object, meta: Constraints): any;
    getData(type: MetadataType, prototype: object, ...args: any[]): any;
}
