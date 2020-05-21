"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = __importDefault(require("../index"));
var metadataType_1 = __importDefault(require("../../constants/metadataType"));
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
    index_1.default.register(target, metadataType_1.default.Member, {
        fieldName: fieldName || propertyName,
        propertyName: propertyName,
        propertyDataType: dataType
    });
}; };
exports.default = member;
//# sourceMappingURL=member.js.map