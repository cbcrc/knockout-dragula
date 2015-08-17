'use strict';

import ko from 'knockout';
import dragula from 'dragula';

function makeTemplateOptions(valueAccessor) {
  let templateOptions = {
    foreach: valueAccessor()
  };

  return () => templateOptions;
}

ko.bindingHandlers.dragula = {
  init: function(element, valueAccessor, allBindingsAccessor, data, context) {
    let items = valueAccessor();

    ko.bindingHandlers.template.init(element, makeTemplateOptions(valueAccessor), allBindingsAccessor, data, context);

    let drake = dragula([element]);
    drake.on('drop', function(el, target /*, source*/ ) {
      let item = ko.dataFor(el);
      let sourceIndex = items.indexOf(item);
      let targetIndex = Array.prototype.indexOf.call(target.children, el);

      items.splice(sourceIndex, 1);
      items.splice(targetIndex, 0, item);
      el.remove();
    });

    ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
      drake.destroy();
    });
  },
  update: function(element, valueAccessor, allBindingsAccessor, data, context) {
    ko.bindingHandlers.template.update(element, makeTemplateOptions(valueAccessor), allBindingsAccessor, data, context);
  }
};
