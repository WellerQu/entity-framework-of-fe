"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var entityMetadataManager_1 = __importStar(require("../entityMetadataManager"));
/**
 * 用来注解实体模型中的外键字段
 *
 * @example
 * ```typescript
 * class Foo {
 *   @foreign()
 *   bid: number = 0
 * }
 * ```
 *
 * @param constructor {{ new(): T }} 外键关联实体的构造函数
 * @param navigatorName {string} 导航名称
 * @param fieldName {string} 字段别名
 */
var foreign = function (constructor, navigatorName, fieldName) { return function (target, property) {
    entityMetadataManager_1.default.register(target, entityMetadataManager_1.MetadataType.ForeignKey, {
        fieldName: fieldName || property,
        constructor: constructor,
        navigatorName: navigatorName,
        propertyName: property
    });
}; };
exports.default = foreign;
//# sourceMappingURL=foreign.js.map