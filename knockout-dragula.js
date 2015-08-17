import ko from "knockout";
import dragula from "dragula";

ko.bindingHandlers.dragula = {
  init: function(element, valueAccessor, allBindingsAccessor, data, context) {
    let items = valueAccessor();

    let templateOptions = {
      foreach: items
    };
    ko.bindingHandlers.template.init(element, function() {
      return templateOptions;
    }, allBindingsAccessor, data, context);

    let drake = dragula([element]);
    drake.on('drop', function(el, target, source) {
      let item = ko.dataFor(el);
      let sourceIndex = items.indexOf(item);
      let targetIndex = Array.from(target.children).indexOf(el);

      items.splice(sourceIndex, 1);
      items.splice(targetIndex, 0, item);
      el.remove();
    });
  },
  update: function(element, valueAccessor, allBindingsAccessor, data, context) {
    let items = valueAccessor();
    let templateOptions = {
      foreach: items
    };

    ko.bindingHandlers.template.update(element, function() {
      return templateOptions;
    }, allBindingsAccessor, data, context);
  }
};
