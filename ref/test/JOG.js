var JOG = (function() {
	
	var _DIV = "div";
	var _SPAN = "span";
	
	function _jog() { 
		this.DIV = _DIV;
		this.SPAN = _SPAN;
	}
	
	return _jog;
})();

function Kontrol() {
	var _name = "John";
	
	this.setName = function(name) {
		_name = name;
	}
	
	this.name = function() {
		return _name;
	}
	
	this.msg = function() {
		return NS.BOOM;
	}
}


var NS = {};
NS.BOOM = "boom";
NS.Control = Kontrol;

function main() {

	//var jog = new JOG();
	//alert(jog.DIV);
	alert(NS.BOOM);
	
	var c = new NS.Control();
	alert(c.name());	
	c.setName("testing...");
	alert(c.name());
	alert(c.msg());

}

window.onload = main();