/*global angular */
/*jshint unused:false */
'use strict';

/**
 * The main TodoMVC app module
 *
 * @type {angular.Module}
 */
var todomvc = angular.module('todomvc', ['ngRoute'])
        .config(function ($routeProvider) {
                $routeProvider.when('/', {
                        controller: 'TodoCtrl',
                        templateUrl: 'todomvc-index.html'
                }).when('/login', {
                        controller: 'LoginCtrl',
                        templateUrl: 'login-index.html',
                        link: function (scope, element, attrs, ctrl) {
                                ctrl.init();
                        }
                }).when('/:status', {
                       controller: 'TodoCtrl',
                       templateUrl: 'todomvc-index.html'
                }).otherwise({
                        redirectTo: '/'
                });
        });

