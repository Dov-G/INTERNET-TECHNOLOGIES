var net = require("net");
var response = require('./response');
var sock = new net.Socket();
var PORT = 8000;
var connArray = [];

String.prototype.contains = function(str) {
    return (this.indexOf(str) != -1);
}

var server = net.createServer(function(c) { //'connection' listener
   // console.log('server connected');
    c.on('end', function() {
       // console.log('server disconnected');
    });
    c.on('data', function(data) {
       // c.write(data);
    });
    c.pipe(c);
});

server.on('connection', function(conn){ connArray.push(conn);} );

server.listen(PORT);

//writeHead without headers as parameter only statues and message
function writeHeadTest1() {
    var sock = new net.Socket();
    sock.on('data', function(data) {
        if (data.toString().indexOf('HTTP/1.1 123 dov goldstein\r\nDate: ') == 0) {
            console.log('writeHeadTest1\t\t Passed');
        } else {
            console.log('writeHeadTest1\t\t Failed');
        }
    });
    sock.connect(PORT, function(){
        var res = new response();
        res.socket = sock;
        res.writeHead(123, 'dov goldstein');
    });

};

//writeHead with headers parameter
function writeHeadTest2() {
    var sock = new net.Socket();
    sock.on('data', function(data) {
        str = data.toString();
        if (data.toString().indexOf("HTTP/1.1 123 dov goldstein\r\nContent-Type: text/plain\r\nDate: ") == 0) {
            console.log('writeHeadTest2\t\t Passed');
        } else {
            console.log('writeHeadTest2\t\t Failed');
            console.log(data.toString());
        }
    });
    sock.connect(PORT, function(){
        var res = new response();
        res.socket = sock;
        res.writeHead(123, 'dov goldstein', {'Content-Type': 'text/plain'});
    });

};

//set and writeHead with headers parameter
function setWriteHeadTest1() {
    var sock = new net.Socket();
    sock.on('data', function(data) {
        str = data.toString();
        if (data.toString() === ("HTTP/1.1 123 dov goldstein\r\nContent-Type:" +
            "text/plain\r\nAcept: audio\r\nDate: now\r\n\r\n") == 0) {
            console.log('setWriteHeadTest1\t Passed');
        } else {
            console.log('setWriteHeadTest1\t Failed');
            console.log(data.toString());
        }
    });
    sock.connect(PORT, function(){
        var res = new response();
        res.socket = sock;
        res.setHeader('Content-Type', 'text/html');
        res.setHeader('Accept', 'audio');
        res.setHeader('Date', 'now');
        res.writeHead(123, 'dov goldstein', {'Content-Type': 'text/plain'});
    });

};

//set and writeHead with headers parameter
function setTimeoutTest1() {
    var res = new response();
    var time = new Date().getTime();
    res.socket = new net.Socket();
    res.setTimeout(300,function(){
        var lapsTime = new Date().getTime() - time;
        if ((lapsTime < 300) || (lapsTime > 400)) {
            console.log('setTimeoutTest1\t\t Failed');
        } else {
            console.log('setTimeoutTest1\t\t Passed');
        }
    });
};


//test remove header (removes single header)
function removeHeaderTest1() {
    var sock = new net.Socket();
    sock.on('data', function(data) {
        str = data.toString();
        if (data.toString() === ("HTTP/1.1 123 dov goldstein\r\nContent-Type:" +
            "text/html\r\nDate: now\r\n\r\n") == 0) {
            console.log('removeHeaderTest1\t Passed');
        } else {
            console.log('removeHeaderTest1\t Failed');
            console.log(data.toString());
        }
    });
    sock.connect(PORT, function(){
        var res = new response();
        res.socket = sock;
        res.setHeader('Content-Type', 'text/html');
        res.setHeader('Accept', 'audio');
        res.setHeader('Date', 'now');
        res.removeHeader('Accept');
        res.writeHead(123, 'dov goldstein');
    });

};

//write with no write head
function writeTest1() {
    var sock = new net.Socket();
    sock.on('data', function(data) {
        if (data.toString() === 'HTTP/1.1 200 OK\r\nDate: now\r\nContent-Length: 4\r\n\r\nabcd') {
            console.log('writeTest1\t\t Passed');
        } else {
            console.log('writeTest1\t\t Failed');
            console.log(data.toString());
        }
    });
    sock.connect(PORT, function(){
        var res = new response();
        res.socket = sock;
        res.setHeader('Date', 'now');
        res.write('abcd');
    });

};

//write with write head prior
function writeTest2() {
    var sock = new net.Socket();
    sock.on('data', function(data) {
        if (data.toString() === 'HTTP/1.1 123 dov goldstein\r\nDate: now\r\n\r\nabcd') {
            console.log('writeTest2\t\t Passed');
        } else {
            console.log('writeTest2\t\t Failed');
        }
    });
    sock.connect(PORT, function(){
        var res = new response();
        res.socket = sock;
        res.setHeader('Date', 'now');
        res.writeHead(123, 'dov goldstein');
        res.write('abcd');
    });

};

