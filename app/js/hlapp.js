// Creation Date: 13 Jul 2013
// Author: Fernando Canizo (aka conan) - http://conan.muriandre.com/


'use strict';


// Declare app level module which depends on filters, and services
angular.module('hlApp', ['hlApp.controllers'])
	.config(['$routeProvider', function($routeProvider) {
		$routeProvider.when('/choose', {templateUrl: 'partials/choose.text.html', controller: 'chooseTextCtrl'});
		$routeProvider.when('/hlapp', {templateUrl: 'partials/hlapp.html', controller: 'hlAppCtrl'});
		$routeProvider.when('/config', {templateUrl: 'partials/config.html', controller: 'configCtrl'});

		$routeProvider.otherwise({redirectTo: '/choose'});
	}]);
