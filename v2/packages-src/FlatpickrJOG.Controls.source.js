(function(global) {
  "use strict";

  var flatpickr = require("flatpickr");
  var flatpickrBaseCss = require("flatpickr/dist/flatpickr.css");
  var thirdPartyHelpers = require("./ThirdPartyJOG.Helpers");
  var JOG = global.JOG;
  var FlatpickrJOG = global.FlatpickrJOG || {};
  var testingAdapterFactory = null;

  if (!JOG) {
    throw new Error("FlatpickrJOG.Controls.js requires JOG to load first.");
  }

  JOG.RegisterStyleBlock("FlatpickrJOG.Controls.Vendor", flatpickrBaseCss);
  JOG.RegisterStyleBlock("FlatpickrJOG.Controls", [
    ".flatpickrjog-date-picker { position: relative; display: block; min-width: 0; min-height: 42px; box-sizing: border-box; }",
    ".flatpickrjog-date-picker-input { display: block; width: 100%; min-height: 36px; box-sizing: border-box; border: 1px solid var(--jog-border) !important; border-bottom: 1px solid var(--jog-border) !important; border-radius: var(--jog-radius-control) !important; background: var(--jog-surface) !important; background-color: var(--jog-surface) !important; background-image: none !important; color: var(--jog-text) !important; padding: var(--jog-control-padding-y) var(--jog-control-padding-x); font: inherit; line-height: var(--jog-line-height); outline: none; appearance: none; -webkit-appearance: none; box-shadow: none !important; }",
    ".flatpickrjog-date-picker > .flatpickrjog-date-picker-input.flatpickr-input[readonly] { border: 1px solid var(--jog-border) !important; border-bottom: 1px solid var(--jog-border) !important; border-top: 1px solid var(--jog-border) !important; border-left: 1px solid var(--jog-border) !important; border-right: 1px solid var(--jog-border) !important; border-radius: var(--jog-radius-control) !important; background: var(--jog-surface) !important; background-color: var(--jog-surface) !important; background-image: none !important; color: var(--jog-text) !important; cursor: pointer; box-shadow: none !important; -webkit-text-fill-color: var(--jog-text); opacity: 1; }",
    ".flatpickrjog-date-picker:focus-within .flatpickrjog-date-picker-input { border-color: var(--jog-primary); box-shadow: 0 0 0 1px var(--jog-primary); }",
    ".flatpickrjog-date-picker.is-readonly .flatpickrjog-date-picker-input { background: var(--jog-surface-muted); cursor: default; }",
    ".flatpickrjog-date-picker.is-readonly .flatpickrjog-date-picker-input.flatpickr-input[readonly] { background: var(--jog-surface-muted); cursor: default; }",
    ".flatpickrjog-date-picker.is-disabled .flatpickrjog-date-picker-input { opacity: 0.6; cursor: not-allowed; }",
    ".flatpickrjog-date-picker.jog-invalid .flatpickrjog-date-picker-input { border-color: var(--jog-danger); box-shadow: var(--jog-shadow-invalid-ring); }",
    ".flatpickrjog-date-picker.jog-theme-preset-muted .flatpickrjog-date-picker-input { background: var(--jog-surface-muted); }",
    ".flatpickrjog-date-picker.jog-theme-preset-muted .flatpickrjog-date-picker-input.flatpickr-input[readonly] { background: var(--jog-surface-muted); }",
    ".flatpickrjog-date-picker.jog-theme-preset-primary .flatpickrjog-date-picker-input { border-color: color-mix(in srgb, var(--jog-primary) 38%, var(--jog-border)); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--jog-primary) 12%, transparent); }",
    ".flatpickr-calendar { background: var(--jog-surface) !important; background-color: var(--jog-surface) !important; border: 1px solid var(--jog-border) !important; box-shadow: var(--jog-shadow-shell) !important; color: var(--jog-text); }",
    ".flatpickr-calendar:after { border-bottom-color: var(--jog-surface); }",
    ".flatpickr-calendar.arrowBottom:after { border-top-color: var(--jog-surface); }",
    ".flatpickr-calendar:before { border-bottom-color: var(--jog-border); }",
    ".flatpickr-calendar.arrowBottom:before { border-top-color: var(--jog-border); }",
    ".flatpickr-months, .flatpickr-weekdays, .flatpickr-rContainer, .flatpickr-days, .dayContainer, .flatpickr-current-month, .flatpickr-innerContainer { background: var(--jog-surface) !important; background-color: var(--jog-surface) !important; }",
    ".flatpickr-months .flatpickr-month, .flatpickr-current-month .flatpickr-monthDropdown-months, .flatpickr-current-month input.cur-year { color: var(--jog-text-strong); fill: var(--jog-text-strong); }",
    ".flatpickr-weekday, span.flatpickr-weekday { color: var(--jog-text-muted); }",
    ".flatpickr-day, .flatpickr-time input, .flatpickr-time .flatpickr-am-pm { color: var(--jog-text); }",
    ".flatpickr-day.today { border-color: var(--jog-primary); }",
    ".flatpickr-day:hover, .flatpickr-day:focus { background: var(--jog-surface-muted); border-color: var(--jog-border-soft); }",
    ".flatpickr-day.selected, .flatpickr-day.startRange, .flatpickr-day.endRange, .flatpickr-day.selected:hover, .flatpickr-day.startRange:hover, .flatpickr-day.endRange:hover { background: var(--jog-primary); border-color: var(--jog-primary); color: var(--jog-primary-text); }",
    ".flatpickr-prev-month:hover svg, .flatpickr-next-month:hover svg { fill: var(--jog-primary); }"
  ].join("\n"));

  function normalizeDateValue(value) {
    if (value == null) {
      return "";
    }
    return String(value).trim();
  }

  function normalizeDateLimit(value) {
    if (value == null || value === "") {
      return "";
    }
    return String(value).trim();
  }

  function createDefaultDatePickerAdapter(options) {
    var picker = null;
    var inputNode = null;

    function syncCalendarThemeVariables() {
      if (!picker || !picker.calendarContainer || !inputNode) {
        return;
      }
      thirdPartyHelpers.syncThemeVariablesFromNode(global, inputNode, picker.calendarContainer);
    }

    function notifyChange(dateString, originalEvent) {
      if (typeof options.onChange !== "function") {
        return;
      }
      options.onChange({
        value: normalizeDateValue(dateString),
        isEmpty: !dateString,
        originalEvent: originalEvent || null
      });
    }

    function buildOptions() {
      return {
        dateFormat: "Y-m-d",
        defaultDate: options.value || undefined,
        minDate: options.minDate || undefined,
        maxDate: options.maxDate || undefined,
        allowInput: false,
        disableMobile: true,
        clickOpens: options.enabled !== false && options.readOnly !== true,
        prevArrow: "<span aria-hidden=\"true\">&#8249;</span>",
        nextArrow: "<span aria-hidden=\"true\">&#8250;</span>",
        onChange: function(selectedDates, dateString) {
          notifyChange(dateString, null);
        },
        onOpen: function() {
          syncCalendarThemeVariables();
          if (typeof options.onOpen === "function") {
            options.onOpen({ originalEvent: null });
          }
        },
        onClose: function() {
          if (typeof options.onClose === "function") {
            options.onClose({ originalEvent: null });
          }
        }
      };
    }

    function syncInputInteraction(enabled, readOnly) {
      if (!inputNode) {
        return;
      }
      inputNode.disabled = !enabled;
      inputNode.readOnly = !enabled || !!readOnly;
      inputNode.setAttribute("aria-readonly", !enabled || readOnly ? "true" : "false");
    }

    return {
      attach: function(nextInputNode) {
        inputNode = nextInputNode;
        picker = flatpickr(inputNode, buildOptions());
        syncCalendarThemeVariables();
        this.setPlaceholder(options.placeholder || "");
        this.setInteractive(options.enabled !== false, options.readOnly === true);
      },
      dispose: function() {
        if (picker && typeof picker.destroy === "function") {
          picker.destroy();
        }
        picker = null;
        inputNode = null;
      },
      setValue: function(value) {
        var nextValue = normalizeDateValue(value);

        if (!picker) {
          if (inputNode) {
            inputNode.value = nextValue;
          }
          return;
        }
        if (!nextValue) {
          picker.clear(false);
          return;
        }
        picker.setDate(nextValue, false, "Y-m-d");
      },
      setMinDate: function(value) {
        if (picker) {
          picker.set("minDate", normalizeDateLimit(value) || null);
        }
      },
      setMaxDate: function(value) {
        if (picker) {
          picker.set("maxDate", normalizeDateLimit(value) || null);
        }
      },
      setPlaceholder: function(value) {
        if (inputNode) {
          inputNode.placeholder = value || "";
        }
      },
      setInteractive: function(enabled, readOnly) {
        syncInputInteraction(!!enabled, !!readOnly);
        if (picker) {
          picker.set("clickOpens", !!enabled && !readOnly);
        }
      },
      clear: function() {
        if (picker) {
          picker.clear(false);
          return;
        }
        if (inputNode) {
          inputNode.value = "";
        }
      },
      getValue: function() {
        if (picker && picker.input) {
          return normalizeDateValue(picker.input.value);
        }
        if (inputNode) {
          return normalizeDateValue(inputNode.value);
        }
        return "";
      },
      isEmpty: function() {
        return !this.getValue();
      },
      focus: function() {
        if (picker && picker.input && typeof picker.input.focus === "function") {
          picker.input.focus();
          return;
        }
        if (inputNode && typeof inputNode.focus === "function") {
          inputNode.focus();
        }
      },
      open: function() {
        if (picker && typeof picker.open === "function") {
          picker.open();
        }
      },
      close: function() {
        if (picker && typeof picker.close === "function") {
          picker.close();
        }
      }
    };
  }

  function createDatePickerAdapter(options) {
    if (typeof testingAdapterFactory === "function") {
      return testingAdapterFactory(options);
    }
    return createDefaultDatePickerAdapter(options);
  }

  function DatePicker() {
    JOG.Control.call(this, "DatePicker");
    this._pickerAdapter = null;
    this._inputNode = null;
    this._focusHandler = null;
    this._blurHandler = null;
    this.Height = 42;
    this.MinHeight = 42;
    thirdPartyHelpers.initializeValueBridge(this, {
      emptyValue: ""
    });
    this.SetStateValue("placeholder", "");
    this.SetStateValue("readOnly", false);
    this.SetStateValue("minDate", "");
    this.SetStateValue("maxDate", "");
    this.SetStateValue("pickerOpen", false);
  }

  DatePicker.prototype = Object.create(JOG.Control.prototype);
  DatePicker.prototype.constructor = DatePicker;

  DatePicker.prototype.CreateDom = function(doc) {
    var node = doc.createElement("div");
    var input = doc.createElement("input");

    node.className = "jog-control flatpickrjog-date-picker";
    input.className = "flatpickrjog-date-picker-input";
    input.type = "text";
    input.setAttribute("aria-haspopup", "dialog");
    input.autocomplete = "off";

    node.appendChild(input);
    this._inputNode = input;
    return node;
  };

  DatePicker.prototype.BindDomEvents = function() {
    var control = this;

    if (!this._inputNode) {
      return;
    }

    this._focusHandler = function(event) {
      control.RaiseEvent("Focus", event || null);
    };
    this._blurHandler = function(event) {
      control.RaiseEvent("Blur", event || null, {
        Value: control.Value
      });
    };

    this._inputNode.addEventListener("focus", this._focusHandler);
    this._inputNode.addEventListener("blur", this._blurHandler);
  };

  DatePicker.prototype._handleAdapterChange = function(payload) {
    var nextValue = normalizeDateValue(payload && payload.value);

    thirdPartyHelpers.syncAdapterValueIntoControl(this, {
      nextValue: nextValue,
      payload: payload,
      eventExtras: {
        Value: nextValue
      }
    });
  };

  DatePicker.prototype._handleAdapterOpen = function(payload) {
    this.SetStateValue("pickerOpen", true);
    this.RaiseEvent("Open", payload ? payload.originalEvent || null : null, {
      Value: this.Value
    });
  };

  DatePicker.prototype._handleAdapterClose = function(payload) {
    this.SetStateValue("pickerOpen", false);
    this.RaiseEvent("Close", payload ? payload.originalEvent || null : null, {
      Value: this.Value
    });
  };

  DatePicker.prototype._applyValueToAdapter = function(value) {
    var nextValue = normalizeDateValue(value);

    thirdPartyHelpers.applyValueToAdapter(this, {
      adapter: this._pickerAdapter,
      nextValue: nextValue,
      setAdapterValue: function(appliedValue) {
        this._pickerAdapter.setValue(appliedValue);
      }.bind(this)
    });
  };

  DatePicker.prototype.OnAttached = function() {
    var control = this;

    if (!this._inputNode) {
      return;
    }

    this._pickerAdapter = createDatePickerAdapter({
      value: this.Value,
      placeholder: this.Placeholder,
      minDate: this.MinDate,
      maxDate: this.MaxDate,
      enabled: this.Enabled,
      readOnly: this.ReadOnly,
      onChange: function(payload) {
        control._handleAdapterChange(payload);
      },
      onOpen: function(payload) {
        control._handleAdapterOpen(payload);
      },
      onClose: function(payload) {
        control._handleAdapterClose(payload);
      }
    });

    this._pickerAdapter.attach(this._inputNode);
    this._pickerAdapter.setPlaceholder(this.Placeholder);
    this._pickerAdapter.setMinDate(this.MinDate);
    this._pickerAdapter.setMaxDate(this.MaxDate);
    this._pickerAdapter.setInteractive(this.Enabled, this.ReadOnly);
    this._applyValueToAdapter(this.Value);
  };

  DatePicker.prototype.OnDisposed = function() {
    if (this._inputNode && this._focusHandler) {
      this._inputNode.removeEventListener("focus", this._focusHandler);
    }
    if (this._inputNode && this._blurHandler) {
      this._inputNode.removeEventListener("blur", this._blurHandler);
    }

    this._focusHandler = null;
    this._blurHandler = null;

    if (this._pickerAdapter) {
      this._pickerAdapter.dispose();
      this._pickerAdapter = null;
    }

    this._inputNode = null;
  };

  DatePicker.prototype.ApplyState = function(prevState, nextState) {
    JOG.Control.prototype.ApplyState.call(this, prevState, nextState);
    if (!this._domNode || !this._inputNode) {
      return;
    }

    if (this._pickerAdapter) {
      if (prevState.value !== nextState.value) {
        this._applyValueToAdapter(nextState.value);
      }
      if (prevState.placeholder !== nextState.placeholder) {
        this._pickerAdapter.setPlaceholder(nextState.placeholder);
      }
      if (prevState.minDate !== nextState.minDate) {
        this._pickerAdapter.setMinDate(nextState.minDate);
      }
      if (prevState.maxDate !== nextState.maxDate) {
        this._pickerAdapter.setMaxDate(nextState.maxDate);
      }
      if (prevState.enabled !== nextState.enabled || prevState.readOnly !== nextState.readOnly) {
        this._pickerAdapter.setInteractive(nextState.enabled, nextState.readOnly);
      }
    }

    this._domNode.classList.toggle("is-readonly", !!nextState.readOnly);
    this._domNode.classList.toggle("is-disabled", !nextState.enabled);
    this._domNode.classList.toggle("is-open", !!nextState.pickerOpen);
    this._inputNode.setAttribute("aria-expanded", nextState.pickerOpen ? "true" : "false");
  };

  DatePicker.prototype.Focus = function() {
    if (this._lifecycle === "Disposed") {
      JOG.Control.prototype.Focus.call(this);
      return;
    }
    if (this._pickerAdapter && typeof this._pickerAdapter.focus === "function") {
      this._pickerAdapter.focus();
      return;
    }
    if (this._inputNode && typeof this._inputNode.focus === "function") {
      this._inputNode.focus();
      return;
    }
    JOG.Control.prototype.Focus.call(this);
  };

  DatePicker.prototype.Open = function() {
    if (this._pickerAdapter && typeof this._pickerAdapter.open === "function") {
      this._pickerAdapter.open();
    }
  };

  DatePicker.prototype.Close = function() {
    if (this._pickerAdapter && typeof this._pickerAdapter.close === "function") {
      this._pickerAdapter.close();
    }
  };

  DatePicker.prototype.Clear = function() {
    this.SetStateValue("pickerOpen", false);
    if (this._pickerAdapter && typeof this._pickerAdapter.clear === "function") {
      this._suppressAdapterChange = true;
      this._pickerAdapter.clear();
      this._lastAppliedValue = "";
      this._lastEmittedValue = "";
      this.SetStateValue("value", "");
    } else {
      this.Value = "";
    }
    this.ClearError();
  };

  DatePicker.prototype.IsEmpty = function() {
    if (this._pickerAdapter && typeof this._pickerAdapter.isEmpty === "function") {
      return !!this._pickerAdapter.isEmpty();
    }
    return !this.Value;
  };

  DatePicker.prototype.BindValue = function(store, key) {
    thirdPartyHelpers.bindValue(this, store, key, {
      normalize: normalizeDateValue,
      getEventValue: function(args) {
        return args.Value;
      }
    });
  };

  DatePicker.prototype.OnOpen = function(listener) {
    this.RegisterEvent("Open", listener);
  };

  DatePicker.prototype.OnClose = function(listener) {
    this.RegisterEvent("Close", listener);
  };

  JOG.DefineControlProperty(DatePicker.prototype, "Value", {
    stateKey: "value",
    normalize: normalizeDateValue
  });

  JOG.DefineControlProperty(DatePicker.prototype, "Placeholder", {
    stateKey: "placeholder",
    normalize: function(value) {
      return value == null ? "" : String(value);
    }
  });

  JOG.DefineControlProperty(DatePicker.prototype, "ReadOnly", {
    stateKey: "readOnly",
    normalize: function(value) {
      return !!value;
    }
  });

  JOG.DefineControlProperty(DatePicker.prototype, "MinDate", {
    stateKey: "minDate",
    normalize: normalizeDateLimit
  });

  JOG.DefineControlProperty(DatePicker.prototype, "MaxDate", {
    stateKey: "maxDate",
    normalize: normalizeDateLimit
  });

  FlatpickrJOG.DatePicker = DatePicker;
  FlatpickrJOG.__setTestingAdapterFactory = function(factory) {
    testingAdapterFactory = typeof factory === "function" ? factory : null;
  };

  JOG.RegisterControl({
    fullName: "FlatpickrJOG.DatePicker",
    version: "1.0.0",
    jogVersionRange: "^2.0.0",
    constructor: DatePicker,
    metadata: {
      baseType: "Control",
      shortName: "DatePicker",
      packageName: "FlatpickrJOG",
      packageVersion: "1.0.0",
      properties: ["Value", "Placeholder", "ReadOnly", "MinDate", "MaxDate", "Invalid", "ErrorText", "ThemePreset"],
      events: ["OnChange", "OnOpen", "OnClose", "OnFocus", "OnBlur"],
      methods: ["Focus", "Open", "Close", "Clear", "IsEmpty", "BindValue", "SetError", "ClearError", "BindError"],
      themePresets: ["muted", "primary"],
      capabilities: {
        supportsValidation: true,
        supportsKeyboard: true,
        supportsResponsiveLayout: true
      }
    }
  });

  global.FlatpickrJOG = FlatpickrJOG;
})(typeof window !== "undefined" ? window : globalThis);