//write with no write head todo
function endTest1() {
    var sock = new net.Socket();
    sock.on('data', function() {});
    sock.connect(PORT, function(){});
    var res = new response();
    res.socket = sock;
    res.on('close', function(data){
        console.log('endTest1\t\t Passed');
    });
    res.setHeader('Date', 'now');
    res.end('abc');

};

//test set field and value (with over ride)
function setTest1() {
    var sock = new net.Socket();
    sock.on('data', function(data) {
        str = data.toString();
        if (data.toString() === ("HTTP/1.1 123 dov goldstein\r\nContent-Type:" +
            " text/html\r\nDate: now\r\nAccept: audio\r\n\r\n")) {
            console.log('setTest1\t\t Passed');
        } else {
            console.log('setTest1\t\t Failed');
            console.log(data.toString());
        }
    });
    sock.connect(PORT, function(){
        var res = new response();
        res.socket = sock;
        res.set('Content-Type', 'text/css');
        res.set('Content-Type', 'text/html');
        res.set('Date', 'now');
        res.set('Accept', 'audio');
        res.writeHead(123, 'dov goldstein');
    });

};

//test set, object as parameter, no set head
function setTest2() {
    var sock = new net.Socket();
    sock.on('data', function(data) {
        str = data.toString();
        if (data.toString() === ("HTTP/1.1 200 OK\r\nContent-Type:" +
            " text/html\r\nAccept: audio\r\nDate: now\r\nContent-Length: 3\r\n\r\nabc")) {
            console.log('setTest2\t\t Passed');
        } else {
            console.log('setTest2\t\t Failed');
            console.log(data.toString());
        }
    });
    sock.connect(PORT, function(){
        var res = new response();
        res.socket = sock;
        res.set({'Content-Type': 'text/html', 'Accept': 'audio', 'Date': 'now'});
        res.write('abc');
    });

};

//test that setting status ( res.status() ) works
function statusTest1() {
    var sock = new net.Socket();
    sock.on('data', function(data) {
        str = data.toString();
        if (data.toString() === ("HTTP/1.1 404 Not Found\r\n" +
            "Date: now\r\nContent-Length: 3\r\n\r\nabc")) {
            console.log('statusTest1\t\t Passed');
        } else {
            console.log('statusTest1\t\t Failed');
            console.log(data.toString());
        }
    });
    sock.connect(PORT, function(){
        var res = new response();
        res.socket = sock;
        res.set('Date', 'now');
        res.status(404);
        res.write('abc');
    });

};

//test that setting status ( res.status() ) chaining effect works
function statusTest2() {
    var sock = new net.Socket();
    sock.on('data', function(data) {
        str = data.toString();
        if (data.toString() === ("HTTP/1.1 500 Internal Server Error\r\n" +
            "Date: now\r\nContent-Length: 3\r\n\r\nabc")) {
            console.log('statusTest2\t\t Passed');
        } else {
            console.log('statusTest2\t\t Failed');
            console.log(data.toString());
        }
    });
    sock.connect(PORT, function(){
        var res = new response();
        res.socket = sock;
        res.status(500).set('Date', 'now');
        res.write('abc');
    });

};

//test that res.send() works with no parameters
function sendTest1() {
    var sock = new net.Socket();
    sock.on('data', function(data) {
        str = data.toString();
        if (data.toString() === ("HTTP/1.1 200 OK\r\nDate: now\r\n\r\n")) {
            console.log('sendTest1\t\t Passed');
        } else {
            console.log('sendTest1\t\t Failed');
            console.log(data.toString());
        }
    });
    sock.connect(PORT, function(){
        var res = new response();
        res.socket = sock;
        res.set('Date', 'now');
        res.send();
    });

};

//test that res.send() works with single number parameter
function sendTest2() {
    var sock = new net.Socket();
    sock.on('data', function(data) {
        str = data.toString();
        if (data.toString() === ("HTTP/1.1 502 Bad Gateway\r\nDate: now\r\n\r\n")) {
            console.log('sendTest2\t\t Passed');
        } else {
            console.log('sendTest2\t\t Failed');
            console.log(data.toString());
        }
    });
    sock.connect(PORT, function(){
        var res = new response();
        res.socket = sock;
        res.set('Date', 'now');
        res.send(502);
    });

};

//test that res.send() works with single string parameter
function sendTest3() {
    var sock = new net.Socket();
    sock.on('data', function(data) {
        str = data.toString();
        if (data.toString() === ("HTTP/1.1 200 OK\r\nDate: now\r\nContent-Type:" +
            " text/html\r\nContent-Length: 3\r\n\r\nabc")) {
            console.log('sendTest3\t\t Passed');
        } else {
            console.log('sendTest3\t\t Failed');
            console.log(data.toString());
        }
    });
    sock.connect(PORT, function(){
        var res = new response();
        res.socket = sock;
        res.set('Date', 'now');
        res.send('abc');
    });
};

