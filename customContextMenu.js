;(function(undefined) {
	"use strict;"

	// Public variables
	var allContextMenus = {}, // Indexes all context menus by target ID
	enabledTargetIDs = {}, // Indexes enable state by target ID
	visibleContextMenu = undefined, // Contains reference to visible menu
	self = undefined; // References this instance


	/**
	*
	*
	* Constructor for customContext object
	*
	* 
	* @param {?object|Array} config - An object or an array of objects containing
	*                           context menus. See 'addContextMenu()' and examples
	*                           for accepted parameters.
	*/
	var customContext = function(config) {
		self = this;

		// Initialize style sheet with default context menu style
		var styleDOM = document.createElement('style');
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
		document.head.insertBefore(styleDOM, document.head.childNodes[0]);

		// Verify config object
		if (config) {
			if (!config.constructor === Array || !config.length) { // If config is not an array
				if (typeof config !== 'object') // Not an object either; invalid
					throw "error: Configuration must be an object or an array with at least one item";
				else // config is an object; convert to an array containing itself
					config = [config];
			}
			for (var i = 0, l = config.length; i < l; i++)
				this.addContextMenu(config[i]);
		}
			
		// Add the event listener to the body to close the context menus
		document.body.addEventListener('click', self.hideContextMenu);
	}

	/**
	* 
	* Adds a new context menu. The following items may be contained in obj:
	*
	* 	{array|string|HTMLElement} menu - The menu element. May be a DOM element, a string ID, 
	*                                     or an array of objects with the following fields:                 
	*       {?string} text - The text to be displayed inline. Defaults to "".
	*       {?function} onClick - The onClick function to be applied to the list item.
	*       {?string} style - The style of the specific list item.
	*
	* 	{string|HTMLElement} target - The target DOM Element that will deploy the context menu.
	*                                 May be the string ID of the element or the element itself.
	*   {?string} style - The style class of the context menu. If not provided, the
	*                     default styling class is used.
	*
	* @param {object} obj - The object containing the context menu data
	* @returna {object} An object containing the properly formatted data
	*/
	customContext.prototype.addContextMenu = function(obj) {
		// Local variables
		var menu = obj['menu'],
		style = obj['style'],
		target = obj['target'];
		
		/** INITIALIZE MENU DOM OBJECT **/
		// Menu can either reference a DOM object or be provided as an array of items
		if (!menu)
			throw "error: Menu object must be provided";
		if (menu.constructor === Array && menu.length) { // Array of menu items provided
			// Creates unordered list and adds all list items
			var menuDom = document.createElement("UL"),
			listItem,
			listText;
			for (var i = 0, l = menu.length; i < l; i++) {			
				listItem = document.createElement("LI");
				listText = document.createTextNode(menu[i].text || "");
				listItem.appendChild(listText);
				if (typeof menu[i].onClick === 'function') // If valid onClick function is provided
					listItem.addEventListener('click', menu[i].onClick, false);
				if (typeof menu[i].style === 'string') // If string style is provided
					listItem.style = menu[i].style;
				if (typeof menu[i].id === 'string') // If string ID is provided
					listItem.id = menu[i].id;
				menuDom.appendChild(listItem); 
			}
			menu = menuDom;
			document.body.appendChild(menu);
		}
		else {
			menu = toDOM(menu);
		}
		/*
		else if (!menu instanceof HTMLElement) {
			throw "error: Invalid menu object";
		}*/
		
		menu.style.display = "none";


		/** INITIALIZE STYLE **/
		if (typeof style === 'string') { // String class is provided
			if (style != "") // An empty string class allows user to not assign any style class
				menu.className = style;
		}
		else // Use default style class
			menu.className = "customContextMenu";


		/** INITIALIZE TARGET **/
		target = self.enableTarget(target);
		if (!target.id || target.id == "")
			throw "error: All targets must have an ID";
		if (allContextMenus[target.id])
			throw "error: Target with this ID already exists";

		var formattedMenu = {
			menu: menu,
			target: target,
			style: menu.className
		};

		allContextMenus[target.id] = formattedMenu;
		return formattedMenu;
	}

	/**
	* Converts a string to DOM element and/or verifies that element exists
	* @param {string|object} o - The HTMLElement or string to be checked
	* @returns {HTMLElement} The corresponding HTMLElement
	*/
	function toDOM(o) {
		if (typeof o === 'string')
			o = document.getElementById(o);
		if (!o instanceof HTMLElement || o == null)
			throw "error: Invalid DOM element";

		return o;
	}

	/**
	* PRIVATE: Displays the corresponding context menu if enabled
	* @param {object} event - The contextmenu event that was called
	*/
	function contextEventHandler(event) {
		if (enabledTargetIDs[this.id]) {
			event.preventDefault();
			self.displayContextMenu(
				allContextMenus[this.id].menu,
				{x: event.clientX, y: event.clientY} );
		}
	}

	/**
	* Displays the context menu at the coordinates provided in event
	* 
	* @param {HTMLElement} menu - The DOM element containing the menu (ol)
	* @param {object} point - The point where the menu should be displayed
	*/
	customContext.prototype.displayContextMenu = function(menu, point) {
		this.hideContextMenu();
		menu.style.top = point.y;
		menu.style.left = point.x;
		menu.style.display = "block";
		visibleContextMenu = menu;
	}

	/**
	* Hides the currently displayed context menu
	*/
	customContext.prototype.hideContextMenu = function() {
		if (visibleContextMenu) {
			visibleContextMenu.style.display = "none";
			visibleContextMenu = undefined;
		}
	}

	/**
	* Enables context menu on provided target
	* @param {string|HTMLElement} target - The string ID or DOM reference of the target
	*/
	customContext.prototype.enableTarget = function(target) {
		target = toDOM(target);

		if (!enabledTargetIDs[target.id])
			target.addEventListener('contextmenu', contextEventHandler, true);
		enabledTargetIDs[target.id] = true;

		return target;
	}

	/**
	* Disables context menu listener on provided target
	* @param {string|HTMLElement} target - The string ID or DOM reference of the target
	*/
	customContext.prototype.disableTarget = function(target) {
		target = toDOM(target);

		if (enabledTargetIDs[target.id])
			target.removeEventListener('contextmenu', self.contextEventHandler, true);
		enabledTargetIDs[target.id] = false;

		return target;
	}

	/**
	* Removes a context menu from the DOM and its target listener
	* @param {string|HTMLElement} target - The string ID or DOM reference of the target
	* @param {?boolean} removeFromDOM - True if the menu should be deleted from the DOM as well
	*/
	customContext.prototype.clearContextMenu = function(target, removeFromDOM) {
		target = toDOM(target);

		if (allContextMenus[target.id]) {
			this.disableTarget(target);
			var menu = allContextMenus[target.id].menu;
			if (menu == visibleContextMenu)
				this.hideContextMenu();
			if (removeFromDOM)
				menu.parentNode.removeChild(menu);
			delete allContextMenus[target.id];
			delete enabledTargetIDs[target.id];
		}
		else
			throw "Target menu does not exist";
	}

	/**
	* Removes all context menus from the DOM and all target listeners
	* Essentially restarts the plugin except for style sheet and body listener
	*/
	customContext.prototype.clearAllMenus = function() {
		for (t in allContextMenus) {
			self.clearContextMenu(t);
		}
		allContextMenus = {};
		enabledTargetIDs = {};
		visibleContextMenu = undefined;
	}

	// Set the customContext object globally
	if (typeof this.customContext !== 'undefined')
    	throw 'A customContext object is already declared in the global scope.';

	this.customContext = customContext;

}).call(this);