(function(global) {
  "use strict";

  var JOG = global.JOG;
  var BeaconJOG = global.BeaconJOG || {};

  if (!JOG) {
    throw new Error("BeaconJOG.Controls.js requires JOG to load first.");
  }

  JOG.RegisterStyleBlock("BeaconJOG.Controls", [
    ".beacon-view-switch { display: inline-flex; flex-wrap: wrap; gap: 6px; padding: 6px; border: 1px solid var(--jog-border-soft); border-radius: var(--jog-radius-control); background: var(--jog-surface-muted); box-sizing: border-box; }",
    ".beacon-view-switch-button { border: 0; background: transparent; color: var(--jog-text-muted); border-radius: calc(var(--jog-radius-control) - 2px); padding: 8px 12px; cursor: pointer; font: inherit; }",
    ".beacon-view-switch-button.is-selected { background: var(--jog-surface); color: var(--jog-text-strong); box-shadow: var(--jog-shadow-section); }",
    ".beacon-view-switch-button:focus { outline: 2px solid var(--jog-primary); outline-offset: 2px; }",
    ".beacon-view-switch-button:disabled { opacity: 0.45; cursor: default; }",
    ".beacon-view-switch-empty { color: var(--jog-text-muted); font-size: var(--jog-font-size); line-height: var(--jog-line-height); padding: 2px 4px; }",
    ".beacon-metric-card { display: block; min-width: 0; border: 1px solid var(--jog-border-soft); border-radius: var(--jog-radius-section); background: linear-gradient(180deg, var(--jog-surface) 0%, var(--jog-surface-muted) 100%); box-shadow: var(--jog-shadow-section); padding: 16px; box-sizing: border-box; }",
    ".beacon-metric-layout { min-width: 0; }",
    ".beacon-metric-value { display: block; font-size: calc(var(--jog-title-size) + 14px); line-height: 1.1; font-weight: 700; color: var(--jog-text-strong); }",
    ".beacon-metric-detail { color: var(--jog-text-muted); }",
    ".beacon-metric-accessory { min-width: 0; }",
    ".beacon-metric-footer { color: var(--jog-text-muted); font-size: var(--jog-caption-size); line-height: 1.45; }"
  ].join("\n"));

  function normalizeSwitchItems(value) {
    return Array.isArray(value) ? value.map(function(item) {
      if (item && typeof item === "object") {
        return {
          key: item.key == null ? String(item.value == null ? "" : item.value) : String(item.key),
          value: item.value == null ? String(item.key == null ? "" : item.key) : String(item.value),
          text: item.text == null ? String(item.value == null ? item.key : item.value) : String(item.text),
          enabled: item.enabled !== false
        };
      }
      return {
        key: String(item == null ? "" : item),
        value: String(item == null ? "" : item),
        text: String(item == null ? "" : item),
        enabled: true
      };
    }) : [];
  }

  function ViewSwitch() {
    JOG.Control.call(this, "ViewSwitch");
    this._buttonNodes = [];
    this._pendingFocusValue = null;
    this.SetStateValue("items", []);
    this.SetStateValue("value", "");
    this.SetStateValue("placeholder", "No views available.");
  }

  ViewSwitch.prototype = Object.create(JOG.Control.prototype);
  ViewSwitch.prototype.constructor = ViewSwitch;

  ViewSwitch.prototype.CreateDom = function(doc) {
    var node = doc.createElement("div");
    node.className = "jog-control beacon-view-switch";
    node.setAttribute("role", "radiogroup");
    return node;
  };

  ViewSwitch.prototype._findIndexByValue = function(value) {
    var items = this.GetStateValue("items") || [];
    var i;
    for (i = 0; i < items.length; i += 1) {
      if (items[i].value === value) {
        return i;
      }
    }
    return -1;
  };

  ViewSwitch.prototype._findNextEnabledIndex = function(startIndex, direction) {
    var items = this.GetStateValue("items") || [];
    var count = items.length;
    var attempts = 0;
    var index = startIndex;

    if (!count) {
      return -1;
    }

    while (attempts < count) {
      index = (index + direction + count) % count;
      if (items[index].enabled !== false) {
        return index;
      }
      attempts += 1;
    }

    return startIndex >= 0 && startIndex < count && items[startIndex].enabled !== false ? startIndex : -1;
  };

  ViewSwitch.prototype._focusIndex = function(index) {
    var button = this._buttonNodes[index];
    if (button && typeof button.focus === "function") {
      button.focus();
    }
  };

  ViewSwitch.prototype._selectValue = function(value, originalEvent) {
    if (!this.Enabled) {
      return;
    }
    if (this.Value === value) {
      return;
    }
    this._pendingFocusValue = value;
    this.Value = value;
    this.RaiseEvent("Change", originalEvent || null, { Value: value });
  };

  ViewSwitch.prototype.ApplyState = function(prevState, nextState) {
    var control = this;
    var selectedIndex = this._findIndexByValue(nextState.value);

    JOG.Control.prototype.ApplyState.call(this, prevState, nextState);
    if (!this._domNode) {
      return;
    }

    while (this._domNode.children.length) {
      this._domNode.removeChild(this._domNode.children[0]);
    }
    this._buttonNodes = [];

    if (!nextState.items.length) {
      var empty = this._runtime.document.createElement("span");
      empty.className = "beacon-view-switch-empty";
      empty.textContent = nextState.placeholder || "";
      this._domNode.appendChild(empty);
      this._pendingFocusValue = null;
      return;
    }

    nextState.items.forEach(function(item, index) {
      var button = control._runtime.document.createElement("button");
      button.type = "button";
      button.className = "beacon-view-switch-button";
      button.textContent = item.text;
      button.disabled = !nextState.enabled || item.enabled === false;
      button.setAttribute("role", "radio");
      button.setAttribute("aria-checked", nextState.value === item.value ? "true" : "false");
      button.tabIndex = nextState.value === item.value ? 0 : -1;
      button.classList.toggle("is-selected", nextState.value === item.value);
      button.addEventListener("click", function(event) {
        if (item.enabled === false) {
          return;
        }
        control._selectValue(item.value, event);
      });
      button.addEventListener("keydown", function(event) {
        var currentIndex = control._findIndexByValue(item.value);
        var nextIndex = currentIndex;

        if (event.key === "ArrowRight" || event.key === "ArrowDown") {
          nextIndex = control._findNextEnabledIndex(currentIndex, 1);
        } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
          nextIndex = control._findNextEnabledIndex(currentIndex, -1);
        } else if (event.key === "Home") {
          nextIndex = control._findNextEnabledIndex(-1, 1);
        } else if (event.key === "End") {
          nextIndex = control._findNextEnabledIndex(0, -1);
        } else if (event.key === " " || event.key === "Enter") {
          control._selectValue(item.value, event);
          if (typeof event.preventDefault === "function") {
            event.preventDefault();
          }
          return;
        } else {
          return;
        }

        if (nextIndex >= 0) {
          control._selectValue(nextState.items[nextIndex].value, event);
          control._focusIndex(nextIndex);
        }
        if (typeof event.preventDefault === "function") {
          event.preventDefault();
        }
      });

      control._buttonNodes.push(button);
      control._domNode.appendChild(button);
    });

    if (selectedIndex < 0) {
      selectedIndex = this._findNextEnabledIndex(-1, 1);
      if (selectedIndex >= 0 && nextState.items[selectedIndex]) {
        this.SetStateValue("value", nextState.items[selectedIndex].value);
      }
    }

    if (this._pendingFocusValue != null) {
      this._focusIndex(this._findIndexByValue(this._pendingFocusValue));
      this._pendingFocusValue = null;
    }
  };

  ViewSwitch.prototype.Focus = function() {
    var index;
    if (this._lifecycle === "Disposed") {
      JOG.Control.prototype.Focus.call(this);
      return;
    }
    index = this._findIndexByValue(this.Value);
    if (index < 0) {
      index = this._findNextEnabledIndex(-1, 1);
    }
    this._focusIndex(index);
  };

  ViewSwitch.prototype.BindValue = function(store, key) {
    var control = this;
    var unsubscribe = store.Subscribe(key, function(value) {
      control.Value = value == null ? "" : String(value);
    });
    this.TrackBinding(unsubscribe);
    this.Value = store.Get(key) == null ? "" : String(store.Get(key));
    this.OnChange(function(args) {
      store.Set(key, args.Value);
    });
  };

  JOG.DefineControlProperty(ViewSwitch.prototype, "Items", {
    get: function() {
      return this.GetStateValue("items").slice();
    },
    set: function(value) {
      this.SetStateValue("items", normalizeSwitchItems(value));
    }
  });

  JOG.DefineControlProperty(ViewSwitch.prototype, "Value", {
    normalize: function(value) {
      return value == null ? "" : String(value);
    }
  });

  JOG.DefineControlProperty(ViewSwitch.prototype, "Placeholder", {
    normalize: function(value) {
      return value == null ? "" : String(value);
    }
  });

  function MetricCard() {
    JOG.Container.call(this, "MetricCard");
    this._layout = new JOG.StackPanel();
    this._eyebrowLabel = new JOG.Label();
    this._valueLabel = new JOG.Label();
    this._detailLabel = new JOG.Label();
    this._accessoryHost = new JOG.StackPanel();
    this._footerLabel = new JOG.Label();
    this._accessoryChild = null;

    this._layout.Name = "metricCardLayout";
    this._layout.Orientation = "vertical";
    this._layout.Spacing = 8;
    this._layout.CssClass = "beacon-metric-layout";

    this._eyebrowLabel.ThemePreset = "strong";
    this._valueLabel.CssClass = "beacon-metric-value";
    this._detailLabel.CssClass = "beacon-metric-detail";
    this._accessoryHost.Orientation = "vertical";
    this._accessoryHost.Spacing = 0;
    this._accessoryHost.CssClass = "beacon-metric-accessory";
    this._footerLabel.CssClass = "beacon-metric-footer";

    this._layout.Add(this._eyebrowLabel);
    this._layout.Add(this._valueLabel);
    this._layout.Add(this._detailLabel);
    this._layout.Add(this._accessoryHost);
    this._layout.Add(this._footerLabel);
    JOG.Container.prototype.Add.call(this, this._layout);

    this.SetStateValue("eyebrowText", "");
    this.SetStateValue("valueText", "");
    this.SetStateValue("detailText", "");
    this.SetStateValue("footerText", "");
  }

  MetricCard.prototype = Object.create(JOG.Container.prototype);
  MetricCard.prototype.constructor = MetricCard;

  MetricCard.prototype.CreateDom = function(doc) {
    var node = doc.createElement("section");
    node.className = "jog-control beacon-metric-card";
    return node;
  };

  MetricCard.prototype._childUsesFlowLayout = function() {
    return true;
  };

  MetricCard.prototype.SetAccessory = function(child) {
    if (this._accessoryChild) {
      this._accessoryHost.Remove(this._accessoryChild);
      this._accessoryChild = null;
    }
    if (child) {
      this._accessoryHost.Add(child);
      this._accessoryChild = child;
      this._accessoryHost.Visible = true;
    } else {
      this._accessoryHost.Visible = false;
    }
  };

  MetricCard.prototype.ApplyState = function(prevState, nextState) {
    JOG.Container.prototype.ApplyState.call(this, prevState, nextState);
    this._eyebrowLabel.Text = nextState.eyebrowText || "";
    this._eyebrowLabel.Visible = !!nextState.eyebrowText;
    this._valueLabel.Text = nextState.valueText || "";
    this._valueLabel.Visible = !!nextState.valueText;
    this._detailLabel.Text = nextState.detailText || "";
    this._detailLabel.Visible = !!nextState.detailText;
    this._footerLabel.Text = nextState.footerText || "";
    this._footerLabel.Visible = !!nextState.footerText;
    this._accessoryHost.Visible = !!this._accessoryChild;
  };

  JOG.DefineControlProperty(MetricCard.prototype, "EyebrowText", {
    stateKey: "eyebrowText",
    normalize: function(value) {
      return value == null ? "" : String(value);
    }
  });

  JOG.DefineControlProperty(MetricCard.prototype, "ValueText", {
    stateKey: "valueText",
    normalize: function(value) {
      return value == null ? "" : String(value);
    }
  });

  JOG.DefineControlProperty(MetricCard.prototype, "DetailText", {
    stateKey: "detailText",
    normalize: function(value) {
      return value == null ? "" : String(value);
    }
  });

  JOG.DefineControlProperty(MetricCard.prototype, "FooterText", {
    stateKey: "footerText",
    normalize: function(value) {
      return value == null ? "" : String(value);
    }
  });

  BeaconJOG.ViewSwitch = ViewSwitch;
  BeaconJOG.MetricCard = MetricCard;

  JOG.RegisterControl({
    fullName: "BeaconJOG.ViewSwitch",
    version: "1.0.0",
    jogVersionRange: "^2.0.0",
    constructor: ViewSwitch,
    metadata: {
      baseType: "Control",
      properties: ["Items", "Value", "Placeholder", "Invalid", "ErrorText", "ThemePreset"],
      events: ["OnChange"],
      methods: ["BindValue", "Focus", "SetError", "ClearError", "BindError"],
      themePresets: [],
      capabilities: {
        supportsValidation: false,
        supportsKeyboard: true,
        supportsResponsiveLayout: true,
        supportsCollection: false,
        supportsChildren: false,
        supportsFocusRestore: true
      }
    }
  });

  JOG.RegisterControl({
    fullName: "BeaconJOG.MetricCard",
    version: "1.0.0",
    jogVersionRange: "^2.0.0",
    constructor: MetricCard,
    metadata: {
      baseType: "Container",
      properties: ["EyebrowText", "ValueText", "DetailText", "FooterText", "ThemePreset"],
      events: [],
      methods: ["SetAccessory", "Add", "Remove", "Clear"],
      themePresets: [],
      capabilities: {
        supportsValidation: false,
        supportsKeyboard: false,
        supportsResponsiveLayout: true,
        supportsCollection: false,
        supportsChildren: true,
        supportsFocusRestore: false
      }
    }
  });

  global.BeaconJOG = BeaconJOG;
})(window);
