//------------------------------------------------------------------------------
// JavaScript on Glue Component Object
// Copyright © 2006 by John Januszczak, All Rights Reserved.
// Please see http://www.januszczak.com for terms of use.
//------------------------------------------------------------------------------
var Component = (function() {

  function _Component() {
		
		//-------------------------------------------------------
	  // private members
	  //-------------------------------------------------------
	  var me = this;
	  var _container;   //document object
	  
	  //-------------------------------------------------------
	  // public methods
	  //-------------------------------------------------------
	  this.__defineGetter__("Container", function() {
	    return _container;
	  });
	  
	  this.__defineSetter__("Container", function(value) {
	    _container = value;
	  }); 
	}
	
	return _Component;
	
})();