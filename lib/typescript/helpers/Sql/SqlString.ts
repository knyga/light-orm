/**
 * Escape string methods
 * https://github.com/felixge/node-mysql/blob/master/lib/protocol/SqlString.js
 */

declare var Buffer:any;

class SqlString {
    private static entity: SqlString;

    public static getEntity() {

        if("undefined" === typeof SqlString.entity) {
            SqlString.entity = new SqlString();
        }

        return SqlString.entity;
    }

    private convertTimezone(tz: string): number {
        if (tz == "Z") return 0;

        var m = tz.match(/([\+\-\s])(\d\d):?(\d\d)?/);

        if (m) {
            return (m[1] == '-' ? -1 : 1) * (parseInt(m[2], 10) + ((m[3] ? parseInt(m[3], 10) : 0) / 60)) * 60;
        }

        return 0;
    }

    private zeroPad(vnumber: any, vlength?: number): string {
        var snumber = vnumber.toString();

        while (snumber.length < vlength) {
            snumber = '0' + snumber;
        }

        return snumber;
    }

    private dateToString(dt: Date, timeZone?: string): string {

        if (timeZone != 'local') {
            var tz = this.convertTimezone(timeZone);

            dt.setTime(dt.getTime() + (dt.getTimezoneOffset() * 60000));
            if (!tz) {
                dt.setTime(dt.getTime() + (tz * 60000));
            }
        }

        var year   = dt.getFullYear();
        var month  = this.zeroPad(dt.getMonth() + 1, 2);
        var day    = this.zeroPad(dt.getDate(), 2);
        var hour   = this.zeroPad(dt.getHours(), 2);
        var minute = this.zeroPad(dt.getMinutes(), 2);
        var second = this.zeroPad(dt.getSeconds(), 2);
        var millisecond = this.zeroPad(dt.getMilliseconds(), 3);

        return year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second + '.' + millisecond;
    }

    private bufferToString(buffer: any): string {
        var hex = '';

        try {
            hex = buffer.toString('hex');
        } catch (err) {

            // node v0.4.x does not support hex / throws unknown encoding error
            for (var i = 0; i < buffer.length; i++) {
                var vbyte:number = +buffer[i];
                hex += this.zeroPad(vbyte.toString(16));
            }

        }

        return "X'" + hex+ "'";
    }

    private arrayToList(array: any[], timeZone: string): string {
        return array.map((v) => {

            if (Array.isArray(v)) {
                return '(' + this.arrayToList(v, timeZone) + ')';
            }
            return this.escape(v, true, timeZone);
        }).join(', ');
    }

    private objectToValues(object: any, timeZone: string): string {
        var values = [];
        for (var key in object) {
            var value = object[key];
            if(typeof value === 'function') {
                continue;
            }

            values.push(this.escapeId(key) + ' = ' + this.escape(value, true, timeZone));
        }

        return values.join(', ');
    }

    public escapeId(val: any, forbidQualified?: boolean) {

        if("undefined" === typeof forbidQualified) {
            forbidQualified = false;
        }

        if (Array.isArray(val)) {

            return val.map((v) => {
                return this.escapeId(v, forbidQualified);
            }).join(', ');
        }

        if (forbidQualified) {
            return '`' + val.replace(/`/g, '``') + '`';
        }

        return '`' + val.replace(/`/g, '``').replace(/\./g, '`.`') + '`';
    }

    public escape(val: any, stringifyObjects?:boolean, timeZone?:string): string {
        if (val === undefined || val === null) {
            return 'NULL';
        }

        switch (typeof val) {
            case 'boolean': return (val) ? 'true' : 'false';
            case 'number': return val+'';
        }

        if (val instanceof Date) {
            val = this.dateToString(val, timeZone || 'local');
        }

        if (Buffer.isBuffer(val)) {
            return this.bufferToString(val);
        }

        if (Array.isArray(val)) {
            return this.arrayToList(val, timeZone);
        }

        if (typeof val === 'object') {
            if (stringifyObjects) {
                val = val.toString();
            } else {
                return this.objectToValues(val, timeZone);
            }
        }

        val = val.replace(/[\0\n\r\b\t\\\'\"\x1a]/g, function(s) {
            switch(s) {
                case "\0": return "\\0";
                case "\n": return "\\n";
                case "\r": return "\\r";
                case "\b": return "\\b";
                case "\t": return "\\t";
                case "\x1a": return "\\Z";
                default: return "\\"+s;
            }
        });
        return "'"+val+"'";
    }


}