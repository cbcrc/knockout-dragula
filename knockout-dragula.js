import ko from 'knockout';
import dragula from 'dragula';

const FOREACH_OPTIONS_PROPERTIES = ['afterAdd', 'afterMove', 'afterRender', 'as', 'beforeRemove'];
const LIST_KEY = 'ko_dragula_list';
const AFTER_DROP_KEY = 'ko_dragula_afterDrop';

// Knockout shortcuts
let unwrap = ko.unwrap;
let setData = ko.utils.domData.set;
let getData = ko.utils.domData.get;
let foreachBinding = ko.bindingHandlers.foreach;
let addDisposeCallback = ko.utils.domNodeDisposal.addDisposeCallback;

let groups = [];

function findGroup(name) {
  // For old browsers (without the need for a polyfill), otherwise it could be: return groups.find(group => group.name === name);
  for (let i = 0; i < groups.length; i++) {
    if (groups[i].name === name) {
      return groups[i];
    }
  }
}

function addGroup(name, drake) {
  let group = {
    name, drake
  };
  groups.push(group);
  return group;
}

function addGroupWithOptions(name, options) {
  let drake = dragula(options);
  drake.on('drop', onDrop);
  return addGroup(name, drake);
}

function removeContainer(group, container) {
  let index = group.drake.containers.indexOf(container);
  group.drake.containers.splice(index, 1);

  if (!group.drake.containers.length) {
    destroyGroup(group);
  }
}

function destroyGroup(group) {
  let index = groups.indexOf(group);
  groups.splice(index, 1);
  group.drake.destroy();
}

function createDrake(element) {
  let drake = dragula([element]);
  drake.on('drop', onDrop);
  return drake;
}

function onDrop(el, target, source) {
  let item = ko.dataFor(el);
  let sourceItems = getData(source, LIST_KEY);
  let sourceIndex = sourceItems.indexOf(item);
  let targetItems = getData(target, LIST_KEY);
  let targetIndex = Array.prototype.indexOf.call(target.children, el); // For old browsers (without the need for a polyfill), otherwise it could be: Array.from(target.children).indexOf(el);

  // Remove the element moved by dragula, let Knockout manage the DOM
  el.parentElement.removeChild(el); // For old browsers (without the need for a polyfill), otherwise it could be: el.remove();

  sourceItems.splice(sourceIndex, 1);
  targetItems.splice(targetIndex, 0, item);

  let afterDrop = getData(target, AFTER_DROP_KEY);
  if (afterDrop) {
    afterDrop(item, sourceIndex, sourceItems, targetIndex, targetItems);
  }
}

ko.bindingHandlers.dragula = {
  init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
    let options = unwrap(valueAccessor()) || {};
    let foreachOptions = makeForeachOptions(valueAccessor, options);

    setData(element, LIST_KEY, foreachOptions.data);
    if (options.afterDrop) {
      setData(element, AFTER_DROP_KEY, options.afterDrop);
    }

    foreachBinding.init(element, () => foreachOptions, allBindings, viewModel, bindingContext);

    if (options.group) {
      createOrUpdateDrakeGroup(options.group, element);
    } else {
      let drake = createDrake(element);
      addDisposeCallback(element, () => drake.destroy());
    }

    return {
      controlsDescendantBindings: true
    };
  },
  update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
    let options = unwrap(valueAccessor()) || {};
    let foreachOptions = makeForeachOptions(valueAccessor, options);

    setData(element, LIST_KEY, foreachOptions.data);
    if (options.afterDrop) {
      setData(element, AFTER_DROP_KEY, options.afterDrop);
    }

    foreachBinding.update(element, () => foreachOptions, allBindings, viewModel, bindingContext);
  }
};

function makeForeachOptions(valueAccessor, options) {
  let templateOptions = {
    data: options.data || valueAccessor()
  };

  FOREACH_OPTIONS_PROPERTIES.forEach(function(option) {
    if (options.hasOwnProperty(option)) {
      templateOptions[option] = options[option];
    }
  });

  return templateOptions;
}

function createOrUpdateDrakeGroup(groupName, container) {
  let group = findGroup(groupName);
  if (group) {
    group.drake.containers.push(container);
  } else {
    group = addGroup(groupName, createDrake(container));
  }

  addDisposeCallback(container, () => removeContainer(group, container));
}

export default {
  add: addGroup,
  options: addGroupWithOptions,
  find: findGroup,
  destroy: destroyGroup
};
