/*global todomvc, angular */
'use strict';

var ACTIVE = false;
var COMPLETED = true;;

/**
 * The main controller for the app. The controller:
 * - retrieves and persists the model via the todoStorage service
 * - exposes the model to the template and provides event handlers
 */
todomvc.controller('TodoCtrl', function TodoCtrl($scope, $routeParams, todoStorage, filterFilter, $http, $location) {

    var todos = $scope.todos = [{}];
    $http.get('/item')
        .success(function(data) {
            if (data == 'OK' || data.length == 0){
                $scope.todos =[];
            } else {
                $scope.todos = JSON.parse(JSON.stringify(data));
            }
            todos = $scope.todos;
        }).error(function(data, status, headers, config) {
            $location.path("/login");
             });

        $scope.newTodo = '';
        $scope.editedTodo = null;

        $scope.$watch('todos', function (newValue, oldValue) {
                $scope.remainingCount = filterFilter(todos, { status: ACTIVE }).length;
                $scope.completedCount = todos.length - $scope.remainingCount;
                $scope.allChecked = !$scope.remainingCount;
        }, true);

        // Monitor the current route for changes and adjust the filter accordingly.
        $scope.$on('$routeChangeSuccess', function () {
                var statusF = $scope.status = $routeParams.status || '';

                $scope.statusFilter = (statusF === 'active') ?
                        { status: ACTIVE } : (statusF === 'completed') ?
                        { status: COMPLETED } : null;
        });

        $scope.addTodo = function () {
                var newTodo = $scope.newTodo.trim();
                var newItem;
                if (!newTodo.length) {
                        return;
                }
                newItem = {
                    id: Date.now(),
                    value: newTodo,
                    status: ACTIVE
                };
                todos.push(newItem);

                $scope.newTodo = '';//todo remove
            todoStorage.post(newItem)
        };

        $scope.editTodo = function (todo) {
                $scope.editedTodo = todo;
                // Clone the original todo to restore it on demand.
                $scope.originalTodo = angular.extend({}, todo);
        };

        $scope.doneEditing = function (todo) {
                $scope.editedTodo = null;
                todoStorage.put(todo);
                if (!todo.value) {
                        $scope.removeTodo(todo);
                }

        };

        $scope.revertEditing = function (todo) {
                todos[todos.indexOf(todo)] = $scope.originalTodo;
                $scope.doneEditing($scope.originalTodo);
        };

        function clear(todo) {
                todos.splice(todos.indexOf(todo), 1);
                todoStorage.delete(todo.id);
        };

        $scope.removeTodo = function (todo) {
                todos.splice(todos.indexOf(todo), 1);
                todoStorage.delete(todo.id);
        };

        $scope.clearCompletedTodos = function () {
            for (var i = todos.length - 1; i>=0; i--) {
                if (todos[i].status) {
                    todoStorage.delete(todos[i].id);
                    todos.splice(i, 1);
                }
            }
        };

        $scope.toggle = function (todo) {
            var updated = {id:todo.id, value:todo.value, status:!todo.status}
            todoStorage.put(updated);
        };

        $scope.markAll = function (status) {
                todos.forEach(function (todo) {
                        todo.status = !status;
                        todoStorage.put(todo);
                });
        };})