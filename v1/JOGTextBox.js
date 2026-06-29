//------------------------------------------------------------------------------
// JavaScript on Glue TextBox Control
// Copyright © 2006 by John Januszczak, All Rights Reserved.
// Please see http://www.januszczak.com for terms of use.
//------------------------------------------------------------------------------
var TextBox = (function () {
  
	function _TextBox() {
	
		// extends control
	  this.base = Control;
	  this.base(); 

	  //-------------------------------------------------------
	  // private members
	  //-------------------------------------------------------
	  var me  = this;

	  //-------------------------------------------------------
	  // private methods
	  //-------------------------------------------------------
	  var onChange = function()
	  {
	    me.Text = doc.getElementById(name).value;
	  }
	  
	  //-------------------------------------------------------
	  // public methods
	  //-------------------------------------------------------
	  this.Draw = function(ancestor)
	  {
	    //me.container.write('<div id="div_' + me.name + 
	    //                  '" style="position: absolute; top:' + me.top + 
	    //                  'px; left:' + me.left + 'px;"><input type="text" id="' + 
	    //                  me.name + '" size="' + me.length + '" value="' + me.text + 
	    //                  '" autocomplete="OFF" /></div>');
	    
	    var div = me.Container.createElement('div');
	    div.setAttribute('id', JOG.HTMLDoc.DivID(me.Name));
	    div.setAttribute('style', 'position: absolute; top:' + me.Top + 'px; left:' + me.Left + 'px;');
	    
	    var input = me.Container.createElement('input');
	    input.setAttribute('id', me.Name);
	    input.setAttribute('type', 'text');
	    input.setAttribute('size', me.Length);
	    input.setAttribute('value', me.Text);
	    input.setAttribute('autocomplete', 'OFF');

	    div.appendChild(input);

	    //if (!me.container.body)
	    //{
	    //  var newBody = me.container.createElement('body');
	    //  me.container.body = newBody;
	    //}
	    //me.container.body.appendChild(div);
			ancestor.appendChild(div);
	    
	    
	    me.Change(onChange);
	  }
	}
	
	return _TextBox;

})();