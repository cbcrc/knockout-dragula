import ko from 'knockout';
import dragula from 'dragula';

const FOREACH_OPTIONS_PROPERTIES = ['afterAdd', 'afterMove', 'afterRender', 'as', 'beforeRemove'];
const LIST_KEY = 'ko_dragula_list';
const AFTER_DROP_KEY = 'ko_dragula_afterDrop';
const AFTER_DELETE_KEY = 'ko_dragula_afterDelete';

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
  registerEvents(drake);
  return addGroup(name, drake);
}

function registerEvents(drake) {
  drake.on('drop', onDrop);
  drake.on('remove', onRemove);
  drake.on('cancel', onCancel);
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

function createDrake(element, options) {
  let drake = dragula([element], options);
  registerEvents(drake);
  return drake;
}

function onDrop(el, target, source) {
  let item = ko.dataFor(el);
  let sourceItems = getData(source, LIST_KEY);
  let sourceIndex = sourceItems.indexOf(item);
  let targetItems = getData(target, LIST_KEY);
  let targetIndex = Array.prototype.indexOf.call(target.children, el); // For old browsers (without the need for a polyfill), otherwise it could be: Array.from(target.children).indexOf(el);

  // Remove the element moved by dragula, let Knockout manage the DOM
  target.removeChild(el);

  sourceItems.splice(sourceIndex, 1);
  targetItems.splice(targetIndex, 0, item);

  let afterDrop = getData(target, AFTER_DROP_KEY);
  if (afterDrop) {
    afterDrop(item, sourceIndex, sourceItems, targetIndex, targetItems);
  }
}

function onRemove(el, container) {
  let item = ko.dataFor(el);
  let sourceItems = getData(container, LIST_KEY);
  let sourceIndex = sourceItems.indexOf(item);

  sourceItems.splice(sourceIndex, 1);

  let afterDelete = getData(container, AFTER_DELETE_KEY);
  if (afterDelete) {
    afterDelete(item, sourceIndex, sourceItems);
  }
}

function onCancel(el, container) {
  let item = ko.dataFor(el);
  let sourceItems = getData(container, LIST_KEY);
  let sourceIndex = sourceItems.indexOf(item);

  // Remove the element added by dragula, let Knockout manage the DOM
  container.removeChild(el);

  // Remove and re-add the item to froce knockout to re-render it
  sourceItems.splice(sourceIndex, 1);
  sourceItems.splice(sourceIndex, 0, item);
}

ko.bindingHandlers.dragula = {
  init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
    let options = unwrap(valueAccessor()) || {};
    let foreachOptions = makeForeachOptions(valueAccessor, options);

    setData(element, LIST_KEY, foreachOptions.data);
    setData(element, AFTER_DROP_KEY, options.afterDrop);
    setData(element, AFTER_DELETE_KEY, options.afterDelete);

    foreachBinding.init(element, () => foreachOptions, allBindings, viewModel, bindingContext);

    if (options.group) {
      createOrUpdateDrakeGroup(element, options);
    } else {
      let drake = createDrake(element, options);
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
    setData(element, AFTER_DROP_KEY, options.afterDrop);
    setData(element, AFTER_DELETE_KEY, options.afterDelete);

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

function createOrUpdateDrakeGroup(container, options) {
  let group = findGroup(options.group);
  if (group) {
    group.drake.containers.push(container);
  } else {
    group = addGroup(options.group, createDrake(container, options));
  }

  addDisposeCallback(container, () => removeContainer(group, container));
}

export default {
  add: addGroup,
  options: addGroupWithOptions,
  find: findGroup,
  destroy: destroyGroup
};
