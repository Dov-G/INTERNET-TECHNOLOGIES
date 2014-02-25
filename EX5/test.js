
var net = require('net');
var http = require('http');
var querystring = require('querystring');

var DOMAIN = 'localhost';
var PORT = 80;
var uiid;

function loginTest() {

    var login_data = querystring.stringify({
        'username' : 'name',
        'password': 'password'
    });

    var login_options = {
        host: DOMAIN,
        port: PORT,
        path: '/login',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': login_data.length
        }
    };

    var register_data = querystring.stringify({
        'fullname' : '',
        'username' : '',
        'password': 'password'
    });

    var register_options = {
        host: DOMAIN,
        port: PORT,
        path: '/register',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': register_data.length
        }
    };

    var register_data2 = querystring.stringify({
        'fullname' : 'full-name',
        'username' : 'name',
        'password': 'password'
    });

    var register_options2 = {
        host: DOMAIN,
        port: PORT,
        path: '/register',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': register_data2.length
        }
    };

    var post_req = http.request(login_options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            if (chunk == 'user name or password is incorrect' && res.statusCode==500) {
                console.log('Bad login test\t\t\tPassed');
            } else {
                console.log('Bad login test\t\t\tFailed');
            }
        });
    });
    post_req.write(login_data);
    post_req.end();

    var post_req2 = http.request(register_options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            if (chunk == 'all fields must be filled, password must be at least 3 characters long' && res.statusCode==500 ) {
                console.log('Bad register test\t\tPassed');
            } else {
                console.log('Bad register test\t\tFailed');
            }
        });
    });
    post_req2.write(register_data);
    post_req2.end();

    var post_req3 = http.request(register_options2, function(res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            if (chunk == 'OK' && res.statusCode==200 ) {
                console.log('Good register test\t\tPassed');
            } else {
                console.log('Good register test\t\tFailed');
            }
        });
    });
    post_req3.write(register_data2);
    post_req3.end();

    var post_req4 = http.request(register_options2, function(res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            if (chunk == 'user name is already taken' && res.statusCode==500) {
                console.log('bad register test2\t\tPassed');
            } else {
                console.log('bad register test2\t\tFailed');
            }
        });
    });
    post_req4.write(register_data2);
    post_req4.end();

    var post_req5 = http.request(login_options, function(res) {
        res.setEncoding('utf8');
        uiid = res.headers['set-cookie'][1].substr(10,36);      //gets session id
        res.on('data', function (chunk) {
            if (chunk == 'OK' && res.statusCode==200) {
                console.log('Good login test\t\t\tPassed');
            } else {
                console.log('Good login test\t\t\tFailed');
            }
        });
    });
    post_req5.write(login_data);
    post_req5.end();
}

function itemPostTest() {
    var data = querystring.stringify({
        'id' : '1',
        'value': 'value'
    });

    var options = {
        host: DOMAIN,
        port: PORT,
        path: '/item',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': data.length
        }
    };
    var post_req = http.request(options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            if (chunk == 'user unidentified or not in session' && res.statusCode==400) {
                console.log('Not logged in post test\t\tPassed');
            } else {
                console.log('Not logged in post test\t\tFailed');
            }
        });
    });
    post_req.write(data);
    post_req.end();
}

function itemPutTest() {
    var data = querystring.stringify({
        'id' : '1',
        'value': 'value',
        'status': 'false'
    });

    var options = {
        host: DOMAIN,
        port: PORT,
        path: '/item',
        method: 'PUT',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': data.length
        }
    };
    var post_req = http.request(options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            if (chunk == 'user unidentified or not in session' && res.statusCode==400) {
                console.log('Not logged in put test\t\tPassed');
            } else {
                console.log('Not logged in put test\t\tFailed');
            }
        });
    });
    post_req.write(data);
    post_req.end();
}

function itemGetTest() {
    var data = querystring.stringify({});

    var options = {
        host: DOMAIN,
        port: PORT,
        path: '/item',
        method: 'GET',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': data.length
        }
    };
    var post_req = http.request(options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            if (chunk == 'user unidentified or not in session' && res.statusCode==400) {
                console.log('Not logged in get test\t\tPassed');
            } else {
                console.log('Not logged in get test\t\tFailed');
            }
        });
    });
    post_req.write(data);
    post_req.end();
}

function itemDeleteTest() {
    var data = querystring.stringify({});

    var options = {
        host: DOMAIN,
        port: PORT,
        path: '/item/1',
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': data.length
        }
    };
    var post_req = http.request(options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            if (chunk == 'user unidentified or not in session' && res.statusCode==400) {
                console.log('Not logged in delete test\tPassed');
            } else {
                console.log('Not logged in delete test\tFailed');
            }
        });
    });
    post_req.write(data);
    post_req.end();
}

