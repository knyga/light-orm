/**
 * Interface to CRUD operations
 * @author Oleksandr Knyga <oleksandrknyga@gmail.com>
 * @license Apache License 2.0 - See file 'LICENSE.md' in this project.
 */

///<reference path="UpdateOptionsInterface.ts" />

interface CrudInterface {
    create();

    update();
    update(options: UpdateOptionsInterface);

    remove();
    remove(options: UpdateOptionsInterface);
}