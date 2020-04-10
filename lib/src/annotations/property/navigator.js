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
 * 用来注解实体模型中的导航字段
 *
 * @example
 *
 * ```typescript
 * class Foo {
 *   @navigator(Relationship.One, 'bar')
 *   bar?: Bar
 *
 *   @navigator(Relationship.Many, 'jar')
 *   jar?: Jar
 * }
 * ```
 *
 * @param relationship {Relationship} 实体间关系
 * @param navigatorName {string} 导航名称
 */
var navigator = function (relationship, navigatorName) { return function (target, propertyName) {
    entityMetadataManager_1.default.register(target, entityMetadataManager_1.MetadataType.Navigator, { fieldName: propertyName, relationship: relationship, navigatorName: navigatorName, propertyName: propertyName });
}; };
exports.default = navigator;
//# sourceMappingURL=navigator.js.map