///<reference path="interfaces/DriverInterface.ts" />

module Light {
    /**
     * @param {object} connector Connection object to DB with method query(query: string, handler: (err, rows, fields) => void)
     */
    export var driver:DriverInterface;
}