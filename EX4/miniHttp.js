var events = require('events');
var util = require('util');
var net = require('net');
var response = require('./response');
var httpRequest = require('./httpRequest');

var miniHttp = function () {}

miniHttp.partailRequest = '';

/**
 * parses an httpRequest from a given data, with given socket and server.
 */
miniHttp.requestEmitter = function(data, socket, server) {
    var str;
    //check for chunked data
    if (this.partailRequest.length > 0) {
        str = this.partailRequest + data;
        this.partailRequest = '';

    } else {
        str = data;
    }

    var req = new httpRequest(socket);
    var bodyIndex = 0;
    var bodyEndIndex = 0;
    var i = 1;
    var leftOverData;
    var linesStr = str.split("\r\n");
    var words = linesStr[0].split(/\s+/);

    req.method = words[0].toLowerCase();
    req.path = words[1];
    req.httpVersion = words[2];
    req.protocol = words[2].substring(0, words[2].indexOf('/'));

    //parse headers
    while (linesStr[i].length > 0) {
        //todo doesn't really work
        if ( (miniHttp.server.maxHeadersCount != 0) && (i > miniHttp.server.maxHeadersCount)) {
            console.log('Warning maximum number of headers exceeded ' + miniHttp.server.maxHeadersCount +
                ' remaining headers are ignored.');
            continue;
        }
    	var headerName = linesStr[i].substring(0, linesStr[i].indexOf(' ') - 1);
    	var headerVal = linesStr[i].substring(linesStr[i].indexOf(' ')).trim();
        req.set(headerName, headerVal);
        i++;
    }
    bodyIndex = str.indexOf('\r\n\r\n')+4;
    if (req.headers['Content-Length'] != undefined) {
        bodyEndIndex = parseInt(bodyIndex) + parseInt(req.headers['Content-Length']);
    } else {
        bodyEndIndex = bodyIndex;
    }
    //check if  the intier request is in data
    if (str.length >= bodyEndIndex) {
        req.reqBody = str.substring(bodyIndex, bodyEndIndex);
        server.emit('request', req, new response(req.socket));
        leftOverData = str.substr( bodyEndIndex);
        if ( leftOverData.length > 0 ) {
            this.requestEmitter(leftOverData, socket, server);
        }
    } else {    //request is chunked wait for the rest
        this.partailRequest = str;
    }

};

/**
 * an object of server. inherit from EventEmitter.
 */
miniHttp.server = function () {
	
    events.EventEmitter.call(this);
    var that = this;
    this.s = net.createServer(function (socket) {
    	  socket.counter = 0;
    	  setTimeout(function () {
                socket.end();
                socket.destroy()
            }, 2000);
            socket.setTimeout(2000, function () {
                socket.end();
                socket.destroy()
            });
        setTimeout(function(){that.s.close},miniHttp.server.prototype.timeout);
        socket.on('data', function (data) {
            setTimeout(function(){that.s.close},miniHttp.server.prototype.timeout);
            try {   //try to parse data and emit requests
                miniHttp.requestEmitter(data.toString(), socket, that)
            } catch(e) {
                var res = new response(socket);
                res.send(400);
                //cleanup
                this.partailRequest = '';
            }
        });
    });
}
util.inherits(miniHttp.server, events.EventEmitter);
    
/**
 * sets the server to listen to a given port.
 */
miniHttp.server.prototype.listen = function (port, callback) {
    return this.s.listen(port, callback);
}

/**
 * closes the server.
 */
miniHttp.server.prototype.close = function (callback) {
    this.s.close(callback);
    this.emit('close');
}

//default maxHedears and timeout.
miniHttp.server.prototype.maxHeadersCount = 1000;
miniHttp.server.prototype.timeout = 120000;

/**
 * creates a new server, gets a function that handles requests.
 */
miniHttp.createServer = function(handler) {
    server = new miniHttp.server();
    server.addListener('request', handler);
    
    return server;
}


module.exports = miniHttp;