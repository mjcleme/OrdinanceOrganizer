
	var app = angular.module('OrdinanceApp', []);

    //	app.config(function ($routeProvider) {
    //      $routeProvider.when('/select', {
    //        controller: 'DemoCntl',
    //        templateUrl: 'views/selectOrdinance.html'
    //      })
    //        .otherwise({
    //         redirectTo: '/'
    //      });
    // 	});




    app.controller('DemoCntl',['$scope', '$location', '$http', '$q', '$timeout', function($scope, $location, $http, $q, $timeout) {
      	
        var fsClient = new FamilySearch({
          client_id: 'a0T3000000C3F8XEAV',
          environment: 'production',
          redirect_uri: 'http://52.25.65.210:9002/angularjs.html',
          http_function: $http,
          deferred_function: $q.defer,
          timeout_function: $timeout,
          save_access_token: true,
          auto_expire: true,
          auto_signin: true
        });
    var accessTok; 
    $scope.loggedIn = false;
    $scope.run = function() { 
        fsClient.getAccessToken().then(function (response) {
	$scope.accessToken = response;		
	$.ajax
	   ({
              // Get the RIDs of all the people you have reserved
	      type: "GET",
	      url: "https://familysearch.org/reservation/v1/person",
	      dataType: 'json',
	      cache: false,
	      headers: {
		"Authorization": "Bearer " + response
		},    
	      success: function(data){
		console.log(data);
	        getOrdinances(data);
		$scope.contents = "loggedIn";	
	     },	
	      error: function(xhr, status, error) {
		   $scope.loggedIn = true;
		   $scope.$apply();		
		   alert("You do not have access to ordinance information.");	
		   var err = eval("(" + xhr.responseText + ")");
		    console.log(err.Message);
		  	
		}
	});
      });
	
		
    }
   function getOrdinances(data){
		
	    var obj = data.persons;
	    var persons = obj.person || {};
	    var url = "https://familysearch.org/reservation/v1/person/"; 		
            // Tack on all of the RIDs
	    for(var i = 0; i < persons.length; i++)
		{
			if(i < persons.length - 1)
		   	url += persons[i].ref + ",";
			else
			url += persons[i].ref; 
		}
	    
            url += "?view=ordinances";
		console.log(url);	
	    $.ajax
		({
		    type: "GET",
		    url: url,
		    dataType: 'json',
		    cache:false,
		    headers: {	
				"Authorization": "Bearer " + $scope.accessToken	
			},
		    	
		    success: function(data) {
			    console.log("we got ordinance data");
			    displayOrdInfo(data); // Display all of the ordinances for all the IDs
			    $scope.loggedIn = true;
			    fsClient.getCurrentUser().then(function(response) {
			    		var user = response.getUser();
					$scope.userName ="Welcome, "+ user.contactName;
				});	
			},
		    		
		});	
	}   
   function displayOrdInfo(data){
	 $scope.persons = data.persons.person;
	 $scope.$apply(); 
	 console.log($scope.persons); 
	}
   $scope.logout = function(){
	console.log("we got here");
        fsClient.invalidateAccessToken();
	$scope.accessToken = "";
	$scope.persons = [];
	$scope.loggedIn = false;
	$scope.userName = "";
	$scope.contents = "";
	$scope.$apply();	 
    }

   $scope.setContents = function(val)
   {
 	$scope.contents = val;
   }
  
}]);
   
