var miniExpress = require('./miniExpress');
var miniHttp = require('./miniHttp');
var net = require('net');
var responseTest = require('./responseTest');

var PORT = 8081;
var TIMEOUT_TIME = 2000;


String.prototype.contains = function(str) {
    return (this.indexOf(str) != -1);
}

//have miniExpress listen using use(root, static(...)) when receiving a good request
function testStaticUse1() {
    var dataStr = '';
    var sock = net.Socket();
    var app = miniExpress();
    var server = app.listen(PORT, function () {});
    app.use('/x',miniExpress.static(__dirname + '/www'));
    sock.connect(PORT, function () {
        sock.write("GET /x/testSource.html HTTP/1.1\r\nConnection: Keep-Alive\r\n\r\n");
    });
    sock.on('data', function(data) {
        dataStr = dataStr + data.toString();
    });
    sock.on('finish', function(data) {
        console.log('testSocketFinish\t Passed')
        if ((dataStr.contains('HTTP/1.1 200 OK\r\n')) && (dataStr.contains('Content-Type: text/html\r\n')) &&
            (dataStr.contains('Content-Length: 15\r\n')) && (dataStr.contains('abcd\r\n\r\n123@#'))){
            console.log('testStaticUse1\t\t Passed');
        } else {
            console.log('testStaticUse1\t\t Failed');
            console.log('---'+dataStr);
        }
    });
    sock.on('close', function(data) {
        console.log('testSocketClose\t\t Passed');
        server.close();
    });
};

//have miniExpress listen using use(root, static(...)) when receiving a non-existing request
function testStaticUse2() {
    var dataStr = '';
    var sock = net.Socket();
    var app = miniExpress();
    var server;
    PORT++;
    server = app.listen(PORT, function () {});
    app.use('/x',miniExpress.static(__dirname + '/www'));
    sock.connect(PORT, function () {
        sock.write("GET /x/none.html HTTP/1.1\r\nConnection: Keep-Alive\r\n\r\n");
    });
    sock.on('data', function(data) {
        dataStr = dataStr + data.toString();
    });
    sock.on('close', function(data) {
        if (dataStr.contains('HTTP/1.1 404 Not Found')){
            console.log('testStaticUse2\t\t Passed');
        } else {
            console.log('testStaticUse2\t\t Failed');
        }
        server.close();
    });
};

//have miniExpress get a request that tries to access file out of root folder
function testStaticUse3() {
    var dataStr = '';
    var sock = net.Socket();
    var app = miniExpress();
    var server;
    PORT++;
    server = app.listen(PORT, function () {});
    app.use('/x',miniExpress.static(__dirname + '/www'));
    sock.connect(PORT, function () {
        sock.write("GET /x/../none.html HTTP/1.1\r\nConnection: Keep-Alive\r\n\r\n");
    });
    sock.on('data', function(data) {
        dataStr = dataStr + data.toString();
    });
    sock.on('close', function(data) {
        if (dataStr.contains('HTTP/1.1 401 Unauthorized')){
            console.log('testStaticUse3\t\t Passed');
        } else {
            console.log('testStaticUse3\t\t Failed');
        }
        server.close();
    });
};

//have miniExpress listen using get(root, foo)
//tests the request structure as well
    function testGet() {
        PORT++;
        var sock = net.Socket();
        var app = miniExpress();
        var called = 0;
        var server = app.listen(PORT, function () {});
        app.get('/x/y',function(request, response, next){
        if ((request.method.toLowerCase() == 'get') && (request.path == '/x/y/testSource.html') &&
            (request.protocol == 'HTTP')) {
            called++;
        }
    });
    sock.connect(PORT, function () {
        sock.write("GET /x/y/testSource.html HTTP/1.1\r\nConnection: Keep-Alive\r\n\r\n");
        sock.write("GET /x/y/testSource.html HTTP/1.1\r\nConnection: Keep-Alive\r\n\r\n");

    });
    setTimeout(function() {
        if (called == 2) {
            console.log('testGet\t\t\t Passed');
        } else {
            console.log('testGet\t\t\t Failed');
        }
        server.close();
    }, TIMEOUT_TIME);
};

