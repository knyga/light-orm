/**
 * Interface to GET/SET operations
 * @author Oleksandr Knyga <oleksandrknyga@gmail.com>
 * @license Apache License 2.0 - See file 'LICENSE.md' in this project.
 */

interface GetSetInterface {
    getAll();
    get(name: string);
    set(name: string, value: any):void;
    set(data: {} ):void;

    has(name: string):boolean;

    clear();
    clear(name: string);
}