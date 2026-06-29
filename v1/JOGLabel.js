//------------------------------------------------------------------------------
// JavaScript on Glue Label Control
// Copyright © 2006 by John Januszczak, All Rights Reserved.
// Please see http://www.januszczak.com for terms of use.
//------------------------------------------------------------------------------
var Label = (function() {

	function _Label() {
	  // extends control
	  this.base = Control;
	  this.base(); 

	  //-------------------------------------------------------
	  // private members
	  //-------------------------------------------------------
	  var me  = this;

	  //-------------------------------------------------------
	  // public methods
	  //-------------------------------------------------------
	  this.Draw = function(ancestor)
	  {
	    //me.container.write('<div id="' + Html.DIV_ID_ATTR_VALUE_PREFIX + me.name + 
	    //                  '" style="position: absolute; top:' + me.top + 
	    //                  'px; left:' + me.left + 'px;">' + me.text + '</div>');
	    var div = me.container.createElement('div');
	    var div_text = me.container.createTextNode(me.text);
	    div.setAttribute('id', JOG.HTMLDoc.DivID(me.Name));
	    div.setAttribute('style', 'position: absolute; top:' + me.top + 'px; left:' + me.left + 'px;');
	    div.appendChild(div_text);
	    //if (!me.container.body)
	    //{
	    // var newBody = me.container.createElement('body');
	    //  me.container.body = newBody;
	    //}
	    //me.container.body.appendChild(div);
			ancestor.appendChild(div);
	  }  
	  
	  // override base class setter method
	  this.__defineSetter__("Caption", function(value) {
	    me.Text = value;
	    if (me.Container)
	    {
	      var name = me.Name;
	      var doc = me.Container;
	      
	      doc.getElementById(JOG.HTMLDoc.DivID(me.Name)).innerHTML = value;
	    }
	  });
	}
	
	return _Label;
  
})();
