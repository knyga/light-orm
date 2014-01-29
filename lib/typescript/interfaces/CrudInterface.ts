/**
 * Interface to CRUD operations
 * @author Oleksandr Knyga <oleksandrknyga@gmail.com>
 * @license Apache License 2.0 - See file 'LICENSE.md' in this project.
 */

interface CrudInterface {
    create();

    update();
    update(options: {});

    remove();
    remove(options: {});
}