// jasmine specs for controllers

describe('mainVisCtrl', function(){

  // definitions
  var $httpBackend, $scope, ctrl; 

  beforeEach(module('app'))
  beforeEach(inject(function($injector){
    $scope = $injector.get('$rootScope').$new()
    var $controller = $injector.get('$controller');
    ctrl = $controller('mainVisCtrl', {'$scope' : $scope })
  }))

  // tests
  it('should be defined', function() {
    expect(ctrl).toBeDefined()
  })
  it('main variabels should be defined', function() {
    expect($scope.width).toBeDefined()
    expect($scope.height).toBeDefined()
    expect($scope.margin).toBeDefined()
  })
  it('wrpStyle padding bottom should be grater than 0', function() {
    expect($scope.svgHeight/$scope.svgWidth*100).toBeGreaterThan(0)
  })

})