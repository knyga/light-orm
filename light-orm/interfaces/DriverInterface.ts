/**
 * Created by agnynk on 25.01.14.
 */

interface DriverInterface {
    query(query: string, handler: (err, rows, fields) => void);
}