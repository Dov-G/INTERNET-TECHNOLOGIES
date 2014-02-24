var express = require('./miniExpress');
var fs = require('fs');
var uuid = require('node-uuid');
var app = express();

var todoes = [];
var ACTIVE = false;
var COMPLETED = true;

users = [];

function getItemFunc(req, res, next) {
    try {
        var name = validateUser(req);
        if (name) {
            if (todoes[name].length > 0) {
                res.send(todoes[name]);
            } else {
                res.send(200,'OK');
            }
            return 0;
        } else {
            res.send(400, 'user unidentified or not in session');
            return 1;
        }
    } catch(e) {
        res.send(500);
        return 1;
    }
}


function postItemFunc(req, res, next) {
    try {
        if (req.reqBody != undefined){try{req.body = JSON.parse(req.reqBody);} catch(e){}}   //needed only if use minExpress
        var name = validateUser(req);
        if (name) {
            var newTodo =
            todoes[name].push({
                id: req.body.id,
                value: req.body.value,
                status: ACTIVE
            });
            res.send(200,'OK');
            return 0;
        } else {
            res.send(400, 'user unidentified or not in session')
            return 1;
        }
    } catch(e) {
        res.send(500);
        return 1;
    }
}

function putItemFunc(req, res, next) {
    try{
        var name = validateUser(req);
        if (req.reqBody != undefined){try{req.body = JSON.parse(req.reqBody);} catch(e){}}   //needed only if use minExpress
        if (name) {
            for (var i = todoes[name].length - 1; i>=0; i--) {
                if (todoes[name][i].id == req.body.id) {
                    todoes[name][i] = req.body;
                    res.send(200,'OK');
                    return 0;
                }
            }
            res.send(1, 'item with given id was not found');     //error id is not in list/
        } else {
            res.send(400, 'user unidentified or not in session')
        }
        return 1;
    } catch(e) {
        res.send(500);
        return 1;
    }
}

//delete item {id: (either item ID or -1 to delete it all)}
function deleteFunc(req, res, next) {
    try {
        var name = validateUser(req);
        var id = req.params.id;
        if (name) {
            //delete all
            if (id == -1) {
                todoes[name] = [];
                res.end(0);
            } else {
                for (var i = todoes[name].length - 1; i>=0; i--) {
                    if (todoes[name][i].id == id) {
                        todoes[name].splice(i, 1);
                        res.send(200,'OK');
                        return 0;
                    }
                }
                res.send(1, 'item with given id was not found');     //id not found
                return 1;
            }
        } else {
            res.send(400, 'user unidentified or not in session')
            return 1;
    }
    } catch(e) {
        res.send(500);
        return 1;
    }
}

//checks that cookie was sent by a logged in user
//if successful returns user name
function validateUser(req) {
    try {
        if ((req.cookies != undefined) && (users[req.cookies.userName] != undefined) &&
            (new Date(Date.now())<users[req.cookies.userName].expiration) && (users[req.cookies.userName].sessionId == req.cookies.sessionId)) {
            users[req.cookies.userName].expires = new Date(Date.now() + 900000);
            return req.cookies.userName;
        } else {
            return null;
        }
    } catch(e) {
        return null;
    }
}

function login(req, res, next) {
    try {
        if (req.reqBody != undefined){try{req.body = JSON.parse(req.reqBody);} catch(e){}}   //needed only if use minExpress
        if (users[req.body.username] != undefined && users[req.body.username].password == req.body.password) {
            var cookieId = uuid.v4();
            var expDate = new Date(Date.now() + 900000);
            users[req.body.username].sessionId = cookieId;
            res.cookie('userName', req.body.username, { expires:expDate });
            res.cookie('sessionId', cookieId, { expires:expDate });
            res.send(200,'OK');


            return 0;
        }
    } catch(e){}
     res.send(500, 'user name or password is incorrect');
    return 1;

}

function register(req, res, next) {
    try {
        if (req.reqBody != undefined){try{req.body = JSON.parse(req.reqBody);} catch(e){}}   //needed only if use minExpress
        if (users[req.body.username] != undefined) {
            //error- name used
            res.send(500, 'user name is already taken');
        } else if (req.body.password == undefined || req.body.password.length < 3 ||
            req.body.username.length < 1 || req.body.fullname < 1){
            res.send(500, 'all fields must be filled, password must be at least 3 characters long');
        } else {
            var cookieId = uuid.v4();
            var expDate = new Date(Date.now() + 900000);
            users[req.body.username] = {};

            users[req.body.username] = {password:req.body.password, sessionId: cookieId, expiration: expDate}
            todoes[req.body.username] = [];
            res.cookie('userName', req.body.username, { expires:expDate });
            res.cookie('sessionId', cookieId, { expires:expDate });
            res.send(200,'OK');
            return 0;
        }
        }   catch (e){}
    return 1;
}

app.use(express.cookieParser());
app.use(express.bodyParser());
app.get('/item', getItemFunc);
app.post('/item', postItemFunc);
app.put('/item', putItemFunc);
app.delete('/item/:id', deleteFunc );

app.post('/login', login);
app.post('/register', register);

app.use(express.static(__dirname + '/www'));
app.listen(process.env.PORT || 80);
