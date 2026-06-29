//------------------------------------------------------------------------------
// JavaScript on Glue Container Control Object
// Copyright © 2006 by John Januszczak, All Rights Reserved.
// Please see http://www.januszczak.com for terms of use.
//------------------------------------------------------------------------------
var ContainerControl = (function() {
	
	function _ContainerControl() {
	  // extends control
	  this.base = Control;
	  this.base();  
	  
	  //-------------------------------------------------------
	  // private members
	  //-------------------------------------------------------
	  var _controls = new Array();
	  var me = this;
	  
	  this.AddControl = function(control) {
	    control.Parent = me;
	    _controls[control.Name] = control;
	  }
	  
	  this.DoLayout = function(ancestor) {
	    if (me.Container) {
	      for (control in _controls) {
	        _controls[control].Container = me.Container
	        _controls[control].Draw(ancestor);
	      }  
	    }
	  }
	}
	
	return _ContainerControl;

})();