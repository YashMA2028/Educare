document.addEventListener("DOMContentLoaded", function () {

    var app = angular.module('educareApp', ['ngRoute']);

app.config(function($routeProvider) {
    $routeProvider
    .when('/', {
        templateUrl: 'home.html' // Your homepage content
    })
    .when('/courses', {
        templateUrl: 'courses.html'
    })
    .when('/about', {
        templateUrl: 'about.html'
    })
    .when('/library', {
        templateUrl: 'library.html'
    })
    .when('/login', {
        templateUrl: 'login_signup.html'
    })
    .otherwise({
        redirectTo: '/'
    });
});

    // Select all email, password, and last name input fields
    const inputs = document.querySelectorAll('input[type="email"], input[type="password"], input#lName');
    
    inputs.forEach(input => {
        input.setAttribute('autocomplete', 'new-password'); // Prevent autofill
        input.setAttribute('spellcheck', 'false');
    });

    // Extra fix for browsers forcing autofill
    setTimeout(() => {
        inputs.forEach(input => {
            input.value = '';
            input.blur();
        });
    }, 500);
});

