var net = require("net");
var util = require("util");
var events = require("events");

function response(socket) {

    this.socket = socket;
    this.headers = {};
    this.statusCode = 200;
    this.statusPhrase = getStatusPhrase(this.statusCode);
    this.headersSent = false;
    this.sendDate = true;

    util.inherits(response , events.EventEmitter);

    /**
     * sets a new header to the response.
     */
    this.setHeader = function(name, value) {
        this.headers[name] = value;
    };

    /**
     * write the headers of the response to the socket.
     */
    this.writeHead = function(statusCode, reasonPhrase, headers) {
        if (reasonPhrase == undefined) {
            reasonPhrase = getStatusPhrase(statusCode);
        }
        for (var header in headers) {
            this.setHeader(header, headers[header]);
        }
        if (this.sendDate && !('Date' in this.headers)) {  //add Date header if needed
            this.setHeader('Date', new Date());
        }
        this.socket.write('HTTP/1.1 ' + statusCode + ' ' + reasonPhrase + '\r\n' + parseHeaders(this.headers));
        this.headersSent = true;
    };

    /**
     * writes a continue massage to the client, indicates the request body should be sent.
     */
    this.writeContinue = function() {  
        this.writeHead(100);
    }

    /**
     * sets the socket's timeout.
     */
    this.setTimeout = function(msecs, callback) {
        if (callback === undefined) {
            return this.socket.setTimeout(msecs, function() {
                this.socket.end();
                this.socket.destroy()();
                this.emit('close');
            });
        } else {
            return this.socket.setTimeout(msecs, callback);
        }
    };

    /**
     * gets the header 'name' of the response.
     */
    this.getHeader = function(name) {
        return this.headers[name];    //if no header found
    };

    /**
     * removes the header 'name' from the response.
     */
    this.removeHeader = function(name) {
        delete this.headers[name];
    };

    /**
     * writes a massage to the socket with the response's headers and a given body.
     * return true if the massage was sent properly.
     */
    this.write = function(chunk, incoding) {
        var ret = true;
        var ret2;
        if (!this.headersSent) {
            if ((this.headers['Content-Length'] === undefined) && (chunk.length > 0)) {
                this.set('Content-Length', chunk.length);
            }
            ret = this.writeHead(this.statusCode, this.statusPhrase, this.headers);
            this.headersSent = true;
        }
        ret2 = this.socket.write(chunk, incoding);
        return (ret && ret2);
    };

    /**
     * ends the socket. if there is data, sends the given data before.
     */
    this.end = function(data, incoding) {
        if (data !== undefined) {
            this.write(data, incoding);
        }
        this.socket.end();
        this.socket.destroy();
        this.emit('finish');
    };

    //********functons for express event************/

    //Set header field to value, or pass an object to set multiple fields at once.
    this.set = function(field, value) {

        if (value !== undefined) {              //  received single header and value
            return this.setHeader(field, value);
        } else {                                //  received object with multiple headers and values
            for (var key in field) {
                this.setHeader(key, field[key]);
            }
        }
    };

    //Chainable alias of node's res.statusCode=.
    this.status = function(code) {
        this.statusCode = code;
        this.statusPhrase = getStatusPhrase(this.statusCode);
        return this;
    };

    //Send a response.
    //todo add buffer option
    this.send = function(var1, var2){
        if (var1 === undefined) {
            return this.write('');
        }
        if (var2 === undefined) {
            if (typeof var1 === 'number') {
                return this.writeHead(var1, getStatusPhrase(var1));
            } else if (typeof var1 === 'string' ){
                this.setHeader('Content-Type', 'text/html');
                return this.write(var1);
            } else if ((typeof var1 === 'object') || (var1 instanceof Array)) {
                return this.json(var1);
            }
            //got status and body
        } else {
            this.statusCode = var1;
            if ((typeof var2 === 'object') || (var2 instanceof Array)) {
                return this.json(var1, var2);
            } else if (typeof var2 === 'string' ){
                this.status(var1);
                return this.write(var2);
            }
        }
        console.log('response.send() got illegal parameters: ' + va1 + ', ' + var2);
        return new Error('response.send() got illegal parameters: ' + va1 + ', ' + var2);
    };

    /**
     * gets a JSON, parses it to a string, and sent it to the socket.
     */
    this.json = function(parm) {
        try {
            JSON.stringify(parm);
            this.setHeader('Content-Type', 'application/json');

            this.write(JSON.stringify(parm));
        } catch (e) {
            console.log(e);
        }
    };

    // Set cookie name to value, which may be a string or object converted to JSON.
    // The path option defaults to "/".
    this.cookie = function(name, value, options) {
        var oldCookie = this.getHeader('Set-Cookie');
        if (oldCookie === undefined) {
            oldCookie = '';
        } else {
            oldCookie += '\r\nSet-Cookie: '
        }
        oldCookie += name + '=' + value
        //give default path if non exist
        if ((options == undefined) || (options['path'] == undefined)) {
            oldCookie += '; path=\\';
        }
        for (var option in options) {
            oldCookie += '; ' + option + '=' + options[option];
            //todo maybe if options[option] == 'true' , '=' + options[option] should not be printed
        }
        this.setHeader('Set-Cookie', oldCookie);
    };
    return this;
};


/**
 * gets a headers object and parses it to a string.
 */
var parseHeaders = function (headers) {
    var str = "";
    for (var header in headers) {
            str += header.toString() + ": " + headers[header]/*.val*/ +"\r\n";
    }
    str += "\r\n";
    return str;
};

/**
 * get the right status phrase from a given status code.
 */
var getStatusPhrase = function(status) {
    switch (status) {
        case 100:
            return 'Continue';
            break;
        case 101:
            return 'Switching Protocol';
            break;
        case 200:
            return 'OK';
            break;
        case 201:
            return 'Created';
            break;
        case 202:
            return 'Accepted';
            break;
        case 203:
            return 'Non-Authoritative Information';
            break;
        case 204:
            return 'No Content';
            break;
        case 205:
            return 'Reset Content';
            break;
        case 206:
            return 'Partial Content';
            break;
        case 400:
            return 'Bad Request';
            break;
        case 401:
            return 'Unauthorized';
            break;
        case 402:
            return 'Payment Required';
            break;
        case 403:
            return 'Forbidden';
            break;
        case 404:
            return 'Not Found';
            break;
        case 405:
            return 'Method Not Allowed';
            break;
        case 500:
            return 'Internal Server Error';
            break;
        case 501:
            return 'Not Implemented';
            break;
        case 502:
            return 'Bad Gateway';
            break;
        case 503:
            return 'Service Unavailable';
            break;
        case 504:
            return 'Gateway Timeout';
            break;
        case 505:
            return 'HTTP Version Not Supported';
            break;
    }

};
util.inherits(response , events.EventEmitter);
module.exports = response;