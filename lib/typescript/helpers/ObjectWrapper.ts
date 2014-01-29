/**
 * Adds some functionality to object or array
 * @author Oleksandr Knyga <oleksandrknyga@gmail.com>
 * @license Apache License 2.0 - See file 'LICENSE.md' in this project.
 */


class ObjectWrapper {
    private data: any;

    constructor(data: any) {
        this.data = data;
    }

    size() {
        if(this.isArray()) {
            return this.data.length;
        } else {
            return Object.keys(this.data).length;
        }
    }

    isArray():boolean {

        if(Object.prototype.toString.call( this.data ) === '[object Array]') {
            return true;
        } else {
            return false;
        }
    }
}