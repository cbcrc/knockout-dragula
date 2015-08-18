# knockout-dragula

Simple binding for [Knockout.js](http://knockoutjs.com/) to add drag and drop functionality to `observableArrays` using [dragula](https://github.com/bevacqua/dragula).

## Install

Using bower:
```
bower install knockout-dragula --save
```

## Usage
The `dragula` binding replaces `foreach`:
```
<div data-bind="dragula: items">
    <div data-bind="text: name"></div>
</div>
```

You can also link multiple containers together by giving them a group name using the `group` option:
```
<div data-bind="dragula: { data: items1, group: 'test' }">
    <div data-bind="text: name"></div>
</div>
<div data-bind="dragula: { data: items2, group: 'test' }">
    <div data-bind="text: name"></div>
</div>
```

## Additional options
### `afterDrop`
Callback function that is called when an item is dropped into the container. It will not be called if it is dropped into another container of the group, that container needs to specify its own `afterDrop` callback.
```
<div data-bind="dragula: { data: items, afterDrop: afterDrop }">
    <div data-bind="text: name"></div>
</div>
```

The callback gets passed 5 arguments:
* `item`: the object that has been moved.
* `sourceIndex`: The original position of the item in `sourceItems`.
* `sourceItems`: The array from which the item was dragged.
* `targetIndex`: The new position of the item in `targetItems`.
* `targetItems`: The array into which the item was dropped.