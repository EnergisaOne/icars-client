/**
 *
 * Copyright StrongLoop 2014
 *
 * User: seanbrookes
 * Date: 2014-01-13
 * Time: 4:50 PM
 *
 */
Profile.directive('lbProfileMainDirective', [
  '$templateCache',
  function ($templateCache) {

    return {
      templateUrl: 'profile.main.html'
    };
  }
]);
Profile.directive('lbProfileChooseTheme', [
  'UIService',
  function (UIService) {
    return{
      templateUrl: './modules/profile/templates/choose.theme.html',
      controller: function ($scope) {
        var profile = {};
        profile.selectedTheme = UIService.getPrimaryThemeName();


        $scope.profile = profile;

        $scope.changeTheme = function (val) {

          window.localStorage.setItem('themeName', val);
        };

      }
    };
  }
]);
Profile.directive('lbLogout', [
  'User',
  function (User) {
    return{
      template: '<button class="button button-full button-outline" ng-click="logout()" ng-show="isUserAuth()">logout</button>',
      controller: function ($scope, User) {
        $scope.logout = function () {
          User.logout();
        };
        $scope.isUserAuth = function () {
          return User.isAuthenticated();
        };
      },
      replace: true
    };
  }

]);
