/**
 *
 * Copyright StrongLoop 2013
 *
 * User: seanbrookes
 * Date: 2013-12-11
 * Time: 10:54 AM
 *
 */
/**
 *
 * Dealer Controller
 *
 * */
Dealer.controller('DealerController', [
  '$scope',
  '$state',
  '$http',
  'LocationService',
  'DealerService',
  function ($scope, $state, $http, LocationService, DealerService) {

    $scope.onRefresh = function () {
      init();
    };

    $scope.viewTitle = 'Dealers';

    $scope.detailView = function (dealerId) {
      $state.go('p.detail', {id: dealerId});
    };

    var currentLocation = {};

    function init() {


      $scope.viewTitle = 'Dealers';

      if (LocationService.getCurrentLocation()) {
        currentLocation = LocationService.getCurrentLocation();
        currentLocation.coords = {};
        currentLocation.coords.latitude = currentLocation.lat;
        currentLocation.coords.longitude = currentLocation.lng;

        //  TODO convert to ng model
        $scope.dealers = DealerService.getNearbyDealers();
      }
      else {
        $scope.$parent.tabsController.select(2);
      }


      $scope.$broadcast('scroll.refreshComplete');

    }

    init();

    $scope.$on('tab.shown', function ($scope) {
      var index = $scope.currentScope.$parent.tabsController.selectedIndex;
      if (index == 0) {
        init();
      }
    });
  }



]);
/**
 *
 * Dealer Location Controller
 *
 * */
Dealer.controller('DealerLocationController', [
  '$scope',
  'LocationService',
  'DealerService',
  function ($scope, LocationService, DealerService) {

    var currentLocation = {};


    if (LocationService.getCurrentLocation()) {
      currentLocation = LocationService.getCurrentLocation();
      currentLocation.coords = {};
      currentLocation.coords.latitude = currentLocation.lat;
      currentLocation.coords.longitude = currentLocation.lng;
      currentLocation.options = {
        title: currentLocation.name
      };


    }


    $scope.currentLocation = currentLocation;

    var dealerLocs = [];
    var bounds = new google.maps.LatLngBounds();

    var currentPoint;

    angular.forEach(DealerService.getNearbyDealers(), function (item) {

      var marker = {};

      var tLocation = item.location.split(',');

      var location = {
        latitude: tLocation[1],
        longitude: tLocation[0],
        name: item.name
      };
      currentPoint = new google.maps.LatLng(location.latitude, location.longitude);
      var tMarker = new google.maps.Marker({
        position: currentPoint,
        title: location.name
      });

      bounds.extend(tMarker.position);

      dealerLocs.push(location);

    });

    $scope.fit = true;

    $scope.dealerLocs = dealerLocs;

    var locationHistory = JSON.parse(window.localStorage.getItem('locationHistory'));
    var targetLocation;
    var centerLat = 45, centerLng = -73;
    $scope.searchLocationMarker = {};


    if (locationHistory) {
      targetLocation = locationHistory[0];

      centerLat = targetLocation.lat;
      centerLng = targetLocation.lng;

      $scope.searchLocationMarker = {
        coords: {
          latitude: targetLocation.lat,
          longitude: targetLocation.lng
        },
        options: {
          title: 'you are here'
        }
      };
      $scope.searchLocationMarker.coords = {
        latitude: targetLocation.lat,
        longitude: targetLocation.lng
      };
      $scope.searchLocationMarker.options = {
        title: 'you are here'
      };

    }

    // var mapCenter = map.setCenter(bounds.getCenter());
    var mapCenter = bounds.getCenter();

    angular.extend($scope, {
      map: {
        center: {
          latitude: mapCenter.ob,
          longitude: mapCenter.pb
        },
        zoom: 8,
        bounds: bounds
      }
    });


    genRandomMarkers = function (numberOfMarkers, scope) {
      var markers = [];
      for (var i = 0; i < numberOfMarkers; i++) {
        markers.push(createRandomMarker(i, scope.map.bounds))
      }
      scope.map.randomMarkers = markers;
    };

    createRandomMarker = function (i, bounds) {
      var lat_min = bounds.southwest.latitude,
        lat_range = bounds.northeast.latitude - lat_min,
        lng_min = bounds.southwest.longitude,
        lng_range = bounds.northeast.longitude - lng_min;

      latitude = lat_min + (Math.random() * lat_range);
      longitude = lng_min + (Math.random() * lng_range);
      return {
        latitude: latitude,
        longitude: longitude,
        title: 'm' + i
      };
    };

  }
]);
/**
 *
 * Dealer Detail Controller
 *
 * */
