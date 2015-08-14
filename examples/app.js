var app = angular.module('OrdinanceApp', ['ngRoute']);

app.config(function ($routeProvider) {
	$routeProvider.when('/select', {
	    controller: 'DemoCntl',
	    templateUrl: 'views/selectOrdinance.html'	
	})
	  .otherwise({
	     redirectTo: '/'
	});
});

