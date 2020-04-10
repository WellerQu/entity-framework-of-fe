"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var entityState_1 = __importDefault(require("./entityState"));
var EntityTrace = /** @class */ (function () {
    function EntityTrace(origin, state) {
        var _this = this;
        if (state === void 0) { state = entityState_1.default.Unchanged; }
        this.origin = origin;
        this.state = state;
        this.propertyChangeHandlers = [];
        var propertyChange = function (propertyName, value, newValue) {
            var event = {
                propertyName: propertyName,
                value: value,
                newValue: newValue
            };
            _this.propertyChangeHandlers.forEach(function (fn) { return fn(_this, event); });
        };
        var _a = Proxy.revocable(origin, {
            set: function (target, property, value) {
                if (property in target) {
                    var oldValue = Reflect.get(target, property);
                    Reflect.set(target, property, value);
                    propertyChange(property, oldValue, value);
                    return true;
                }
                return false;
            }
        }), proxy = _a.proxy, revoke = _a.revoke;
        this.proxy = proxy;
        this.revoke = revoke;
    }
    Object.defineProperty(EntityTrace.prototype, "object", {
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
    EntityTrace.prototype.onPropertyChange = function (handler) {
        this.propertyChangeHandlers.push(handler);
    };
    EntityTrace.prototype.offPropertyChange = function (handler) {
        this.propertyChangeHandlers = this.propertyChangeHandlers.filter(function (item) { return item !== handler; });
    };
    return EntityTrace;
}());
exports.default = EntityTrace;
//# sourceMappingURL=entityTrace.js.map