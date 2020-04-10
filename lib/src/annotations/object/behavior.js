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
 * 用于定义实体模型的行为
 *
 * @category annotations
 *
 * @param behaviorName {BehaviorName} 行为名称
 * @param url {string} 数据源地址
 * @param method {Method} 向数据源地址发起http请求时使用的HTTP谓词
 *
 * @example
 * ```typescript
 * @behavior('load', 'http://localhost:3000/foo/$id', 'GET')
 * class Foo {}
 * ```
 */
var behavior = function (behaviorName, url, method, mapParameters, mapEntity) {
    if (method === void 0) { method = 'GET'; }
    return function (target) {
        entityMetadataManager_1.default.register(target.prototype, entityMetadataManager_1.MetadataType.Behavior, { behaviorName: behaviorName, url: url, method: method, mapParameters: mapParameters, mapEntity: mapEntity });
    };
};
exports.default = behavior;
//# sourceMappingURL=behavior.js.map