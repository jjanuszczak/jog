function test() {
	try {
		throw new Error("test");
	} catch(e) {
		if (e instanceof JOG.Exception) {
			alert("JOG Exception");
		} else {
			alert(e.stack);
		}
	}
}

var META = (function() {

	var _i = 10;
	__defineGetter__("PI", function() {
		return 3.14;
	});
	
	
	function _META() {
	}
	
	_META.__defineGetter__("PI", function() {
		return PI;
	});
	
	_META.__defineSetter__("PI", function(value) {
		// gracefully handle attempts to set the constant
	});
	
	return _META

})();

function test2() {
	alert(META.PI);
	META.PI = 5
	alert(META.PI);
}

//window.onload = test();
window.onload = test2();