//have miniExpress listen using post(root, foo)
function testPost() {
    PORT++;
    var sock = net.Socket();
    var app = miniExpress();
    var called = false;
    var server = app.listen(PORT, function () {});
    app.post('/x',function(request, response, next){
        if ((request.method.toLowerCase() == 'post') && (request.path == '/x/y/testSource.html') &&
            (request.protocol == 'HTTP')) {
            called = true;
            console.log('testPost\t\t Passed');
        }
    });
    sock.connect(PORT, function () {
        sock.write("POST /x/y/testSource.html HTTP/1.1\r\n\r\n");
    });
    setTimeout(function() {
        if (!called) {
            console.log('testPost\t\t Failed');
        }
        server.close();
    }, TIMEOUT_TIME);
};

//have miniExpress listen using delete(root, foo)
//checked also that does not respond to wrong method of request
//check variable url in root and two messages on single socket (also single chunk)
function testDelete() {
    PORT++;
    var sock = net.Socket();
    var app = miniExpress();
    var called = false;
    var server = app.listen(PORT, function () {});
    app.delete('/x',function(request, response, next){
        if ((request.method.toLowerCase() == 'delete') && (request.path == '/x/y/testSource.html') &&
            (request.protocol == 'HTTP') && (request.reqBody == '')) {
            called = true;
            console.log('testDelete\t\t Passed');
        }
        else {
            console.log('testDelete\t\t Failed');
        }
    });
    sock.connect(PORT, function () {
        sock.write("DELETE /x/y/testSource.html HTTP/1.1\r\n\r\n");
        sock.write("GET /x/y/testSource.html HTTP/1.1\r\n\r\n");
    });
    setTimeout(function() {
        if (!called) {
            console.log('testDelete\t\t Failed');
        }
        server.close();
    }, TIMEOUT_TIME);
};


//have miniExpress listen using put(root, foo)
function testPut() {
    PORT++;
    var sock = net.Socket();
    var app = miniExpress();
    var called = false;
    var server = app.listen(PORT, function () {});
    app.put('/x',function(request, response, next){
        if ((request.method.toLowerCase() == 'put') && (request.path == '/x/y/testSource.html') &&
            (request.protocol == 'HTTP')) {
            called = true;
        }
    });
    sock.connect(PORT, function () {
        sock.write("PUT /x/y/testSource.html HTTP/1.1\r\n\r\n");
    });
    setTimeout(function() {
        if (!called) {
            console.log('testPut\t\t Failed');
        } else {
            console.log('testPut\t\t Passed');
        }
        server.close();
    }, TIMEOUT_TIME);
};

//have request with bad method
function testBadMethod() {
    PORT++;
    var sock = net.Socket();
    var app = miniExpress();
    var good = false;
    var server = app.listen(PORT, function () {});
    sock.connect(PORT, function () {
        sock.write("nothing /x/y/testSource.html HTTP/1.1\r\n\r\n");
    });
    sock.on('data', function(data){
        if (data.toString().contains('HTTP/1.1 405 Method Not Allowed')) {
            good = true;
        }
    });
    setTimeout(function() {
        if (good) {
            console.log('testBadMethod\t\t Passed');
        } else {
            console.log('testBadMethod\t\t Failed');
        }
        server.close();
    }, TIMEOUT_TIME);
};

//have miniExpress receive a request in chunks
function testChunkedRequest() {
    PORT++;
    var sock = net.Socket();
    var app = miniExpress();
    var called = false;
    var server = app.listen(PORT, function () {});
    app.put('/x',function(request, response, next){
        if ((request.method.toLowerCase() == 'put') && (request.path == '/x/y/testSource.html') &&
            (request.protocol == 'HTTP') && (request.reqBody == '0123456789')) {
            called = true;
            console.log('testChunkedRequest\t Passed');

        } else (console.log('----**'+request.reqBody));
    });
    sock.connect(PORT, function () {
        sock.write("PUT /x/y/testSource.html HTTP/1.1\r\nContent-Length: 10\r\n\r\n");
        setTimeout(function(){sock.write('0123456789')}, 500);
    });
    setTimeout(function() {
        if (!called) {
            console.log('testChunkedRequest\t Failed');
        }
        server.close();
    }, TIMEOUT_TIME);
};

