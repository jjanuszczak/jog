//------------------------------------------------------------------------------
// JavaScript on Glue Button Control
// Copyright © 2006 by John Januszczak, All Rights Reserved.
// Please see http://www.januszczak.com for terms of use.
//------------------------------------------------------------------------------
var Button = (function() {

	function _Button() {
	  // extends control
	  this.base = Control;
	  this.base(); 

	  //-------------------------------------------------------
	  // private members
	  //-------------------------------------------------------
	  var me = this;
	  
	  //-------------------------------------------------------
	  // public methods
	  //-------------------------------------------------------
	  this.Draw = function(ancestor)
	  {
	    //me.container.write('<div id="div_' + me.name + 
	    //                  '" style="position: absolute; top:' + me.top + 
	    //                  'px; left:' + me.left + 'px;"><input type="button" id="' + 
	    //                  me.name + '" value="' + me.text + '" /></div>');
	                      
	    var div = me.Container.createElement('div');
	    div.setAttribute('id', JOG.HTMLDoc.DivID(me.Name));
	    //div.setAttribute('style', 'position: absolute; top:' + me.Top + 'px; left:' + me.Left + 'px;');
			div.style.position = 'absolute';
			div.style.top = me.Top + 'px';
			div.style.left = me.Left + 'px';
	    
	    var input = me.Container.createElement('input');
	    input.setAttribute('id', me.Name);
	    input.setAttribute('type', 'button');
	    //input.setAttribute('size', me.length);
	    input.setAttribute('value', me.Text);
	    //input.setAttribute('autocomplete', 'OFF');

	    div.appendChild(input);

	    //if (!me.container.body)
	    //{
	    //  var newBody = me.container.createElement('body');
	    //  me.container.body = newBody;
	    //}
	    //me.container.body.appendChild(div);
			ancestor.appendChild(div);
	  }
	}
	
	return _Button;
	
})();
