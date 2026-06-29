//----------------------------------------------------------
// Exception handling utility class 
//----------------------------------------------------------

JOG.Exception = (function() {
	
	var GENERIC_NAME = "General Error";
	var GENERIC_MESSAGE = "An unknown error has occurred.";
	var DELIMITER = ",";
	
	function _Exception(name, message, file, line, stack) {
	
		var _name = ((name) ? name : GENERIC_NAME);
		var _message = ((message) ? message : GENERIC_MESSAGE);
		var _file = ((file) ? file : null);
		var _line = ((line) ? line : 0);
		var _stack = ((stack) ? stack : null);
		
		this.__defineGetter__("Name", function() {
			return _name;
		});
		
		this.__defineSetter__("Name", function(value) {
			_name = value;
		});
		
		//...
		
		this.ToString = function() {
			return _name + DELIMITER + _message + DELIMITER + _type + DELIMITER
				+ _method + DELIMITER + _file + DELIMITER + _line + DELIMITER + _stack;
		}
	}
	
	return _Exception;

})();

JOG.ExceptionHandler = (function() {

	// Constants
	var NO_TYPE = "No type specified.";
	var NO_METHOD = "No method specified.";

	// Private members
	var _callStack = new Array();
	
	// Private methods
	function _ClearStack() {
		_callStack = new Array();
	}
	
	function _ConvertError() {
		// Converts an Error object into a JOG.Exception
	}
	
	function _ExceptionHandler() {
	}
	
	_ExceptionHandler.HandleException = function() {
		// For handling an exception
	}
	
	_ExceptionHandler.ShowException = function() {
		// For whoing the exception in html
	}
	
	return _ExceptionHandler;
	
})();