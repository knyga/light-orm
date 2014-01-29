/**
 * Interface to update/delete selection options
 * @author Oleksandr Knyga <oleksandrknyga@gmail.com>
 * @license Apache License 2.0 - See file 'LICENSE.md' in this project.
 */

///<reference path="../interfaces/WhereInterface.ts" />

class Where implements WhereInterface {
    whereValue: {};
    where: string[];

    constructor(where: WhereInterface) {
        this.where = where.where;
        this.whereValue = where.whereValue;
    }

    /**
     * Generate object with data, that will be used for filtering in WHERE block
     * @param data Data from Model
     * @returns {{}}
     */
    public getBlock(data: {}): {} {
        var obj: {} = {};

        if("undefined" !== typeof this.where) {

            for(var i = 0; i < this.where.length; i++) {

                if(data.hasOwnProperty(this.where[i])) {
                    obj[this.where[i]] = data[this.where[i]];
                }
            }
        } else {
            obj = this.whereValue;
        }

        return obj;
    }
}