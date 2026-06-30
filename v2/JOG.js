(function(global) {
  "use strict";

  var JOG = {};

  var nextControlId = 0;
  var runningApplications = [];
  var responsiveBreakpointOrder = ["base", "sm", "md", "lg", "xl"];
  var responsiveBreakpointMinWidths = {
    base: 0,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280
  };
  var defaultTheme = {
    colors: {
      appBackground: "#f3f4f6",
      surface: "#ffffff",
      surfaceMuted: "#f8fafc",
      text: "#0f172a",
      textMuted: "#475569",
      textStrong: "#1e293b",
      border: "#cbd5e1",
      borderSoft: "#e2e8f0",
      primary: "#0f172a",
      primaryText: "#f8fafc",
      danger: "#dc2626",
      dangerText: "#b91c1c",
      overlay: "rgba(15, 23, 42, 0.22)",
      resizeGrip: "#94a3b8"
    },
    typography: {
      fontFamily: "Arial, sans-serif",
      fontSize: "14px",
      captionSize: "12px",
      titleSize: "13px",
      lineHeight: "1.45"
    },
    radius: {
      control: "8px",
      section: "14px",
      shell: "16px",
      window: "14px"
    },
    spacing: {
      pagePadding: "32px",
      sectionHeaderX: "16px",
      sectionHeaderY: "14px",
      sectionBody: "16px",
      windowContent: "20px",
      controlPaddingX: "12px",
      controlPaddingY: "10px",
      closeButtonX: "10px",
      closeButtonY: "4px",
      fieldGap: "10px",
      listPadding: "8px"
    },
    shadow: {
      shell: "0 14px 34px rgba(15, 23, 42, 0.06)",
      section: "0 8px 20px rgba(15, 23, 42, 0.04)",
      window: "0 24px 50px rgba(15, 23, 42, 0.16)",
      invalidRing: "0 0 0 3px rgba(220, 38, 38, 0.12)"
    }
  };
  var activeGlobalTheme = cloneTheme(defaultTheme);

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

  function isPlainObject(value) {
    return !!value && typeof value === "object" && !Array.isArray(value);
  }

  function cloneResponsiveConfig(value, normalizer) {
    var copy = {};
    var breakpoint;
    var normalizedBreakpoint;

    if (!isPlainObject(value)) {
      return null;
    }

    responsiveBreakpointOrder.forEach(function(name) {
      if (!isPlainObject(value[name])) {
        return;
      }
      normalizedBreakpoint = normalizer(value[name]);
      if (normalizedBreakpoint) {
        copy[name] = normalizedBreakpoint;
      }
    });

    for (breakpoint in copy) {
      if (Object.prototype.hasOwnProperty.call(copy, breakpoint)) {
        return copy;
      }
    }

    return null;
  }

  function normalizeGridResponsiveBreakpoint(value) {
    var normalized = {};

    if (!isPlainObject(value)) {
      return null;
    }
    if (value.columns !== undefined) {
      normalized.columns = value.columns;
    }
    if (value.rows !== undefined) {
      normalized.rows = value.rows;
    }
    if (value.areas !== undefined) {
      normalized.areas = value.areas == null ? "" : String(value.areas);
    }
    if (value.autoRows !== undefined) {
      normalized.autoRows = value.autoRows == null ? "" : String(value.autoRows);
    }
    if (value.autoFlow !== undefined) {
      normalized.autoFlow = String(value.autoFlow);
    }
    if (value.columnGap !== undefined && isNumber(value.columnGap)) {
      normalized.columnGap = value.columnGap;
    }
    if (value.rowGap !== undefined && isNumber(value.rowGap)) {
      normalized.rowGap = value.rowGap;
    }

    return Object.keys(normalized).length ? normalized : null;
  }

  function normalizeResponsivePlacementBreakpoint(value) {
    var normalized = {};

    if (!isPlainObject(value)) {
      return null;
    }
    if (value.column !== undefined) {
      normalized.gridColumn = value.column;
    }
    if (value.row !== undefined) {
      normalized.gridRow = value.row;
    }
    if (value.area !== undefined) {
      normalized.gridArea = value.area == null ? null : String(value.area);
    }
    if (value.columnSpan !== undefined && isNumber(value.columnSpan) && value.columnSpan > 0) {
      normalized.columnSpan = value.columnSpan;
    }
    if (value.rowSpan !== undefined && isNumber(value.rowSpan) && value.rowSpan > 0) {
      normalized.rowSpan = value.rowSpan;
    }

    return Object.keys(normalized).length ? normalized : null;
  }

  function normalizeResponsiveLayoutBreakpoint(value) {
    var normalized = {};
    var allowedDocks = ["none", "top", "bottom", "left", "right", "fill"];

    if (!isPlainObject(value)) {
      return null;
    }
    if (value.width !== undefined) {
      normalized.width = value.width;
    }
    if (value.height !== undefined) {
      normalized.height = value.height;
    }
    if (value.minWidth !== undefined) {
      normalized.minWidth = value.minWidth;
    }
    if (value.minHeight !== undefined) {
      normalized.minHeight = value.minHeight;
    }
    if (value.maxWidth !== undefined) {
      normalized.maxWidth = value.maxWidth;
    }
    if (value.maxHeight !== undefined) {
      normalized.maxHeight = value.maxHeight;
    }
    if (value.left !== undefined) {
      normalized.left = value.left;
    }
    if (value.top !== undefined) {
      normalized.top = value.top;
    }
    if (value.padding !== undefined) {
      normalized.padding = value.padding;
    }
    if (value.margin !== undefined) {
      normalized.margin = value.margin;
    }
    if (value.gap !== undefined) {
      normalized.gap = value.gap;
    }
    if (value.dock !== undefined) {
      normalized.dock = allowedDocks.indexOf(value.dock) >= 0 ? value.dock : "none";
    }

    return Object.keys(normalized).length ? normalized : null;
  }

  function normalizeResponsiveStackBreakpoint(value) {
    var normalized = {};

    if (!isPlainObject(value)) {
      return null;
    }
    if (value.orientation !== undefined) {
      normalized.orientation = value.orientation === "horizontal" ? "horizontal" : "vertical";
    }
    if (value.spacing !== undefined && isNumber(value.spacing)) {
      normalized.spacing = value.spacing;
    }
    if (value.gap !== undefined) {
      normalized.gap = value.gap;
    }

    return Object.keys(normalized).length ? normalized : null;
  }

  function resolveResponsiveValues(baseValues, responsiveConfig, viewportWidth) {
    var resolved = {};
    var breakpointValues;
    var key;

    for (key in baseValues) {
      if (Object.prototype.hasOwnProperty.call(baseValues, key)) {
        resolved[key] = baseValues[key];
      }
    }

    if (!responsiveConfig) {
      return resolved;
    }

    responsiveBreakpointOrder.forEach(function(name) {
      if (name !== "base" && viewportWidth < responsiveBreakpointMinWidths[name]) {
        return;
      }
      breakpointValues = responsiveConfig[name];
      if (!breakpointValues) {
        return;
      }
      for (key in breakpointValues) {
        if (Object.prototype.hasOwnProperty.call(breakpointValues, key)) {
          resolved[key] = breakpointValues[key];
        }
      }
    });

    return resolved;
  }

  function cloneThemeSection(section) {
    var copy = {};
    var key;
    for (key in section) {
      if (Object.prototype.hasOwnProperty.call(section, key)) {
        copy[key] = section[key];
      }
    }
    return copy;
  }

  function cloneTheme(theme) {
    var copy = {};
    var section;
    theme = theme || defaultTheme;
    for (section in defaultTheme) {
      if (Object.prototype.hasOwnProperty.call(defaultTheme, section)) {
        copy[section] = cloneThemeSection(theme[section] || defaultTheme[section]);
      }
    }
    return copy;
  }

  function mergeTheme(baseTheme, overrideTheme) {
    var merged = cloneTheme(baseTheme || defaultTheme);
    var section;
    var token;
    var overrideSection;

    if (!isPlainObject(overrideTheme)) {
      return merged;
    }

    for (section in defaultTheme) {
      if (!Object.prototype.hasOwnProperty.call(defaultTheme, section)) {
        continue;
      }
      overrideSection = overrideTheme[section];
      if (!isPlainObject(overrideSection)) {
        continue;
      }
      for (token in defaultTheme[section]) {
        if (Object.prototype.hasOwnProperty.call(overrideSection, token) && overrideSection[token] != null && overrideSection[token] !== "") {
          merged[section][token] = String(overrideSection[token]);
        }
      }
    }

    return merged;
  }

  function cloneThemeOverride(theme) {
    var copy = {};
    var section;
    var token;
    var sourceSection;

    if (!isPlainObject(theme)) {
      return null;
    }

    for (section in defaultTheme) {
      if (!Object.prototype.hasOwnProperty.call(defaultTheme, section)) {
        continue;
      }
      sourceSection = theme[section];
      if (!isPlainObject(sourceSection)) {
        continue;
      }
      copy[section] = {};
      for (token in defaultTheme[section]) {
        if (Object.prototype.hasOwnProperty.call(sourceSection, token) && sourceSection[token] != null && sourceSection[token] !== "") {
          copy[section][token] = String(sourceSection[token]);
        }
      }
      if (Object.keys(copy[section]).length === 0) {
        delete copy[section];
      }
    }

    return Object.keys(copy).length > 0 ? copy : null;
  }

  function themeVariablesFromTheme(theme) {
    return {
      "--jog-app-background": theme.colors.appBackground,
      "--jog-surface": theme.colors.surface,
      "--jog-surface-muted": theme.colors.surfaceMuted,
      "--jog-text": theme.colors.text,
      "--jog-text-muted": theme.colors.textMuted,
      "--jog-text-strong": theme.colors.textStrong,
      "--jog-border": theme.colors.border,
      "--jog-border-soft": theme.colors.borderSoft,
      "--jog-primary": theme.colors.primary,
      "--jog-primary-text": theme.colors.primaryText,
      "--jog-danger": theme.colors.danger,
      "--jog-danger-text": theme.colors.dangerText,
      "--jog-overlay": theme.colors.overlay,
      "--jog-resize-grip": theme.colors.resizeGrip,
      "--jog-font-family": theme.typography.fontFamily,
      "--jog-font-size": theme.typography.fontSize,
      "--jog-caption-size": theme.typography.captionSize,
      "--jog-title-size": theme.typography.titleSize,
      "--jog-line-height": theme.typography.lineHeight,
      "--jog-radius-control": theme.radius.control,
      "--jog-radius-section": theme.radius.section,
      "--jog-radius-shell": theme.radius.shell,
      "--jog-radius-window": theme.radius.window,
      "--jog-page-padding": theme.spacing.pagePadding,
      "--jog-section-header-x": theme.spacing.sectionHeaderX,
      "--jog-section-header-y": theme.spacing.sectionHeaderY,
      "--jog-section-body": theme.spacing.sectionBody,
      "--jog-window-content": theme.spacing.windowContent,
      "--jog-control-padding-x": theme.spacing.controlPaddingX,
      "--jog-control-padding-y": theme.spacing.controlPaddingY,
      "--jog-close-button-x": theme.spacing.closeButtonX,
      "--jog-close-button-y": theme.spacing.closeButtonY,
      "--jog-field-gap": theme.spacing.fieldGap,
      "--jog-list-padding": theme.spacing.listPadding,
      "--jog-shadow-shell": theme.shadow.shell,
      "--jog-shadow-section": theme.shadow.section,
      "--jog-shadow-window": theme.shadow.window,
      "--jog-shadow-invalid-ring": theme.shadow.invalidRing
    };
  }

  function applyThemeVariablesToNode(node, theme) {
    var variables;
    var name;

    if (!node || !node.style) {
      return;
    }

    variables = themeVariablesFromTheme(theme);
    for (name in variables) {
      if (Object.prototype.hasOwnProperty.call(variables, name)) {
        if (typeof node.style.setProperty === "function") {
          node.style.setProperty(name, variables[name]);
        } else {
          node.style[name] = variables[name];
        }
      }
    }
  }

  function refreshRunningApplications() {
    runningApplications.forEach(function(application) {
      if (application && typeof application._applyTheme === "function") {
        application._applyTheme();
      }
    });
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

  function toGridTrackList(value, fallback) {
    if (Array.isArray(value)) {
      return value.join(" ");
    }
    if (typeof value === "string" && value) {
      return value;
    }
    return fallback || "";
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

  function clamp(value, minValue) {
    if (!isNumber(minValue)) {
      return value;
    }
    return Math.max(value, minValue);
  }

  function resizeWindowFromState(state, deltaX, deltaY, minWidth, minHeight) {
    var next = {
      left: state.left,
      top: state.top,
      width: state.width,
      height: state.height
    };
    var clampedWidth;
    var clampedHeight;

    if (state.direction.indexOf("e") >= 0) {
      next.width = clamp(state.width + deltaX, minWidth);
    }

    if (state.direction.indexOf("s") >= 0) {
      next.height = clamp(state.height + deltaY, minHeight);
    }

    if (state.direction.indexOf("w") >= 0) {
      clampedWidth = clamp(state.width - deltaX, minWidth);
      next.width = clampedWidth;
      next.left = state.left + (state.width - clampedWidth);
    }

    if (state.direction.indexOf("n") >= 0) {
      clampedHeight = clamp(state.height - deltaY, minHeight);
      next.height = clampedHeight;
      next.top = state.top + (state.height - clampedHeight);
    }

    return next;
  }

  function controlDebugName(control) {
    if (!control || !control._state) {
      return "Unknown";
    }
    return control._typeName + "(" + (control._state.name || control._state.id) + ")";
  }

  function normalizeTreeDumpOptions(options) {
    if (options === true || options === "detailed" || options === "full") {
      return { detailed: true };
    }
    if (!options) {
      return { detailed: false };
    }
    return {
      detailed: !!options.detailed
    };
  }

  function appendDetailedTreeSummary(summary, control, state) {
    var children = ensureArray(control._children);

    if (state.text) {
      summary.push('text="' + state.text + '"');
    }
    if (state.title) {
      summary.push('title="' + state.title + '"');
    }
    if (state.placeholder) {
      summary.push('placeholder="' + state.placeholder + '"');
    }
    if (state.dock && state.dock !== "none") {
      summary.push("dock=" + state.dock);
    }
    if (state.gridColumn != null || state.gridRow != null) {
      summary.push("grid=(" + (state.gridColumn != null ? state.gridColumn : "-") + "," + (state.gridRow != null ? state.gridRow : "-") + ")");
    }
    if (state.gridArea) {
      summary.push("area=" + state.gridArea);
    }
    if ((state.columnSpan || 1) !== 1 || (state.rowSpan || 1) !== 1) {
      summary.push("span=(" + (state.columnSpan || 1) + "," + (state.rowSpan || 1) + ")");
    }
    if (state.invalid) {
      summary.push("invalid=true");
    }
    if (state.errorText) {
      summary.push('error="' + state.errorText + '"');
    }
    if (children.length) {
      summary.push("children=" + children.length);
    }
  }

  function appendTreeLines(control, depth, lines, options) {
    var indent = new Array(depth + 1).join("  ");
    var state = control._state || {};
    var summary = [
      controlDebugName(control),
      "visible=" + (!!state.visible),
      "enabled=" + (!!state.enabled),
      "lifecycle=" + (control._lifecycle || "Unknown")
    ];

    if (isNumber(state.left) || isNumber(state.top)) {
      summary.push("pos=(" + (state.left || 0) + "," + (state.top || 0) + ")");
    }
    if (isNumber(state.width) || isNumber(state.height)) {
      summary.push("size=(" + (state.width || "auto") + "," + (state.height || "auto") + ")");
    }
    if (options && options.detailed) {
      appendDetailedTreeSummary(summary, control, state);
    }

    lines.push(indent + summary.join(" "));

    ensureArray(control._children).forEach(function(child) {
      appendTreeLines(child, depth + 1, lines, options);
    });
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

  function normalizeDebugTopics(value) {
    var map = {};

    if (value == null) {
      return null;
    }

    if (Array.isArray(value)) {
      value.forEach(function(topic) {
        if (topic == null) {
          return;
        }
        map[String(topic).toLowerCase()] = true;
      });
      return map;
    }

    if (typeof value === "string") {
      value.split(",").forEach(function(topic) {
        var trimmed = String(topic).trim();
        if (!trimmed) {
          return;
        }
        map[trimmed.toLowerCase()] = true;
      });
      return map;
    }

    return null;
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
    this._responsiveControls = new Set();
    this._scheduled = false;
    this._windowZIndex = 1000;
    this._activeModalOverlay = null;
    this._modalWindows = [];
    this._viewportListenerAttached = false;
    this._handleViewportResize = this._handleViewportResize.bind(this);
  }

  Runtime.prototype.attach = function(doc, rootHost) {
    this.document = doc;
    this.rootHost = rootHost;
    if (!this._viewportListenerAttached && typeof global.addEventListener === "function") {
      global.addEventListener("resize", this._handleViewportResize);
      this._viewportListenerAttached = true;
    }
  };

  Runtime.prototype.getViewportWidth = function() {
    if (this.document && this.document.body && isNumber(this.document.body.clientWidth) && this.document.body.clientWidth > 0) {
      return this.document.body.clientWidth;
    }
    if (isNumber(global.innerWidth) && global.innerWidth > 0) {
      return global.innerWidth;
    }
    return 1280;
  };

  Runtime.prototype.trackResponsiveControl = function(control, enabled) {
    if (!control) {
      return;
    }
    if (enabled) {
      this._responsiveControls.add(control);
      return;
    }
    this._responsiveControls.delete(control);
  };

  Runtime.prototype._handleViewportResize = function() {
    var runtime = this;
    this.debugLog("Lifecycle", "Viewport resize width=" + this.getViewportWidth());
    this._responsiveControls.forEach(function(control) {
      runtime.markDirty(control);
    });
  };

  Runtime.prototype.debugLog = function(topic, message) {
    var topics;

    if (!this.application || !this.application.Debug || !global.console || typeof global.console.log !== "function") {
      return;
    }
    topics = this.application._debugTopics;
    if (topics && !topics[String(topic).toLowerCase()]) {
      return;
    }
    global.console.log("[JOG][" + topic + "] " + message);
  };

  Runtime.prototype.reportError = function(phase, error, details) {
    var message;
    var lines;

    if (!global.console || typeof global.console.error !== "function") {
      return;
    }

    details = details || {};
    lines = ["[JOG][Error][" + phase + "]"];

    if (details.control) {
      lines.push("Control: " + controlDebugName(details.control));
    }

    if (details.eventName) {
      lines.push("Event: " + details.eventName);
    }

    if (details.handlerIndex != null) {
      lines.push("Handler: #" + (details.handlerIndex + 1));
    }

    message = error && error.message ? error.message : String(error);
    lines.push("Message: " + message);

    if (error && error.stack) {
      lines.push("Stack: " + error.stack);
    }

    global.console.error(lines.join("\n"));
  };

  Runtime.prototype.markDirty = function(control) {
    if (!control || control._lifecycle === "Disposed") {
      return;
    }
    this.debugLog("Dirty", "Queued " + controlDebugName(control));
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
    this.debugLog("Flush", "Rendering " + controls.length + " control(s)");

    controls.sort(function(a, b) {
      return a._depth - b._depth;
    });

    for (var i = 0; i < controls.length; i += 1) {
      try {
        controls[i]._renderIfNeeded();
      } catch (error) {
        this.reportError("Render", error, { control: controls[i] });
        throw error;
      }
    }
  };

  Runtime.prototype.nextWindowZIndex = function() {
    this._windowZIndex += 1;
    return this._windowZIndex;
  };

  Runtime.prototype.assignWindowZIndex = function(windowControl) {
    if (!windowControl) {
      return;
    }
    windowControl._windowZIndex = this.nextWindowZIndex();
    if (windowControl._domNode) {
      windowControl._domNode.style.zIndex = windowControl._windowZIndex;
    }
    this.syncModalOverlay();
  };

  Runtime.prototype.updateModalWindow = function(windowControl, forceVisible) {
    var isVisible = forceVisible;
    var index;

    if (!windowControl) {
      this.syncModalOverlay();
      return;
    }

    if (isVisible === undefined) {
      isVisible = !!(windowControl.Modal && windowControl.Visible && windowControl._lifecycle !== "Disposed");
    }

    index = this._modalWindows.indexOf(windowControl);

    if (isVisible) {
      if (index < 0) {
        this._modalWindows.push(windowControl);
      }
    } else if (index >= 0) {
      this._modalWindows.splice(index, 1);
    }

    this.syncModalOverlay();
  };

  Runtime.prototype.syncModalOverlay = function() {
    var topModal = null;
    var topZIndex = -1;

    this._modalWindows = this._modalWindows.filter(function(windowControl) {
      return !!windowControl && windowControl._lifecycle !== "Disposed" && !!windowControl.Modal && !!windowControl.Visible;
    });

    this._modalWindows.forEach(function(windowControl) {
      var zIndex = windowControl._windowZIndex || 0;
      if (!windowControl._domNode || zIndex < topZIndex) {
        return;
      }
      topModal = windowControl;
      topZIndex = zIndex;
    });

    if (!topModal || !this.document || !this.document.body) {
      this.hideModalOverlay();
      return;
    }

    this.showModalOverlay();
    this._activeModalOverlay.style.zIndex = String(Math.max(topZIndex - 1, 1000));
  };

  Runtime.prototype.showModalOverlay = function() {
    if (this._activeModalOverlay || !this.document || !this.document.body) {
      return;
    }
    var overlay = this.document.createElement("div");
    overlay.className = "jog-modal-overlay";
    this.document.body.appendChild(overlay);
    this._activeModalOverlay = overlay;
    this.applyThemeToOverlay();
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

  Runtime.prototype.applyThemeToOverlay = function(theme) {
    var resolvedTheme = theme || (this.application && this.application._resolveTheme ? this.application._resolveTheme() : activeGlobalTheme);

    if (!this._activeModalOverlay) {
      return;
    }

    this._activeModalOverlay.style.background = resolvedTheme.colors.overlay;
  };

  function Application() {
    this.Runtime = new Runtime(this);
    this.MainPage = null;
    this._stylesInjected = false;
    this.Debug = false;
    this._debugTopics = null;
    this._themeOverride = null;
    this._resolvedTheme = cloneTheme(activeGlobalTheme);
  }

  Application.prototype.Run = function(page) {
    this.MainPage = page;
    this.Runtime.attach(document, document.body);
    this._injectBaseStyles();
    page._attachToApplication(this);
    page.Refresh();
    this.Runtime.flush();
    this._applyTheme();
    if (runningApplications.indexOf(this) < 0) {
      runningApplications.push(this);
    }
  };

  Application.prototype.DumpTree = function(options) {
    var lines = [];
    var normalizedOptions = normalizeTreeDumpOptions(options);
    if (!this.MainPage) {
      return "(no main page)";
    }
    appendTreeLines(this.MainPage, 0, lines, normalizedOptions);
    return lines.join("\n");
  };

  Application.prototype.LogTree = function(options) {
    if (global.console && typeof global.console.log === "function") {
      global.console.log(this.DumpTree(options));
    }
  };

  Object.defineProperty(Application.prototype, "DebugTopics", {
    get: function() { return this._debugTopics; },
    set: function(value) { this._debugTopics = normalizeDebugTopics(value); }
  });

  Object.defineProperty(Application.prototype, "Theme", {
    get: function() { return this._themeOverride ? cloneThemeOverride(this._themeOverride) : null; },
    set: function(value) {
      this._themeOverride = cloneThemeOverride(value);
      this._applyTheme();
    }
  });

  Application.prototype._resolveTheme = function() {
    this._resolvedTheme = mergeTheme(activeGlobalTheme, this._themeOverride);
    return this._resolvedTheme;
  };

  Application.prototype._applyTheme = function() {
    var theme = this._resolveTheme();
    if (this.MainPage && this.MainPage._domNode) {
      applyThemeVariablesToNode(this.MainPage._domNode, theme);
    }
    this.Runtime.applyThemeToOverlay(theme);
  };

  Application.prototype._injectBaseStyles = function() {
    if (this._stylesInjected) {
      return;
    }
    var style = document.createElement("style");
    style.type = "text/css";
    style.textContent = [
      "html, body { margin: 0; padding: 0; min-height: 100%; }",
      ".jog-root { position: relative; min-height: 100vh; font-family: var(--jog-font-family); font-size: var(--jog-font-size); background: var(--jog-app-background); color: var(--jog-text-strong); padding: var(--jog-page-padding); }",
      ".jog-page { position: relative; min-height: 100%; }",
      ".jog-control { box-sizing: border-box; }",
      ".jog-panel { position: relative; }",
      ".jog-dock-panel { position: relative; min-height: 100%; min-width: 100%; background: var(--jog-surface); border: 1px solid var(--jog-border-soft); border-radius: var(--jog-radius-shell); box-shadow: var(--jog-shadow-shell); overflow: hidden; }",
      ".jog-stack-panel { position: relative; display: flex; }",
      ".jog-stack-panel.vertical { flex-direction: column; }",
      ".jog-stack-panel.horizontal { flex-direction: row; align-items: center; }",
      ".jog-fill-width { width: 100%; }",
      ".jog-section { position: relative; background: var(--jog-surface); border: 1px solid var(--jog-border-soft); border-radius: var(--jog-radius-section); box-shadow: var(--jog-shadow-section); overflow: hidden; }",
      ".jog-section-header { padding: var(--jog-section-header-y) var(--jog-section-header-x); font-size: var(--jog-title-size); font-weight: 600; color: var(--jog-text); background: var(--jog-surface-muted); border-bottom: 1px solid var(--jog-border-soft); }",
      ".jog-section-body { position: relative; padding: var(--jog-section-body); }",
      ".jog-grid-panel { position: relative; display: grid; align-items: start; }",
      ".jog-window { position: absolute; border: 1px solid var(--jog-border); border-radius: var(--jog-radius-window); background: var(--jog-surface); box-shadow: var(--jog-shadow-window); overflow: hidden; }",
      ".jog-window-titlebar { background: var(--jog-surface-muted); color: var(--jog-text); padding: 12px 16px; font-weight: 600; cursor: move; user-select: none; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--jog-border-soft); }",
      ".jog-window-content { position: relative; padding: var(--jog-window-content); background: var(--jog-surface); }",
      ".jog-window-resize-handle { position: absolute; z-index: 2; }",
      ".jog-window-resize-handle.edge-top { top: -4px; left: 12px; right: 12px; height: 8px; cursor: ns-resize; }",
      ".jog-window-resize-handle.edge-right { top: 12px; right: -4px; bottom: 12px; width: 8px; cursor: ew-resize; }",
      ".jog-window-resize-handle.edge-bottom { left: 12px; right: 12px; bottom: -4px; height: 8px; cursor: ns-resize; }",
      ".jog-window-resize-handle.edge-left { top: 12px; left: -4px; bottom: 12px; width: 8px; cursor: ew-resize; }",
      ".jog-window-resize-handle.corner-top-left { top: -4px; left: -4px; width: 14px; height: 14px; cursor: nwse-resize; }",
      ".jog-window-resize-handle.corner-top-right { top: -4px; right: -4px; width: 14px; height: 14px; cursor: nesw-resize; }",
      ".jog-window-resize-handle.corner-bottom-left { bottom: -4px; left: -4px; width: 14px; height: 14px; cursor: nesw-resize; }",
      ".jog-window-resize-handle.corner-bottom-right { right: 0; bottom: 0; width: 16px; height: 16px; cursor: nwse-resize; background: linear-gradient(135deg, transparent 0 45%, var(--jog-resize-grip) 45% 55%, transparent 55% 100%); }",
      ".jog-button { border: 1px solid var(--jog-border); background: var(--jog-surface); color: var(--jog-text); border-radius: var(--jog-radius-control); padding: var(--jog-control-padding-y) 14px; cursor: pointer; font-size: var(--jog-font-size); }",
      ".jog-button:disabled { opacity: 0.6; cursor: default; }",
      ".jog-window-close { padding: var(--jog-close-button-y) var(--jog-close-button-x); background: var(--jog-primary); border-color: var(--jog-primary); color: var(--jog-primary-text); }",
      ".jog-button.jog-theme-preset-primary { background: var(--jog-primary); border-color: var(--jog-primary); color: var(--jog-primary-text); }",
      ".jog-button.jog-theme-preset-danger { background: var(--jog-danger); border-color: var(--jog-danger); color: var(--jog-primary-text); }",
      ".jog-button.jog-theme-preset-quiet { background: transparent; border-color: transparent; color: var(--jog-text-muted); box-shadow: none; }",
      ".jog-label { display: block; color: var(--jog-text-muted); font-size: var(--jog-font-size); line-height: var(--jog-line-height); }",
      ".jog-label.jog-theme-preset-primary { color: var(--jog-primary); font-weight: 600; }",
      ".jog-label.jog-theme-preset-strong { color: var(--jog-text); font-weight: 600; }",
      ".jog-label.jog-error-text { color: var(--jog-danger-text); font-size: var(--jog-caption-size); line-height: 1.35; }",
      ".jog-section.jog-theme-preset-muted { background: var(--jog-surface-muted); }",
      ".jog-section.jog-theme-preset-primary { border-color: var(--jog-primary); }",
      ".jog-section.jog-theme-preset-primary .jog-section-header { background: var(--jog-primary); color: var(--jog-primary-text); border-bottom-color: var(--jog-primary); }",
      ".jog-textbox { border: 1px solid var(--jog-border); border-radius: var(--jog-radius-control); padding: var(--jog-control-padding-y) var(--jog-control-padding-x); font-size: var(--jog-font-size); background: var(--jog-surface); color: var(--jog-text); }",
      ".jog-textarea { border: 1px solid var(--jog-border); border-radius: var(--jog-radius-control); padding: var(--jog-control-padding-y) var(--jog-control-padding-x); font-size: var(--jog-font-size); background: var(--jog-surface); color: var(--jog-text); resize: vertical; min-height: 120px; }",
      ".jog-checkbox-row { display: flex; align-items: center; gap: var(--jog-field-gap); color: var(--jog-text-strong); font-size: var(--jog-font-size); }",
      ".jog-checkbox { width: 16px; height: 16px; }",
      ".jog-radio-row { display: flex; align-items: center; gap: var(--jog-field-gap); color: var(--jog-text-strong); font-size: var(--jog-font-size); }",
      ".jog-radio { width: 16px; height: 16px; }",
      ".jog-select { border: 1px solid var(--jog-border); border-radius: var(--jog-radius-control); padding: var(--jog-control-padding-y) var(--jog-control-padding-x); font-size: var(--jog-font-size); background: var(--jog-surface); color: var(--jog-text); min-height: 42px; }",
      ".jog-listbox { border: 1px solid var(--jog-border); border-radius: var(--jog-radius-control); padding: var(--jog-list-padding); font-size: var(--jog-font-size); background: var(--jog-surface); color: var(--jog-text); min-height: 120px; }",
      ".jog-textbox.jog-invalid, .jog-textarea.jog-invalid, .jog-select.jog-invalid, .jog-listbox.jog-invalid { border-color: var(--jog-danger); box-shadow: var(--jog-shadow-invalid-ring); }",
      ".jog-checkbox-row.jog-invalid, .jog-radio-row.jog-invalid { color: var(--jog-danger-text); }",
      ".jog-stack-panel.jog-invalid .jog-radio-row { color: var(--jog-danger-text); }",
      ".jog-modal-overlay { position: fixed; inset: 0; background: var(--jog-overlay); z-index: 1000; }"
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
      minWidth: null,
      minHeight: null,
      maxWidth: null,
      maxHeight: null,
      top: null,
      left: null,
      gridColumn: null,
      gridRow: null,
      gridArea: null,
      responsiveGrid: null,
      responsiveLayout: null,
      columnSpan: 1,
      rowSpan: 1,
      padding: null,
      margin: null,
      gap: null,
      cssClass: null,
      themePreset: "",
      tooltip: null,
      invalid: false,
      errorText: "",
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
    this._runtime.debugLog("Lifecycle", "Render " + controlDebugName(this));
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
    this._runtime.debugLog("Lifecycle", "Mounted " + controlDebugName(this));
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

  Component.prototype._isDockManagedChild = function(resolvedState) {
    return !!(this._parent && this._parent._typeName === "DockPanel" && resolvedState && resolvedState.dock && resolvedState.dock !== "none");
  };

  Component.prototype._createDomNode = function(doc) {
    var node = doc.createElement("div");
    node.className = "jog-control";
    return node;
  };

  Component.prototype._applyStateToDom = function(prevState, nextState) {
    var isDockManagedChild;
    var resolvedState = resolveResponsiveValues({
      width: nextState.width,
      height: nextState.height,
      minWidth: nextState.minWidth,
      minHeight: nextState.minHeight,
      maxWidth: nextState.maxWidth,
      maxHeight: nextState.maxHeight,
      top: nextState.top,
      left: nextState.left,
      padding: nextState.padding,
      margin: nextState.margin,
      gap: nextState.gap,
      dock: nextState.dock
    }, nextState.responsiveLayout, this._runtime ? this._runtime.getViewportWidth() : 1280);

    if (!this._domNode) {
      return;
    }
    this._resolvedResponsiveState = resolvedState;
    isDockManagedChild = this._isDockManagedChild(resolvedState);
    this._domNode.id = nextState.name || nextState.id;
    this._domNode.style.display = nextState.visible ? "" : "none";
    this._domNode.style.width = isDockManagedChild ? this._domNode.style.width : (isNumber(resolvedState.width) ? toCssPixels(resolvedState.width) : "");
    this._domNode.style.height = isDockManagedChild ? this._domNode.style.height : (isNumber(resolvedState.height) ? toCssPixels(resolvedState.height) : "");
    this._domNode.style.minWidth = isDockManagedChild ? this._domNode.style.minWidth : (isNumber(resolvedState.minWidth) ? toCssPixels(resolvedState.minWidth) : "");
    this._domNode.style.minHeight = isDockManagedChild ? this._domNode.style.minHeight : (isNumber(resolvedState.minHeight) ? toCssPixels(resolvedState.minHeight) : "");
    this._domNode.style.maxWidth = isDockManagedChild ? this._domNode.style.maxWidth : (isNumber(resolvedState.maxWidth) ? toCssPixels(resolvedState.maxWidth) : "");
    this._domNode.style.maxHeight = isDockManagedChild ? this._domNode.style.maxHeight : (isNumber(resolvedState.maxHeight) ? toCssPixels(resolvedState.maxHeight) : "");
    this._domNode.style.padding = toCssBox(resolvedState.padding);
    this._domNode.style.margin = isDockManagedChild ? this._domNode.style.margin : toCssBox(resolvedState.margin);
    this._domNode.title = nextState.errorText || nextState.tooltip || "";
    this._domNode.classList.toggle("jog-invalid", !!nextState.invalid);
    if (this._themePresetClass && this._themePresetClass !== "jog-theme-preset-" + nextState.themePreset) {
      this._domNode.classList.remove(this._themePresetClass);
      this._themePresetClass = "";
    }
    if (nextState.themePreset) {
      this._themePresetClass = "jog-theme-preset-" + nextState.themePreset;
      this._domNode.classList.add(this._themePresetClass);
    }
    if (nextState.invalid) {
      this._domNode.setAttribute("aria-invalid", "true");
    } else {
      this._domNode.removeAttribute("aria-invalid");
    }
    if (nextState.cssClass) {
      this._domNode.classList.add(nextState.cssClass);
    }
    if (this._runtime) {
      this._runtime.trackResponsiveControl(this, !!(nextState.responsiveLayout || nextState.responsiveGrid));
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
    var i;
    if (this._runtime) {
      this._runtime.debugLog("Event", controlDebugName(this) + " -> " + name + " handlers=" + handlers.length);
    }
    for (i = 0; i < handlers.length; i += 1) {
      try {
        handlers[i](eventArgs);
      } catch (error) {
        if (this._runtime) {
          this._runtime.reportError("Event", error, {
            control: this,
            eventName: name,
            handlerIndex: i
          });
        }
        throw error;
      }
    }
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
    if (this._runtime) {
      this._runtime.debugLog("Lifecycle", "Dispose " + controlDebugName(this));
      this._runtime.trackResponsiveControl(this, false);
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

  Component.prototype.SetError = function(message) {
    this.ErrorText = message == null ? "" : String(message);
    this.Invalid = !!this.ErrorText;
  };

  Component.prototype.ClearError = function() {
    this.ErrorText = "";
    this.Invalid = false;
  };

  Component.prototype.BindError = function(store, key) {
    var control = this;
    var listener = function(value) {
      if (value) {
        control.SetError(value);
        return;
      }
      control.ClearError();
    };
    var unsubscribe = store.Subscribe(key, listener);
    this._bindings.push({ unsubscribe: unsubscribe });
    listener(store.Get(key));
  };

  Component.prototype.BindVisible = function(store, key, transform) {
    var control = this;
    var listener = function(value) {
      control.Visible = transform ? !!transform(value) : !!value;
    };
    var unsubscribe = store.Subscribe(key, listener);
    this._bindings.push({ unsubscribe: unsubscribe });
    listener(store.Get(key));
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

  Object.defineProperty(Component.prototype, "MinWidth", {
    get: function() { return this._state.minWidth; },
    set: function(value) { this._setState("minWidth", value); }
  });

  Object.defineProperty(Component.prototype, "MinHeight", {
    get: function() { return this._state.minHeight; },
    set: function(value) { this._setState("minHeight", value); }
  });

  Object.defineProperty(Component.prototype, "MaxWidth", {
    get: function() { return this._state.maxWidth; },
    set: function(value) { this._setState("maxWidth", value); }
  });

  Object.defineProperty(Component.prototype, "MaxHeight", {
    get: function() { return this._state.maxHeight; },
    set: function(value) { this._setState("maxHeight", value); }
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

  Object.defineProperty(Component.prototype, "Invalid", {
    get: function() { return !!this._state.invalid; },
    set: function(value) { this._setState("invalid", !!value); }
  });

  Object.defineProperty(Component.prototype, "ErrorText", {
    get: function() { return this._state.errorText; },
    set: function(value) { this._setState("errorText", value == null ? "" : String(value)); }
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

  Object.defineProperty(Component.prototype, "ResponsiveLayout", {
    get: function() { return this._state.responsiveLayout; },
    set: function(value) { this._setState("responsiveLayout", cloneResponsiveConfig(value, normalizeResponsiveLayoutBreakpoint)); }
  });

  Object.defineProperty(Component.prototype, "GridColumn", {
    get: function() { return this._state.gridColumn; },
    set: function(value) { this._setState("gridColumn", value); }
  });

  Object.defineProperty(Component.prototype, "GridRow", {
    get: function() { return this._state.gridRow; },
    set: function(value) { this._setState("gridRow", value); }
  });

  Object.defineProperty(Component.prototype, "GridArea", {
    get: function() { return this._state.gridArea; },
    set: function(value) { this._setState("gridArea", value == null ? null : String(value)); }
  });

  Object.defineProperty(Component.prototype, "ResponsiveGrid", {
    get: function() { return this._state.responsiveGrid; },
    set: function(value) { this._setState("responsiveGrid", cloneResponsiveConfig(value, normalizeResponsivePlacementBreakpoint)); }
  });

  Object.defineProperty(Component.prototype, "ColumnSpan", {
    get: function() { return this._state.columnSpan; },
    set: function(value) { this._setState("columnSpan", isNumber(value) && value > 0 ? value : 1); }
  });

  Object.defineProperty(Component.prototype, "RowSpan", {
    get: function() { return this._state.rowSpan; },
    set: function(value) { this._setState("rowSpan", isNumber(value) && value > 0 ? value : 1); }
  });

  Object.defineProperty(Component.prototype, "Dock", {
    get: function() { return this._state.dock || "none"; },
    set: function(value) {
      var allowed = ["none", "top", "bottom", "left", "right", "fill"];
      this._setState("dock", allowed.indexOf(value) >= 0 ? value : "none");
    }
  });

  Object.defineProperty(Component.prototype, "ThemePreset", {
    get: function() { return this._state.themePreset; },
    set: function(value) { this._setState("themePreset", value == null ? "" : String(value)); }
  });

  function Control(typeName) {
    Component.call(this, typeName || "Control");
  }

  Control.prototype = Object.create(Component.prototype);
  Control.prototype.constructor = Control;

  Control.prototype._applyStateToDom = function(prevState, nextState) {
    var isDockManagedChild;
    var resolvedLayoutState;
    var resolvedGridPlacement;
    var viewportWidth;

    Component.prototype._applyStateToDom.call(this, prevState, nextState);
    if (!this._domNode) {
      return;
    }
    resolvedLayoutState = this._resolvedResponsiveState || nextState;
    isDockManagedChild = this._isDockManagedChild(resolvedLayoutState);
    if (this._runtime) {
      viewportWidth = this._runtime.getViewportWidth();
    }
    resolvedGridPlacement = resolveResponsiveValues({
      gridColumn: nextState.gridColumn,
      gridRow: nextState.gridRow,
      gridArea: nextState.gridArea,
      columnSpan: nextState.columnSpan,
      rowSpan: nextState.rowSpan
    }, nextState.responsiveGrid, viewportWidth || 1280);
    this._domNode.style.position = this._usesFlowLayout() ? "" : "absolute";
    this._domNode.style.left = this._usesFlowLayout() || isDockManagedChild ? this._domNode.style.left : toCssPixels(resolvedLayoutState.left);
    this._domNode.style.top = this._usesFlowLayout() || isDockManagedChild ? this._domNode.style.top : toCssPixels(resolvedLayoutState.top);
    this._domNode.style.gridArea = resolvedGridPlacement.gridArea || "";
    this._domNode.style.gridColumn = resolvedGridPlacement.gridArea ? "" : (resolvedGridPlacement.gridColumn != null ? String(resolvedGridPlacement.gridColumn) + " / span " + (resolvedGridPlacement.columnSpan || 1) : "");
    this._domNode.style.gridRow = resolvedGridPlacement.gridArea ? "" : (resolvedGridPlacement.gridRow != null ? String(resolvedGridPlacement.gridRow) + " / span " + (resolvedGridPlacement.rowSpan || 1) : "");
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
    if (this._application) {
      this._application._applyTheme();
    }
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

  Page.prototype._childUsesFlowLayout = function() {
    return true;
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
    var resolvedState;

    Container.prototype._applyStateToDom.call(this, prevState, nextState);
    if (!this._domNode) {
      return;
    }
    resolvedState = this._resolvedResponsiveState || nextState;

    var padding = normalizeBox(resolvedState.padding);
    var top = padding.top;
    var left = padding.left;
    var right = (this._domNode.clientWidth || this.Width || 0) - padding.right;
    var bottom = (this._domNode.clientHeight || this.Height || 0) - padding.bottom;

    this._children.forEach(function(child) {
      var childState = child._resolvedResponsiveState || child._state;
      if (!child._domNode) {
        return;
      }

      var dock = childState.dock || child.Dock || "none";
      var width = childState.width || child.Width || child._domNode.offsetWidth || 0;
      var height = childState.height || child.Height || child._domNode.offsetHeight || 0;
      var margin = normalizeBox(childState.margin);
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
    this._state.responsive = null;
  }

  StackPanel.prototype = Object.create(Container.prototype);
  StackPanel.prototype.constructor = StackPanel;

  StackPanel.prototype._createDomNode = function(doc) {
    var node = doc.createElement("div");
    node.className = "jog-control jog-stack-panel vertical";
    return node;
  };

  StackPanel.prototype._applyStateToDom = function(prevState, nextState) {
    var resolvedStack;

    Container.prototype._applyStateToDom.call(this, prevState, nextState);
    if (!this._domNode) {
      return;
    }
    if (this._runtime) {
      this._runtime.trackResponsiveControl(this, !!(nextState.responsive || nextState.responsiveLayout));
    }
    resolvedStack = resolveResponsiveValues({
      orientation: nextState.orientation,
      spacing: nextState.spacing,
      gap: nextState.gap
    }, nextState.responsive, this._runtime ? this._runtime.getViewportWidth() : 1280);
    this._domNode.classList.remove("vertical", "horizontal");
    this._domNode.classList.add(resolvedStack.orientation === "horizontal" ? "horizontal" : "vertical");
    this._domNode.style.gap = toCssBox(resolvedStack.gap != null ? resolvedStack.gap : resolvedStack.spacing) || "8px";
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

  Object.defineProperty(StackPanel.prototype, "Responsive", {
    get: function() { return this._state.responsive; },
    set: function(value) { this._setState("responsive", cloneResponsiveConfig(value, normalizeResponsiveStackBreakpoint)); }
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

  function Grid() {
    Container.call(this, "Grid");
    this._state.columns = "1fr";
    this._state.rows = "";
    this._state.areas = "";
    this._state.autoRows = "";
    this._state.autoFlow = "row";
    this._state.columnGap = 12;
    this._state.rowGap = 12;
    this._state.responsive = null;
  }

  Grid.prototype = Object.create(Container.prototype);
  Grid.prototype.constructor = Grid;

  Grid.prototype._createDomNode = function(doc) {
    var node = doc.createElement("div");
    node.className = "jog-control jog-grid-panel";
    return node;
  };

  Grid.prototype._applyStateToDom = function(prevState, nextState) {
    var resolvedGrid;
    var viewportWidth;

    Container.prototype._applyStateToDom.call(this, prevState, nextState);
    if (!this._domNode) {
      return;
    }
    if (this._runtime) {
      this._runtime.trackResponsiveControl(this, !!nextState.responsive);
      viewportWidth = this._runtime.getViewportWidth();
    }
    resolvedGrid = resolveResponsiveValues({
      columns: nextState.columns,
      rows: nextState.rows,
      areas: nextState.areas,
      autoRows: nextState.autoRows,
      autoFlow: nextState.autoFlow,
      columnGap: nextState.columnGap,
      rowGap: nextState.rowGap
    }, nextState.responsive, viewportWidth || 1280);
    this._domNode.style.gridTemplateColumns = toGridTrackList(resolvedGrid.columns, "1fr");
    this._domNode.style.gridTemplateRows = toGridTrackList(resolvedGrid.rows, "");
    this._domNode.style.gridTemplateAreas = resolvedGrid.areas || "";
    this._domNode.style.gridAutoRows = resolvedGrid.autoRows || "";
    this._domNode.style.gridAutoFlow = resolvedGrid.autoFlow || "row";
    this._domNode.style.columnGap = toCssPixels(resolvedGrid.columnGap);
    this._domNode.style.rowGap = toCssPixels(resolvedGrid.rowGap);
  };

  Grid.prototype._childUsesFlowLayout = function() {
    return true;
  };

  Object.defineProperty(Grid.prototype, "Columns", {
    get: function() { return this._state.columns; },
    set: function(value) { this._setState("columns", value); }
  });

  Object.defineProperty(Grid.prototype, "Rows", {
    get: function() { return this._state.rows; },
    set: function(value) { this._setState("rows", value); }
  });

  Object.defineProperty(Grid.prototype, "Areas", {
    get: function() { return this._state.areas; },
    set: function(value) { this._setState("areas", value == null ? "" : String(value)); }
  });

  Object.defineProperty(Grid.prototype, "AutoRows", {
    get: function() { return this._state.autoRows; },
    set: function(value) { this._setState("autoRows", value == null ? "" : String(value)); }
  });

  Object.defineProperty(Grid.prototype, "AutoFlow", {
    get: function() { return this._state.autoFlow; },
    set: function(value) {
      var allowed = ["row", "column", "row dense", "column dense"];
      this._setState("autoFlow", allowed.indexOf(value) >= 0 ? value : "row");
    }
  });

  Object.defineProperty(Grid.prototype, "ColumnGap", {
    get: function() { return this._state.columnGap; },
    set: function(value) { this._setState("columnGap", isNumber(value) ? value : 12); }
  });

  Object.defineProperty(Grid.prototype, "RowGap", {
    get: function() { return this._state.rowGap; },
    set: function(value) { this._setState("rowGap", isNumber(value) ? value : 12); }
  });

  Object.defineProperty(Grid.prototype, "Responsive", {
    get: function() { return this._state.responsive; },
    set: function(value) { this._setState("responsive", cloneResponsiveConfig(value, normalizeGridResponsiveBreakpoint)); }
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

  Label.prototype.BindText = function(store, key, formatter) {
    var control = this;
    var listener = function(value) {
      var nextValue = formatter ? formatter(value) : value;
      control.Text = nextValue == null ? "" : String(nextValue);
    };
    var unsubscribe = store.Subscribe(key, listener);
    this._bindings.push({ unsubscribe: unsubscribe });
    listener(store.Get(key));
  };

  function ValidationMessage() {
    Label.call(this);
    this._typeName = "ValidationMessage";
    this.CssClass = "jog-error-text";
    this.Visible = false;
  }

  ValidationMessage.prototype = Object.create(Label.prototype);
  ValidationMessage.prototype.constructor = ValidationMessage;

  ValidationMessage.prototype.BindMessage = function(store, key, formatter) {
    this.BindText(store, key, formatter);
    this.BindVisible(store, key);
  };

  function ValidationSummary() {
    SectionPanel.call(this);
    this._typeName = "ValidationSummary";
    this.Title = "Validation Summary";
    this.Padding = 14;
    this.Visible = false;

    this._messageLabel = new ValidationMessage();
    this._messageLabel.Name = "validationSummaryMessage";
    this.Add(this._messageLabel);
  }

  ValidationSummary.prototype = Object.create(SectionPanel.prototype);
  ValidationSummary.prototype.constructor = ValidationSummary;

  ValidationSummary.prototype.BindSummary = function(store, key, formatter) {
    this._messageLabel.BindMessage(store, key, formatter);
    this.BindVisible(store, key);
  };

  ValidationSummary.prototype.BindErrors = function(store, keys, formatter) {
    var control = this;
    var errorKeys = ensureArray(keys).slice();

    function update() {
      var messages = errorKeys.map(function(key) {
        return store.Get(key);
      }).filter(function(message) {
        return !!message;
      });
      var summary = formatter ? formatter(messages, store) : (messages.length ? "Please fix: " + messages.join(" | ") : "");

      control._messageLabel.Text = summary;
      control.Visible = !!summary;
    }

    errorKeys.forEach(function(key) {
      var unsubscribe = store.Subscribe(key, update);
      control._bindings.push({ unsubscribe: unsubscribe });
    });

    update();
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
    this.OnChange(function(eventArgs) {
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
    this.OnChange(function(eventArgs) {
      store.Set(key, !!eventArgs.Value);
    });
  };

  function RadioButton() {
    Control.call(this, "RadioButton");
    this._state.checked = false;
    this._state.groupName = "";
    this._state.value = "";
  }

  RadioButton.prototype = Object.create(Control.prototype);
  RadioButton.prototype.constructor = RadioButton;

  RadioButton.prototype._createDomNode = function(doc) {
    var wrapper = doc.createElement("label");
    wrapper.className = "jog-control jog-radio-row";

    var input = doc.createElement("input");
    input.type = "radio";
    input.className = "jog-radio";

    var text = doc.createElement("span");

    wrapper.appendChild(input);
    wrapper.appendChild(text);

    this._inputNode = input;
    this._captionNode = text;
    return wrapper;
  };

  RadioButton.prototype._applyStateToDom = function(prevState, nextState) {
    Control.prototype._applyStateToDom.call(this, prevState, nextState);
    if (!this._domNode) {
      return;
    }
    this._inputNode.name = nextState.groupName || "";
    this._inputNode.value = nextState.value || "";
    this._inputNode.checked = !!nextState.checked;
    this._inputNode.disabled = !nextState.enabled;
    this._captionNode.textContent = nextState.text || "";
  };

  RadioButton.prototype._bindDomEvents = function() {
    var control = this;
    this._inputNode.addEventListener("change", function(event) {
      control._state.checked = !!event.target.checked;
      control._raiseEvent("Change", event, { Value: event.target.value });
      control._previousState = cloneState(control._state);
    });
  };

  Object.defineProperty(RadioButton.prototype, "Checked", {
    get: function() { return !!this._state.checked; },
    set: function(value) { this._setState("checked", !!value); }
  });

  Object.defineProperty(RadioButton.prototype, "GroupName", {
    get: function() { return this._state.groupName; },
    set: function(value) { this._setState("groupName", value == null ? "" : String(value)); }
  });

  Object.defineProperty(RadioButton.prototype, "Value", {
    get: function() { return this._state.value; },
    set: function(value) { this._setState("value", value == null ? "" : String(value)); }
  });

  RadioButton.prototype.BindSelectedValue = function(store, key) {
    var control = this;
    var listener = function(value) {
      control.Checked = (String(value) === String(control.Value));
    };
    var unsubscribe = store.Subscribe(key, listener);
    this._bindings.push({ unsubscribe: unsubscribe });
    listener(store.Get(key));
    this.OnChange(function(eventArgs) {
      if (control.Checked || eventArgs.Value === control.Value) {
        store.Set(key, control.Value);
      }
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
    this.OnChange(function(eventArgs) {
      store.Set(key, eventArgs.Value);
    });
  };

  function ListBox() {
    Control.call(this, "ListBox");
    this._state.options = [];
    this._state.selectedValue = "";
    this._state.size = 5;
  }

  ListBox.prototype = Object.create(Control.prototype);
  ListBox.prototype.constructor = ListBox;

  ListBox.prototype._createDomNode = function(doc) {
    var node = doc.createElement("select");
    node.className = "jog-control jog-listbox";
    node.size = 5;
    return node;
  };

  ListBox.prototype._applyStateToDom = function(prevState, nextState) {
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

    this._domNode.size = nextState.size || 5;
    this._domNode.value = nextState.selectedValue || "";
    this._domNode.disabled = !nextState.enabled;
  };

  ListBox.prototype._bindDomEvents = function() {
    var control = this;
    this._domNode.addEventListener("change", function(event) {
      control._state.selectedValue = event.target.value;
      control._raiseEvent("Change", event, { Value: event.target.value });
      control._previousState = cloneState(control._state);
    });
  };

  Object.defineProperty(ListBox.prototype, "Options", {
    get: function() { return this._state.options.slice(); },
    set: function(value) { this._setState("options", ensureArray(value).slice()); }
  });

  Object.defineProperty(ListBox.prototype, "SelectedValue", {
    get: function() { return this._state.selectedValue; },
    set: function(value) { this._setState("selectedValue", value == null ? "" : String(value)); }
  });

  Object.defineProperty(ListBox.prototype, "SizeRows", {
    get: function() { return this._state.size; },
    set: function(value) { this._setState("size", isNumber(value) ? value : 5); }
  });

  ListBox.prototype.BindSelectedValue = function(store, key) {
    var control = this;
    var listener = function(value) {
      control.SelectedValue = value == null ? "" : String(value);
    };
    var unsubscribe = store.Subscribe(key, listener);
    this._bindings.push({ unsubscribe: unsubscribe });
    listener(store.Get(key));
    this.OnChange(function(eventArgs) {
      store.Set(key, eventArgs.Value);
    });
  };

  function Window() {
    Container.call(this, "Window");
    this._state.title = "";
    this._state.modal = false;
    this._state.draggable = true;
    this._state.resizable = false;
    this._state.closeButtonVisible = true;
    this._state.closeButtonText = "Close";
    this._state.closeOnEscape = true;
    this._dragState = null;
    this._resizeState = null;
    this._contentNode = null;
    this._windowZIndex = null;
    this._hasRaisedLoad = false;
    this._hasRenderedVisibility = false;
    this._lastRenderedVisible = null;
  }

  Window.prototype = Object.create(Container.prototype);
  Window.prototype.constructor = Window;

  Window.prototype._createDomNode = function(doc) {
    var resizeHandles = {};
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
    closeButton.className = "jog-button jog-window-close";
    titleBar.appendChild(closeButton);

    var content = doc.createElement("div");
    content.className = "jog-window-content";

    function createResizeHandle(cssClass, direction) {
      var handle = doc.createElement("div");
      handle.className = "jog-window-resize-handle " + cssClass;
      handle._resizeDirection = direction;
      resizeHandles[direction] = handle;
      return handle;
    }

    node.appendChild(titleBar);
    node.appendChild(content);
    node.appendChild(createResizeHandle("edge-top", "n"));
    node.appendChild(createResizeHandle("edge-right", "e"));
    node.appendChild(createResizeHandle("edge-bottom", "s"));
    node.appendChild(createResizeHandle("edge-left", "w"));
    node.appendChild(createResizeHandle("corner-top-left", "nw"));
    node.appendChild(createResizeHandle("corner-top-right", "ne"));
    node.appendChild(createResizeHandle("corner-bottom-left", "sw"));
    node.appendChild(createResizeHandle("corner-bottom-right", "se"));

    this._titleNode = titleText;
    this._closeNode = closeButton;
    this._contentNode = content;
    this._titleBarNode = titleBar;
    this._resizeHandleNode = resizeHandles.se;
    this._resizeHandles = resizeHandles;

    return node;
  };

  Window.prototype._getChildHostNode = function() {
    return this._contentNode || this._domNode;
  };

  Window.prototype._usesFlowLayout = function() {
    return false;
  };

  Window.prototype._applyStateToDom = function(prevState, nextState) {
    Container.prototype._applyStateToDom.call(this, prevState, nextState);
    if (!this._domNode) {
      return;
    }
    this._titleNode.textContent = nextState.title || "";
    this._closeNode.textContent = nextState.closeButtonText || "Close";
    this._closeNode.style.display = nextState.closeButtonVisible ? "" : "none";
    this._domNode.style.left = toCssPixels(nextState.left);
    this._domNode.style.top = toCssPixels(nextState.top);
    this._domNode.style.width = isNumber(nextState.width) ? toCssPixels(nextState.width) : "420px";
    this._domNode.style.height = isNumber(nextState.height) ? toCssPixels(nextState.height) : "";
    this._domNode.style.minWidth = isNumber(nextState.minWidth) ? toCssPixels(nextState.minWidth) : "";
    this._domNode.style.minHeight = isNumber(nextState.minHeight) ? toCssPixels(nextState.minHeight) : "";
    Object.keys(this._resizeHandles).forEach(function(direction) {
      this._resizeHandles[direction].style.display = nextState.resizable ? "" : "none";
    }, this);

    if (this._windowZIndex == null || (!prevState.visible && nextState.visible)) {
      this._runtime.assignWindowZIndex(this);
    } else {
      this._domNode.style.zIndex = String(this._windowZIndex);
    }

    this._runtime.updateModalWindow(this);

    if (!this._hasRaisedLoad) {
      this._hasRaisedLoad = true;
      this._raiseEvent("Load", null);
    }

    if (!this._hasRenderedVisibility) {
      this._hasRenderedVisibility = true;
      this._lastRenderedVisible = !!nextState.visible;
      if (nextState.visible) {
        this._raiseEvent("Show", null);
      }
      return;
    }

    if (this._lastRenderedVisible !== !!nextState.visible) {
      this._lastRenderedVisible = !!nextState.visible;
      this._raiseEvent(nextState.visible ? "Show" : "Hide", null);
    }
  };

  Window.prototype._bindDomEvents = function() {
    var control = this;
    var doc = this._runtime.document;

    function detachDragListeners(onMove, onUp) {
      doc.removeEventListener("mousemove", onMove);
      doc.removeEventListener("mouseup", onUp);
    }

    this._closeNode.addEventListener("click", function() {
      control.Close();
    });

    this._domNode.addEventListener("keydown", function(event) {
      if (event.key === "Escape" && control._state.closeOnEscape) {
        control.Close();
      }
    });

    this._titleBarNode.addEventListener("mousedown", function(event) {
      if (!control._state.draggable) {
        return;
      }
      control.BringToFront();
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
        detachDragListeners(onMove, onUp);
        control._dragState = null;
      }

      doc.addEventListener("mousemove", onMove);
      doc.addEventListener("mouseup", onUp);
    });

    Object.keys(this._resizeHandles).forEach(function(direction) {
      control._resizeHandles[direction].addEventListener("mousedown", function(event) {
        if (!control._state.resizable) {
          return;
        }
        event.preventDefault();
        event.stopPropagation();
        control.BringToFront();
        control._resizeState = {
          direction: direction,
          startX: event.clientX,
          startY: event.clientY,
          left: control.Left || 0,
          top: control.Top || 0,
          width: control.Width || control._domNode.offsetWidth || 420,
          height: control.Height || control._domNode.offsetHeight || 240
        };

        function onMove(moveEvent) {
          var nextBounds;
          if (!control._resizeState) {
            return;
          }
          nextBounds = resizeWindowFromState(
            control._resizeState,
            moveEvent.clientX - control._resizeState.startX,
            moveEvent.clientY - control._resizeState.startY,
            control.MinWidth || 220,
            control.MinHeight || 140
          );
          control.SetBounds(nextBounds.left, nextBounds.top, nextBounds.width, nextBounds.height);
        }

        function onUp() {
          detachDragListeners(onMove, onUp);
          control._resizeState = null;
        }

        doc.addEventListener("mousemove", onMove);
        doc.addEventListener("mouseup", onUp);
      });
    });
  };

  Window.prototype.ShowModal = function() {
    this.Modal = true;
    this.Show();
    this.BringToFront();
  };

  Window.prototype.Close = function() {
    this.Hide();
    if (this._runtime) {
      this._runtime.updateModalWindow(this, false);
    }
    this._raiseEvent("Close", null);
  };

  Window.prototype.BringToFront = function() {
    if (this._runtime) {
      this._runtime.assignWindowZIndex(this);
    }
  };

  Window.prototype.Dispose = function() {
    if (this._runtime) {
      this._runtime.updateModalWindow(this, false);
    }
    Container.prototype.Dispose.call(this);
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

  Object.defineProperty(Window.prototype, "CloseButtonVisible", {
    get: function() { return this._state.closeButtonVisible; },
    set: function(value) { this._setState("closeButtonVisible", !!value); }
  });

  Object.defineProperty(Window.prototype, "CloseButtonText", {
    get: function() { return this._state.closeButtonText; },
    set: function(value) { this._setState("closeButtonText", value == null ? "" : String(value)); }
  });

  Object.defineProperty(Window.prototype, "CloseOnEscape", {
    get: function() { return this._state.closeOnEscape; },
    set: function(value) { this._setState("closeOnEscape", !!value); }
  });

  Window.prototype.OnClose = function(listener) {
    this._registerEvent("Close", listener);
  };

  Window.prototype.OnLoad = function(listener) {
    this._registerEvent("Load", listener);
  };

  Window.prototype.OnShow = function(listener) {
    this._registerEvent("Show", listener);
  };

  Window.prototype.OnHide = function(listener) {
    this._registerEvent("Hide", listener);
  };

  function Dialog() {
    Window.call(this);
    this.Modal = true;
  }

  Dialog.prototype = Object.create(Window.prototype);
  Dialog.prototype.constructor = Dialog;

  JOG.SetTheme = function(theme) {
    activeGlobalTheme = mergeTheme(defaultTheme, theme);
    refreshRunningApplications();
  };

  JOG.GetTheme = function() {
    return cloneTheme(activeGlobalTheme);
  };

  Object.defineProperty(JOG, "Theme", {
    get: function() { return cloneTheme(activeGlobalTheme); },
    set: function(value) { JOG.SetTheme(value); }
  });

  JOG.Application = Application;
  JOG.Component = Component;
  JOG.Control = Control;
  JOG.Container = Container;
  JOG.Page = Page;
  JOG.Panel = Panel;
  JOG.DockPanel = DockPanel;
  JOG.SectionPanel = SectionPanel;
  JOG.StackPanel = StackPanel;
  JOG.Grid = Grid;
  JOG.Window = Window;
  JOG.Dialog = Dialog;
  JOG.Label = Label;
  JOG.ValidationMessage = ValidationMessage;
  JOG.ValidationSummary = ValidationSummary;
  JOG.Button = Button;
  JOG.TextBox = TextBox;
  JOG.TextArea = TextArea;
  JOG.CheckBox = CheckBox;
  JOG.RadioButton = RadioButton;
  JOG.DropDownList = DropDownList;
  JOG.ListBox = ListBox;
  JOG.Store = Store;
  JOG.EventArgs = EventArgs;

  global.JOG = JOG;
})(window);
