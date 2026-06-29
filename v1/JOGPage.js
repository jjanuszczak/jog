//------------------------------------------------------------------------------
// JavaScript on Glue Page Object
// This type of page container resides on the existing browser window.
// Copyright © 2006 by John Januszczak, All Rights Reserved.
// Please see http://www.januszczak.com for terms of use.
//------------------------------------------------------------------------------
var Page = (function() {
	
	function _Page() {
	  
		// extends container control
	  this.base = ContainerControl;
	  this.base();  
	  
	  //-------------------------------------------------------
	  // private members
	  //-------------------------------------------------------
	  var me = this;
	  var _title;

	  //-------------------------------------------------------
	  // public methods
	  //-------------------------------------------------------

	  this.__defineGetter__("Title", function() {
	    return _title;
	  });

	  this.__defineSetter__("Title", function(value) {
	    _title = value;
	    if (me.Container) {
	      me.Container.title = _title;
	    }
	  });

	  this.Show = function() {
	    if (me.Container) {
	      if (!me.Container.body) {
					var newBody = me.Container.createElement('body');
					me.Container.body = newBody;
				}
				this.DoLayout(me.Container.body);
	    }
	  }
	  //-------------------------------------------------------
	  // constructor logic
	  //-------------------------------------------------------
	}

	return _Page;
	
})();