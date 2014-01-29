/**
 * Clones object
 * @author Oleksandr Knyga <oleksandrknyga@gmail.com>
 * @license Apache License 2.0 - See file 'LICENSE.md' in this project.
 */

class Clone {
    data: any;

    constructor(data: any) {
        this.data = data;
        return this.clone();
    }

    clone(): any {

        if (null === this.data || "object" !== typeof this.data) {
            return this.data;
        }

        var copy = this.data.constructor() || {};

        for (var attr in this.data) {

            if (this.data.hasOwnProperty(attr)) {
                copy[attr] = this.data[attr];
            }
        }

        return copy;
    }
}


