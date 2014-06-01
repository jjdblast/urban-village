/////////////
describe('Service getMouse', function () {

  // definitions
  var getMouse, eventMock

  beforeEach(module('app'))
  beforeEach(inject(function($injector){
    getMouse = $injector.get('getMouse')
    eventMock = {
      target: document.createElement('div'),
      clientX: 10,
      clientY: 10,
    }
  }))

  // test
  it('should be defined', function() {
    expect(getMouse).toBeDefined()
  })
  it('should return [10,10]', function() {
    expect(getMouse(eventMock)).toEqual([10,10])
  })

})

/////////////
describe('Service transform', function () {

  // definitions
  var transform, dataMock

  beforeEach(module('app'))
  beforeEach(inject(function($injector){
    transform = $injector.get('transform')
    dataMock = [
      {
        amount: 11,
        pop: 1,
        degrees: [
          {
            degree: 1,
            avgClustCoeff: .5,
            amount: 1
          },
          {
            degree: 2,
            avgClustCoeff: .5,
            amount: 10
          }
        ]
      },
      {
        amount: 11,
        pop: 10,
        degrees: [
          {
            degree: 1,
            avgClustCoeff: .5,
            amount: 110
          },
          {
            degree: 2,
            avgClustCoeff: .5,
            amount: 10
          }
        ]
      }
    ]
  }))

  // test
  it('should be defined', function() {
    expect(transform).toBeDefined()
  })
  it('should filter degrees with amount > 1', function () {
    var tData = transform(dataMock)
    expect(tData[0].degrees.length).toEqual(1)
  })
  it('should compute maxDegree', function () {
    var tData = transform(dataMock)
    expect(tData[0].maxDegree).toEqual(2)
  })

})