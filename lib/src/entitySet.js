"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var annotations_1 = __importDefault(require("./annotations"));
var EntitySet = /** @class */ (function () {
    function EntitySet(type) {
        this.entityMetadata = { type: type };
    }
    /**
     * 将 原始数据 反序列化成 实体数据
     * @param originData 原始数据
     * @param isomorphism 是否是同构数据, 默认为异构
     * @returns 实体数据
     */
    EntitySet.prototype.deserialize = function (originData, isomorphism) {
        if (isomorphism === void 0) { isomorphism = false; }
        if (!originData) {
            return undefined;
        }
        return annotations_1.default.entry(originData, this.entityMetadata.type, isomorphism);
    };
    /**
     * 将 实体数据 序列化成 原始数据
     * @param entity 实体数据
     * @returns 原始数据
     */
    EntitySet.prototype.serialize = function (entity, constraints) {
        if (!entity) {
            return undefined;
        }
        return annotations_1.default.revert(entity, this.entityMetadata.type, constraints);
    };
    return EntitySet;
}());
exports.default = EntitySet;
//# sourceMappingURL=entitySet.js.map