//have miniExpress listen multiple times. get requests on multiple sockets.
function testMultiListen() {
    PORT++;
    var sock = net.Socket();
    var sock2 = net.Socket()
    var app = miniExpress();
    var check1 = false;
    var check2 = false;
    var check3 = false;
    var check4 = false;
    var wrongListen = false;
    var getCounter = 0;
    var putCounter = 0;
    var deleteCounter = 0;
    var deletes = 100;
    var server = app.listen(PORT, function () {});
    app.get('/x/y',function(request, response, next){
        if ((request.method.toLowerCase() == 'get') && (request.path == '/x/y/testSource.html') &&
            (request.protocol == 'HTTP')) {
            check1 = true;
            getCounter++;
        }
        else {
            wrongListen = true;
        }
    });
    app.delete('/x',function(request, response, next){
        if ((request.method.toLowerCase() == 'delete') && (request.path == '/x/y/testSource.html') &&
            (request.protocol == 'HTTP')) {
            check2 = true;
            deleteCounter++;
        }
        else {
            wrongListen = true;
        }
    });
    app.post('/x',function(request, response, next){
        if ((request.method.toLowerCase() == 'post') && (request.path == '/x/y/testSource.html') &&
            (request.protocol == 'HTTP')) {
            check3 = true;
        } else {
            wrongListen = true;
        }
    });
    app.put('/x',function(request, response, next){
        if ((request.method.toLowerCase() == 'put') && (request.path == '/x/y/testSource.html') &&
            (request.protocol == 'HTTP')) {
            check4 = true;
            putCounter++
        } else {
            wrongListen = true;
        }
    });
    sock.connect(PORT, function () {
        sock.write("GET /x/y/testSource.html HTTP/1.1\r\n\r\n");
        sock.write("PUT /x/y/testSource.html HTTP/1.1\r\n\r\n");
    });
    sock2.connect(PORT, function () {
        sock.write("GET /x/y/testSource.html HTTP/1.1\r\n\r\n");
        sock.write("GET /z/y/testSource.html HTTP/1.1\r\n\r\n");
        sock.write("PUT /x/y/testSource.html HTTP/1.1\r\n\r\n");
        sock.write("POST /x/y/testSource.html HTTP/1.1\r\n\r\n");
    });
    for (var i = 0; i < deletes; i++) {
        net.Socket().connect(PORT, function () {
            sock.write("DELETE /x/y/testSource.html HTTP/1.1\r\n\r\n");
        });
    }
    setTimeout(function() {
        if (check1 && check2 && check3 && !wrongListen && (getCounter == 2) &&
            (putCounter == 2) && (deleteCounter == deletes)) {
            console.log('testMultiListen\t\t Passed');
        } else {
            console.log('testMultiListen\t\t Failed');
            console.log(check1 +" "+ check2 +" "+ check3 +" "+ !wrongListen +" "+ (getCounter) +" "+
                (putCounter) +" "+ (deleteCounter));
        }
        server.close();
    }, TIMEOUT_TIME);
};

//tests the next()- has three listeners that the second does not
// call next check only the first two run
function testNext() {
    PORT++;
    var sock = net.Socket();
    var app = miniExpress();
    var listner1Called = false;
    var listner2Called = false;
    var listner3Called = false;
    var server = app.listen(PORT, function () {});
    app.get('/x/y',function(request, response, next){
        listner1Called = true;
        next();
    });
    app.get('/x/y',function(request, response, next){
        listner2Called = true;
    });
    app.get('/x/y',function(request, response, next){
        listner3Called = true;
    });
    sock.connect(PORT, function () {
        sock.write("GET /x/y/testSource.html HTTP/1.1\r\nConnection: Keep-Alive\r\n\r\n");
    });
    setTimeout(function() {
        if (listner1Called && listner2Called && !listner3Called) {
            console.log('testNext\t\t Passed');
        } else {
            console.log('testNext\t\t Failed');
        }
        server.close();
    }, TIMEOUT_TIME);
};

//test that miniExpress app works when used and defined in the alternative form
function testAlternativeAppDef() {
    var app = miniExpress();
    var sock = net.Socket();
    var called = false;
    PORT++;
    var server = miniHttp.createServer(app).listen(PORT);
    app.post('/x',function(request, response, next){
        if ((request.method.toLowerCase() == 'post') && (request.path == '/x/y/testSource.html') &&
            (request.protocol == 'HTTP')) {
            called = true;
            console.log('testAlternativeAppDef\t Passed');
        }
    });
    sock.connect(PORT, function () {
        sock.write("POST /x/y/testSource.html HTTP/1.1\r\n\r\n");
    });
    setTimeout(function() {
        if (!called) {
            console.log('testAlternativeAppDef\t Failed');
        }
        server.close();
    }, TIMEOUT_TIME);
}

