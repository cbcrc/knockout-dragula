# knockout-dragula

Simple binding for [Knockout.js](http://knockoutjs.com/) to add drag and drop functionality to `observableArrays` using [dragula](https://github.com/bevacqua/dragula).

## Install

Using bower:
```
bower install knockout-dragula --save
```

## Usage
The `dragula` binding replaces `foreach`:
```html
<div data-bind="dragula: items">
    <div data-bind="text: name"></div>
</div>
```

You can also link multiple containers together by giving them a group name using the `group` option:
```html
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
```html
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

### `bind`
By default `afterDrop` binds to the items [bindingContext](http://knockoutjs.com/documentation/binding-context.html). By setting `bind` you can have it bind to something else in the context. For example the `$parent` which would make sense if you had list like hierarchy with one view-model for the list and one for the items.

Example: Set sort order after drop.

```html
<div id="list" data-bind="dragula: { data: items, afterDrop: afterDrop, bind: '$parent' }">
    <div data-bind="text: name"></div>
</div>
```

ListViewModel implement the afterDrop method:

```JavaScript
class ListViewModel () {
  constructor () {
    this.items = ko.observableArray([]);
  }

  afterDrop () {
    for ([idx, item] of this.items().entries()) {
      item.sortOrder(idx);
    }
  }
}
ko.applyBindings(new ListViewModel(), $('#list'));
```

`this` inside `afterDrop` is now the ListViewModel instance that defines the method. Had we not used `bind:` we could've achieved the same using:

```JavaScript
this.$parent
```
