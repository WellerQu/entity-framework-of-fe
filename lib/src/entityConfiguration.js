"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var isEmpty_1 = __importDefault(require("./utils/isEmpty"));
var EntityConfiguration = /** @class */ (function () {
    function EntityConfiguration() {
    }
    EntityConfiguration.prototype.parseUrl = function (url, params) {
        if (isEmpty_1.default(params)) {
            return url;
        }
        var newUrl = url;
        var prototype = Object.getPrototypeOf(params);
        if (prototype === Array.prototype) {
            newUrl = params.reduce(function (url, param) {
                return url.replace(/(\$[^/&$]+)/i, param);
            }, newUrl);
        }
        else if (prototype === Object.prototype) {
            newUrl = Object.entries(params).reduce(function (url, param) {
                return url.replace(new RegExp("(\\$" + param[0] + ")\\b", 'i'), param[1]);
            }, newUrl);
        }
        else {
            newUrl = url.replace(/(\$[^/&$]+)/i, params);
        }
        return newUrl;
    };
    EntityConfiguration.prototype.fetchData = function (url, options, data) {
        var hasDollar = !!(~url.indexOf('$'));
        if (hasDollar && isEmpty_1.default(data)) {
            var msg = 'fetchData时存在$变量, 但缺少数据';
            console.error(msg); // eslint-disable-line no-console
            throw new Error(msg);
        }
        var fetchTarget = this.parseUrl(url, data);
        var fetchOptions = __assign({}, options, { headers: __assign({}, options.headers, { 'Content-Type': 'application/json' }) });
        if (fetchOptions.method !== 'GET') {
            fetchOptions.body = JSON.stringify(data);
        }
        return this.fetch(fetchTarget, fetchOptions);
    };
    return EntityConfiguration;
}());
exports.default = EntityConfiguration;
//# sourceMappingURL=entityConfiguration.js.map