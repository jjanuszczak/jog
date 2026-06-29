var App = (function() {

	_app = function() {
	}
	
	_app.Main = function() {
	
		//alert("HTML Test: " + JOG.HTMLDoc.Test);
		//alert("HTML Start: " + JOG.HTMLDoc.DocStart("Hi"));
		//alert("HTML Div: " + JOG.HTMLDoc.DivID("MyDiv"));
		//alert("HTML Class: " + JOG.HTMLDoc.ClassID("MyDiv"));
		//alert("HTML End: " + JOG.HTMLDoc.DocEnd());
		var myPage1 = new Page1(window);

	}
	
	return _app;

})();


//function main() {
//
//	alert("HTML Test: " + JOG.HTMLDoc.Test);
//	alert("HTML Start: " + JOG.HTMLDoc.DocStart("Hi"));
//	alert("HTML Div: " + JOG.HTMLDoc.DivID("MyDiv"));
//	alert("HTML Class: " + JOG.HTMLDoc.ClassID("MyDiv"));
//	alert("HTML End: " + JOG.HTMLDoc.DocEnd());
//	
//}

//window.onload = App.Main();
window.addEventListener('load', App.Main, false);