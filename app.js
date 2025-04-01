var app = angular.module('educareApp', ['ngRoute']);

app.config(function($routeProvider) {
    $routeProvider
        .when("/", {
            templateUrl: "home.html", // Homepage content
            controller: "MainController"
        })
        .when("/about", {
            templateUrl: "about.html", // About page content
            controller: "AboutController"
        })
        .otherwise({
            redirectTo: "/"
        });
});

app.controller('MainController', function($scope) {
    // Homepage controller logic
});

app.controller('AboutController', function($scope) {
    // About page controller logic
});