//test '/item' functions with session cookie


function itemPostTest2() {
    var data = querystring.stringify({
        'id' : '1',
        'value': 'value'
    });
    var cookieStr = 'userName=name; sessionId='+uiid;
    var options = {
        host: DOMAIN,
        port: PORT,
        path: '/item',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': data.length,
            'Cookie': cookieStr
        }
    };
    var post_req = http.request(options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            if (chunk == 'OK' && res.statusCode==200) {
                console.log('logged in post test\t\tPassed');
            } else {
                console.log('logged in post test\t\tFailed');
            }
        });
    });
    post_req.write(data);
    post_req.end();
}

function itemGetTest2() {
    var data = querystring.stringify({});
    var cookieStr = 'userName=name; sessionId='+uiid;
    var options = {
        host: DOMAIN,
        port: PORT,
        path: '/item',
        method: 'GET',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': data.length,
            'Cookie': cookieStr
        }
    };
    var post_req = http.request(options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            if (chunk == '[{"id":"1","value":"value","status":false}]' && res.statusCode==200) {
                console.log('logged in get test1\t\tPassed');
            } else {
                console.log('logged in get test1\t\tFailed');
            }
        });
    });
    post_req.write(data);
    post_req.end();
}

function itemPutTest2() {
    var data = querystring.stringify({
        'id' : '1',
        'value': 'value2',
        'status': 'true'
    });
    var cookieStr = 'userName=name; sessionId='+uiid;
    var options = {
        host: DOMAIN,
        port: PORT,
        path: '/item',
        method: 'PUT',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': data.length,
            'Cookie': cookieStr
        }
    };
    var post_req = http.request(options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            if (chunk == 'OK' && res.statusCode==200) {
                console.log('logged in put test\t\tPassed');
            } else {
                console.log('logged in put test\t\tFailed');
            }
        });
    });
    post_req.write(data);
    post_req.end();
}

function itemGetTest3() {
    var data = querystring.stringify({});
    var cookieStr = 'userName=name; sessionId='+uiid;
    var options = {
        host: DOMAIN,
        port: PORT,
        path: '/item',
        method: 'GET',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': data.length,
            'Cookie': cookieStr
        }
    };
    var post_req = http.request(options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            if (chunk == '[{"id":"1","value":"value2","status":"true"}]' && res.statusCode==200) {
                console.log('logged in get test2\t\tPassed');
            } else {
                console.log('logged in get test2\t\tFailed');
            }
        });
    });
    post_req.write(data);
    post_req.end();
}

function itemDeleteTest2() {
    var data = querystring.stringify({});
    var cookieStr = 'userName=name; sessionId='+uiid;
    var options = {
        host: DOMAIN,
        port: PORT,
        path: '/item/1',
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': data.length,
            'Cookie': cookieStr
        }
    };
    var post_req = http.request(options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            if (chunk == 'OK' && res.statusCode==200) {
                console.log('logged in delete test\t\tPassed');
            } else {
                console.log('logged in delete test\t\tFailed');
            }
        });
    });
    post_req.write(data);
    post_req.end();
}

function itemGetTest4() {
    var data = querystring.stringify({});
    var cookieStr = 'userName=name; sessionId='+uiid;
    var options = {
        host: DOMAIN,
        port: PORT,
        path: '/item',
        method: 'GET',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': data.length,
            'Cookie': cookieStr
        }
    };
    var post_req = http.request(options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            if (chunk == 'OK' && res.statusCode==200) {
                console.log('logged in get test2\t\tPassed');
            } else {
                console.log('logged in get test2\t\tFailed');
            }
        });
    });
    post_req.write(data);
    post_req.end();
}
function itemDeleteTest3() {
    var data = querystring.stringify({});
    var cookieStr = 'userName=name; sessionId='+uiid;
    var options2 = {
        host: DOMAIN,
        port: PORT,
        path: '/item/-1',
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': data.length,
            'Cookie': cookieStr
        }
    };
    var post_req2 = http.request(options2, function(res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            if (chunk == 'OK' && res.statusCode==200) {
                console.log('delete all test\t\t\tPassed');
            } else {
                console.log('delete all test\t\t\tFailed');
            }
        });
    });
    post_req2.write(data);
    post_req2.end();
}
function logedInTests(){
    itemPostTest2();
    itemGetTest2();
    itemPutTest2();
    itemGetTest3();
    itemDeleteTest2();
    itemGetTest4();
    itemPostTest2();
    itemDeleteTest3();
}

loginTest();
itemPostTest();
itemPutTest();
itemGetTest();
itemDeleteTest();

setTimeout(logedInTests,2000);
//main();