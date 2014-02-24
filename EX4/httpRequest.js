var httpRequest = function(socket) {
    this.protocol;
    this.method;
    this.httpVersion;
    this.headers = {};
    this.reqBody;
    this.socket = socket;
    this.isClosed;

    /**
     * sets a new header in the request.
     */
    this.setHeader = function (name, value) {
        this.headers[name] = value;
    }

    /**
     * gets the header 'name' of the request.
     */
    this.getHeader = function (name) {
        return this.header[name];
    }

    /**
     * removes the header 'name' from the request.
     */
    this.removeHeader = function (name) {
        delete this.headers[name];
    }

    /**
     * writes a chunk of data in the socket of the request.
     */
    this.write = function (chunk, encoding) {
        this.socket.write(chunk, encoding);
    }

    /**
     * writes a chunk of data in the socket of the request, and ends the socket.
     */
    this.end = function (data, encoding) {
        this.socket.end(data, encoding);
    }

    /**
     * sets timeout to the socket of the request.
     */
    this.setTimeout = function (timeout, callback) {
        if (this.socket) this.socket.setTimeout(timeout, callback); 
    }

    /**
     * sets the socket with no delay.
     */
    this.setNoDelay = function (noDelay) {
        if (this.socket) this.socket.setNoDelay(noDelay); 
    }

    /**
     * sets the socket with keep-alive.
     */
    this.setSocketKeepAlive = function (enable, initialDelay) {
        if (this.socket) this.socket.setSocketKeepAlive(enable, initialDelay); 
    }
 
    /**
     * sets a header of the request. 
     * if it is an object, makes header of every field of the object
     */
    this.set = function(field, value) {
            if (value !== undefined) {              //  received single header and value
                this.headers[field] = value;
                return this;
            } else {                                //  received object with multiple headers and values
                for (var key in field) {
                    this.headers[key] = field[key];
                    return this;
                }
            }
        }
}
module.exports = httpRequest;