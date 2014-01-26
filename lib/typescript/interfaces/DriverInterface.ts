/**
 * Interface to Driver
 * @author Oleksandr Knyga <oleksandrknyga@gmail.com>
 * @license Apache License 2.0 - See file 'LICENSE.md' in this project.
 */

interface DriverInterface {
    query(query: string, handler: (err, rows, fields) => void);
}