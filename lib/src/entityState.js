"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var EntityState;
(function (EntityState) {
    EntityState[EntityState["Added"] = 1] = "Added";
    EntityState[EntityState["Deleted"] = 2] = "Deleted";
    EntityState[EntityState["Detached"] = 4] = "Detached";
    EntityState[EntityState["Modified"] = 8] = "Modified";
    EntityState[EntityState["Unchanged"] = 16] = "Unchanged";
})(EntityState || (EntityState = {}));
exports.default = EntityState;
//# sourceMappingURL=entityState.js.map