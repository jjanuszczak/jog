//------------------------------------------------------------------------------
// JavaScript on Glue Control Object
// Copyright © 2006 by John Januszczak, All Rights Reserved.
// Please see http://www.januszczak.com for terms of use.
//------------------------------------------------------------------------------
var Control = (function() {

	function _Control() {
	  // extends component
	  this.base = Component;
	  this.base();  
	  
	  //-------------------------------------------------------
	  // private members
	  //-------------------------------------------------------
	  var me = this;
	  var _name;
	  var _text;
	  var _length;
	  var _width;
	  var _height;
	  var _top;
	  var _left;
	  var _parent;
	  
	  //-------------------------------------------------------
	  // public methods
	  //-------------------------------------------------------
	  
	  // name
	  this.__defineGetter__("Name", function () {
	    return _name;
	  }); 

	  this.__defineSetter__("Name", function (value) {
	    _name = value;
	  }); 

	  // parent
	  this.__defineGetter__("Parent", function () {
	    return _parent;
	  }); 

	  this.__defineSetter__("Parent", function (value) {
	    _parent = value;
	  }); 
	  
	  // text
	  this.__defineGetter__("Text", function() {
	    return _text;
	  });
	  
	  this.__defineSetter__("Text", function(value) {
	    _text = value;
	    if (me.Container) {
	      me.Container.getElementById(_name).value = value;
	    }
	  });

	  // length
	  this.__defineGetter__("Length", function() {
	    return _length;
	  });
	  
	  this.__defineSetter__("Length", function(value) {
	    _length = value;
	    if (me.Container) {
	    me.Container.getElementById(_name).size = value;
	    }
	  });  
	  
	  // top
	  this.__defineGetter__("Top", function() {
	    return _top;
	  });
	  
	  this.__defineSetter__("Top", function(value) {
	    _top = value;
	    if (me.Container) {
	      me.Container.getElementById(JOG.HTMLDoc.DivID(_name)).style.top = value + 'px';
	    }
	  }); 
	  
	  // left
	  this.__defineGetter__("Left", function() {
	    return _left;
	  });
	  
	  this.__defineSetter__("Left", function(value) {
	    _left = value;
	    if (me.Container) {
	      me.Container.getElementById(JOG.HTMLDoc.DivID(_name)).style.left = value + 'px';
	    }
	  });
	  
	  // width
	  this.__defineGetter__("Width", function() {
	    return _width;
	  });
	  
	  this.__defineSetter__("Width", function(value) {
	    _width = value;
	    if (me.Container) {
	      me.Container.getElementById(JOG.HTMLDoc.DivID(_name)).style.width = value + 'px';
	    }
	  });        

	  // height
	  this.__defineGetter__("Height", function() {
	    return _height;
	  });
	  
	  this.__defineSetter__("Height", function(value) {
	    _height = value;
	    if (me.Container) {
	      me.Container.getElementById(JOG.HTMLDoc.DivID(_name)).style.height = value + 'px';
	    }
	  });     

	  // enabled
	  this.__defineGetter__("Enabled", function() {
	    if (me.Container) {
	      return !(me.Container.getElementById(_name).disabled);
	    }
	  });

	  this.__defineSetter__("Enabled", function(value) {
	    if (me.Container) {
	      me.Container.getElementById(_name).disabled = !(value);
	    }
	  });

	  // visible
	  this.__defineGetter__("Visible", function() {
	    if (me.Container) {
	      if (me.Container.getElementById(JOG.HTMLDoc.DivID(_name)).style.visibility = 'hidden') {
	        return false;
	      } else {
	        return true;
	      }
	    }
	  });

	  this.__defineSetter__("Visible", function(value) {
	    if (me.Container) {
	      if (value) {
	        me.Container.getElementById(JOG.HTMLDoc.DivID(_name)).style.visibility = 'visible';
	      } else {
	        me.Container.getElementById(JOG.HTMLDoc.DivID(_name)).style.visibility = 'hidden';
	      }
	    }
	  });
	  
	  // set top and left at the same time
	  this.Location = function(x, y) {
	    me.Top = y;
	    me.Left = x;
	  }
	  
	  // set width and height at the same time
	  this.Size = function(w, h) {
	    me.Width = w;
	    me.Height = h;
	  }
		
	  //-------------------------------------------------------
	  // abstract methods to override
	  //-------------------------------------------------------
	  this.Draw = function(ancestor) {
		}	
		
	  //-------------------------------------------------------
	  // events
	  //-------------------------------------------------------
	  this.Change = function(listener) {
	    if (me.Container) {
	      me.Container.getElementById(_name).addEventListener('change', listener, false); 
	    }
	  }
	  
	  this.Click = function(listener) {
	    if (me.Container) {
	      me.Container.getElementById(_name).addEventListener('click', listener, false); 
	    }
	  }
	}

	return _Control;
	
})();