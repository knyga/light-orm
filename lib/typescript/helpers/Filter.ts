/**
 * Filter object on property names
 * @author Oleksandr Knyga <oleksandrknyga@gmail.com>
 * @license Apache License 2.0 - See file 'LICENSE.md' in this project.
 */

class Filter {
    data: {};

    /**
     * @param {object} data Object, that should be filtered
     */
    constructor(data: {}) {
        this.data = data;
    }


    /**
     * @param Names of properties, that should stay in object
     * @returns {{}}
     */
    filter(names: string[]): {} {
        var newData: {} = {};

        for(var name in this.data) {

            if(this.data.hasOwnProperty(name)) {
                newData[name] = this.data[name];
            }
        }

        return newData;
    }

    /**
     * this.data MINUS data
     * @param data2
     * @returns {{}}
     */
    minus(data2: {}) {
        var newData: {} = {};

        for(var name in this.data) {

            if(this.data.hasOwnProperty(name) && !data2.hasOwnProperty(name)) {
                newData[name] = this.data[name];
            }
        }

        return newData;
    }
}