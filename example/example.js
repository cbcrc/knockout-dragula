(function(ko) {
  'use strict';

  var viewModel = {
    items1: ko.observableArray([{
      name: 'Item A'
    }, {
      name: 'Item B'
    }, {
      name: 'Item C'
    }, {
      name: 'Item D'
    }]),
    items2: ko.observableArray([{
      name: 'Item 1'
    }, {
      name: 'Item 2'
    }, {
      name: 'Item 3'
    }, {
      name: 'Item 4'
    }]),
    afterMove: function(item, sourceIndex, sourceItems, targetIndex, targetItems) {
      console.log(item);
      console.log(sourceIndex);
      console.log(sourceItems);
      console.log(targetIndex);
      console.log(targetItems);
    }
  };

  ko.applyBindings(viewModel);
})(window.ko);
