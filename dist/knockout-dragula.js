(function (global, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['exports', 'knockout', 'dragula'], factory);
  } else if (typeof exports !== 'undefined') {
    factory(exports, require('knockout'), require('dragula'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.ko, global.dragula);
    global.knockoutDragula = mod.exports;
  }
})(this, function (exports, _knockout, _dragula) {
  'use strict';

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _ko = _interopRequireDefault(_knockout);

  var _dragula2 = _interopRequireDefault(_dragula);

  var FOREACH_OPTIONS_PROPERTIES = ['afterAdd', 'afterRender', 'as', 'beforeRemove', 'includeDestroyed'];
  var LIST_KEY = 'ko_dragula_list';
  var DRAKE_KEY = 'ko_dragula_drake';

  function makeForeachOptions(valueAccessor) {
    var options = _ko['default'].utils.unwrapObservable(valueAccessor()) || {};
    var templateOptions = {
      data: options.data || valueAccessor()
    };

    FOREACH_OPTIONS_PROPERTIES.forEach(function (option) {
      if (options.hasOwnProperty(option)) {
        templateOptions[option] = options[option];
      }
    });

    return templateOptions;
  }

  function initDragula(element) {
    var drake = (0, _dragula2['default'])([element]);
    drake.on('drop', onDrop);
    _ko['default'].utils.domData.set(element, DRAKE_KEY, drake);

    _ko['default'].utils.domNodeDisposal.addDisposeCallback(element, function () {
      drake.destroy();
    });
  }

  function onDrop(el, target, source) {
    var item = _ko['default'].dataFor(el);
    var sourceItems = _ko['default'].utils.domData.get(source, LIST_KEY);
    var sourceIndex = sourceItems.indexOf(item);
    var targetItems = _ko['default'].utils.domData.get(target, LIST_KEY);
    var targetIndex = Array.prototype.indexOf.call(target.children, el);

    el.remove();
    sourceItems.splice(sourceIndex, 1);
    targetItems.splice(targetIndex, 0, item);
  }

  function linkContainers(originalContainer, newContainer) {
    var drake = _ko['default'].utils.domData.get(originalContainer, DRAKE_KEY);
    if (!drake) {
      return;
    }

    drake.containers.push(newContainer);

    _ko['default'].utils.domNodeDisposal.addDisposeCallback(newContainer, function () {
      var index = drake.containers.indexOf(newContainer);
      drake.containers.splice(index, 1);
    });
  }

  _ko['default'].bindingHandlers.dragula = {
    init: function init(element, valueAccessor, allBindings, viewModel, bindingContext) {
      var options = _ko['default'].utils.unwrapObservable(valueAccessor()) || {};
      var foreachOptions = makeForeachOptions(valueAccessor);

      _ko['default'].utils.domData.set(element, LIST_KEY, foreachOptions.data);

      _ko['default'].bindingHandlers.foreach.init(element, function () {
        return foreachOptions;
      }, allBindings, viewModel, bindingContext);

      if (options.linkTo) {
        linkContainers(options.linkTo, element);
      } else {
        initDragula(element);
      }

      return {
        controlsDescendantBindings: true
      };
    },
    update: function update(element, valueAccessor, allBindings, viewModel, bindingContext) {
      var foreachOptions = makeForeachOptions(valueAccessor);

      _ko['default'].utils.domData.set(element, LIST_KEY, foreachOptions.data);

      _ko['default'].bindingHandlers.foreach.update(element, function () {
        return foreachOptions;
      }, allBindings, viewModel, bindingContext);
    }
  };
});
