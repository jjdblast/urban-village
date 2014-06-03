
angular.module('directives', [])

.directive('getsize', function () {
    var link = function(scope, element, attrs, ngModel) {
        if(!ngModel) return 

        attrs.$observe('ngBindTemplate', function () {
            read()
        })

        read()

        function read() {
            var box = element[0].getBoundingClientRect()
            var size = [box.width, box.height]
            ngModel.$setViewValue(size)
        }
    }
    return {
        require: '?ngModel', // get a hold of NgModelController
        scope: true,
        link: link
    }
})

.directive('vbox', function(){
    function link (scope, element, attrs) {
        attrs.$observe('vbox', function () {
            writte()
        })

        writte()

        function writte() {
            element.attr('viewBox', attrs.vbox)
        }
    }
    return {
        link: link
    }
})