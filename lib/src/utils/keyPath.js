"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.keyPathGetter = function (keyPath, defaultValue) {
    return function (target) {
        return (keyPath
            .split('.')
            .reduce(function (middle, key) { return middle ? middle[key] : undefined; }, target) || defaultValue);
    };
};
exports.keyPathSetter = function (keyPath) {
    return function (target, value) {
        return keyPath.split('.').reduce(function (middle, key, index, keys) {
            if (!middle[key]) {
                middle[key] = {};
            }
            if (index === keys.length - 1) {
                middle[key] = value;
            }
            return middle[key];
        }, target);
    };
};
//# sourceMappingURL=keyPath.js.map