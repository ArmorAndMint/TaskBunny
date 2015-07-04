(function(){

  angular.module('trApp')
    .config(function($stateProvider, $urlRouterProvider) {

      $urlRouterProvider.otherwise('/');

      $stateProvider
        .state('landing', {
          url: '/',
          templateUrl: 'app/components/landing/landing.html',
          controller: 'LandingPageController'
        })
        .state('sign-in', {
          url: '/sign-in',
          templateUrl: 'app/components/sign-in/sign-in.html',
          controller: 'SignInPageController'
        })
        .state('create', {
          url: '/create-task',
          templateUrl: 'app/components/taskNew/task-form.html',
          controller: 'TaskFormController'
        })

        // this is the first and only place where i have started implementing
        // the new 'dual views'/ui-router style interface
        .state('tasks', {
          url: '/tasks',
          templateUrl: 'app/components/myTasks/overview.html',
          controller: 'TasksController'
        })
        //this is the sub-state of the main tasks view
        .state('tasks.manage', {
          url: '/manage',
          templateUrl: 'app/components/myTasks/tasks.html',
          controller: 'TasksController'
        })

        .state('tasks.view', {
          url: '/:id',
          templateUrl: 'app/components/taskDetails/task-view.html',
          controller: 'TaskViewController'
        })
        .state('search', {
          url: '/search',
          templateUrl: 'app/components/taskSearch/taskSearch.html',
          controller: 'TaskSearchController'
        })
        .state('settings', {
          url: '/settings',
          templateUrl: 'app/components/userSettings/template.html',
          controller: 'SettingsController'
        });
    });

})();