Dealer.controller('DealerDetailController', [
  '$scope',
  '$state',
  '$stateParams',
  '$http',
  '$templateCache',
  'DealerService',
  'ReservationDataService',
  'RestService',
  'SearchService',
  'User',
  'UIService',
  function ($scope, $state, $stateParams, $http, $templateCache, DealerService, ReservationDataService, RestService, SearchService, User, UIService) {
    /*
     * Load Dealer Detail
     * */


    var dealerObj = {};
    var dealerInventory = [];
    var dealerRates = [];

    $scope.loadDealerDetail = {};

    $scope.dealerCars = [];
    $scope.targetReserveCar = {};
    // get the list of dealers
    $scope.dealerCollection = [];
    $scope.imgPath = function (arg) {
      // console.log(arg);
    };


    $scope.viewTitle = 'Dealer Detail';

    var id = $stateParams.id;

    $scope.inventory2 = $state.$current.locals.globals.inventory;
    if (id) {

      dealerObj = DealerService.getDealerDetail(id);
      dealerInventory = DealerService.getDealerInventory(id);
      dealerRates = DealerService.getDealerClassRates(id);
      $scope.inventory = dealerRates;
      $scope.dealerDetail = dealerObj;
    }


    $scope.themeName = UIService.getPrimaryThemeName();
    // format car class
    // format car class
    $scope.formatCarClass = UIService.formatCarClass;

    /*
     *
     * Reserve Car
     *
     * */
    $scope.reserveCar = function (carObj) {

      var dInventory = $scope.inventory2;

      if (dInventory) {


        for (var i = 0; i < dInventory.length; i++) {
          if (dealerInventory[i].carClass === carObj.carClass) {
            carObj.id = dealerInventory[i].id;
            break;
          }
        }

        var lReservationReqModel = {};
        lReservationReqModel.dealer = dealerObj;
        lReservationReqModel.car = carObj;
        var lSearchModel = SearchService.getCurrentSearchModel();
        if (lSearchModel) {
          lReservationReqModel.fromDate = lSearchModel.fromDate;
          lReservationReqModel.toDate = lSearchModel.toDate;
        }


        ReservationDataService.setCurrentReservationReqModel(lReservationReqModel);

        // determine if user is logged in or not and redirect if not

        if (User.isAuthenticated()) {
          $state.go('reservation');
        }
        else {
          $state.go('login');
        }
        //
      }
    };

  }
]);
/**
 *
 * Dealer Location Controller
 *
 * */
Dealer.controller('DealerDetailLocationController', [
  '$scope',
  '$stateParams',
  'LocationService',
  'DealerService',
  function ($scope, $stateParams, LocationService, DealerService) {

    var currentLocation = {};
    var id = $stateParams.id;


    if (LocationService.getCurrentLocation()) {
      currentLocation = LocationService.getCurrentLocation();
      currentLocation.coords = {};
      currentLocation.coords.latitude = currentLocation.lat;
      currentLocation.coords.longitude = currentLocation.lng;
      currentLocation.options = {
        title: currentLocation.name
      };


    }


    $scope.currentLocation = currentLocation;

    var dealerLocs = [];
    var bounds = new google.maps.LatLngBounds();

    var currentPoint;

    var dealer = DealerService.getDealerDetail(id);


    var marker = {};

    var tLocation = dealer.location.split(',');

    var location = {
      latitude: tLocation[1],
      longitude: tLocation[0],
      name: dealer.name
    };
    currentPoint = new google.maps.LatLng(location.latitude, location.longitude);
    var tMarker = new google.maps.Marker({
      position: currentPoint,
      title: location.name
    });

    bounds.extend(tMarker.position);


    $scope.fit = true;

    $scope.dealerLoc = location;

    var locationHistory = JSON.parse(window.localStorage.getItem('locationHistory'));
    var targetLocation;
    var centerLat = 45, centerLng = -73;
    $scope.searchLocationMarker = {};


    if (locationHistory) {
      targetLocation = locationHistory[0];

      centerLat = targetLocation.lat;
      centerLng = targetLocation.lng;

      $scope.searchLocationMarker = {
        coords: {
          latitude: targetLocation.lat,
          longitude: targetLocation.lng
        },
        options: {
          title: 'you are here'
        }
      };
      $scope.searchLocationMarker.coords = {
        latitude: targetLocation.lat,
        longitude: targetLocation.lng
      };
      $scope.searchLocationMarker.options = {
        title: 'you are here'
      };

    }

    // var mapCenter = map.setCenter(bounds.getCenter());
    var mapCenter = bounds.getCenter();

    angular.extend($scope, {
      map: {
        center: {
          latitude: mapCenter.ob,
          longitude: mapCenter.pb
        },
        zoom: 8,
        bounds: bounds
      }
    });


  }
]);
