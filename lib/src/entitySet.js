"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var entityMetadataManager_1 = __importDefault(require("./annotations/entityMetadataManager"));
var isEmpty_1 = __importDefault(require("./utils/isEmpty"));
var EntitySet = /** @class */ (function () {
    function EntitySet(type) {
        this.entityMetadata = { type: type };
    }
    /**
     * 将原始JSON数据反序列化成 Entity 实例
     * @param originData 原始数据
     * @param isomorphism 是否是同构数据, 默认为异构
     * @returns 填充数据的实例
     */
    EntitySet.prototype.deserialize = function (originData, isomorphism) {
        if (isomorphism === void 0) { isomorphism = false; }
        if (isEmpty_1.default(originData)) {
            return undefined;
        }
        return entityMetadataManager_1.default.entry(originData, this.entityMetadata.type, isomorphism);
    };
    /**
     * 将 Entity 实例序列化成JSON数据
     * @param entity 数据来源实体实例
     * @returns 原始数据
     */
    EntitySet.prototype.serialize = function (entity, constraints) {
        return entityMetadataManager_1.default.reverse(entity, this.entityMetadata.type, constraints);
    };
    return EntitySet;
}());
exports.default = EntitySet;
//# sourceMappingURL=entitySet.js.map