//------------------------------------------------------------------------------
// JavaScript on Glue Draggable Object
// Provides drap and drop functionality.
// Copyright © 2008 by John Januszczak, All Rights Reserved.
// Please see http://www.januszczak.com for terms of use.
//------------------------------------------------------------------------------

var Draggable = (function() {

	// private static member to keep track of the stacking order
	var _zIndex = 0;
	var _elNode;
	var _cursorStartX;
	var _cursorStartY;
	var _elStartLeft = 0;
	var _elStartTop = 0;
	
	// function to increment counter
	function getNextZIndex() {
		return ++_zIndex;
	}

	function _Draggable() {
	}
	
	_Draggable.Start = function(event, id) {
	
	  //var el;
	  var x, y;

	  // If an element id was given, find it. Otherwise use the element being
	  // clicked on.
	  if (id)
	    _elNode = document.getElementById(id);
	  else {
			_elNode = event.target;

	    // If this is a text node, use its parent element.
	    if (_elNode.nodeType == 3)
	      _elNode = _elNode.parentNode;
	  }

	  // Get cursor position with respect to the page.
		x = event.clientX + window.scrollX;
		y = event.clientY + window.scrollY;

	  // Save starting positions of cursor and element.
	  _cursorStartX = x;
	  _cursorStartY = y;
	  _elStartLeft  = parseInt(_elNode.style.left, 10);
	  _elStartTop   = parseInt(_elNode.style.top,  10);

	  if (isNaN(_elStartLeft)) _elStartLeft = 0;
	  if (isNaN(_elStartTop))  _elStartTop  = 0;

	  // Update element's z-index.
	  _elNode.style.zIndex = getNextZIndex();

	  // Capture mousemove and mouseup events on the page.
		document.addEventListener("mousemove", Draggable.Drag, true);
		document.addEventListener("mouseup", Draggable.Stop, true);
		event.preventDefault();
	}
	
	_Draggable.Drag = function(event) {
	
	  var x, y;

	  // Get cursor position with respect to the page.
		x = event.clientX + window.scrollX;
		y = event.clientY + window.scrollY;

	  // Move drag element by the same amount the cursor has moved.
	  _elNode.style.left = (_elStartLeft + x - _cursorStartX) + "px";
	  _elNode.style.top  = (_elStartTop  + y - _cursorStartY) + "px";

		event.preventDefault();
	}
	
	_Draggable.Stop = function(event) {
		
		// Stop capturing mousemove and mouseup events.
    document.removeEventListener("mousemove", Draggable.Drag, true);
    document.removeEventListener("mouseup", Draggable.Stop, true);
	}
	
	return _Draggable;
	
})();