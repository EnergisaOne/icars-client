/**
 *
 * Copyright StrongLoop 2014
 *
 * User: seanbrookes
 * Date: 2014-01-07
 * Time: 10:20 AM
 *
 */
Reservation.service('ReservationDataService', [
  '$state',
  '$q',
  'Reservation',
  'SearchService',
  'User',
  function ($state, $q, Reservation, SearchService, User) {

    var svc = {};

    svc.getCurrentReservationReqModel = function () {
      if (window.localStorage && window.localStorage.getItem('currentReservationReqModel')) {
        var resReqObj = JSON.parse(window.localStorage.getItem('currentReservationReqModel'));
        if (User.isAuthenticated()) {
          resReqObj.userId = User.getCurrentId();
        }
        return resReqObj;
      }
      else {
        return null;
      }
    };

    svc.setCurrentReservationReqModel = function (model) {
      if (model && window.localStorage) {
        window.localStorage.setItem('currentReservationReqModel', JSON.stringify(model));
      }
    };
    svc.clearCurrentReservationReqModel = function (model) {
      if (window.localStorage) {
        window.localStorage.removeItem('currentReservationReqModel');
      }
    };
    svc.generateConfirmationNumber = function () {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    };

    svc.confirmCurrentReservation = function () {
      var currentReservationRequest = svc.getCurrentReservationReqModel();
      var requestObj = {};

      // make sure we have a valid user
      if (!currentReservationRequest.userId) {
        console.log('We do not have a valid user');
      }
      else {

        requestObj.customerId = currentReservationRequest.userId;
        requestObj.carId = currentReservationRequest.car.id;
        requestObj.dealerId = currentReservationRequest.dealer.id;
        var currentSearchModel = SearchService.getCurrentSearchModel();
        requestObj.fromDate = currentSearchModel.fromDate;
        requestObj.toDate = currentSearchModel.toDate;

        // create the structure needed to map with te requestObj data
        // call the API resource
        Reservation.create(requestObj, function (response) {
            svc.clearCurrentReservationReqModel();
            $state.go('confirmation');
          },
          function (response) {
            console.log('bad create resrouce: ' + response);
          }
        );
      }

    };

    svc.cancelReservation = function (id) {
      var filter = {
        'id': id
      };
      return Reservation.deleteById(
        filter,
        function (response) {

          //console.log('Cancel My Reservations');

        },
        function () {
          console.log('bad cancel my reservations' + arguments);

        });
    };

    svc.getMyReservations = function () {

      var customerId = User.getCurrentId();

      var filter = {
        'filter[where][customerId]': customerId,
        'filter[include]': ['car', 'dealer'],
        'filter[limit]': 10
      };
      return Reservation.query(
        filter,
        function (response) {

          //console.log('Got My Reservations');

        },
        function () {
          console.log('bad my reservations' + arguments);

        });
    };

    return svc;

  }
]);
