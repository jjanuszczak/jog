var Foo = (function() {

	// Private static member
	var _counter = 0;
	
	// Private static method
	function incrementCounter() {
		return _counter++;
	}
	
	// Constructor
	function _Foo() {
		var me = this;
		
		// private instance
		var index = incrementCounter();
		
		// Public/Priviledged instance
		this.getIndex = function(){
			return index;
		}
	}
	
	// Static Public/Priviledged 
	_Foo.getCount = function() {
		return _counter;
	}
	
	//_Foo.prototype.getProtoIndex = function(){
	//	return me.index;
	//}
	
	return _Foo;
	
})();

var Bar = (function() {

	function _Bar() {
	
		this.base = Foo;
		this.base();
	
		var msg = "Bar";
		
		this.getMsg = function() {
			return msg;
		}
	}
	
	return _Bar
	
})();

var Doo = (function() {

	function _Doo() {
	
		this.base = Bar;
		this.base();
	
		var msg = "Doo";
		
		this.getMsg = function() {
			return msg;
		}
	}
	
	return _Doo
	
})();

function main() {

	alert("Foo count: " + Foo.getCount());
	var f = new Foo();
	var g = new Foo();
	alert("f index: " + f.getIndex());	
	alert("Foo count: " + Foo.getCount());
	alert("g index: " + g.getIndex());
	var h = new Bar();
	alert("h message: " + h.getMsg());
	alert("h index: " + h.getIndex());
	var i = new Doo();
	alert("i message: " + i.getMsg());
	alert("i index: " + i.getIndex());
	alert("Foo count: " + Foo.getCount());
	//alert(Bar.getCount());
}

window.onload = main();