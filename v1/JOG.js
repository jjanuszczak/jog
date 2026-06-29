//------------------------------------------------------------------------------
// JavaScript on Glue
// Copyright © 2006 by John Januszczak, All Rights Reserved.
// Please see http://www.januszczak.com for terms of use.
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
// Coding conventions
//
// Class:	Pascal Casing	
// Enum values:	Pascal Casing	 
// Enum type:	Pascal Casing	 
// Events:	Pascal Casing	 
// Exception class:	Pascal Casing, End with "Exception"
// Public Fields:	Pascal Casing	 
// Methods: Pascal Casing	 
// Namespace:	Pascal Casing	 
// Property: Pascal Casing	 
// Private Fields: Camel Casing	 
// Parameters: Camel Casing
// Constants: Upper Casing
// Private Members (Fields and Methods): As above, prefix with "_"
//------------------------------------------------------------------------------

//----------------------------------------------------------
// JOG namespace for Java on Glue 
//----------------------------------------------------------
var JOG = {};

//----------------------------------------------------------
// HTML Document utility class 
//----------------------------------------------------------
JOG.HTMLDoc = (function() {
	
	// Constants
	var DIV_PREFIX = "div_";
	var CLASS_PREFIX = "class_";
	
	// Constructor
	function _HTMLDoc() {
		var me = this;
	}
	
	// Static Public methods 
	_HTMLDoc.DocStart = function(title) {
		
		var docStart;
		
		if (title) {
			docStart = "<html><head><title>" + title + "</title></head><body>";
		} else {
			docStart = "<html><head><title></title></head><body>";
		}
		
		return docStart;
	}
	
	_HTMLDoc.DocEnd = function() {
		return "</body></html>";
	}
	
	_HTMLDoc.DivID = function(id) {
		return DIV_PREFIX + id;
	}

	_HTMLDoc.ClassID = function(id) {
		return CLASS_PREFIX + id;
	}
	
	_HTMLDoc.Test = "Test!";
	
	return _HTMLDoc;
	
})();

//----------------------------------------------------------
// handle the window onload events
//----------------------------------------------------------
function addLoadListener(listener)
{
  window.addEventListener('load', listener, false);
}
