(function(){

angular.module('trApp', ['ui.router'])
  .run(function ($rootScope, $location, AuthService) {
    $rootScope.$on('$routeChangeStart', function (evt, next, current) {

      //ignore arriving at root path
      if (next.$$route.originalPath === '') {
        return;
      }

    });
  })
  // instead of asking the server if we are authed on every single route change, 
  // lets wait until the server sends a 401 response to worry about it
  
  // if we get a 401: route the user to the sign in page
  .factory('authHttpResponseInterceptor',['$q','$location',function($q,$location){
      return {
          response: function(response){
              if (response.status === 401) {
                  console.log('Response 401');
                  $location.path('/sign-in');
              }
              return response || $q.when(response);
          },
          responseError: function(rejection) {
              if (rejection.status === 401) {
                  console.log('Response Error 401',rejection);
                  $location.path('/sign-in');
              }
              return $q.reject(rejection);
          }
      }
  }])
  .config(['$httpProvider',function($httpProvider) {
      //Http Interceptor to check auth failures for xhr requests
      $httpProvider.interceptors.push('authHttpResponseInterceptor');
  }]);
})();
