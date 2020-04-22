"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var entityState_1 = __importDefault(require("./entityState"));
var EntityTrace = /** @class */ (function () {
    function EntityTrace(origin, state) {
        if (state === void 0) { state = entityState_1.default.Unchanged; }
        this.origin = origin;
        this.state = state;
        this.propertyBeforeChangeHandlers = [];
        this.propertyAfterChangeHandlers = [];
        var sender = this;
        var _a = Proxy.revocable(origin, {
            isExtensible: function () { return false; },
            set: function (target, property, newValue) {
                if (property in target) {
                    var value = Reflect.get(target, property);
                    var event_1 = {
                        propertyName: property,
                        value: value,
                        newValue: newValue
                    };
                    try {
                        sender.propertyBeforeChangeHandlers.forEach(function (fn) { return fn(sender, event_1); });
                        Reflect.set(target, property, newValue);
                        sender.propertyAfterChangeHandlers.forEach(function (fn) { return fn(sender, event_1); });
                    }
                    catch (e) {
                        if (process.env.NODE_ENV === 'development') {
                            // eslint-disable-next-line no-console
                            console.warn(e.message);
                        }
                    }
                    return true;
                }
                return false;
            }
        }), proxy = _a.proxy, revoke = _a.revoke;
        this.proxy = proxy;
        this.revoke = revoke;
    }
    Object.defineProperty(EntityTrace.prototype, "proxyObject", {
        get: function () {
            return this.proxy;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EntityTrace.prototype, "rawObject", {
        get: function () {
            return this.origin;
        },
        enumerable: true,
        configurable: true
    });
    EntityTrace.prototype.onPropertyBeforeChange = function (handler) {
        this.propertyBeforeChangeHandlers.push(handler);
    };
    EntityTrace.prototype.offPropertyBeforeChange = function (handler) {
        this.propertyBeforeChangeHandlers = this.propertyBeforeChangeHandlers.filter(function (item) { return item !== handler; });
    };
    EntityTrace.prototype.onPropertyAfterChange = function (handler) {
        this.propertyAfterChangeHandlers.push(handler);
    };
    EntityTrace.prototype.offPropertyAfterChange = function (handler) {
        this.propertyAfterChangeHandlers = this.propertyAfterChangeHandlers.filter(function (item) { return item !== handler; });
    };
    return EntityTrace;
}());
exports.default = EntityTrace;
//# sourceMappingURL=entityTrace.js.map