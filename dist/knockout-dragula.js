(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "knockout", "dragula"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("knockout"), require("dragula"));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.ko, global.dragula);
    global.knockoutDragula = mod.exports;
  }
})(this, function (exports, _knockout, _dragula) {
  "use strict";

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

  var _ko = _interopRequireDefault(_knockout);

  var _dragula2 = _interopRequireDefault(_dragula);

  _ko["default"].bindingHandlers.dragula = {
    init: function init(element, valueAccessor, allBindingsAccessor, data, context) {
      var items = valueAccessor();

      var templateOptions = {
        foreach: items
      };
      _ko["default"].bindingHandlers.template.init(element, function () {
        return templateOptions;
      }, allBindingsAccessor, data, context);

      var drake = (0, _dragula2["default"])([element]);
      drake.on('drop', function (el, target, source) {
        var item = _ko["default"].dataFor(el);
        var sourceIndex = items.indexOf(item);
        var targetIndex = Array.from(target.children).indexOf(el);

        items.splice(sourceIndex, 1);
        items.splice(targetIndex, 0, item);
        el.remove();
      });
    },
    update: function update(element, valueAccessor, allBindingsAccessor, data, context) {
      var items = valueAccessor();
      var templateOptions = {
        foreach: items
      };

      _ko["default"].bindingHandlers.template.update(element, function () {
        return templateOptions;
      }, allBindingsAccessor, data, context);
    }
  };
});
