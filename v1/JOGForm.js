//------------------------------------------------------------------------------
// JavaScript on Glue Window Object
// This type of page container resides inside a (new) browser window.
// Copyright © 2006 by John Januszczak, All Rights Reserved.
// Please see http://www.januszczak.com for terms of use.
//------------------------------------------------------------------------------
var Form = (function() {
  
	function _Form() {
	
		// extends container control
	  this.base = ContainerControl;
	  this.base();  
	  
	  //-------------------------------------------------------
	  // private members
	  //-------------------------------------------------------
	  var me = this;
	  var _title;

	  //-------------------------------------------------------
	  // public methods
	  //-------------------------------------------------------

	  this.__defineGetter__("Title", function() {
	    return _title;
	  });

	  this.__defineSetter__("Title", function(value) {
	    _title = value;
	  });

	  this.Hide = function() {
	    var div = me.Container.getElementById(JOG.HTMLDoc.DivID(me.Name));
	    var par = div.parentNode;
			par.removeChild(div);
	  }
	  
	  this.Show = function() {
			//me.container = window.document;
	    var div = me.Container.createElement('div');
	    div.setAttribute('id', JOG.HTMLDoc.DivID(me.Name));
	    div.setAttribute('style', 'position: absolute; top:' + me.Top + 'px; left:' + me.Left + 'px;' + ' background-color: gray; height:' + me.Height + 'px; width:' + me.Width + 'px;');
	    
			
			//NEW
			var titleDiv = me.Container.createElement('div');
			titleDiv.setAttribute('id', JOG.HTMLDoc.DivID(me.Name + 'Title'));
			// make it draggable
			titleDiv.addEventListener('mousedown', function(e) {Draggable.Start(e, div.id)}, true);
			//titleDiv.setAttribute('onmousedown', "Draggable.Start(event,'" + div.id + "')");
			
			var titleText = me.Container.createTextNode(me.Title);
			titleDiv.appendChild(titleText);
			
			var contentDiv = me.Container.createElement('div');
			contentDiv.setAttribute('id', JOG.HTMLDoc.DivID(me.Name + 'Content'));
			
			div.appendChild(titleDiv);
			div.appendChild(contentDiv);
			
	    //END NEW

	    if (!me.Container.body)
	    {
	      var newBody = me.Container.createElement('body');
	      me.Container.body = newBody;
	    }
	    me.Container.body.appendChild(div);
			
	    if (me.Container)
	    {
				//this.DoLayout(div);
				this.DoLayout(contentDiv);
	    }		
		}
		
		this.ShowDialog = function() {
		
			// check if form is showing
			// get latest z index
			// apply div mask over body
			// call me.Show()
		
		}

	  //-------------------------------------------------------
	  // constructor logic
	  //-------------------------------------------------------
	}
	
	return _Form;
	
})();
