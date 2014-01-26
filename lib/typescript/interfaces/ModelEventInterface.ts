/**
 * Created by agnynk on 25.01.14.
 */

interface ModelEventInterface {
    before(handler: (err, rows, fields) => void);
    after(handler: (err, rows, fields) => void);
}