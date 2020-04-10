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
 * 用来注解上下文模型中的数据集字段
 *
 * @example
 * ```typescript
 * class YourContext extends EntityContext {
 *   @set()
 *   foo = new EntitySet(this, Foo)
 *   @set('bar)
 *   barSet = new EntitySet(this, Bar)
 * }
 * ```
 *
 * @param navigatorName {string} 导航别名
 */
var set = function (navigatorName) { return function (target, property) {
    entityMetadataManager_1.default.register(target, entityMetadataManager_1.MetadataType.Entity, {
        fieldName: navigatorName || property,
        propertyName: property
    });
}; };
exports.default = set;
//# sourceMappingURL=set.js.map