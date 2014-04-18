/**
 *
 * Copyright StrongLoop 2014
 *
 * User: seanbrookes
 * Date: 2014-01-18
 * Time: 1:20 PM
 *
 */
/**
 *
 * Home Controller
 *
 * */
Home.controller('HomeController', [
  '$scope',
  '$state',
  'User',
  'Installation',
  function ($scope, $state, User, Installation) {


    if(window.localStorage.getItem('APNKey') && (!JSON.parse(window.localStorage.getItem('pnRegistered')))){
      // post app initialization key to server
      Installation.create({
          appId: '1',
          userId: User.getCurrentUserId || '',
          deviceToken: window.localStorage.getItem('APNKey'),
          deviceType: 'ios',
          created: new Date(),
          modified: new Date(),
          status: 'Active'
        },
        function (response) {
         // alert('Registration record is created: ', JSON.stringify(response));
          window.localStorage.setItem('pnRegistered','true');
        },
        function(response){
          alert('problem creating installation record: ' + JSON.stringify(response))
        });
    }




    $scope.viewTitle = 'iCars';

    $scope.showMyReservations = function () {
      if (User.isAuthenticated()) {
        return true;
      }
      return false;
    };
    $scope.showLogin = function () {
      if (User.isAuthenticated()) {
        return false;
      }
      return true;

    };
    $scope.showRegister = function () {
      if (User.isAuthenticated()) {
        return false;
      }
      return true;

    };

  }
]);
Home.controller('HomeAppController', [
  '$scope',
  function ($scope) {

    $scope.viewTitle = 'iCars';
  }
]);
app.controller('HomeTabController', [
  '$scope',
  '$state',
  function ($scope, $state) {

    $scope.$on('tab.shown', function ($scope) {
      if ($scope.currentScope.$parent.tabsController.selectedIndex) {
        var tIndex = $scope.currentScope.$parent.tabsController.selectedIndex;
        if (tIndex === 3) {
          $state.go('home');
        }
      }
    });
  }
]);
