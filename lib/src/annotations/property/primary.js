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
 * 用来注解实体模型中的主键字段
 *
 * @example
 *
 * ```typescript
 * class Foo {
 *   @primary()
 *   id: number = 0
 * }
 *
 * ctx.foo.find(1)
 * ```
 */
var primary = function () { return function (target, propertyName) {
    entityMetadataManager_1.default.register(target, entityMetadataManager_1.MetadataType.PrimaryKey, { fieldName: propertyName, propertyName: propertyName });
}; };
exports.default = primary;
//# sourceMappingURL=primary.js.map