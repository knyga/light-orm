/**
 * Created by agnynk on 25.01.14.
 */

interface GetSetInterface {
    get(name: string);
    set(name: string, value: any);
    set(data: {string: any} );
}