//test that res.send() works with single jason parameter
function sendTest4() {
    var sock = new net.Socket();
    sock.on('data', function(data) {
        str = data.toString();
        if (data.toString() === ('HTTP/1.1 200 OK\r\nDate: now\r\nContent-Type:' +
            ' application/json\r\nContent-Length: 15\r\n\r\n{"user":"tobi"}')) {
            console.log('sendTest4\t\t Passed');
        } else {
            console.log('sendTest4\t\t Failed');
            console.log(data.toString());
        }
    });
    sock.connect(PORT, function(){
        var res = new response();
        res.socket = sock;
        res.set('Date', 'now');
        res.send({ user: 'tobi' });
    });
};

//test res.send() with two parameters number and string
function sendTest5() {
    var sock = new net.Socket();
    sock.on('data', function(data) {
        str = data.toString();
        if (data.toString() === ("HTTP/1.1 500 Internal Server Error\r\nDate: now\r\n" +
        "Content-Length: 3\r\n\r\nabc")) {
            console.log('sendTest5\t\t Passed');
        } else {
            console.log('sendTest5\t\t Failed');
            console.log(data.toString());
        }
    });
    sock.connect(PORT, function(){
        var res = new response();
        res.socket = sock;
        res.set('Date', 'now');
        res.send(500, 'abc');
    });
};

//test cookie with name value and object as parameters
function cookieTest1() {
    var sock = new net.Socket();
    sock.on('data', function(data) {
        str = data.toString();
        if (data.toString() === ("HTTP/1.1 200 OK\r\nDate: now\r\n" +
            "Set-Cookie: name=tobi; domain=.example.com; path=/admin; secure=true\r\n\r\n")) {
            console.log('cookieTest1\t\t Passed');
        } else {
            console.log('cookieTest1\t\t Failed');
            console.log(data.toString());
        }
    });
    sock.connect(PORT, function(){
        var res = new response();
        res.socket = sock;
        res.set('Date', 'now');
        res.cookie('name', 'tobi', { domain: '.example.com', path: '/admin', secure: true });
        res.send();
    });
};

//tst cookie witting cookie twice one with no path
function cookieTest2() {
    var sock = new net.Socket();
    sock.on('data', function(data) {
        str = data.toString();
        if (data.toString() === ("HTTP/1.1 200 OK\r\nDate: now\r\n" +
            "Set-Cookie: name=tobi; domain=.example.com; path=/admin; secure=true\r\n" +
            "Set-Cookie: grade=100; path=\\; domain=.example5.com\r\n\r\n")) {
            console.log('cookieTest2\t\t Passed');
        } else {
            console.log('cookieTest2\t\t Failed');
            console.log(data.toString());
        }
    });
    sock.connect(PORT, function(){
        var res = new response();
        res.socket = sock;
        res.set('Date', 'now');
        res.cookie('name', 'tobi', { domain: '.example.com', path: '/admin', secure: true });
        res.cookie('grade', '100', { domain: '.example5.com'});
        res.send();
    });
};

//test that responses are independent
function objectTest1() {
    var sock1 = new net.Socket();
    var sock2 = new net.Socket();
    var res1 = new response();
    var res2 = new response();;
    sock1.on('data', function(data) {
        str = data.toString();
        if (data.toString() === ("HTTP/1.1 200 OK\r\nDate: now\r\n\r\n")) {
            console.log('objectTest1.A\t\t Passed');
        } else {
            console.log('objectTest1.A\t\t Failed');
            console.log(data.toString());
        }
    });
    sock2.on('data', function(data) {
        str = data.toString();
        if (data.toString() === ("HTTP/1.1 404 Not Found\r\nDate: then\r\n\r\n")) {
            console.log('objectTest1.B\t\t Passed');
        } else {
            console.log('objectTest1.B\t\t Failed');
            console.log(data.toString());
        }
    });
    sock1.connect(PORT, function(){});
    sock2.connect(PORT, function(){});
    res1.socket = sock1;
    res2.socket = sock2;
    res1.setHeader('Date', 'now');
    res2.setHeader('Date', 'then')
    res1.writeHead(200,'OK');
    res2.writeHead(404,'Not Found')

};

function closeAll() {
    for (var i = 0; i < connArray.length; i++)   {
        connArray[i].destroy();
    }
    server.close();
}

function responseTest() {
    writeHeadTest1();
    writeHeadTest2();
    setWriteHeadTest1();
    setTimeoutTest1();
    removeHeaderTest1();
    writeTest1();
    writeTest2();
    endTest1();
    setTest1();
    setTest2();
    statusTest1();
    statusTest2();
    sendTest1();
    sendTest2();
    sendTest3();
    sendTest4();
    sendTest5();
    cookieTest1();
    cookieTest2();
    objectTest1();

    setTimeout(closeAll, 1000);
};
module.exports = responseTest;