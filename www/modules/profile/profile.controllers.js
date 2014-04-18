/**
 *
 * Copyright StrongLoop 2014
 *
 * User: seanbrookes
 * Date: 2014-01-13
 * Time: 4:50 PM
 *
 */
/**
 *
 * Profile Controller
 *
 * */
Profile.controller('ProfileController', [
  '$rootScope',
  'User',
  '$scope',
  'User',
  function ($rootScope, User, $scope, User) {

    $scope.viewTitle = 'Profile';

    $scope.showMyReservations = function () {
      if (User.isAuthenticated()) {
        return true;
      }
      return false;
    };
    $scope.showReceiveNotifications = function(){
      var pushNotificationsEnabled = true;
//      if (ProfileService.getCurrentUserId()) {
//        return true;
//      }
      return pushNotificationsEnabled;
    };
  }
]);
Profile.controller('LoginController', [
  '$scope',
  '$state',
  'User',
  'ReservationDataService',
  'UIService',
  function ($scope, $state, User, ReservationDataService, UIService) {

    $scope.credentials = {
      email: 'foo@bar.com',
      password: 'foo'
    };
    $scope.themeName = UIService.getPrimaryThemeName();
    // TODO move to Profile Service
    $scope.login = function () {

      $scope.loginResult = User.login($scope.credentials,
        function () {

          // TODO make a more robust API call here
          window.localStorage.setItem('currentUserId', $scope.loginResult.userId);
          window.localStorage.setItem('accessToken', $scope.loginResult.id);

          if (ReservationDataService.getCurrentReservationReqModel()) {
            $state.go('reservation');
          }
          else {
            $state.go('home');
          }

          //$location.path('/');
        },
        function (res) {
          $scope.loginError = res.data.error;
        }
      );
    };
  }
]);
Profile.controller('RegisterController', [
  '$scope',
  '$state',
  'User',
  'UIService',
  function ($scope, $state, User, UIService) {

    $scope.registration = {};
    $scope.themeName = UIService.getPrimaryThemeName();

    $scope.register = function () {
      $scope.user = User.save($scope.registration,
        function () {
          $state.go('login');
        },
        function (res) {
          $scope.registerError = res.data.error;
        }
      );
    };

    $scope.getCarThumb = function (res) {
      return 'http://0.0.0.0:3000/images/car/midsize-thumb.png';
    };
  }
]);
/**
 *
 * My Reservation Controller
 *
 * */
Profile.controller('MyReservationsController', [
  '$scope',
  'ReservationDataService',
  'RestService',
  'UIService',
  function ($scope, ReservationDataService, RestService, UIService) {

    $scope.themeName = UIService.getPrimaryThemeName();
    /*
     *
     *   item Buttons
     *
     *
     * */
    $scope.itemButtons = [
      {
        text: 'Cancel Reservation',
        type: 'button-' + UIService.getPrimaryThemeName(),
        onTap: function (item) {
          if (window.confirm('Cancel reservation?')) {
            ReservationDataService.cancelReservation(item.id);
            $scope.reservations = ReservationDataService.getMyReservations();
          }

        }
      }
    ];

    $scope.onRefresh = function () {
      init();
    };
    function init() {
      $scope.viewTitle = 'My Reservations';


      // format car class
      $scope.formatCarClass = UIService.formatCarClass;
      $scope.getThumb = UIService.getCarThumb;


      $scope.reservations = ReservationDataService.getMyReservations();
      $scope.$broadcast('scroll.refreshComplete');

    }

    init();

  }
]);
