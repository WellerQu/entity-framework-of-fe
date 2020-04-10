"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 判断值是否为空
 *
 * a -> boolean
 *
 * @author nixon
 * @since 2019-07-17 13:42:07
 *
 * @example
 * import isEmpty from 'utils/isEmpty'
 * isEmpty('a') // => false
 * isEmpty(0) // => false
 * isEmpty(true) // => false
 * isEmpty(false) // => false
 * isEmpty('') // => true
 * isEmpty('  ') // => true
 * isEmpty({}) // => true
 * isEmpty([]) // => true
 * isEmpty(null) // => true
 * isEmpty(undefined) // => true
 */
var isEmpty = function (value) {
    if (value === void 0) {
        return true;
    }
    if (value === null) {
        return true;
    }
    if (Array.isArray(value)) {
        return value.length === 0;
    }
    if (typeof value === 'object') {
        return Reflect.ownKeys(value).length === 0;
    }
    if (typeof value === 'string') {
        return !value.trim();
    }
    return false;
};
exports.default = isEmpty;
//# sourceMappingURL=isEmpty.js.map