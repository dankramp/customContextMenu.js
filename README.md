# customContextMenu.js
This plugin allows the user to create custom context menus quickly and easily. Created by Daniel Kramp 2017.

See the [example page](http://rawgit.com/DANKRAMP/customContextMenu.js/master/fullTest.html) for a sample of how the plugin works.

## Features
### Quick and Simple to Begin
If you are looking to add a custom context menu as fast as possible, this plugin will do most of the grunt work for you. All you need to do is specify which element you want to launch the menu on when right-clicked and what will be in the menu - and that's it! It's really that simple! 

This is what creating a custom context menu from scratch might look like:
```
var customContext = new customContext({
  target: "elementID",
  menu: [
    {
      text: "Option 1",
      onClick: function() {alert("Option 1 clicked")}
    },
    {
      text: "Option 2",
      onClick: function() {alert("Option 2 clicked")}
    }
  ]
});
```        

### Supports Multiple Menus
With this plugin, you can add a unique context menu to each element and control each individually. You can add a new context menu at any time similar to the constructor seen above:
```
customContext.addContextMenu({
  target: "newElementID",
  menu: "menuID"  
});
```
By default, context menus are set to enabled when loaded but can be easily disabled at any time by using `customContext.disableTarget(target)`.
Additionally, you can entirely remove a context menu from the plugin or the DOM with `customContext.clearContextMenu(target, removeFromDOM)`

### Flexible and Customizable
The user can use the default stylings for the context menu or specify their own. A custom style class could be added to a menu by including 'style' as seen below:
```
var customContext = new customContext({
  target: "elementID",
  menu: "menuID",
  style: "customStyleClassName"
});
```
In addition, each menu item can be constructed with a multitude of values, such as __text, onClick, style,__ and __id__ for maximum customization abilities.

## How To Use:
Clone repo and copy *customContextMenu.js* into necessary folder. See example files and source code for usage. 
