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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var isEmpty_1 = __importDefault(require("./utils/isEmpty"));
var EntityConfiguration = /** @class */ (function () {
    function EntityConfiguration() {
        this.fetchData = this.fetchData.bind(this);
    }
    EntityConfiguration.prototype.parseUrl = function (url, params) {
        if (isEmpty_1.default(params)) {
            return url;
        }
        var newUrl = url;
        var prototype = Object.getPrototypeOf(params);
        if (prototype === Array.prototype) {
            newUrl = params.reduce(function (url, param) {
                return url.replace(/(\$[^/&$]+)/i, isEmpty_1.default(param) ? '' : param);
            }, newUrl);
        }
        else if (prototype === Object.prototype) {
            newUrl = Object.entries(params).reduce(function (url, param) {
                var _a = __read(param, 2), key = _a[0], value = _a[1];
                return url.replace(new RegExp("(\\$" + key + ")\\b", 'i'), isEmpty_1.default(value) ? '' : value);
            }, newUrl);
        }
        else {
            newUrl = url.replace(/(\$[^/&$]+)/i, isEmpty_1.default(params) ? '' : params);
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