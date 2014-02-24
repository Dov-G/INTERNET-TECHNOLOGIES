var net = require("net");
var fs = require("fs");
var util = require('util');
var miniHttp = require('./miniHttp');
var noSuchTypeErr = function () {} // for exception handeling.

String.prototype.contains = function(str) {
    return (this.indexOf(str) != -1);
}

/**
 * gets the content type of the requested file.
 */
function getContentType(file) {
    str = file.substring(file.indexOf('.'));
    switch (str) {
        case ".html":
            return 'text/html';
            break;
        case ".css":
            return 'text/css';
            break;
        case ".jpg":
            return 'image/jpg';
            break;
        case ".jpeg":
            return 'image/jpeg';
            break;
        case ".gif":
            return 'image/gif';
            break;
        case ".txt":
            return 'text/plain';
            break;
        case '.js':
            return 'application/javascript';
            break;
    }
    throw new noSuchTypeErr;
}

/**
 * gets data and root, parses from the URL the asked resource.
 */
var parseURL = function(req, root, res) {
	    var ind = req.path.indexOf('?');
	    ind = (ind === -1)? req.path.length : ind;
        var tempPath = req.path.substring(0, ind);
        var tempRoot = root;
        var strPrefix;
        var query;
        var tempQuery;
        
        //parse parameters and check match
        rootArr = root.split('/');
        if (root === '/') rootArr = [];
        pathArr = req.path.substring(0, ind).split('/');
        var i = 1;
        while (i < rootArr.length) {
            if (rootArr[i].indexOf(':') !== 0) {
                if (!rootArr[i].contains(pathArr[i])) {
                    return false;
                }
            } else {
                req.params[rootArr[i].substring(1, rootArr[i].length)] = pathArr[i];
            }
            ++i;
        }
        //parse query
        query = req.path.substring(ind + 1).split('&');
        for (var j = 0; j < query.length; ++j) {
            tempQuery = query[j].split('=');
            if (tempQuery[0].contains('[')) {
                ind = tempQuery[0].indexOf('[');
                req.query[tempQuery[0].substring(0, ind)] = [];
                req.query[tempQuery[0].substring(0, ind)][tempQuery[0].substring(ind + 1, 
                    tempQuery[0].length - 1)] = tempQuery[1];
            } else {
                req.query[tempQuery[0]] = tempQuery[1];
            }
        }

        //make sure the client is not trying to acces to files not in the root dir.
        if ((pathArr[i] !== undefined) && (pathArr[i].contains('..'))) {
            res.send(401);
            return false;
        }
        req.resource = '/' + pathArr[i];
        return true;
    }


function Item(rt, foo, method) {
    this.root = rt;
    this.func = foo;
    this.method = method;
}

//adds to a http request the miniExpress request attributes
addMiniExpressRequestField = function(req) {
        //variables needed by express API
        if (!req.params) req.params = {};
        if (!req.query) req.query = {};
        if (!req.body) req.body = {};
        if(!req.cookies) req.cookies = [];
        req.host = req.headers['Host'];

        //Get the case-insensitive request header field. The Referrer and Referer fields are interchangeable.
        req.get = function(field) {
            for (var key in this.headers) {
                if (key.toLowerCase() == field.toLowerCase()) {
                    return headers[key];
                }
            }
            return undefined;
        }

        //Check if the incoming request contains the "Content-Type" header field, and it matches the give mime type.
        req.is = function(type) {
            var thisType = this.headers['Content-Type'];
            if ( thisType == undefined ) {
                //todo behavier when no Content-Type
                return false;
            }
            if ((thisType == type)) {                       //exact match
                return true;
            }
            // thistype = y/x, type = y/*
            if (type.indexOf('/*') != type.length-2) {
                return (thisType.indexOf(type.substr(0, type.length - 1)) == 0);
            }
            // thistype = y/x, type = x
            if (thisType.indexOf('/' + type) == (thisType.length - type.length - 1)) {
                return true
            }
            return false;
        }

        //Return the value of param name when present.
        req.param = function(name) {
            ret = this.params[name];
            if (ret == undefined) {
                ret = this.body[name];
                if (ret == undefined) {
                    ret = this.query[name];
                }
            }
            return ret;
        }
    };

/**
 * returns the object of the server, with functions of use, listen and close.
 */
