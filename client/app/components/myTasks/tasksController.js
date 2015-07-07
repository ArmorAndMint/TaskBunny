(function(){

angular.module('trApp')
    .controller('TasksController', ['$interval', '$scope', '$route', '$location', 'TaskService', 'UserService', TasksController]);

  function TasksController($interval, $scope, $route, $location, TaskService, UserService){
    $scope.states = TaskService.states;
    
    // init currentTaskList and currenTaskListName
    $scope.currentTaskListName = 'created';
    $scope.currentTaskList = $scope[$scope.currentTaskListName];

    $scope.viewTask = function(id) {
      $location.path('/task/' + id);
    };
    
    // this function sets which task filter to use
    // takes a string that describes which filter to use
    // applied, created, assigned are possible options
    $scope.setTaskList = function(list){
      if (list === 'applied'){
        $scope.currentTaskList = $scope.appliedTasks;
        $scope.currentTaskListName = list;
      } else if (list === 'created'){
        $scope.currentTaskList = $scope.createdTasks;
        $scope.currentTaskListName = list;
      } else if (list === 'open'){
        $scope.currentTaskList = $scope.openTasks;
        $scope.currentTaskListName = list;
      } else if (list === 'pending'){
        $scope.currentTaskList = $scope.pendingTasks;
        $scope.currentTaskListName = list;
      } else if (list === 'assigned') {
        $scope.currentTaskList = $scope.assignedTasks;
        $scope.currentTaskListName = list;
      } else if (list === 'ready') {
        $scope.currentTaskList = $scope.readyTasks;
        $scope.currentTaskListName = list;
      } else if (list === 'myReady') {
        $scope.currentTaskList = $scope.myReadyTasks;
        $scope.currentTaskListName = list;
      } else if (list === 'myCompleted') {
        $scope.currentTaskList = $scope.myCompletedTasks;
        $scope.currentTaskListName = list;
      } else if (list === 'iCompleted') {
        $scope.currentTaskList = $scope.iCompletedTasks;
        $scope.currentTaskListName = list;
      } else {
        console.error('Invalid task list name: ', list);
      }
    };

    // set the id for this user
    UserService.whoami()
      .then(function(results){
        $scope.me = results.data;
      });


    $scope.editMode = false;
    $scope.editTask = function(){
      if($scope.task.isOwner && !$scope.task.assignedTo && $scope.task.applicants.length === 0){
        $scope.editMode = true;
      }
    };

    $scope.cancelEditTask = function(id){
      reload(id);
    };

    // reload task information from server
    var reload = function(id){
      TaskService.retrieveTask(id).success(function(task){
        $scope.task = task;
        $scope.editMode = false;
        // date is a pesky thing to deal with
        // must always be a Date object for the model per angular's doc
        $scope.deadline = new Date( $scope.task.information.deadline );
        $scope.deadlineStr = moment($scope.deadline).format('MMMM Do YYYY');
      });
    };
    
    $scope.updateTask = function(id) {
      $scope.editMode = false;
      $scope.task.information.deadline = $scope.deadline;
      TaskService.updateTask(id, $scope.task.information).success(function(){
        $route.reload();
      }).catch(function(err){
        //display error message, maybe  $scope.errorMessage = "error" ?
        console.log(err);
      });
    };

    $scope.deleteTask = function(id) {
      $scope.editMode = false;
      TaskService.deleteTask(id).success(function(){
        $route.reload();
      });
      //todo handle error
    };

    $scope.applyForTask = function(id){
      TaskService.applyForTask(id).success(function(){
        $route.reload();
      }).catch(function(){

      });
    };

    $scope.assignToUser = function(taskId, userId){
      console.log(taskId, userId);
      TaskService.assignTask(taskId, userId).success(function(){
        $route.reload();
      }).catch(function(err){
        console.log(err);
      });
    };

    // set a 'ready' state
    // it may make sense to just create a 'state'
    // or 'progress' variable to tracke this?
    $scope.setProgress = function(id, state){
      TaskService.setProgress(id, state)
        .success(function(d){
          $route.reload();
        });
    };

    $scope.updateTaskList = function(){
      TaskService.retrieveUserTasks()
        .success(function(tasks){
          tasks = _.map(tasks, function(task){
            task.information.deadline = moment(Date(task.information.deadline)).format('MMMM Do YYYY');
            return task;
          });

          $scope.createdTasks = _.filter(tasks, function(task){
            return task.isOwner;
          });

          $scope.openTasks = _.filter(tasks, function(task){
            return task.isOwner && task.state === 1;
          });

          $scope.pendingTasks = _.filter(tasks, function(task){
            return task.isOwner && task.state === 2;
          });

          $scope.appliedTasks = _.filter(tasks, function(task){
            return (task.appliedTo && !task.isAssignedToMe);
          });

          $scope.assignedTasks = _.filter(tasks, function(task){
            return task.isAssignedToMe && task.state !== 4;
          });

          // get only my tasks marked ready
          $scope.myReadyTasks = _.filter(tasks, function(task){
            return task.isOwner && task.state === 3;
          });

          // get only tasks im assigned to marked as ready
          $scope.readyTasks = _.filter(tasks, function(task){
            return task.isAssignedToMe && task.state === 3;
          });

          // get my tasks marked as complete
          $scope.myCompletedTasks = _.filter(tasks, function(task){
            return task.isOwner && task.state === 4;
          });

          // get (not my) tasks marked as complete
          $scope.iCompletedTasks = _.filter(tasks, function(task){
            return !task.isOwner && task.state === 4;
          });

          // set our current task list if we havnt yet
          if (!$scope.currentTaskList){
            // set our starting state
            $scope.currentTaskList = $scope.createdTasks;
          } else {
            // update the current task list
            // TODO: need a more elegant way to do this:
              // like an object map or something
            if ($scope.currentTaskListName === 'created'){
              $scope.currentTaskList = $scope.createdTasks;
            } else if ($scope.currentTaskListName === 'open'){
              $scope.currentTaskList = $scope.openTasks;
            } else if ($scope.currentTaskListName === 'pending'){
              $scope.currentTaskList = $scope.pendingTasks;
            } else if ($scope.currentTaskListName === 'applied'){
              $scope.currentTaskList = $scope.appliedTasks;
            } else if ($scope.currentTaskListName === 'assigned'){
              $scope.currentTaskList = $scope.assignedTasks;
            } else if ($scope.currentTaskListName === 'myReady'){
              $scope.currentTaskList = $scope.myReadyTasks;
            } else if ($scope.currentTaskListName === 'ready'){
              $scope.currentTaskList = $scope.readyTasks;
            } else if ($scope.currentTaskListName === 'myCompleted'){
              $scope.currentTaskList = $scope.myCompletedTasks;
            } else if ($scope.currentTaskListName === 'iCompleted'){
              $scope.currentTaskList = $scope.iCompletedTasks;
            } else {
              console.error('No task to apply');
            }
          }

      });
    };

    // call updateTaskList once on view load
    // and again every 1.5 seconds to update tasks
    $scope.updateTaskList();
    $interval(function(){
      $scope.updateTaskList();
    }, 1500);
      
  }// end of controller function body
})();
