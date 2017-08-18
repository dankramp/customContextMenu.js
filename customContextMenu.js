;(function(undefined) {
	"use strict;"

	//var allContextMenus = {},
	//enabledTargetIDs = {},
	//visibleContextMenu = undefined;
/**
* Constructor for customContext object
* @param {object} config - Takes the following parameters:
*   target (required): The DOM element or ID of a DOM element on which to launch the context menu
*   menu (required): The DOM element of an unordered list or an array of list items
*   style (optional): The style class of the list
*/
var customContext = function(config) {
	// Public variables
	this.allContextMenus = {};
	this.enabledTargetIDs = {};
	this.visibleContextMenu = undefined;

	// Private variables
	var self = this,
	styleDOM = document.createElement('style');

	// Initialize style sheet with default list style
	styleDOM.type = 'text/css';
	styleDOM.innerHTML = ".customContextMenu {" + 
		"z-index: 1;" +
		"position: absolute;" + 
		"background-color: #ffffff;" +
		"border: 1px solid #dfdfdf;" +
		"display: block;" +
		"margin: 0;" +
		"list-style-type: none;" +
		"list-style-position: inside;" +       		
		"padding-left: 0;" +
		"min-height: 20px;" +
		"min-width: 200px;" +
		"}" +
		".customContextMenu li {" +
		"display: block;" +
		"padding: 8px 20px 8px 10px;" +
		"color: #4f4f4f;" +
		"}" + 
		".customContextMenu li:hover {" +
		"background-color: #dfdfdf;" +
		"text-decoration: none;" +
		"cursor: default;" +
		"}";
	document.head.appendChild(styleDOM);

	// Verify that the provided object is an array
	if (config) {
		if (!config.constructor === Array || !config.length)
			throw "Configuration must be an array with at least one item";
		else 
			for (var i = 0, l = config.length; i < l; i++) {
				this.addContextMenu(config[i]);
			}
	}
		
	// Add the event listener to the body to close the context menus
	document.body.addEventListener('click', function(event) {
		self.hideContextMenu();
	});
}

/**
* Displays the context menu at the coordinates provided in event
* 
* @param {HTMLElement} menu - The DOM element containing the menu (ol)
* @param {object} point - The point where the menu should be displayed
*/
customContext.prototype.displayContextMenu = function(menu, point) {
	if (this.visibleContextMenu) {
		this.visibleContextMenu.style.display = "none";
	}
	menu.style.top = point.y;
	menu.style.left = point.x;
	menu.style.display = "block";
	this.visibleContextMenu = menu;
}

/**
* Hides the currently displayed context menu
*/
customContext.prototype.hideContextMenu = function() {
	if (this.visibleContextMenu) {
		this.visibleContextMenu.style.display = "none";
		this.visibleContextMenu = undefined;
	}
}

/**
* 
* Adds a new context menu. The following items may be contained in obj:
*
* 	{array|HTMLElement} menu - The menu element. May be a DOM reference or 
*                              an array of objects with the following fields:                 
*       {?string} text - The text to be displayed inline. Defaults to "".
*       {?function} onClick - The onClick function to be applied to the list item.
*
* 	{string|HTMLElement} target - The target DOM Element that will deploy the context menu.
*                                 May be the string ID of the element or the element itself.
*   {?string} style - The style class of the context menu. If not provided, the
*                     default styling class is used.
*
* @param {object} obj - The object containing the context menu data
* @return {object} An object containing the properly formatted data
*/
customContext.prototype.addContextMenu = function(obj) {
	var menu = obj['menu'],
	style = obj['style'],
	target = obj['target']
	self = this;
	
	/** INITIALIZE MENU DOM OBJECT **/
	if (!menu)
		throw "Menu object must be provided";
	if (menu.constructor === Array && menu.length) { // Array of menu items provided
		var menuDom = document.createElement("UL"),
		listItem,
		listText;
		for (var i = 0, l = menu.length; i < l; i++) {			
			listItem = document.createElement("LI");
			listText = document.createTextNode(menu[i].text || "");
			listItem.appendChild(listText);
			if (typeof menu[i].onClick === 'function')
				listItem.addEventListener('click', menu[i].onClick, false);
			menuDom.appendChild(listItem); 
		}
		menu = menuDom;
	}
	if (!menu instanceof HTMLElement) {
		throw "Invalid menu object";
	}
	document.body.appendChild(menu);
	menu.style.display = "none";


	/** INITIALIZE STYLE **/
	if (typeof style === 'string') // String class is provided
		menu.className = style;
	else // Use default style class
	    menu.className = "customContextMenu";


	/** INITIALIZE TARGET **/
	if (typeof target === 'string')
		target = document.getElementById(target);
	if (!target instanceof HTMLElement || target == null)
		throw "Invalid target";
	target.addEventListener('contextmenu', self.contextEventHandler.bind(self), true);

	var formattedMenu = {
		menu: menu,
		target: target,
		style: menu.className
	};

	self.allContextMenus[target.id] = formattedMenu;
	self.enabledTargetIDs[target.id] = true;
	return formattedMenu;
}

customContext.prototype.contextEventHandler = function(event) {
	event.preventDefault();
	this.displayContextMenu(
		this.allContextMenus[event.target.id].menu,
		{x: event.clientX, y: event.clientY} );
}

/**
* Enables context menu on provided target
* @param {string|HTMLElement} target - The string ID or DOM reference of the target
*/
customContext.prototype.enableTarget = function(target) {
	var self = this;
	if (typeof target === 'string')
		target = document.getElementById(target);
	if (!target instanceof HTMLElement || target == null)
		throw "Invalid target";
	if (!this.enabledTargetIDs[target.id])
		target.addEventListener('contextmenu', self.contextEventHandler.bind(self), true);
	this.enabledTargetIDs[target.id] = true;
}

/**
* Disables context menu on provided target
* @param {string|HTMLElement} target - The string ID or DOM reference of the target
*/
customContext.prototype.disableTarget = function(target) {
	console.log("Disabling " + target);
	var self = this;
	if (typeof target === 'string')
		target = document.getElementById(target);
	if (!target instanceof HTMLElement || target == null)
		throw "Invalid target";

	if (this.enabledTargetIDs[target.id]) {
		target.removeEventListener('contextmenu', self.contextEventHandler.bind(self), true);
		console.log("Removed listener");
		console.log(target);
	}
	delete this.enabledTargetIDs[target.id];
}

	this.customContext = customContext;

}).call(this);