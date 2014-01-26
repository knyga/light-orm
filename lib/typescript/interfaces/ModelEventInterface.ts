/**
 * Interface to before/after event setters
 * @author Oleksandr Knyga <oleksandrknyga@gmail.com>
 * @license Apache License 2.0 - See file 'LICENSE.md' in this project.
 */

interface ModelEventInterface {
    before(handler: (err, rows, fields) => void);
    after(handler: (err, rows, fields) => void);
}