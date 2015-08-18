(function (global, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['exports', 'module', 'knockout', 'dragula'], factory);
  } else if (typeof exports !== 'undefined' && typeof module !== 'undefined') {
    factory(exports, module, require('knockout'), require('dragula'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, mod, global.ko, global.dragula);
    global.knockoutDragula = mod.exports;
  }
})(this, function (exports, module, _knockout, _dragula) {
  'use strict';

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _ko = _interopRequireDefault(_knockout);

  var _dragula2 = _interopRequireDefault(_dragula);

  var FOREACH_OPTIONS_PROPERTIES = ['afterAdd', 'afterMove', 'afterRender', 'as', 'beforeRemove'];
  var LIST_KEY = 'ko_dragula_list';
  var AFTER_DROP_KEY = 'ko_dragula_afterDrop';
  var AFTER_DELETE_KEY = 'ko_dragula_afterDelete';

  // Knockout shortcuts
  var unwrap = _ko['default'].unwrap;
  var setData = _ko['default'].utils.domData.set;
  var getData = _ko['default'].utils.domData.get;
  var foreachBinding = _ko['default'].bindingHandlers.foreach;
  var addDisposeCallback = _ko['default'].utils.domNodeDisposal.addDisposeCallback;

  var groups = [];

  function findGroup(name) {
    // For old browsers (without the need for a polyfill), otherwise it could be: return groups.find(group => group.name === name);
    for (var i = 0; i < groups.length; i++) {
      if (groups[i].name === name) {
        return groups[i];
      }
    }
  }

  function addGroup(name, drake) {
    var group = {
      name: name, drake: drake
    };
    groups.push(group);
    return group;
  }

  function addGroupWithOptions(name, options) {
    var drake = (0, _dragula2['default'])(options);
    registerEvents(drake);
    return addGroup(name, drake);
  }

  function registerEvents(drake) {
    drake.on('drop', onDrop);
    drake.on('remove', onRemove);
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

  function createDrake(element) {
    var drake = (0, _dragula2['default'])([element]);
    registerEvents(drake);
    return drake;
  }

  function onDrop(el, target, source) {
    var item = _ko['default'].dataFor(el);
    var sourceItems = getData(source, LIST_KEY);
    var sourceIndex = sourceItems.indexOf(item);
    var targetItems = getData(target, LIST_KEY);
    var targetIndex = Array.prototype.indexOf.call(target.children, el); // For old browsers (without the need for a polyfill), otherwise it could be: Array.from(target.children).indexOf(el);

    // Remove the element moved by dragula, let Knockout manage the DOM
    target.removeChild(el);

    sourceItems.splice(sourceIndex, 1);
    targetItems.splice(targetIndex, 0, item);

    var afterDrop = getData(target, AFTER_DROP_KEY);
    if (afterDrop) {
      afterDrop(item, sourceIndex, sourceItems, targetIndex, targetItems);
    }
  }

  function onRemove(el, container) {
    var item = _ko['default'].dataFor(el);
    var sourceItems = getData(container, LIST_KEY);
    var sourceIndex = sourceItems.indexOf(item);

    sourceItems.splice(sourceIndex, 1);

    var afterDelete = getData(container, AFTER_DELETE_KEY);
    if (afterDelete) {
      afterDelete(item, sourceIndex, sourceItems);
    }
  }

  _ko['default'].bindingHandlers.dragula = {
    init: function init(element, valueAccessor, allBindings, viewModel, bindingContext) {
      var options = unwrap(valueAccessor()) || {};
      var foreachOptions = makeForeachOptions(valueAccessor, options);

      setData(element, LIST_KEY, foreachOptions.data);
      setData(element, AFTER_DROP_KEY, options.afterDrop);
      setData(element, AFTER_DELETE_KEY, options.afterDelete);

      foreachBinding.init(element, function () {
        return foreachOptions;
      }, allBindings, viewModel, bindingContext);

      if (options.group) {
        createOrUpdateDrakeGroup(options.group, element);
      } else {
        (function () {
          var drake = createDrake(element);
          addDisposeCallback(element, function () {
            return drake.destroy();
          });
        })();
      }

      return {
        controlsDescendantBindings: true
      };
    },
    update: function update(element, valueAccessor, allBindings, viewModel, bindingContext) {
      var options = unwrap(valueAccessor()) || {};
      var foreachOptions = makeForeachOptions(valueAccessor, options);

      setData(element, LIST_KEY, foreachOptions.data);
      setData(element, AFTER_DROP_KEY, options.afterDrop);
      setData(element, AFTER_DELETE_KEY, options.afterDelete);

      foreachBinding.update(element, function () {
        return foreachOptions;
      }, allBindings, viewModel, bindingContext);
    }
  };

  function makeForeachOptions(valueAccessor, options) {
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

  function createOrUpdateDrakeGroup(groupName, container) {
    var group = findGroup(groupName);
    if (group) {
      group.drake.containers.push(container);
    } else {
      group = addGroup(groupName, createDrake(container));
    }

    addDisposeCallback(container, function () {
      return removeContainer(group, container);
    });
  }

  module.exports = {
    add: addGroup,
    options: addGroupWithOptions,
    find: findGroup,
    destroy: destroyGroup
  };
});
