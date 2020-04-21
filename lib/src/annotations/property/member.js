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
 * 用来注解实体模型中的成员字段
 *
 * @param fieldName {string} 字段别名
 * @param dataType {{new(): object}} 非基本数据类型
 *
 * @example
 *
 * ```typescript
 * class Foo {
 *   @member()
 *   name: string = ''
 *
 *   other: string = ''
 * }
 *
 * const foo = ctx.foo.entry({name: 'fooName', other: 'test'})
 * // foo is {name: 'fooName'}
 * ```
 */
var member = function (fieldName, dataType) { return function (target, propertyName) {
    entityMetadataManager_1.default.register(target, entityMetadataManager_1.MetadataType.Member, { fieldName: fieldName || propertyName, propertyName: propertyName, dataType: dataType });
}; };
exports.default = member;
//# sourceMappingURL=member.js.map