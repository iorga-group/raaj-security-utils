function SearchUserCtrl($scope, $http, $location) {
	
	$http.get('api/searchUser/init').success(function(data, status, headers, config) {
		$scope.profileList = data.profileList;
	});
	
	$scope.showUsers = function() {
		$http.get('api/searchUser/findAll').success(function(listUser, status, headers, config) {
			$scope.users = listUser;
		});
	};
	
	$scope.userForm = {	
			currentPage : 1,
			pageSize : 10,
			orderByPath : "",
			orderByDirection : ""
	};
	
	$scope.searchUser = function(newSearch){		
		if (newSearch){
			$scope.userForm.currentPage = 1;
		}
		$http({
		    url: 'api/searchUser/search',
		    method: "POST",
		    data: $scope.userForm
		})
		.success(function(data, status, headers, config) {
					$scope.users = data.listUser;
					$scope.paginator.nbPages = data.nbPages;
					$scope.nbResults = data.nbResults;
				});
	}
	
	$scope.findUser = function(userId){		
		$location.path('/user/' + userId);
	}
	
}