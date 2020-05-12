"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @example
 * ```typescript
 * class YourContext extends EntityContext {
 * }
 *
 * const ctx = new YourContext()
 * ```
 */
var EntityContext = /** @class */ (function () {
    function EntityContext(configuration) {
        this._configuration = configuration;
    }
    Object.defineProperty(EntityContext.prototype, "configuration", {
        get: function () {
            return this._configuration;
        },
        enumerable: true,
        configurable: true
    });
    EntityContext.prototype.fetch = function (url, options, data) {
        return this.configuration.fetchData(url, options, data);
    };
    return EntityContext;
}());
exports.default = EntityContext;
//# sourceMappingURL=entityContext.js.map