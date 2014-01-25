/**
 * Created by agnynk on 25.01.14.
 */

///<reference path="UpdateOptionsInterface.ts" />

interface CrudInterface {
    create();

    update();
    update(options: UpdateOptionsInterface);

    remove();
    remove(options: UpdateOptionsInterface);
}