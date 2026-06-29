(function(global) {
  "use strict";

  var JOG = {};

  var nextControlId = 0;

  function cloneState(state) {
    var copy = {};
    var key;
    for (key in state) {
      if (!Object.prototype.hasOwnProperty.call(state, key)) {
        continue;
      }
      if (key === "children" && Array.isArray(state.children)) {
        copy.children = state.children.map(function(child) {
          return child && child._state ? (child._state.name || child._state.id) : null;
        });
        continue;
      }
      copy[key] = state[key];
    }
    return copy;
  }

  function ensureArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function toCssPixels(value) {
    if (value === null || value === undefined || value === "") {
      return "";
    }
    return value + "px";
  }

  function toCssBox(value) {
    if (value === null || value === undefined || value === "") {
      return "";
    }
    if (typeof value === "number") {
      return toCssPixels(value);
    }
    if (typeof value === "string") {
      return value;
    }
    if (typeof value === "object") {
      var top = value.top != null ? value.top : 0;
      var right = value.right != null ? value.right : top;
      var bottom = value.bottom != null ? value.bottom : top;
      var left = value.left != null ? value.left : right;
      return [top, right, bottom, left].map(toCssPixels).join(" ");
    }
    return "";
  }

  function normalizeBox(value) {
    if (value === null || value === undefined || value === "") {
      return { top: 0, right: 0, bottom: 0, left: 0 };
    }
    if (typeof value === "number") {
      return { top: value, right: value, bottom: value, left: value };
    }
    if (typeof value === "object") {
      var top = value.top != null ? value.top : 0;
      var right = value.right != null ? value.right : top;
      var bottom = value.bottom != null ? value.bottom : top;
      var left = value.left != null ? value.left : right;
      return { top: top, right: right, bottom: bottom, left: left };
    }
    return { top: 0, right: 0, bottom: 0, left: 0 };
  }

  function isNumber(value) {
    return typeof value === "number" && !isNaN(value);
  }

  function invariant(condition, message) {
    if (!condition) {
      throw new Error(message);
    }
  }

  function scheduleMicrotask(fn) {
    if (typeof queueMicrotask === "function") {
      queueMicrotask(fn);
      return;
    }
    Promise.resolve().then(fn);
  }

  function EventArgs(source, type, originalEvent, extras) {
    this.Source = source;
    this.Type = type;
    this.OriginalEvent = originalEvent || null;
    this.Handled = false;
    extras = extras || {};
    this.Value = extras.Value;
    this.Key = extras.Key;
  }

  function Store(initialState) {
    this._state = Object.assign({}, initialState || {});
    this._listeners = {};
  }

  Store.prototype.Get = function(key) {
    return this._state[key];
  };

  Store.prototype.Set = function(key, value) {
    var oldValue = this._state[key];
    if (oldValue === value) {
      return;
    }
    this._state[key] = value;
    this._emit(key, value);
  };

  Store.prototype.Subscribe = function(key, listener) {
    if (!this._listeners[key]) {
      this._listeners[key] = [];
    }
    this._listeners[key].push(listener);
    var store = this;
    return function() {
      var listeners = store._listeners[key];
      if (!listeners) {
        return;
      }
      var index = listeners.indexOf(listener);
      if (index >= 0) {
        listeners.splice(index, 1);
      }
    };
  };

  Store.prototype._emit = function(key, value) {
    var listeners = ensureArray(this._listeners[key]).slice();
    listeners.forEach(function(listener) {
      listener(value);
    });
  };

  function Runtime(application) {
    this.application = application;
    this.document = null;
    this.rootHost = null;
    this._dirtyControls = new Set();
    this._scheduled = false;
    this._windowZIndex = 1000;
    this._activeModalOverlay = null;
  }

  Runtime.prototype.attach = function(doc, rootHost) {
    this.document = doc;
    this.rootHost = rootHost;
  };

  Runtime.prototype.markDirty = function(control) {
    if (!control || control._lifecycle === "Disposed") {
      return;
    }
    this._dirtyControls.add(control);
    if (this._scheduled) {
      return;
    }
    this._scheduled = true;
    var runtime = this;
    scheduleMicrotask(function() {
      runtime.flush();
    });
  };

  Runtime.prototype.flush = function() {
    if (!this._scheduled && this._dirtyControls.size === 0) {
      return;
    }
    this._scheduled = false;

    var controls = Array.from(this._dirtyControls);
    this._dirtyControls.clear();

    controls.sort(function(a, b) {
      return a._depth - b._depth;
    });

    for (var i = 0; i < controls.length; i += 1) {
      controls[i]._renderIfNeeded();
    }
  };

  Runtime.prototype.nextWindowZIndex = function() {
    this._windowZIndex += 1;
    return this._windowZIndex;
  };

  Runtime.prototype.showModalOverlay = function() {
    if (this._activeModalOverlay || !this.document || !this.document.body) {
      return;
    }
    var overlay = this.document.createElement("div");
    overlay.className = "jog-modal-overlay";
    this.document.body.appendChild(overlay);
    this._activeModalOverlay = overlay;
  };

  Runtime.prototype.hideModalOverlay = function() {
    if (!this._activeModalOverlay) {
      return;
    }
    if (this._activeModalOverlay.parentNode) {
      this._activeModalOverlay.parentNode.removeChild(this._activeModalOverlay);
    }
    this._activeModalOverlay = null;
  };

  function Application() {
    this.Runtime = new Runtime(this);
    this.MainPage = null;
    this._stylesInjected = false;
    this.Debug = false;
  }

  Application.prototype.Run = function(page) {
    this.MainPage = page;
    this.Runtime.attach(document, document.body);
    this._injectBaseStyles();
    page._attachToApplication(this);
    page.Refresh();
    this.Runtime.flush();
  };

  Application.prototype._injectBaseStyles = function() {
    if (this._stylesInjected) {
      return;
    }
    var style = document.createElement("style");
    style.type = "text/css";
    style.textContent = [
      ".jog-root { position: relative; min-height: 100vh; font-family: Arial, sans-serif; background: #f3f4f6; color: #1e293b; padding: 32px; }",
      ".jog-page { position: relative; min-height: calc(100vh - 64px); }",
      ".jog-control { box-sizing: border-box; }",
      ".jog-panel { position: relative; }",
      ".jog-dock-panel { position: relative; min-height: 100%; min-width: 100%; background: #ffffff; border: 1px solid #dbe2ea; border-radius: 16px; box-shadow: 0 14px 34px rgba(15, 23, 42, 0.06); overflow: hidden; }",
      ".jog-stack-panel { position: relative; display: flex; }",
      ".jog-stack-panel.vertical { flex-direction: column; }",
      ".jog-stack-panel.horizontal { flex-direction: row; align-items: center; }",
      ".jog-fill-width { width: 100%; }",
      ".jog-section { position: relative; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; box-shadow: 0 8px 20px rgba(15, 23, 42, 0.04); overflow: hidden; }",
      ".jog-section-header { padding: 14px 16px; font-size: 13px; font-weight: 600; color: #0f172a; background: #f8fafc; border-bottom: 1px solid #e2e8f0; }",
      ".jog-section-body { position: relative; padding: 16px; }",
      ".jog-window { position: absolute; border: 1px solid #cbd5e1; border-radius: 14px; background: #ffffff; box-shadow: 0 24px 50px rgba(15, 23, 42, 0.16); overflow: hidden; }",
      ".jog-window-titlebar { background: #f8fafc; color: #0f172a; padding: 12px 16px; font-weight: 600; cursor: move; user-select: none; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; }",
      ".jog-window-content { position: relative; padding: 20px; background: #ffffff; }",
      ".jog-button { border: 1px solid #cbd5e1; background: #ffffff; color: #0f172a; border-radius: 8px; padding: 10px 14px; cursor: pointer; font-size: 14px; }",
      ".jog-button:disabled { opacity: 0.6; cursor: default; }",
      ".jog-label { display: block; color: #475569; font-size: 14px; line-height: 1.45; }",
      ".jog-textbox { border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px 12px; font-size: 14px; background: #ffffff; }",
      ".jog-textarea { border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px 12px; font-size: 14px; background: #ffffff; resize: vertical; min-height: 120px; }",
      ".jog-checkbox-row { display: flex; align-items: center; gap: 10px; color: #334155; font-size: 14px; }",
      ".jog-checkbox { width: 16px; height: 16px; }",
      ".jog-select { border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px 12px; font-size: 14px; background: #ffffff; min-height: 42px; }",
      ".jog-modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.22); z-index: 1000; }"
    ].join("\n");
    document.head.appendChild(style);
    this._stylesInjected = true;
  };

  function Component(typeName) {
    this._typeName = typeName || "Component";
    this._application = null;
    this._runtime = null;
    this._domNode = null;
    this._parent = null;
    this._depth = 0;
    this._lifecycle = "Created";
    this._eventHandlers = {};
    this._bindings = [];
    this._state = this._createInitialState();
    this._previousState = cloneState(this._state);
  }

  Component.prototype._createInitialState = function() {
    return {
      id: "jog_" + (++nextControlId),
      type: this._typeName,
      name: null,
      text: "",
      visible: true,
      enabled: true,
        width: null,
        height: null,
        top: null,
        left: null,
        padding: null,
        margin: null,
        gap: null,
        cssClass: null,
        tooltip: null,
        children: []
    };
  };

  Component.prototype._attachToApplication = function(application) {
    this._application = application;
    this._runtime = application.Runtime;
    this._state.applicationAttached = true;
  };

  Component.prototype._setParent = function(parent) {
    this._parent = parent || null;
    this._depth = parent ? parent._depth + 1 : 0;
  };

  Component.prototype._setState = function(key, value) {
    invariant(this._lifecycle !== "Disposed", "Cannot update a disposed control.");
    if (this._state[key] === value) {
      return;
    }
    this._state[key] = value;
    this._markDirty(key);
  };

  Component.prototype._markDirty = function() {
    if (this._runtime) {
      this._runtime.markDirty(this);
    }
  };

  Component.prototype._renderIfNeeded = function() {
    if (!this._runtime || this._lifecycle === "Disposed") {
      return;
    }
    this._ensureMounted();
    this._applyStateToDom(this._previousState, this._state);
    this._previousState = cloneState(this._state);
  };

  Component.prototype._ensureMounted = function() {
    if (this._domNode) {
      return;
    }
    var host = this._resolveHostNode();
    if (!host) {
      return;
    }
    this._domNode = this._createDomNode(this._runtime.document);
    host.appendChild(this._domNode);
    this._bindDomEvents();
    this._lifecycle = this._state.visible ? "Shown" : "Hidden";
  };

  Component.prototype._resolveHostNode = function() {
    if (!this._parent) {
      return this._runtime.rootHost;
    }
    return this._parent._getChildHostNode();
  };

  Component.prototype._getChildHostNode = function() {
    return this._domNode;
  };

  Component.prototype._createDomNode = function(doc) {
    var node = doc.createElement("div");
    node.className = "jog-control";
    return node;
  };

  Component.prototype._applyStateToDom = function(prevState, nextState) {
    if (!this._domNode) {
      return;
    }
    this._domNode.id = nextState.name || nextState.id;
    this._domNode.style.display = nextState.visible ? "" : "none";
    this._domNode.style.width = isNumber(nextState.width) ? toCssPixels(nextState.width) : "";
    this._domNode.style.height = isNumber(nextState.height) ? toCssPixels(nextState.height) : "";
    this._domNode.style.padding = toCssBox(nextState.padding);
    this._domNode.style.margin = toCssBox(nextState.margin);
    this._domNode.title = nextState.tooltip || "";
    if (nextState.cssClass) {
      this._domNode.classList.add(nextState.cssClass);
    }
    if (!nextState.visible) {
      this._lifecycle = "Hidden";
    } else if (this._lifecycle !== "Disposed") {
      this._lifecycle = "Shown";
    }
  };

  Component.prototype._bindDomEvents = function() {};

  Component.prototype._raiseEvent = function(name, originalEvent, extras) {
    var handlers = ensureArray(this._eventHandlers[name]).slice();
    var eventArgs = new EventArgs(this, name, originalEvent, extras);
    handlers.forEach(function(handler) {
      handler(eventArgs);
    });
    return eventArgs;
  };

  Component.prototype._registerEvent = function(name, listener) {
    if (!this._eventHandlers[name]) {
      this._eventHandlers[name] = [];
    }
    this._eventHandlers[name].push(listener);
  };

  Component.prototype.Show = function() {
    invariant(this._lifecycle !== "Disposed", "Cannot show a disposed control.");
    this.Visible = true;
  };

  Component.prototype.Hide = function() {
    invariant(this._lifecycle !== "Disposed", "Cannot hide a disposed control.");
    this.Visible = false;
  };

  Component.prototype.Dispose = function() {
    if (this._lifecycle === "Disposed") {
      return;
    }
    this._bindings.forEach(function(binding) {
      if (typeof binding.unsubscribe === "function") {
        binding.unsubscribe();
      }
    });
    this._bindings = [];
    if (this._domNode && this._domNode.parentNode) {
      this._domNode.parentNode.removeChild(this._domNode);
    }
    this._domNode = null;
    this._lifecycle = "Disposed";
  };

  Component.prototype.Refresh = function() {
    this._markDirty("refresh");
  };

  Component.prototype.Focus = function() {
    invariant(this._lifecycle !== "Disposed", "Cannot focus a disposed control.");
    if (this._domNode && typeof this._domNode.focus === "function") {
      this._domNode.focus();
    }
  };

  Component.prototype.Location = function(x, y) {
    this.Left = x;
    this.Top = y;
  };

  Component.prototype.Size = function(width, height) {
    this.Width = width;
    this.Height = height;
  };

  Component.prototype.SetBounds = function(x, y, width, height) {
    this.Location(x, y);
    this.Size(width, height);
  };

  Object.defineProperty(Component.prototype, "Name", {
    get: function() { return this._state.name; },
    set: function(value) { this._setState("name", value); }
  });

  Object.defineProperty(Component.prototype, "Parent", {
    get: function() { return this._parent; }
  });

  Object.defineProperty(Component.prototype, "Visible", {
    get: function() { return this._state.visible; },
    set: function(value) { this._setState("visible", !!value); }
  });

  Object.defineProperty(Component.prototype, "Enabled", {
    get: function() { return this._state.enabled; },
    set: function(value) { this._setState("enabled", !!value); }
  });

  Object.defineProperty(Component.prototype, "Width", {
    get: function() { return this._state.width; },
    set: function(value) { this._setState("width", value); }
  });

  Object.defineProperty(Component.prototype, "Height", {
    get: function() { return this._state.height; },
    set: function(value) { this._setState("height", value); }
  });

  Object.defineProperty(Component.prototype, "Top", {
    get: function() { return this._state.top; },
    set: function(value) { this._setState("top", value); }
  });

  Object.defineProperty(Component.prototype, "Left", {
    get: function() { return this._state.left; },
    set: function(value) { this._setState("left", value); }
  });

  Object.defineProperty(Component.prototype, "Text", {
    get: function() { return this._state.text; },
    set: function(value) { this._setState("text", value == null ? "" : String(value)); }
  });

  Object.defineProperty(Component.prototype, "CssClass", {
    get: function() { return this._state.cssClass; },
    set: function(value) { this._setState("cssClass", value); }
  });

  Object.defineProperty(Component.prototype, "Tooltip", {
    get: function() { return this._state.tooltip; },
    set: function(value) { this._setState("tooltip", value); }
  });

  Object.defineProperty(Component.prototype, "Padding", {
    get: function() { return this._state.padding; },
    set: function(value) { this._setState("padding", value); }
  });

  Object.defineProperty(Component.prototype, "Margin", {
    get: function() { return this._state.margin; },
    set: function(value) { this._setState("margin", value); }
  });

  Object.defineProperty(Component.prototype, "Gap", {
    get: function() { return this._state.gap; },
    set: function(value) { this._setState("gap", value); }
  });

  Object.defineProperty(Component.prototype, "Dock", {
    get: function() { return this._state.dock || "none"; },
    set: function(value) {
      var allowed = ["none", "top", "bottom", "left", "right", "fill"];
      this._setState("dock", allowed.indexOf(value) >= 0 ? value : "none");
    }
  });

  function Control(typeName) {
    Component.call(this, typeName || "Control");
  }

  Control.prototype = Object.create(Component.prototype);
  Control.prototype.constructor = Control;

  Control.prototype._applyStateToDom = function(prevState, nextState) {
    Component.prototype._applyStateToDom.call(this, prevState, nextState);
    if (!this._domNode) {
      return;
    }
    this._domNode.style.position = this._usesFlowLayout() ? "" : "absolute";
    this._domNode.style.left = this._usesFlowLayout() ? "" : toCssPixels(nextState.left);
    this._domNode.style.top = this._usesFlowLayout() ? "" : toCssPixels(nextState.top);
    if ("disabled" in this._domNode) {
      this._domNode.disabled = !nextState.enabled;
    }
  };

  Control.prototype._usesFlowLayout = function() {
    return !!(this._parent && typeof this._parent._childUsesFlowLayout === "function" && this._parent._childUsesFlowLayout());
  };

  Control.prototype.Click = function(listener) { this._registerEvent("Click", listener); };
  Control.prototype.Change = function(listener) { this._registerEvent("Change", listener); };
  Control.prototype.OnFocus = function(listener) { this._registerEvent("Focus", listener); };
  Control.prototype.Blur = function(listener) { this._registerEvent("Blur", listener); };
  Control.prototype.KeyDown = function(listener) { this._registerEvent("KeyDown", listener); };
  Control.prototype.KeyUp = function(listener) { this._registerEvent("KeyUp", listener); };
  Control.prototype.OnClick = function(listener) { this._registerEvent("Click", listener); };
  Control.prototype.OnChange = function(listener) { this._registerEvent("Change", listener); };
  Control.prototype.OnBlur = function(listener) { this._registerEvent("Blur", listener); };
  Control.prototype.OnKeyDown = function(listener) { this._registerEvent("KeyDown", listener); };
  Control.prototype.OnKeyUp = function(listener) { this._registerEvent("KeyUp", listener); };

  function Container(typeName) {
    Control.call(this, typeName || "Container");
    this._children = [];
  }

  Container.prototype = Object.create(Control.prototype);
  Container.prototype.constructor = Container;

  Container.prototype.Add = function(child) {
    invariant(!!child, "Cannot add an empty child.");
    invariant(child !== this, "A container cannot add itself.");
    invariant(this._lifecycle !== "Disposed", "Cannot add a child to a disposed container.");
    invariant(this._children.indexOf(child) < 0, "Cannot add the same child twice.");
    invariant(!child.Parent || child.Parent === this, "Child already belongs to another container.");
    if (child.Name) {
      var duplicate = this._children.some(function(existing) {
        return existing.Name && existing.Name === child.Name;
      });
      invariant(!duplicate, "Duplicate child name in container: " + child.Name);
    }
    child._setParent(this);
    if (this._application) {
      child._attachToApplication(this._application);
    }
    this._children.push(child);
    this._state.children = this._children.slice();
    this._markDirty("children");
    child._markDirty("parent");
  };

  Container.prototype.Remove = function(child) {
    var index = this._children.indexOf(child);
    if (index < 0) {
      return;
    }
    this._children.splice(index, 1);
    this._state.children = this._children.slice();
    child._setParent(null);
    child.Dispose();
    this._markDirty("children");
  };

  Container.prototype.Clear = function() {
    while (this._children.length) {
      this.Remove(this._children[0]);
    }
  };

  Container.prototype._attachToApplication = function(application) {
    Control.prototype._attachToApplication.call(this, application);
    this._children.forEach(function(child) {
      child._attachToApplication(application);
    });
  };

  Container.prototype._applyStateToDom = function(prevState, nextState) {
    Control.prototype._applyStateToDom.call(this, prevState, nextState);
    this._children.forEach(function(child) {
      child._renderIfNeeded();
    });
  };

  Container.prototype.Dispose = function() {
    while (this._children.length) {
      var child = this._children.pop();
      child._setParent(null);
      child.Dispose();
    }
    this._state.children = [];
    Component.prototype.Dispose.call(this);
  };

  Object.defineProperty(Container.prototype, "Children", {
    get: function() {
      return this._children.slice();
    }
  });

  function Page() {
    Container.call(this, "Page");
    this._state.title = "";
  }

  Page.prototype = Object.create(Container.prototype);
  Page.prototype.constructor = Page;

  Page.prototype._createDomNode = function(doc) {
    var node = doc.createElement("div");
    node.className = "jog-root jog-page";
    return node;
  };

  Page.prototype._applyStateToDom = function(prevState, nextState) {
    Container.prototype._applyStateToDom.call(this, prevState, nextState);
    if (this._runtime && this._runtime.document) {
      this._runtime.document.title = nextState.title || "";
    }
  };

  Page.prototype._resolveHostNode = function() {
    return this._runtime.rootHost;
  };

  Page.prototype._getChildHostNode = function() {
    return this._domNode;
  };

  Object.defineProperty(Page.prototype, "Title", {
    get: function() { return this._state.title; },
    set: function(value) { this._setState("title", value == null ? "" : String(value)); }
  });

  function Panel() {
    Container.call(this, "Panel");
  }

  Panel.prototype = Object.create(Container.prototype);
  Panel.prototype.constructor = Panel;

  Panel.prototype._createDomNode = function(doc) {
    var node = doc.createElement("div");
    node.className = "jog-control jog-panel";
    return node;
  };

  function DockPanel() {
    Container.call(this, "DockPanel");
  }

  DockPanel.prototype = Object.create(Container.prototype);
  DockPanel.prototype.constructor = DockPanel;

  DockPanel.prototype._createDomNode = function(doc) {
    var node = doc.createElement("div");
    node.className = "jog-control jog-dock-panel";
    return node;
  };

  DockPanel.prototype._applyStateToDom = function(prevState, nextState) {
    Container.prototype._applyStateToDom.call(this, prevState, nextState);
    if (!this._domNode) {
      return;
    }

    var padding = normalizeBox(nextState.padding);
    var top = padding.top;
    var left = padding.left;
    var right = (this._domNode.clientWidth || this.Width || 0) - padding.right;
    var bottom = (this._domNode.clientHeight || this.Height || 0) - padding.bottom;

    this._children.forEach(function(child) {
      if (!child._domNode) {
        return;
      }

      var dock = child.Dock || "none";
      var width = child.Width || child._domNode.offsetWidth || 0;
      var height = child.Height || child._domNode.offsetHeight || 0;
      var margin = normalizeBox(child.Margin);
      var style = child._domNode.style;

      style.position = "absolute";

      if (dock === "top") {
        style.left = toCssPixels(left + margin.left);
        style.top = toCssPixels(top + margin.top);
        style.width = toCssPixels(Math.max(right - left - margin.left - margin.right, 0));
        if (height) {
          style.height = toCssPixels(height);
        }
        top += height + margin.top + margin.bottom;
        return;
      }

      if (dock === "bottom") {
        style.left = toCssPixels(left + margin.left);
        style.top = toCssPixels(Math.max(bottom - height - margin.bottom, top + margin.top));
        style.width = toCssPixels(Math.max(right - left - margin.left - margin.right, 0));
        if (height) {
          style.height = toCssPixels(height);
        }
        bottom -= height + margin.top + margin.bottom;
        return;
      }

      if (dock === "left") {
        style.left = toCssPixels(left + margin.left);
        style.top = toCssPixels(top + margin.top);
        if (width) {
          style.width = toCssPixels(width);
        }
        style.height = toCssPixels(Math.max(bottom - top - margin.top - margin.bottom, 0));
        left += width + margin.left + margin.right;
        return;
      }

      if (dock === "right") {
        style.left = toCssPixels(Math.max(right - width - margin.right, left + margin.left));
        style.top = toCssPixels(top + margin.top);
        if (width) {
          style.width = toCssPixels(width);
        }
        style.height = toCssPixels(Math.max(bottom - top - margin.top - margin.bottom, 0));
        right -= width + margin.left + margin.right;
        return;
      }

      if (dock === "fill") {
        style.left = toCssPixels(left + margin.left);
        style.top = toCssPixels(top + margin.top);
        style.width = toCssPixels(Math.max(right - left - margin.left - margin.right, 0));
        style.height = toCssPixels(Math.max(bottom - top - margin.top - margin.bottom, 0));
      }
    });
  };

  DockPanel.prototype._childUsesFlowLayout = function() {
    return false;
  };

  function StackPanel() {
    Container.call(this, "StackPanel");
    this._state.orientation = "vertical";
    this._state.spacing = 8;
  }

  StackPanel.prototype = Object.create(Container.prototype);
  StackPanel.prototype.constructor = StackPanel;

  StackPanel.prototype._createDomNode = function(doc) {
    var node = doc.createElement("div");
    node.className = "jog-control jog-stack-panel vertical";
    return node;
  };

  StackPanel.prototype._applyStateToDom = function(prevState, nextState) {
    Container.prototype._applyStateToDom.call(this, prevState, nextState);
    if (!this._domNode) {
      return;
    }
    this._domNode.classList.remove("vertical", "horizontal");
    this._domNode.classList.add(nextState.orientation === "horizontal" ? "horizontal" : "vertical");
    this._domNode.style.gap = toCssBox(nextState.gap != null ? nextState.gap : nextState.spacing) || "8px";
  };

  StackPanel.prototype._childUsesFlowLayout = function() {
    return true;
  };

  Object.defineProperty(StackPanel.prototype, "Orientation", {
    get: function() { return this._state.orientation; },
    set: function(value) { this._setState("orientation", value === "horizontal" ? "horizontal" : "vertical"); }
  });

  Object.defineProperty(StackPanel.prototype, "Spacing", {
    get: function() { return this._state.spacing; },
    set: function(value) { this._setState("spacing", isNumber(value) ? value : 8); }
  });

  function SectionPanel() {
    Container.call(this, "SectionPanel");
    this._state.title = "";
    this._bodyNode = null;
  }

  SectionPanel.prototype = Object.create(Container.prototype);
  SectionPanel.prototype.constructor = SectionPanel;

  SectionPanel.prototype._createDomNode = function(doc) {
    var node = doc.createElement("div");
    node.className = "jog-control jog-section";

    var header = doc.createElement("div");
    header.className = "jog-section-header";

    var body = doc.createElement("div");
    body.className = "jog-section-body";

    node.appendChild(header);
    node.appendChild(body);

    this._headerNode = header;
    this._bodyNode = body;
    return node;
  };

  SectionPanel.prototype._getChildHostNode = function() {
    return this._bodyNode || this._domNode;
  };

  SectionPanel.prototype._applyStateToDom = function(prevState, nextState) {
    Container.prototype._applyStateToDom.call(this, prevState, nextState);
    if (!this._domNode) {
      return;
    }
    this._headerNode.textContent = nextState.title || "";
    this._headerNode.style.display = nextState.title ? "" : "none";
    this._bodyNode.style.padding = toCssBox(nextState.padding != null ? nextState.padding : 16);
  };

  SectionPanel.prototype._childUsesFlowLayout = function() {
    return true;
  };

  Object.defineProperty(SectionPanel.prototype, "Title", {
    get: function() { return this._state.title; },
    set: function(value) { this._setState("title", value == null ? "" : String(value)); }
  });

  function Label() {
    Control.call(this, "Label");
  }

  Label.prototype = Object.create(Control.prototype);
  Label.prototype.constructor = Label;

  Label.prototype._createDomNode = function(doc) {
    var node = doc.createElement("label");
    node.className = "jog-control jog-label";
    return node;
  };

  Label.prototype._applyStateToDom = function(prevState, nextState) {
    Control.prototype._applyStateToDom.call(this, prevState, nextState);
    if (this._domNode) {
      this._domNode.textContent = nextState.text;
    }
  };

  function Button() {
    Control.call(this, "Button");
  }

  Button.prototype = Object.create(Control.prototype);
  Button.prototype.constructor = Button;

  Button.prototype._createDomNode = function(doc) {
    var node = doc.createElement("button");
    node.className = "jog-control jog-button";
    node.type = "button";
    return node;
  };

  Button.prototype._applyStateToDom = function(prevState, nextState) {
    Control.prototype._applyStateToDom.call(this, prevState, nextState);
    if (this._domNode) {
      this._domNode.textContent = nextState.text;
      this._domNode.disabled = !nextState.enabled;
    }
  };

  Button.prototype._bindDomEvents = function() {
    var control = this;
    this._domNode.addEventListener("click", function(event) {
      control._raiseEvent("Click", event);
    });
    this._domNode.addEventListener("focus", function(event) {
      control._raiseEvent("Focus", event);
    });
    this._domNode.addEventListener("blur", function(event) {
      control._raiseEvent("Blur", event);
    });
  };

  function TextBox() {
    Control.call(this, "TextBox");
    this._state.placeholder = "";
  }

  TextBox.prototype = Object.create(Control.prototype);
  TextBox.prototype.constructor = TextBox;

  TextBox.prototype._createDomNode = function(doc) {
    var node = doc.createElement("input");
    node.className = "jog-control jog-textbox";
    node.type = "text";
    return node;
  };

  TextBox.prototype._applyStateToDom = function(prevState, nextState) {
    Control.prototype._applyStateToDom.call(this, prevState, nextState);
    if (!this._domNode) {
      return;
    }
    if (this._domNode.value !== nextState.text) {
      this._domNode.value = nextState.text;
    }
    this._domNode.placeholder = nextState.placeholder || "";
    this._domNode.disabled = !nextState.enabled;
  };

  TextBox.prototype._bindDomEvents = function() {
    var control = this;
    this._domNode.addEventListener("input", function(event) {
      control._state.text = event.target.value;
      control._raiseEvent("Change", event, { Value: event.target.value });
      control._previousState = cloneState(control._state);
    });
    this._domNode.addEventListener("focus", function(event) {
      control._raiseEvent("Focus", event);
    });
    this._domNode.addEventListener("blur", function(event) {
      control._raiseEvent("Blur", event, { Value: event.target.value });
    });
    this._domNode.addEventListener("keydown", function(event) {
      control._raiseEvent("KeyDown", event, { Key: event.key, Value: event.target.value });
    });
    this._domNode.addEventListener("keyup", function(event) {
      control._raiseEvent("KeyUp", event, { Key: event.key, Value: event.target.value });
    });
  };

  Object.defineProperty(TextBox.prototype, "Placeholder", {
    get: function() { return this._state.placeholder; },
    set: function(value) { this._setState("placeholder", value == null ? "" : String(value)); }
  });

  TextBox.prototype.BindText = function(store, key) {
    var control = this;
    var listener = function(value) {
      control.Text = value == null ? "" : String(value);
    };
    var unsubscribe = store.Subscribe(key, listener);
    this._bindings.push({ unsubscribe: unsubscribe });
    listener(store.Get(key));
    this.Change(function(eventArgs) {
      store.Set(key, eventArgs.Value);
    });
  };

  function TextArea() {
    Control.call(this, "TextArea");
    this._state.placeholder = "";
  }

  TextArea.prototype = Object.create(Control.prototype);
  TextArea.prototype.constructor = TextArea;

  TextArea.prototype._createDomNode = function(doc) {
    var node = doc.createElement("textarea");
    node.className = "jog-control jog-textarea";
    return node;
  };

  TextArea.prototype._applyStateToDom = function(prevState, nextState) {
    Control.prototype._applyStateToDom.call(this, prevState, nextState);
    if (!this._domNode) {
      return;
    }
    if (this._domNode.value !== nextState.text) {
      this._domNode.value = nextState.text;
    }
    this._domNode.placeholder = nextState.placeholder || "";
    this._domNode.disabled = !nextState.enabled;
  };

  TextArea.prototype._bindDomEvents = function() {
    var control = this;
    this._domNode.addEventListener("input", function(event) {
      control._state.text = event.target.value;
      control._raiseEvent("Change", event, { Value: event.target.value });
      control._previousState = cloneState(control._state);
    });
    this._domNode.addEventListener("focus", function(event) {
      control._raiseEvent("Focus", event);
    });
    this._domNode.addEventListener("blur", function(event) {
      control._raiseEvent("Blur", event, { Value: event.target.value });
    });
  };

  Object.defineProperty(TextArea.prototype, "Placeholder", {
    get: function() { return this._state.placeholder; },
    set: function(value) { this._setState("placeholder", value == null ? "" : String(value)); }
  });

  TextArea.prototype.BindText = TextBox.prototype.BindText;

  function CheckBox() {
    Control.call(this, "CheckBox");
    this._state.checked = false;
  }

  CheckBox.prototype = Object.create(Control.prototype);
  CheckBox.prototype.constructor = CheckBox;

  CheckBox.prototype._createDomNode = function(doc) {
    var wrapper = doc.createElement("label");
    wrapper.className = "jog-control jog-checkbox-row";

    var input = doc.createElement("input");
    input.type = "checkbox";
    input.className = "jog-checkbox";

    var text = doc.createElement("span");

    wrapper.appendChild(input);
    wrapper.appendChild(text);

    this._inputNode = input;
    this._captionNode = text;
    return wrapper;
  };

  CheckBox.prototype._applyStateToDom = function(prevState, nextState) {
    Control.prototype._applyStateToDom.call(this, prevState, nextState);
    if (!this._domNode) {
      return;
    }
    this._inputNode.checked = !!nextState.checked;
    this._inputNode.disabled = !nextState.enabled;
    this._captionNode.textContent = nextState.text || "";
  };

  CheckBox.prototype._bindDomEvents = function() {
    var control = this;
    this._inputNode.addEventListener("change", function(event) {
      control._state.checked = !!event.target.checked;
      control._raiseEvent("Change", event, { Value: !!event.target.checked });
      control._previousState = cloneState(control._state);
    });
  };

  Object.defineProperty(CheckBox.prototype, "Checked", {
    get: function() { return !!this._state.checked; },
    set: function(value) { this._setState("checked", !!value); }
  });

  CheckBox.prototype.BindChecked = function(store, key) {
    var control = this;
    var listener = function(value) {
      control.Checked = !!value;
    };
    var unsubscribe = store.Subscribe(key, listener);
    this._bindings.push({ unsubscribe: unsubscribe });
    listener(store.Get(key));
    this.Change(function(eventArgs) {
      store.Set(key, !!eventArgs.Value);
    });
  };

  function DropDownList() {
    Control.call(this, "DropDownList");
    this._state.options = [];
    this._state.selectedValue = "";
  }

  DropDownList.prototype = Object.create(Control.prototype);
  DropDownList.prototype.constructor = DropDownList;

  DropDownList.prototype._createDomNode = function(doc) {
    var node = doc.createElement("select");
    node.className = "jog-control jog-select";
    return node;
  };

  DropDownList.prototype._applyStateToDom = function(prevState, nextState) {
    Control.prototype._applyStateToDom.call(this, prevState, nextState);
    if (!this._domNode) {
      return;
    }

    var optionsChanged = prevState.options !== nextState.options;
    if (optionsChanged) {
      this._domNode.innerHTML = "";
      ensureArray(nextState.options).forEach(function(option) {
        var el = document.createElement("option");
        if (typeof option === "object") {
          el.value = option.value;
          el.textContent = option.text;
        } else {
          el.value = option;
          el.textContent = option;
        }
        this._domNode.appendChild(el);
      }, this);
    }

    this._domNode.value = nextState.selectedValue || "";
    this._domNode.disabled = !nextState.enabled;
  };

  DropDownList.prototype._bindDomEvents = function() {
    var control = this;
    this._domNode.addEventListener("change", function(event) {
      control._state.selectedValue = event.target.value;
      control._raiseEvent("Change", event, { Value: event.target.value });
      control._previousState = cloneState(control._state);
    });
  };

  Object.defineProperty(DropDownList.prototype, "Options", {
    get: function() { return this._state.options.slice(); },
    set: function(value) { this._setState("options", ensureArray(value).slice()); }
  });

  Object.defineProperty(DropDownList.prototype, "SelectedValue", {
    get: function() { return this._state.selectedValue; },
    set: function(value) { this._setState("selectedValue", value == null ? "" : String(value)); }
  });

  DropDownList.prototype.BindSelectedValue = function(store, key) {
    var control = this;
    var listener = function(value) {
      control.SelectedValue = value == null ? "" : String(value);
    };
    var unsubscribe = store.Subscribe(key, listener);
    this._bindings.push({ unsubscribe: unsubscribe });
    listener(store.Get(key));
    this.Change(function(eventArgs) {
      store.Set(key, eventArgs.Value);
    });
  };

  function Window() {
    Container.call(this, "Window");
    this._state.title = "";
    this._state.modal = false;
    this._state.draggable = true;
    this._state.resizable = false;
    this._dragState = null;
    this._contentNode = null;
  }

  Window.prototype = Object.create(Container.prototype);
  Window.prototype.constructor = Window;

  Window.prototype._createDomNode = function(doc) {
    var node = doc.createElement("div");
    node.className = "jog-window";

    var titleBar = doc.createElement("div");
    titleBar.className = "jog-window-titlebar";

    var titleText = doc.createElement("span");
    titleText.className = "jog-window-title";
    titleBar.appendChild(titleText);

    var closeButton = doc.createElement("button");
    closeButton.type = "button";
    closeButton.textContent = "Close";
    closeButton.className = "jog-button";
    closeButton.style.padding = "4px 10px";
    closeButton.style.background = "#0f172a";
    closeButton.style.borderColor = "#0f172a";
    closeButton.style.color = "#f8fafc";
    titleBar.appendChild(closeButton);

    var content = doc.createElement("div");
    content.className = "jog-window-content";

    node.appendChild(titleBar);
    node.appendChild(content);

    this._titleNode = titleText;
    this._closeNode = closeButton;
    this._contentNode = content;
    this._titleBarNode = titleBar;

    return node;
  };

  Window.prototype._getChildHostNode = function() {
    return this._contentNode || this._domNode;
  };

  Window.prototype._applyStateToDom = function(prevState, nextState) {
    Container.prototype._applyStateToDom.call(this, prevState, nextState);
    if (!this._domNode) {
      return;
    }
    this._titleNode.textContent = nextState.title || "";
    this._domNode.style.left = toCssPixels(nextState.left);
    this._domNode.style.top = toCssPixels(nextState.top);
    this._domNode.style.width = isNumber(nextState.width) ? toCssPixels(nextState.width) : "420px";
    this._domNode.style.height = isNumber(nextState.height) ? toCssPixels(nextState.height) : "";
    this._domNode.style.zIndex = this._runtime.nextWindowZIndex();
    if (nextState.modal && nextState.visible) {
      this._runtime.showModalOverlay();
    } else if (!nextState.modal || !nextState.visible) {
      this._runtime.hideModalOverlay();
    }
  };

  Window.prototype._bindDomEvents = function() {
    var control = this;

    this._closeNode.addEventListener("click", function() {
      control.Close();
    });

    this._titleBarNode.addEventListener("mousedown", function(event) {
      if (!control._state.draggable) {
        return;
      }
      control._dragState = {
        startX: event.clientX,
        startY: event.clientY,
        left: control.Left || 0,
        top: control.Top || 0
      };

      function onMove(moveEvent) {
        if (!control._dragState) {
          return;
        }
        control.Location(
          control._dragState.left + (moveEvent.clientX - control._dragState.startX),
          control._dragState.top + (moveEvent.clientY - control._dragState.startY)
        );
      }

      function onUp() {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
        control._dragState = null;
      }

      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    });
  };

  Window.prototype.ShowModal = function() {
    this.Modal = true;
    this.Show();
    this.BringToFront();
  };

  Window.prototype.Close = function() {
    this.Hide();
    if (this.Modal) {
      this._runtime.hideModalOverlay();
    }
    this._raiseEvent("Close", null);
  };

  Window.prototype.BringToFront = function() {
    if (this._domNode) {
      this._domNode.style.zIndex = this._runtime.nextWindowZIndex();
    }
  };

  Object.defineProperty(Window.prototype, "Title", {
    get: function() { return this._state.title; },
    set: function(value) { this._setState("title", value == null ? "" : String(value)); }
  });

  Object.defineProperty(Window.prototype, "Modal", {
    get: function() { return this._state.modal; },
    set: function(value) { this._setState("modal", !!value); }
  });

  Object.defineProperty(Window.prototype, "Draggable", {
    get: function() { return this._state.draggable; },
    set: function(value) { this._setState("draggable", !!value); }
  });

  Object.defineProperty(Window.prototype, "Resizable", {
    get: function() { return this._state.resizable; },
    set: function(value) { this._setState("resizable", !!value); }
  });

  Window.prototype.OnClose = function(listener) {
    this._registerEvent("Close", listener);
  };

  function Dialog() {
    Window.call(this);
    this.Modal = true;
  }

  Dialog.prototype = Object.create(Window.prototype);
  Dialog.prototype.constructor = Dialog;

  JOG.Application = Application;
  JOG.Component = Component;
  JOG.Control = Control;
  JOG.Container = Container;
  JOG.Page = Page;
  JOG.Panel = Panel;
  JOG.DockPanel = DockPanel;
  JOG.SectionPanel = SectionPanel;
  JOG.StackPanel = StackPanel;
  JOG.Window = Window;
  JOG.Dialog = Dialog;
  JOG.Label = Label;
  JOG.Button = Button;
  JOG.TextBox = TextBox;
  JOG.TextArea = TextArea;
  JOG.CheckBox = CheckBox;
  JOG.DropDownList = DropDownList;
  JOG.Store = Store;
  JOG.EventArgs = EventArgs;

  global.JOG = JOG;
})(window);
