(function(global) {
  "use strict";

  var JOG = global.JOG;
  var AcmeJOG = global.AcmeJOG || {};

  if (!JOG) {
    throw new Error("AcmeJOG.Controls.js requires JOG to load first.");
  }

  JOG.RegisterStyleBlock("AcmeJOG.Controls", [
    ".acme-tag-picker { display: flex; flex-wrap: wrap; align-items: center; align-content: center; gap: 8px; min-height: 42px; padding: 10px; border: 1px solid var(--jog-border); border-radius: var(--jog-radius-control); background: var(--jog-surface); box-sizing: border-box; }",
    ".acme-tag-picker.is-empty { justify-content: flex-start; align-items: center; color: var(--jog-text-muted); }",
    ".acme-tag-picker-button { border: 1px solid var(--jog-border); background: var(--jog-surface-muted); color: var(--jog-text); border-radius: 999px; padding: 8px 12px; cursor: pointer; font: inherit; }",
    ".acme-tag-picker-button.is-selected { background: var(--jog-primary); border-color: var(--jog-primary); color: var(--jog-primary-text); }",
    ".acme-tag-picker-button:focus { outline: 2px solid var(--jog-primary); outline-offset: 2px; }",
    ".acme-tag-picker-button:disabled { opacity: 0.55; cursor: default; }",
    ".acme-tag-picker-empty { color: var(--jog-text-muted); font-size: var(--jog-font-size); line-height: var(--jog-line-height); }",
    ".acme-inspector-card { display: flex; flex-direction: column; gap: 0; background: var(--jog-surface); border: 1px solid var(--jog-border-soft); border-radius: var(--jog-radius-section); box-shadow: var(--jog-shadow-section); overflow: hidden; }",
    ".acme-inspector-card-header { padding: 14px 16px; background: var(--jog-surface-muted); border-bottom: 1px solid var(--jog-border-soft); }",
    ".acme-inspector-card-title { margin: 0; font-size: var(--jog-title-size); font-weight: 600; color: var(--jog-text-strong); }",
    ".acme-inspector-card-body { display: flex; flex-direction: column; gap: 12px; padding: 16px; min-width: 0; }",
    ".acme-inspector-card-body > .jog-control { min-width: 0; }",
    ".acme-inspector-card-footer { padding: 12px 16px; border-top: 1px solid var(--jog-border-soft); color: var(--jog-text-muted); background: var(--jog-surface-muted); font-size: var(--jog-caption-size); }",
    ".acme-command-dialog { border-color: color-mix(in srgb, var(--jog-primary) 20%, var(--jog-border)); box-shadow: 0 28px 60px rgba(15, 23, 42, 0.24); }",
    ".acme-command-dialog .jog-window-titlebar { align-items: flex-start; gap: 12px; }",
    ".acme-command-dialog-title-wrap { display: flex; flex-direction: column; gap: 4px; min-width: 0; flex: 1 1 auto; }",
    ".acme-command-dialog-subtitle { color: var(--jog-text-muted); font-size: var(--jog-caption-size); line-height: 1.4; }",
    ".acme-command-dialog-status { margin-left: auto; border: 1px solid color-mix(in srgb, var(--jog-primary) 22%, var(--jog-border)); border-radius: 999px; padding: 4px 10px; background: color-mix(in srgb, var(--jog-primary) 8%, white); color: var(--jog-primary); font-size: var(--jog-caption-size); white-space: nowrap; }",
    ".acme-command-dialog-content { display: flex; flex-direction: column; gap: 0; padding: 0; }",
    ".acme-command-dialog-body { display: flex; flex-direction: column; gap: 12px; padding: 18px; min-height: 0; }",
    ".acme-command-dialog-footer { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 14px 18px; border-top: 1px solid var(--jog-border-soft); background: var(--jog-surface-muted); }",
    ".acme-command-dialog-footer-note { color: var(--jog-text-muted); font-size: var(--jog-caption-size); }"
  ].join("\n"));

  function normalizeTagItems(value) {
    return Array.isArray(value) ? value.map(function(item) {
      if (item && typeof item === "object") {
        return {
          value: item.value == null ? "" : String(item.value),
          text: item.text == null ? String(item.value == null ? "" : item.value) : String(item.text)
        };
      }
      return {
        value: item == null ? "" : String(item),
        text: item == null ? "" : String(item)
      };
    }) : [];
  }

  function TagPicker() {
    JOG.Control.call(this, "TagPicker");
    this._buttonNodes = [];
    this._emptyNode = null;
    this._pendingFocusValue = null;
    this.SetStateValue("items", []);
    this.SetStateValue("value", "");
    this.SetStateValue("placeholder", "No options available.");
  }

  TagPicker.prototype = Object.create(JOG.Control.prototype);
  TagPicker.prototype.constructor = TagPicker;

  TagPicker.prototype.CreateDom = function(doc) {
    var node = doc.createElement("div");
    var empty = doc.createElement("span");

    node.className = "jog-control acme-tag-picker";
    node.setAttribute("role", "radiogroup");
    empty.className = "acme-tag-picker-empty";
    node.appendChild(empty);

    this._emptyNode = empty;
    this._buttonNodes = [];

    return node;
  };

  TagPicker.prototype._findItemIndexByValue = function(value) {
    var items = this.GetStateValue("items") || [];
    var i;

    for (i = 0; i < items.length; i += 1) {
      if (items[i].value === value) {
        return i;
      }
    }

    return items.length ? 0 : -1;
  };

  TagPicker.prototype._focusItemAtIndex = function(index) {
    var button = this._buttonNodes[index];

    if (button && typeof button.focus === "function") {
      button.focus();
    }
  };

  TagPicker.prototype._selectItemValue = function(value, originalEvent) {
    if (!this.Enabled) {
      return;
    }
    if (this.Value === value) {
      this.ClearError();
      return;
    }
    this._pendingFocusValue = value;
    this.Value = value;
    this.ClearError();
    this.RaiseEvent("Change", originalEvent || null, { Value: value });
  };

  TagPicker.prototype.ApplyState = function(prevState, nextState) {
    var control = this;

    JOG.Control.prototype.ApplyState.call(this, prevState, nextState);
    if (!this._domNode) {
      return;
    }

    while (this._domNode.children.length) {
      this._domNode.removeChild(this._domNode.children[0]);
    }
    this._buttonNodes = [];

    if (!nextState.items.length) {
      this._domNode.classList.add("is-empty");
      this._emptyNode = this._runtime.document.createElement("span");
      this._emptyNode.className = "acme-tag-picker-empty";
      this._emptyNode.textContent = nextState.placeholder || "";
      this._domNode.appendChild(this._emptyNode);
      this._pendingFocusValue = null;
      return;
    }

    this._domNode.classList.remove("is-empty");
    nextState.items.forEach(function(item) {
      var button = control._runtime.document.createElement("button");
      button.type = "button";
      button.className = "acme-tag-picker-button";
      button.textContent = item.text;
      button.disabled = !nextState.enabled;
      button._tagValue = item.value;
      button.setAttribute("role", "radio");
      button.setAttribute("aria-checked", nextState.value === item.value ? "true" : "false");
      button.tabIndex = nextState.value === item.value ? 0 : -1;
      button.classList.toggle("is-selected", nextState.value === item.value);
      button.addEventListener("click", function(event) {
        control._selectItemValue(item.value, event);
      });
      button.addEventListener("keydown", function(event) {
        var currentIndex = control._findItemIndexByValue(item.value);
        var nextIndex = currentIndex;
        var items = nextState.items;

        if (!items.length) {
          return;
        }

        if (event.key === "ArrowRight" || event.key === "ArrowDown") {
          nextIndex = (currentIndex + 1) % items.length;
        } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
          nextIndex = (currentIndex - 1 + items.length) % items.length;
        } else if (event.key === "Home") {
          nextIndex = 0;
        } else if (event.key === "End") {
          nextIndex = items.length - 1;
        } else if (event.key === " " || event.key === "Enter") {
          control._selectItemValue(item.value, event);
          if (typeof event.preventDefault === "function") {
            event.preventDefault();
          }
          return;
        } else {
          return;
        }

        control._selectItemValue(items[nextIndex].value, event);
        control._focusItemAtIndex(nextIndex);
        if (typeof event.preventDefault === "function") {
          event.preventDefault();
        }
      });
      control._buttonNodes.push(button);
      control._domNode.appendChild(button);
    });

    if (this._pendingFocusValue != null) {
      this._focusItemAtIndex(this._findItemIndexByValue(this._pendingFocusValue));
      this._pendingFocusValue = null;
    }
  };

  TagPicker.prototype.Focus = function() {
    var index;

    if (this._lifecycle === "Disposed") {
      JOG.Control.prototype.Focus.call(this);
      return;
    }

    index = this._findItemIndexByValue(this.Value);
    if (index < 0) {
      index = 0;
    }
    this._focusItemAtIndex(index);
  };

  TagPicker.prototype.BindValue = function(store, key) {
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

  JOG.DefineControlProperty(TagPicker.prototype, "Items", {
    get: function() {
      return this.GetStateValue("items").slice();
    },
    set: function(value) {
      this.SetStateValue("items", normalizeTagItems(value));
    }
  });

  JOG.DefineControlProperty(TagPicker.prototype, "Value", {
    normalize: function(value) {
      return value == null ? "" : String(value);
    }
  });

  JOG.DefineControlProperty(TagPicker.prototype, "Placeholder", {
    normalize: function(value) {
      return value == null ? "" : String(value);
    }
  });

  function InspectorCard() {
    JOG.Container.call(this, "InspectorCard");
    this._headerNode = null;
    this._titleNode = null;
    this._bodyNode = null;
    this._footerNode = null;
    this.SetStateValue("titleText", "");
    this.SetStateValue("footerText", "");
  }

  InspectorCard.prototype = Object.create(JOG.Container.prototype);
  InspectorCard.prototype.constructor = InspectorCard;

  InspectorCard.prototype.CreateDom = function(doc) {
    var node = doc.createElement("section");
    var header = doc.createElement("div");
    var title = doc.createElement("h3");
    var body = doc.createElement("div");
    var footer = doc.createElement("div");

    node.className = "jog-control acme-inspector-card";
    header.className = "acme-inspector-card-header";
    title.className = "acme-inspector-card-title";
    body.className = "acme-inspector-card-body";
    footer.className = "acme-inspector-card-footer";

    header.appendChild(title);
    node.appendChild(header);
    node.appendChild(body);
    node.appendChild(footer);

    this._headerNode = header;
    this._titleNode = title;
    this._bodyNode = body;
    this._footerNode = footer;

    return node;
  };

  InspectorCard.prototype.GetChildHostNode = function() {
    return this._bodyNode || this._domNode;
  };

  InspectorCard.prototype._childUsesFlowLayout = function() {
    return true;
  };

  InspectorCard.prototype.ApplyState = function(prevState, nextState) {
    JOG.Container.prototype.ApplyState.call(this, prevState, nextState);
    if (!this._domNode) {
      return;
    }

    this._titleNode.textContent = nextState.titleText || "";
    this._headerNode.style.display = nextState.titleText ? "" : "none";
    this._footerNode.textContent = nextState.footerText || "";
    this._footerNode.style.display = nextState.footerText ? "" : "none";
  };

  JOG.DefineControlProperty(InspectorCard.prototype, "TitleText", {
    stateKey: "titleText",
    normalize: function(value) {
      return value == null ? "" : String(value);
    }
  });

  JOG.DefineControlProperty(InspectorCard.prototype, "FooterText", {
    stateKey: "footerText",
    normalize: function(value) {
      return value == null ? "" : String(value);
    }
  });

  function CommandPaletteDialog() {
    JOG.Dialog.call(this);
    this._subtitleNode = null;
    this._statusNode = null;
    this._bodyNode = null;
    this._footerNode = null;
    this._footerNoteNode = null;
    this._actionButton = null;
    this.SetStateValue("subtitleText", "");
    this.SetStateValue("statusText", "");
    this.SetStateValue("actionText", "Apply");
    this.SetStateValue("footerNoteText", "");
  }

  CommandPaletteDialog.prototype = Object.create(JOG.Dialog.prototype);
  CommandPaletteDialog.prototype.constructor = CommandPaletteDialog;

  CommandPaletteDialog.prototype.CreateDom = function(doc) {
    var node = JOG.Window.prototype.CreateDom.call(this, doc);
    var shell = this.GetWindowShell();
    var titleWrap = doc.createElement("div");
    var subtitle = doc.createElement("div");
    var status = doc.createElement("div");
    var body = doc.createElement("div");
    var footer = doc.createElement("div");
    var footerNote = doc.createElement("div");
    var actionButton = doc.createElement("button");

    titleWrap.className = "acme-command-dialog-title-wrap";
    subtitle.className = "acme-command-dialog-subtitle";
    status.className = "acme-command-dialog-status";
    body.className = "acme-command-dialog-body";
    footer.className = "acme-command-dialog-footer";
    footerNote.className = "acme-command-dialog-footer-note";
    actionButton.type = "button";
    actionButton.className = "jog-button jog-theme-preset-primary";

    node.classList.add("acme-command-dialog");
    shell.content.classList.add("acme-command-dialog-content");

    shell.titleBar.removeChild(shell.title);
    shell.titleBar.removeChild(shell.closeButton);
    shell.titleBar.appendChild(titleWrap);
    titleWrap.appendChild(shell.title);
    titleWrap.appendChild(subtitle);
    shell.titleBar.appendChild(status);
    shell.titleBar.appendChild(shell.closeButton);

    shell.content.appendChild(body);
    shell.content.appendChild(footer);
    footer.appendChild(footerNote);
    footer.appendChild(actionButton);

    this._subtitleNode = subtitle;
    this._statusNode = status;
    this._bodyNode = body;
    this._footerNode = footer;
    this._footerNoteNode = footerNote;
    this._actionButton = actionButton;

    return node;
  };

  CommandPaletteDialog.prototype.GetChildHostNode = function() {
    return this._bodyNode || JOG.Dialog.prototype.GetChildHostNode.call(this);
  };

  CommandPaletteDialog.prototype._childUsesFlowLayout = function() {
    return true;
  };

  CommandPaletteDialog.prototype.ApplyState = function(prevState, nextState) {
    JOG.Window.prototype.ApplyState.call(this, prevState, nextState);
    if (!this._domNode) {
      return;
    }

    this._subtitleNode.textContent = nextState.subtitleText || "";
    this._subtitleNode.style.display = nextState.subtitleText ? "" : "none";
    this._statusNode.textContent = nextState.statusText || "";
    this._statusNode.style.display = nextState.statusText ? "" : "none";
    this._footerNoteNode.textContent = nextState.footerNoteText || "";
    this._footerNoteNode.style.display = nextState.footerNoteText ? "" : "none";
    this._actionButton.textContent = nextState.actionText || "Apply";
    this._actionButton.disabled = !nextState.enabled;
  };

  CommandPaletteDialog.prototype.BindDomEvents = function() {
    var control = this;
    JOG.Window.prototype.BindDomEvents.call(this);
    this._actionButton.addEventListener("click", function(event) {
      if (!control.Enabled) {
        return;
      }
      control.RaiseEvent("Commit", event, { Value: control.ActionText });
    });
  };

  CommandPaletteDialog.prototype.OnCommit = function(listener) {
    this.RegisterEvent("Commit", listener);
  };

  JOG.DefineControlProperty(CommandPaletteDialog.prototype, "SubtitleText", {
    stateKey: "subtitleText",
    normalize: function(value) {
      return value == null ? "" : String(value);
    }
  });

  JOG.DefineControlProperty(CommandPaletteDialog.prototype, "StatusText", {
    stateKey: "statusText",
    normalize: function(value) {
      return value == null ? "" : String(value);
    }
  });

  JOG.DefineControlProperty(CommandPaletteDialog.prototype, "ActionText", {
    stateKey: "actionText",
    normalize: function(value) {
      return value == null ? "" : String(value);
    }
  });

  JOG.DefineControlProperty(CommandPaletteDialog.prototype, "FooterNoteText", {
    stateKey: "footerNoteText",
    normalize: function(value) {
      return value == null ? "" : String(value);
    }
  });

  AcmeJOG.TagPicker = TagPicker;
  AcmeJOG.InspectorCard = InspectorCard;
  AcmeJOG.CommandPaletteDialog = CommandPaletteDialog;

  JOG.RegisterControl({
    fullName: "AcmeJOG.TagPicker",
    version: "1.0.0",
    jogVersionRange: "^2.0.0",
    constructor: TagPicker,
    metadata: {
      baseType: "Control",
      properties: ["Items", "Value", "Placeholder", "Invalid", "ErrorText", "ThemePreset"],
      events: ["OnChange"],
      methods: ["BindValue", "SetError", "ClearError", "BindError"],
      themePresets: [],
      capabilities: {
        supportsValidation: true,
        supportsKeyboard: true,
        supportsResponsiveLayout: true,
        supportsCollection: false,
        supportsChildren: false,
        supportsFocusRestore: false
      }
    }
  });

  JOG.RegisterControl({
    fullName: "AcmeJOG.InspectorCard",
    version: "1.0.0",
    jogVersionRange: "^2.0.0",
    constructor: InspectorCard,
    metadata: {
      baseType: "Container",
      properties: ["TitleText", "FooterText", "Invalid", "ErrorText", "ThemePreset"],
      events: [],
      methods: ["Add", "Remove", "Clear"],
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

  JOG.RegisterControl({
    fullName: "AcmeJOG.CommandPaletteDialog",
    version: "1.0.0",
    jogVersionRange: "^2.0.0",
    constructor: CommandPaletteDialog,
    metadata: {
      baseType: "Dialog",
      properties: [
        "Title",
        "SubtitleText",
        "StatusText",
        "ActionText",
        "FooterNoteText",
        "Modal",
        "CloseButtonText",
        "CloseOnEscape"
      ],
      events: ["OnCommit", "OnShow", "OnHide", "OnClose"],
      methods: ["Add", "Remove", "Clear", "ShowModal", "BringToFront", "Close", "GetWindowShell"],
      themePresets: [],
      capabilities: {
        supportsValidation: false,
        supportsKeyboard: true,
        supportsResponsiveLayout: false,
        supportsCollection: false,
        supportsChildren: true,
        supportsFocusRestore: false
      }
    }
  });

  global.AcmeJOG = AcmeJOG;
})(window);
