/**
* Created by agnynk on 26.01.14.
*/
///<reference path="interfaces/DriverInterface.ts" />
///<reference path="Model.ts" />
///<reference path="Collection.ts" />
var Connector = (function () {
    function Connector() {
    }
    Connector.prototype.getModel = function (tableName) {
        return new Model(this.connector, tableName);
    };

    Connector.prototype.getCollection = function (tableName) {
        return new Collection(this.connector, tableName);
    };
    return Connector;
})();
//# sourceMappingURL=Connector.js.map
