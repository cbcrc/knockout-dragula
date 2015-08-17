(function(ko) {
  'use strict';

  var viewModel = {
    items: ko.observableArray([{
      name: 'Item A'
    }, {
      name: 'Item B'
    }, {
      name: 'Item C'
    }, {
      name: 'Item D'
    }])
  };

  ko.applyBindings(viewModel);
})(window.ko);
