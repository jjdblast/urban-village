/* jasmine specs for controllers go here */

describe('mainCtrl', function(){
  var $httpBackend, $scope, ctrl;

  beforeEach(module('app'))
  beforeEach(inject(function($injector){
    $scope = $injector.get('$rootScope').$new()
    // The $controller service is used to create instances of controllers
    var $controller = $injector.get('$controller');

    ctrl = $controller('mainCtrl', {'$scope' : $scope })

  }))

  it('should be defined', inject(function($controller) {
    expect(ctrl).toBeDefined()
  }))
})