angular.module("myApp")
    .directive('scrollBottom', function() {
        return {
            scope: {
                scrollBottom: "="
            },
            link: function(scope, elm) {
                scope.$watchCollection('scrollBottom', function(newValue) {
                    if (newValue) {
                    	angular.element(elm)[0].scrollTop = angular.element(elm)[0].scrollHeight;
                    }
                });
            }
        }
    });
