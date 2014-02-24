/*global todomvc */
'use strict';

/**
 * Services that persists and retrieves TODOs from localStorage
 */
todomvc.factory('todoStorage', function ($http, $location) {
        return {

            // add new todo
            post: function(newTodo) {
                    $http.post('/item',{id:newTodo.id, value:newTodo.value}).error(function(data, status, headers, config) {
                        $location.path("/login");
                    });
            },
            // update a todo
            put: function (todo) {
                    $http.put('/item',{id:todo.id, value:todo.value, status:todo.status}).error(function(data, status, headers, config) {
                        $location.path("/login");
                    });
            },
            // remove a todo
            delete: function(id) {
                    $http.delete('/item/'+id).error(function(data, status, headers, config) {
                        $location.path("/login");
                    });;
            }
        };
});