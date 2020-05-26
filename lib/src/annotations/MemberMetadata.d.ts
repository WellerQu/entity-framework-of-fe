import MetadataType from '../constants/metadataType';
export declare class MemberMetadata implements IMetadata<Member> {
    private ctx;
    constructor(ctx: IMetadataContext, next?: IMetadata<{}>);
    next?: IMetadata<{}> | undefined;
    setData(type: MetadataType, prototype: object, meta: Member): any;
    getData(type: MetadataType, prototype: object, ...args: any[]): any;
}
