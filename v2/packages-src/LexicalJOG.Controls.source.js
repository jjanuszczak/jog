(function(global) {
  "use strict";

  var lexical = require("lexical");
  var createEditor = lexical.createEditor;
  var $createParagraphNode = lexical.$createParagraphNode;
  var $createTextNode = lexical.$createTextNode;
  var $getRoot = lexical.$getRoot;
  var FORMAT_TEXT_COMMAND = lexical.FORMAT_TEXT_COMMAND;
  var registerPlainText = require("@lexical/plain-text").registerPlainText;
  var lexicalRichText = require("@lexical/rich-text");
  var HeadingNode = lexicalRichText.HeadingNode;
  var QuoteNode = lexicalRichText.QuoteNode;
  var registerRichText = lexicalRichText.registerRichText;
  var thirdPartyHelpers = require("./ThirdPartyJOG.Helpers");
  var JOG = global.JOG;
  var LexicalJOG = global.LexicalJOG || {};
  var testingAdapterFactory = null;
  var EMPTY_EDITOR_STATE_JSON = '{"root":{"children":[],"direction":null,"format":"","indent":0,"type":"root","version":1}}';
  var TEXT_FORMAT_TYPES = {
    bold: true,
    italic: true,
    underline: true,
    strikethrough: true,
    code: true,
    highlight: true,
    subscript: true,
    superscript: true
  };

  if (!JOG) {
    throw new Error("LexicalJOG.Controls.js requires JOG to load first.");
  }

  JOG.RegisterStyleBlock("LexicalJOG.Controls", [
    ".lexicaljog-box { position: relative; display: block; min-width: 0; min-height: 0; border: 1px solid var(--jog-border); border-radius: var(--jog-radius-control); background: var(--jog-surface); color: var(--jog-text); box-sizing: border-box; overflow: hidden; }",
    ".lexicaljog-box.is-readonly { background: var(--jog-surface-muted); }",
    ".lexicaljog-box.is-disabled { opacity: 0.6; }",
    ".lexicaljog-box.jog-invalid { border-color: var(--jog-danger); box-shadow: var(--jog-shadow-invalid-ring); }",
    ".lexicaljog-box-host { position: relative; min-height: 120px; padding: var(--jog-control-padding-y) var(--jog-control-padding-x); font: inherit; color: inherit; line-height: var(--jog-line-height); overflow-wrap: anywhere; outline: none; }",
    ".lexicaljog-plain-text-box-host { white-space: pre-wrap; }",
    ".lexicaljog-rich-text-box-host { white-space: normal; }",
    ".lexicaljog-box-host[contenteditable=\"false\"] { cursor: default; }",
    ".lexicaljog-box:focus-within { border-color: var(--jog-primary); box-shadow: 0 0 0 1px var(--jog-primary); }",
    ".lexicaljog-box-placeholder { position: absolute; top: var(--jog-control-padding-y); left: var(--jog-control-padding-x); right: var(--jog-control-padding-x); color: var(--jog-text-muted); pointer-events: none; user-select: none; white-space: pre-wrap; overflow-wrap: anywhere; }",
    ".lexicaljog-box-placeholder.hidden { display: none; }",
    ".lexicaljog-box.jog-theme-preset-muted { background: var(--jog-surface-muted); }",
    ".lexicaljog-box.jog-theme-preset-primary { border-color: color-mix(in srgb, var(--jog-primary) 38%, var(--jog-border)); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--jog-primary) 12%, transparent); }",
    ".lexicaljog-rich-text-box-host > *:first-child { margin-top: 0; }",
    ".lexicaljog-rich-text-box-host > *:last-child { margin-bottom: 0; }",
    ".lexicaljog-rich-text-box-host p { margin: 0 0 0.7em; }",
    ".lexicaljog-rich-text-box-host h1, .lexicaljog-rich-text-box-host h2, .lexicaljog-rich-text-box-host h3 { margin: 0 0 0.55em; color: var(--jog-text-strong); line-height: 1.25; }",
    ".lexicaljog-rich-text-box-host h1 { font-size: calc(var(--jog-title-size) * 1.08); }",
    ".lexicaljog-rich-text-box-host h2 { font-size: calc(var(--jog-title-size) * 0.94); }",
    ".lexicaljog-rich-text-box-host h3 { font-size: calc(var(--jog-title-size) * 0.82); }",
    ".lexicaljog-rich-text-box-host blockquote { margin: 0 0 0.7em; padding-left: 12px; border-left: 3px solid var(--jog-border-soft); color: var(--jog-text-muted); }",
    ".lexicaljog-text-bold { font-weight: 600; }",
    ".lexicaljog-text-italic { font-style: italic; }",
    ".lexicaljog-text-underline { text-decoration: underline; }",
    ".lexicaljog-text-strikethrough { text-decoration: line-through; }",
    ".lexicaljog-text-underline-strikethrough { text-decoration: underline line-through; }",
    ".lexicaljog-text-code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; background: color-mix(in srgb, var(--jog-surface-muted) 88%, white); padding: 0 0.18em; border-radius: 4px; }",
    ".lexicaljog-text-highlight { background: color-mix(in srgb, #fde68a 72%, white); }",
    ".lexicaljog-text-subscript { vertical-align: sub; font-size: 0.8em; }",
    ".lexicaljog-text-superscript { vertical-align: super; font-size: 0.8em; }"
  ].join("\n"));

  function normalizeSerializedValue(value) {
    if (value == null || value === "") {
      return EMPTY_EDITOR_STATE_JSON;
    }
    return String(value);
  }

  function normalizePlainTextValue(value) {
    if (value == null) {
      return "";
    }
    return String(value);
  }

  function normalizeTextFormatType(formatType) {
    var nextFormat = formatType == null ? "" : String(formatType).trim().toLowerCase();

    return TEXT_FORMAT_TYPES[nextFormat] ? nextFormat : "";
  }

  function isEditorTextEmpty(text) {
    return normalizePlainTextValue(text).replace(/\u200b/g, "").trim() === "";
  }

  function createDefaultEditorAdapter(options) {
    var editor = createEditor({
      namespace: options.namespace,
      editable: options.editable !== false,
      nodes: options.mode === "richText" ? [HeadingNode, QuoteNode] : undefined,
      theme: {
        text: {
          bold: "lexicaljog-text-bold",
          italic: "lexicaljog-text-italic",
          underline: "lexicaljog-text-underline",
          strikethrough: "lexicaljog-text-strikethrough",
          underlineStrikethrough: "lexicaljog-text-underline-strikethrough",
          code: "lexicaljog-text-code",
          highlight: "lexicaljog-text-highlight",
          subscript: "lexicaljog-text-subscript",
          superscript: "lexicaljog-text-superscript"
        }
      },
      onError: function(error) {
        throw error;
      }
    });
    var unregisterEditor = options.mode === "richText" ? registerRichText(editor) : registerPlainText(editor);
    var unregisterUpdate = editor.registerUpdateListener(function(payload) {
      var plainText = editor.getEditorState().read(function() {
        return $getRoot().getTextContent();
      });

      if (typeof options.onChange !== "function") {
        return;
      }
      options.onChange({
        editorState: payload.editorState,
        serializedValue: JSON.stringify(editor.getEditorState().toJSON()),
        plainText: plainText,
        isEmpty: isEditorTextEmpty(plainText),
        originalEvent: null
      });
    });
    var rootElement = null;

    return {
      attach: function(nextRootElement) {
        rootElement = nextRootElement;
        editor.setRootElement(nextRootElement);
      },
      dispose: function() {
        if (typeof unregisterUpdate === "function") {
          unregisterUpdate();
          unregisterUpdate = null;
        }
        if (typeof unregisterEditor === "function") {
          unregisterEditor();
          unregisterEditor = null;
        }
        editor.setRootElement(null);
        rootElement = null;
      },
      setEditable: function(editable) {
        editor.setEditable(!!editable);
      },
      setSerializedState: function(serializedValue) {
        editor.setEditorState(editor.parseEditorState(normalizeSerializedValue(serializedValue)));
      },
      setPlainText: function(text) {
        var nextText = text == null ? "" : String(text);
        editor.update(function() {
          var root = $getRoot();
          root.clear();
          if (nextText) {
            var paragraph = $createParagraphNode();
            paragraph.append($createTextNode(nextText));
            root.append(paragraph);
          }
        }, {
          discrete: true
        });
      },
      clear: function() {
        editor.update(function() {
          $getRoot().clear();
        }, {
          discrete: true
        });
      },
      getPlainText: function() {
        return editor.getEditorState().read(function() {
          return $getRoot().getTextContent();
        });
      },
      isEmpty: function() {
        return isEditorTextEmpty(this.getPlainText());
      },
      formatText: function(formatType) {
        var nextFormat = normalizeTextFormatType(formatType);

        if (!nextFormat || typeof editor.dispatchCommand !== "function") {
          return false;
        }
        if (typeof editor.focus === "function") {
          editor.focus();
        }
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, nextFormat);
        return true;
      },
      focus: function() {
        if (typeof editor.focus === "function") {
          editor.focus();
          return;
        }
        if (rootElement && typeof rootElement.focus === "function") {
          rootElement.focus();
        }
      }
    };
  }

  function createEditorAdapter(options) {
    if (typeof testingAdapterFactory === "function") {
      return testingAdapterFactory(options);
    }
    return createDefaultEditorAdapter(options);
  }

  function BaseLexicalBox(typeName, options) {
    JOG.Control.call(this, typeName);
    this._editorAdapter = null;
    this._editorHostNode = null;
    this._placeholderNode = null;
    this._focusInHandler = null;
    this._focusOutHandler = null;
    this._pendingPlainText = null;
    this._lastAppliedPlainText = "";
    this._boundValueTargets = [];
    this._editorMode = options && options.mode ? options.mode : "plainText";
    this._shellClassName = options && options.shellClassName ? options.shellClassName : "lexicaljog-plain-text-box";
    this._hostClassName = options && options.hostClassName ? options.hostClassName : "lexicaljog-plain-text-box-host";
    thirdPartyHelpers.initializeValueBridge(this, {
      emptyValue: EMPTY_EDITOR_STATE_JSON
    });
    this.SetStateValue("placeholder", "");
    this.SetStateValue("readOnly", false);
    this.SetStateValue("editorEmpty", true);
  }

  BaseLexicalBox.prototype = Object.create(JOG.Control.prototype);
  BaseLexicalBox.prototype.constructor = BaseLexicalBox;

  BaseLexicalBox.prototype.CreateDom = function(doc) {
    var node = doc.createElement("div");
    var host = doc.createElement("div");
    var placeholder = doc.createElement("div");

    node.className = "jog-control lexicaljog-box " + this._shellClassName;
    host.className = "lexicaljog-box-host " + this._hostClassName;
    host.setAttribute("role", "textbox");
    host.setAttribute("aria-multiline", "true");
    host.setAttribute("contenteditable", "true");
    host.tabIndex = 0;
    placeholder.className = "lexicaljog-box-placeholder";

    node.appendChild(host);
    node.appendChild(placeholder);

    this._editorHostNode = host;
    this._placeholderNode = placeholder;

    return node;
  };

  BaseLexicalBox.prototype.BindDomEvents = function() {
    var control = this;

    if (!this._editorHostNode) {
      return;
    }

    this._focusInHandler = function(event) {
      control.RaiseEvent("Focus", event || null, {
        Value: control.Value,
        PlainText: control.GetPlainText()
      });
    };
    this._focusOutHandler = function(event) {
      control.RaiseEvent("Blur", event || null, {
        Value: control.Value,
        PlainText: control.GetPlainText()
      });
    };

    this._editorHostNode.addEventListener("focusin", this._focusInHandler);
    this._editorHostNode.addEventListener("focusout", this._focusOutHandler);
  };

  BaseLexicalBox.prototype._setEditorEmptyState = function(isEmpty) {
    if (this.GetStateValue("editorEmpty") === !!isEmpty) {
      return;
    }
    this.SetStateValue("editorEmpty", !!isEmpty);
  };

  BaseLexicalBox.prototype._getEditorNamespace = function() {
    return "LexicalJOG." + this._typeName + "." + (this.Name || this.GetStateValue("id"));
  };

  BaseLexicalBox.prototype._handleAdapterChange = function(payload) {
    var serializedValue = normalizeSerializedValue(payload && payload.serializedValue);
    var plainText = payload && payload.plainText != null ? normalizePlainTextValue(payload.plainText) : (this._editorAdapter && typeof this._editorAdapter.getPlainText === "function" ? normalizePlainTextValue(this._editorAdapter.getPlainText()) : "");

    this._lastAppliedPlainText = plainText;

    thirdPartyHelpers.syncAdapterValueIntoControl(this, {
      nextValue: serializedValue,
      payload: payload,
      afterSync: function() {
        this._setEditorEmptyState(!!(payload && payload.isEmpty));
      }.bind(this),
      eventExtras: {
        Value: serializedValue,
        PlainText: plainText
      }
    });
  };

  BaseLexicalBox.prototype._applyPlainTextToAdapter = function(text, suppressChange) {
    var nextText = normalizePlainTextValue(text);

    if (this._editorAdapter && typeof this._editorAdapter.setPlainText === "function") {
      if (nextText === this.GetPlainText()) {
        return false;
      }
      if (suppressChange) {
        this._suppressAdapterChange = true;
      }
      this._editorAdapter.setPlainText(nextText);
      this._lastAppliedPlainText = nextText;
      return true;
    }

    this._pendingPlainText = nextText;
    this._lastAppliedPlainText = nextText;
    this._setEditorEmptyState(!nextText);
    return false;
  };

  BaseLexicalBox.prototype._syncBoundValueTargets = function() {
    var currentValue = this.Value;

    this._boundValueTargets.forEach(function(target) {
      if (!target || !target.store || typeof target.store.Get !== "function" || typeof target.store.Set !== "function") {
        return;
      }
      if (target.store.Get(target.key) === currentValue) {
        return;
      }
      target.store.Set(target.key, currentValue);
    });
  };

  BaseLexicalBox.prototype._applyValueToAdapter = function(value) {
    var nextValue = normalizeSerializedValue(value);

    thirdPartyHelpers.applyValueToAdapter(this, {
      adapter: this._editorAdapter,
      nextValue: nextValue,
      beforeApply: function() {
        this._pendingPlainText = null;
      }.bind(this),
      setAdapterValue: function(appliedValue) {
        this._editorAdapter.setSerializedState(appliedValue);
      }.bind(this),
      afterApply: function() {
        this._setEditorEmptyState(this._editorAdapter.isEmpty());
      }.bind(this)
    });
  };

  BaseLexicalBox.prototype.OnAttached = function() {
    var control = this;

    if (!this._editorHostNode) {
      return;
    }

    this._editorAdapter = createEditorAdapter({
      namespace: this._getEditorNamespace(),
      mode: this._editorMode,
      editable: this.Enabled && !this.ReadOnly,
      onChange: function(payload) {
        control._handleAdapterChange(payload);
      }
    });

    this._editorAdapter.attach(this._editorHostNode);
    this._editorAdapter.setEditable(this.Enabled && !this.ReadOnly);
    if (this._pendingPlainText != null) {
      this._editorAdapter.setPlainText(this._pendingPlainText);
      this._pendingPlainText = null;
    } else {
      this._applyValueToAdapter(this.Value);
    }
    this._setEditorEmptyState(this._editorAdapter.isEmpty());
  };

  BaseLexicalBox.prototype.OnDisposed = function() {
    if (this._editorHostNode && this._focusInHandler) {
      this._editorHostNode.removeEventListener("focusin", this._focusInHandler);
    }
    if (this._editorHostNode && this._focusOutHandler) {
      this._editorHostNode.removeEventListener("focusout", this._focusOutHandler);
    }
    this._focusInHandler = null;
    this._focusOutHandler = null;

    if (this._editorAdapter) {
      this._editorAdapter.dispose();
      this._editorAdapter = null;
    }
    this._editorHostNode = null;
    this._placeholderNode = null;
  };

  BaseLexicalBox.prototype.ApplyState = function(prevState, nextState) {
    var editorEmpty;
    var isReadonly = !nextState.enabled || !!nextState.readOnly;

    JOG.Control.prototype.ApplyState.call(this, prevState, nextState);
    if (!this._domNode || !this._editorHostNode || !this._placeholderNode) {
      return;
    }

    if (this._editorAdapter) {
      this._editorAdapter.setEditable(!isReadonly);
    }

    if (prevState.value !== nextState.value) {
      this._applyValueToAdapter(nextState.value);
    }

    editorEmpty = this._editorAdapter ? this._editorAdapter.isEmpty() : !!nextState.editorEmpty;
    this._setEditorEmptyState(editorEmpty);

    this._domNode.classList.toggle("is-readonly", !!nextState.readOnly);
    this._domNode.classList.toggle("is-disabled", !nextState.enabled);
    this._editorHostNode.setAttribute("aria-readonly", isReadonly ? "true" : "false");
    this._editorHostNode.setAttribute("aria-disabled", nextState.enabled ? "false" : "true");
    this._editorHostNode.setAttribute("aria-invalid", nextState.invalid ? "true" : "false");
    this._editorHostNode.setAttribute("contenteditable", isReadonly ? "false" : "true");
    this._editorHostNode.tabIndex = nextState.enabled ? 0 : -1;
    this._placeholderNode.textContent = nextState.placeholder || "";
    this._placeholderNode.classList.toggle("hidden", !(editorEmpty && nextState.placeholder));
  };

  BaseLexicalBox.prototype.Focus = function() {
    if (this._lifecycle === "Disposed") {
      JOG.Control.prototype.Focus.call(this);
      return;
    }
    if (this._editorAdapter && typeof this._editorAdapter.focus === "function") {
      this._editorAdapter.focus();
      return;
    }
    if (this._editorHostNode && typeof this._editorHostNode.focus === "function") {
      this._editorHostNode.focus();
      return;
    }
    JOG.Control.prototype.Focus.call(this);
  };

  BaseLexicalBox.prototype.Clear = function() {
    this._pendingPlainText = null;
    this._lastAppliedPlainText = "";
    if (this._editorAdapter && typeof this._editorAdapter.clear === "function") {
      this._suppressAdapterChange = true;
      this._editorAdapter.clear();
      this._lastAppliedValue = EMPTY_EDITOR_STATE_JSON;
      this._lastEmittedValue = EMPTY_EDITOR_STATE_JSON;
      this.SetStateValue("value", EMPTY_EDITOR_STATE_JSON);
      this._setEditorEmptyState(true);
    } else {
      this.Value = EMPTY_EDITOR_STATE_JSON;
      this._setEditorEmptyState(true);
    }
    this.ClearError();
  };

  BaseLexicalBox.prototype.GetPlainText = function() {
    if (this._editorAdapter && typeof this._editorAdapter.getPlainText === "function") {
      return normalizePlainTextValue(this._editorAdapter.getPlainText());
    }
    if (this._pendingPlainText != null) {
      return normalizePlainTextValue(this._pendingPlainText);
    }
    return normalizePlainTextValue(this._lastAppliedPlainText);
  };

  BaseLexicalBox.prototype.SetPlainText = function(text) {
    var nextText = normalizePlainTextValue(text);

    if (!nextText) {
      this.Clear();
      return;
    }

    this._applyPlainTextToAdapter(nextText, false);
  };

  BaseLexicalBox.prototype.IsEmpty = function() {
    if (this._editorAdapter && typeof this._editorAdapter.isEmpty === "function") {
      return !!this._editorAdapter.isEmpty();
    }
    return !!this.GetStateValue("editorEmpty");
  };

  BaseLexicalBox.prototype.BindValue = function(store, key) {
    this._boundValueTargets.push({
      store: store,
      key: key
    });
    thirdPartyHelpers.bindValue(this, store, key, {
      normalize: normalizeSerializedValue,
      getEventValue: function(args) {
        return args.Value;
      }
    });
  };

  BaseLexicalBox.prototype.BindPlainText = function(store, key) {
    var control = this;
    var listener = function(value) {
      var nextText = normalizePlainTextValue(value);

      if (nextText === control.GetPlainText()) {
        return;
      }
      if (!nextText) {
        control.Clear();
        control._syncBoundValueTargets();
        return;
      }
      control._applyPlainTextToAdapter(nextText, true);
      control._syncBoundValueTargets();
    };
    var unsubscribe = store.Subscribe(key, listener);

    this.TrackBinding(unsubscribe);
    listener(store.Get(key));
    this.OnChange(function(args) {
      store.Set(key, normalizePlainTextValue(args.PlainText));
    });
  };

  function LexicalPlainTextBox() {
    BaseLexicalBox.call(this, "LexicalPlainTextBox", {
      mode: "plainText",
      shellClassName: "lexicaljog-plain-text-box",
      hostClassName: "lexicaljog-plain-text-box-host"
    });
  }

  LexicalPlainTextBox.prototype = Object.create(BaseLexicalBox.prototype);
  LexicalPlainTextBox.prototype.constructor = LexicalPlainTextBox;

  function LexicalRichTextBox() {
    BaseLexicalBox.call(this, "LexicalRichTextBox", {
      mode: "richText",
      shellClassName: "lexicaljog-rich-text-box",
      hostClassName: "lexicaljog-rich-text-box-host"
    });
  }

  LexicalRichTextBox.prototype = Object.create(BaseLexicalBox.prototype);
  LexicalRichTextBox.prototype.constructor = LexicalRichTextBox;

  LexicalRichTextBox.prototype.FormatText = function(formatType) {
    var nextFormat = normalizeTextFormatType(formatType);

    if (!nextFormat || this._lifecycle === "Disposed") {
      return false;
    }
    if (this._editorAdapter && typeof this._editorAdapter.formatText === "function") {
      return this._editorAdapter.formatText(nextFormat);
    }
    return false;
  };

  LexicalRichTextBox.prototype.ToggleBold = function() {
    return this.FormatText("bold");
  };

  LexicalRichTextBox.prototype.ToggleItalic = function() {
    return this.FormatText("italic");
  };

  LexicalRichTextBox.prototype.ToggleUnderline = function() {
    return this.FormatText("underline");
  };

  function defineLexicalBoxProperties(prototype) {
    JOG.DefineControlProperty(prototype, "Value", {
      stateKey: "value",
      normalize: normalizeSerializedValue
    });

    JOG.DefineControlProperty(prototype, "Placeholder", {
      stateKey: "placeholder",
      normalize: function(value) {
        return value == null ? "" : String(value);
      }
    });

    JOG.DefineControlProperty(prototype, "ReadOnly", {
      stateKey: "readOnly",
      normalize: function(value) {
        return !!value;
      }
    });
  }

  defineLexicalBoxProperties(LexicalPlainTextBox.prototype);
  defineLexicalBoxProperties(LexicalRichTextBox.prototype);

  LexicalJOG.LexicalPlainTextBox = LexicalPlainTextBox;
  LexicalJOG.LexicalRichTextBox = LexicalRichTextBox;
  LexicalJOG.__EMPTY_EDITOR_STATE_JSON = EMPTY_EDITOR_STATE_JSON;
  LexicalJOG.__setTestingAdapterFactory = function(factory) {
    testingAdapterFactory = typeof factory === "function" ? factory : null;
  };

  JOG.RegisterControl({
    fullName: "LexicalJOG.LexicalPlainTextBox",
    version: "1.0.0",
    jogVersionRange: "^2.0.0",
    constructor: LexicalPlainTextBox,
    metadata: {
      baseType: "Control",
      properties: ["Value", "Placeholder", "ReadOnly", "Invalid", "ErrorText", "ThemePreset"],
      events: ["OnChange", "OnFocus", "OnBlur"],
      methods: ["Focus", "Clear", "GetPlainText", "SetPlainText", "IsEmpty", "BindValue", "BindPlainText", "SetError", "ClearError", "BindError"],
      themePresets: ["muted", "primary"],
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
    fullName: "LexicalJOG.LexicalRichTextBox",
    version: "1.0.0",
    jogVersionRange: "^2.0.0",
    constructor: LexicalRichTextBox,
    metadata: {
      baseType: "Control",
      properties: ["Value", "Placeholder", "ReadOnly", "Invalid", "ErrorText", "ThemePreset"],
      events: ["OnChange", "OnFocus", "OnBlur"],
      methods: ["Focus", "Clear", "GetPlainText", "SetPlainText", "IsEmpty", "BindValue", "BindPlainText", "FormatText", "ToggleBold", "ToggleItalic", "ToggleUnderline", "SetError", "ClearError", "BindError"],
      themePresets: ["muted", "primary"],
      capabilities: {
        supportsValidation: true,
        supportsKeyboard: true,
        supportsResponsiveLayout: true,
        supportsCollection: false,
        supportsChildren: false,
        supportsFocusRestore: false,
        supportsRichText: true
      }
    }
  });

  global.LexicalJOG = LexicalJOG;
})(typeof globalThis !== "undefined" ? globalThis : window);
