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