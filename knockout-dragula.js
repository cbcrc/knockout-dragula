'use strict';

import ko from 'knockout';
import dragula from 'dragula';

const FOREACH_OPTIONS_PROPERTIES = ['afterAdd', 'afterRender', 'as', 'beforeRemove'];
const LIST_KEY = 'ko_dragula_list';
let groups = [];

ko.bindingHandlers.dragula = {
  invalidTarget: function(el) {
    return el.tagName === 'BUTTON' || el.tagName === 'A';
  },
  init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
    let options = ko.utils.unwrapObservable(valueAccessor()) || {};
    let foreachOptions = makeForeachOptions(valueAccessor);

    ko.utils.domData.set(element, LIST_KEY, foreachOptions.data);

    ko.bindingHandlers.foreach.init(element, () => foreachOptions, allBindings, viewModel, bindingContext);

    if (options.group) {
      createOrUpdateDrakeGroup(element, options.group, options);
    } else {
      let drake = createDrake(element, options);
      ko.utils.domNodeDisposal.addDisposeCallback(element, () => drake.destroy());
    }

    return {
      controlsDescendantBindings: true
    };
  },
  update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
    let foreachOptions = makeForeachOptions(valueAccessor);

    ko.utils.domData.set(element, LIST_KEY, foreachOptions.data);

    ko.bindingHandlers.foreach.update(element, () => foreachOptions, allBindings, viewModel, bindingContext);
  }
};

function makeForeachOptions(valueAccessor) {
  let options = ko.unwrap(valueAccessor()) || {};
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

function createOrUpdateDrakeGroup(element, groupName, options) {
  let group = findGroup(groupName);
  if (group) {
    group.drake.containers.push(element);
  } else {
    group = addGroup(groupName, createDrake(element, options));
  }

  ko.utils.domNodeDisposal.addDisposeCallback(element, () => removeContainer(group, element));
}

function findGroup(name) {
  // For old browsers (without the need for a polyfill), otherwise it could be: return groups.find(group => group.name === name);
  for (let group of groups) {
    if (group.name === name) {
      return group;
    }
  }
}

function addGroup(name, drake) {
  let group = { name, drake };
  groups.push(group);
  return group;
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
  let drake = dragula([element], {
    invalid: ko.bindingHandlers.dragula.invalidTarget
  });
  drake.on('drop', onDrop.bind(drake, options));

  return drake;
}

function onDrop(options, el, target, source) {
  let item = ko.dataFor(el);
  let sourceItems = ko.utils.domData.get(source, LIST_KEY);
  let sourceIndex = sourceItems.indexOf(item);
  let targetItems = ko.utils.domData.get(target, LIST_KEY);
  let targetIndex = Array.prototype.indexOf.call(target.children, el); // For old browsers (without the need for a polyfill), otherwise it could be: Array.from(target.children).indexOf(el);

  // Remove the element moved by dragula, let Knockout manage the DOM
  el.parentElement.removeChild(el); // For old browsers (without the need for a polyfill), otherwise it could be: el.remove();

  sourceItems.splice(sourceIndex, 1);
  targetItems.splice(targetIndex, 0, item);

  if (options.afterMove) {
    options.afterMove(item, sourceIndex, sourceItems, targetIndex, targetItems);
  }
}