var miniExpress = function () {
    	  var app = function (request, response) {
    	  	   var nextCalled = true;
            var next = function () {
                nextCalled =true;            	 
            };
    	  		nextCalled = true;
    	  		if (!'getputpostdelete'.contains(request.method)) {
    	  		    response.send(405, 'the request was not get, post, delete or put request');
    	  		} else {
    	  			 addMiniExpressRequestField(request);
    	          for (var i = 0; i < app.queue.length; ++i) {
    	      	     var item = app.queue[i];
        	           if (!nextCalled) break;
        	           if (item.method.contains(request.method)) {
    	                  if (parseURL(request, item.root, response)) {
    	                      //check if next() was called.
    	                 	    nextCalled = false;
    	                      item.func(request, response, next);
    	                  }
    	              }
    	          }
    	      }
    	  };
    	  
    	  //the queue of the middlewares.
        app.queue = new Array();

        /**
         * adding a middleware for request that starts with the prefix of 'resource'
         * if no resource was assigned, the middleware is for every request. 
         */
        app.use = function (resource, requestHandeler) {
            if (requestHandeler !== undefined) {
                var item = new Item(resource, requestHandeler, 'getputpostdelete');
                app.queue.push(item);
            } else {
            	app.queue.push(new Item('/', resource, 'getputpostdelete'));
            }
        };
        
        /**
         * a helper function that adds a middleware for a specific request.
         */
        app.specificUse = function (rt, foo, method) {
            var item;
            if (foo === undefined) {
            	 item = new Item('/', function (request, response, next) {
                    if (request.method === method) {
                        rt(request, response, next);
                    }
                }, method);
             } else {
                 item = new Item(rt, function (request, response, next) {
                    if (request.method === method) {
                        foo(request, response, next);
                    }
                }, method);
             }
             app.queue.push(item);
        };
        
        /**
         * works like app.use, but only for GET requests.
         */
        app.get = function (rt, foo) {
        	   this.specificUse(rt, foo, 'get');
        	   this.route.get.push({
        	      path: rt,
        	      method: 'get',
        	      callbacks: foo
        	   });
        };
        
        /**
         * works like app.use, but only for POST requests.
         */
        app.post = function (rt, foo) {
        	   this.specificUse(rt, foo, 'post');
        	   this.route.post.push({
        	      path: rt,
        	      method: 'post',
        	      callbacks: foo 	
        	   });
        };
        
        /**
         * works like app.use, but only for DELETE requests.
         */
        app.delete = function (rt, foo) {
        	   this.specificUse(rt, foo, 'delete');
        	   this.route.delete.push({
        	      path: rt,
        	      method: 'delete',
        	      callbacks: foo 	
        	   });
        };
        
        /**
         * works like app.use, but only for PUT requests.
         */
        app.put = function (rt, foo) {
        	   this.specificUse(rt, foo, 'put');
        	   this.route.put.push({
        	      path: rt,
        	      method: 'put',
        	      callbacks: foo 	
        	   });
        };
        
        /**
         * returns an object with all the middlewares, divided by its' methods.
         */
        app.route = {
            get: new Array(),
            post: new Array(),
            delete: new Array(),
            put: new Array()
        };

        /**
         * returns a new server that is listening to the given port
         */
        app.listen = function (port, callback){
            server = miniHttp.createServer(this);
			   server.listen(port, callback);
            return server;
        };
    return app;
};

/**
 * makes the function that gives the right response to the request.
 */
miniExpress.static = function (pref) {
    pref = replaceAll(pref);
    return function (req, res, next) {
        var path = pref +  req.resource;
        if (req.method !== 'get') {
            next();
            return;
        }

        fs.exists(path, function (exists) {
            if (exists) {
                try {
                    var strm = fs.createReadStream(path);
                    res.setHeader('Content-Type', getContentType(path));
                    fs.stat(path, function (err, stats) {
                        if (err) throw err;
               	      res.setHeader('Content-Length', stats.size);
                        res.writeHead(200, 'OK', res.headers);
                        strm.pipe(res.socket, {end: false});
                        if (req.isClose) {
                            req.end();
                        }
                    });
                } catch (e) {
            	     if (e instanceof noSuchTypeErr) {
            	     	   console.log('no such type');
            	     } else {
            	     	   res.send(404, 'could not read the requested file');
                    }
                    if (req.isClose) {
                        req.end();
                    }
               }
            } else {
            	 res.send(404, 'There is no file "' + path +'"\n');
                if (req.isClose) {
                    req.end();
                }
            }
        });
    }
}

/**
 * populates the request with new cookies, according the header Cookies.
 */
miniExpress.cookieParser = function () {
    return function (request, response, next) {
        if (request.headers['Cookie']) {
            var cookiesArr = request.headers['Cookie'].split(';');
            for (var j = 0; j < cookiesArr.length; ++j) {
                var nameVal = cookiesArr[j].split('=');
                request.cookies[nameVal[0].trim()] = nameVal[1].trim();
            }
        }

        next();
    }
}

/**
 * puts in the request body a JSON according the given request's body
 */
miniExpress.json = function () {
    return function (request, response, next) {
    	try {
         JSON.parse(request.reqBody);
         request.body = JSON.parse(request.reqBody);
      } catch (e) {}
      next();
    }
}

/**
 * parses the url of the request to its' body.
 */
miniExpress.urlencoded = function () {
    return function (request, response, next) {
        if (request.headers['Content-Type'] != undefined &&
                request.headers['Content-Type'].contains('application/x-www-form-urlencoded')) {
            var nameVal;
            var secondaryName;
            var str = request.reqBody.toString();
            while (str.contains('+')) {
                str = str.replace('+',' ');
            }
            var urls = str.split('&');
            for (var i = 0; i < urls.length; i++) {
                nameVal = urls[i].split('=');
                if (nameVal[0].contains('[')) {
                    secondaryName = nameVal[0].substring(nameVal[0].indexOf('[') + 1,nameVal[0].indexOf(']'));
                    nameVal[0] = nameVal[0].substring(0, nameVal[0].indexOf('['));
                    request.body[nameVal[0]] = [];
                    request.body[nameVal[0]][secondaryName] = nameVal[1];
                } else {
                    request.body[nameVal[0]] = nameVal[1];
                }
            }
        }
    }
}

/**
 * invokes both urlencoded() and cookieParser().
 */
miniExpress.bodyParser = function () {
	 var urlFunc = this.urlencoded();
	 var cookieFunc = miniExpress.cookieParser(); 
    return function (request, response, next) {
        urlFunc(request, response, next);
        cookieFunc(request, response, next);
        next();
    }
}

/**
 * gets a string and replaces its '\' in '/'.
 */
var replaceAll = function(str) {
    while (str.contains('\\')) {
        str = str.replace('\\','/');
    }
    return str;
};

module.exports = miniExpress;