//test cookie parser and the use without a given root
function testCookieParser() {
    PORT++;
    var sock = net.Socket();
    var app = miniExpress();
    var success = false;
    var server = app.listen(PORT, function () {});
    app.use(miniExpress.cookieParser());
    app.get('/x',function(request, response, next){
        if (request.cookies) {
            if ((request.cookies.a === 'a') && (request.cookies.a2 === 'a2') &&
                (request.cookies._a === '_b')) {
                success = true;
            }
        }
    });
    sock.connect(PORT, function () {
        sock.write("GET /x/y/testSource.html HTTP/1.1\r\nCookie: a=a; a2 = a2 ; _a=_b\r\n\r\n");
    });
    setTimeout(function() {
        if (success) {
            console.log('testCookieParser\t Passed');
        } else {
            console.log('testCookieParser\t Failed');
        }
        server.close();
    }, TIMEOUT_TIME);
};

//have miniExpress receive a illegal request check that received 400 and server still running
function testBadRequest() {
    PORT++;
    var sock = net.Socket();
    var app = miniExpress();
    var called = false;
    var server = app.listen(PORT, function () {});
    app.put('/x',function(request, response, next){});
    sock.connect(PORT, function () {
        sock.write("PUT /x/y/testSource.htmlHTTP/1.1\r\n\r\n");
    });
    sock.on('data', function(data){
        if (data.toString().contains('HTTP/1.1 400 Bad Request')) {
            called = true;
        }
    })
    setTimeout(function() {
        if (called) {
            console.log('testBadRequest\t\t Passed');
        } else {
            console.log('testBadRequest\t\t Failed');
        }
        server.close();
    }, TIMEOUT_TIME);
};

//check app.route
function testRout() {
    PORT++;
    var app = miniExpress();
    var server = app.listen(PORT, function () {});
    func = function(request, response, next){};
    app.get('/x/y',func);
    app.delete('/x',function(request, response, next){});
    if ((app.route.get[0].path == '/x/y') && (app.route.get[0].method == 'get') && (app.route.post.length == 0) &&
        (app.route.delete[0].path == '/x') && (app.route.delete[0].method == 'delete') && (app.route.put.length == 0)){
        console.log('testRout\t\t Passed');
    } else {
        console.log('testRout\t\t Failed');
    }

    setTimeout(function() {
        server.close();
    }, TIMEOUT_TIME);
}

//test bodyParser with multi variables spaces and arrays, also tests multiple parames in request
//also tests param function from miniExpress
function testBodyParser() {
    PORT++;
    var sock = net.Socket();
    var app = miniExpress();
    var success = false;
    var server = app.listen(PORT, function () {});
    app.use(miniExpress.bodyParser());
    app.put('/items/:itemId1/:itemId2',function(req, res){
        if ((req.params.itemId1 == 123) && (req.params.itemId2 == 'a2') &
            (req.body.q == 'ab cd') && (req.body.b.a == 5) && (req.query.t == 3)
            && (req.query.d.s == 'f')) {
            if ((req.param('itemId1') == 123) && (req.param('itemId2') == 'a2') &&
                (req.param('q') == 'ab cd') && (req.param('b').a == 5) &&
                (req.param('t') == 3) ) {
                success = true;
            }
        }
    });
    sock.connect(PORT, function () {
        sock.write("PUT /items/123/a2?t=3&d[s]=f HTTP/1.1\r\nContent-Type: application/x-www-form-urlencoded" +
        "\r\nContent-Length: 14\r\n\r\nq=ab+cd&b[a]=5");
    });
    setTimeout(function() {
        if (success) {
            console.log('testBodyParser\t\t Passed');
        } else {
            console.log('testBodyParser\t\t Failed');
        }
        server.close();
    }, TIMEOUT_TIME);
};


function runTester() {
    console.log('\n******** testing miniExpress and miniHttp ********\n');
    testStaticUse1();
    testStaticUse2();
    testStaticUse3();
    testGet();
    testPost();
    testDelete();
    testBadMethod();
    testMultiListen();
    testNext();
    testAlternativeAppDef();
    testCookieParser();
    testBadRequest();
    testRout();
    testBodyParser();

    setTimeout(function(){
        testChunkedRequest();
    },TIMEOUT_TIME*2);
}

console.log('The program is supposed to automatically exit after 2 minuets' +
    ' indicating the http timeOut variable works');
console.log('\n******** testing response ********\n');
responseTest();
setTimeout(runTester, 1500);

