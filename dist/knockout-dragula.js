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

  var FOREACH_OPTIONS_PROPERTIES = ['afterAdd', 'afterRender', 'as', 'beforeRemove'];
  var LIST_KEY = 'ko_dragula_list';
  var groups = [];

  _ko['default'].bindingHandlers.dragula = {
    invalidTarget: function invalidTarget(el) {
      return el.tagName === 'BUTTON' || el.tagName === 'A';
    },
    init: function init(element, valueAccessor, allBindings, viewModel, bindingContext) {
      var options = _ko['default'].utils.unwrapObservable(valueAccessor()) || {};
      var foreachOptions = makeForeachOptions(valueAccessor);

      _ko['default'].utils.domData.set(element, LIST_KEY, foreachOptions.data);

      _ko['default'].bindingHandlers.foreach.init(element, function () {
        return foreachOptions;
      }, allBindings, viewModel, bindingContext);

      if (options.group) {
        createOrUpdateDrakeGroup(element, options.group, options);
      } else {
        (function () {
          var drake = createDrake(element, options);
          _ko['default'].utils.domNodeDisposal.addDisposeCallback(element, function () {
            return drake.destroy();
          });
        })();
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

  function makeForeachOptions(valueAccessor) {
    var options = _ko['default'].unwrap(valueAccessor()) || {};
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

  function createOrUpdateDrakeGroup(element, groupName, options) {
    var group = findGroup(groupName);
    if (group) {
      group.drake.containers.push(element);
    } else {
      group = addGroup(groupName, createDrake(element, options));
    }

    _ko['default'].utils.domNodeDisposal.addDisposeCallback(element, function () {
      return removeContainer(group, element);
    });
  }

  function findGroup(name) {
    // For old browsers (without the need for a polyfill), otherwise it could be: return groups.find(group => group.name === name);
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = groups[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var group = _step.value;

        if (group.name === name) {
          return group;
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator['return']) {
          _iterator['return']();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  }

  function addGroup(name, drake) {
    var group = { name: name, drake: drake };
    groups.push(group);
    return group;
  }

  function removeContainer(group, container) {
    var index = group.drake.containers.indexOf(container);
    group.drake.containers.splice(index, 1);

    if (!group.drake.containers.length) {
      destroyGroup(group);
    }
  }

  function destroyGroup(group) {
    var index = groups.indexOf(group);
    groups.splice(index, 1);
    group.drake.destroy();
  }

  function createDrake(element, options) {
    var drake = (0, _dragula2['default'])([element], {
      invalid: _ko['default'].bindingHandlers.dragula.invalidTarget
    });
    drake.on('drop', onDrop.bind(drake, options));

    return drake;
  }

  function onDrop(options, el, target, source) {
    var item = _ko['default'].dataFor(el);
    var sourceItems = _ko['default'].utils.domData.get(source, LIST_KEY);
    var sourceIndex = sourceItems.indexOf(item);
    var targetItems = _ko['default'].utils.domData.get(target, LIST_KEY);
    var targetIndex = Array.prototype.indexOf.call(target.children, el); // For old browsers (without the need for a polyfill), otherwise it could be: Array.from(target.children).indexOf(el);

    // Remove the element moved by dragula, let Knockout manage the DOM
    el.parentElement.removeChild(el); // For old browsers (without the need for a polyfill), otherwise it could be: el.remove();

    sourceItems.splice(sourceIndex, 1);
    targetItems.splice(targetIndex, 0, item);

    if (options.afterMove) {
      options.afterMove(item, sourceIndex, sourceItems, targetIndex, targetItems);
    }
  }
});
