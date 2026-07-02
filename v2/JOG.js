(function(global) {
  "use strict";

  var JOG = {};

  var nextControlId = 0;
  var runningApplications = [];
  var hiddenFilePickerInput = null;
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

  function basename(path) {
    var value = String(path || "");
    var slash = Math.max(value.lastIndexOf("/"), value.lastIndexOf("\\"));
    return slash >= 0 ? value.slice(slash + 1) : value;
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

  function normalizeResponsiveSplitBreakpoint(value) {
    var normalized = {};

    if (!isPlainObject(value)) {
      return null;
    }
    if (value.orientation !== undefined) {
      normalized.orientation = value.orientation === "vertical" ? "vertical" : "horizontal";
    }
    if (value.gap !== undefined) {
      normalized.gap = value.gap;
    }
    if (value.firstPaneSize !== undefined && isNumber(value.firstPaneSize) && value.firstPaneSize >= 0) {
      normalized.firstPaneSize = value.firstPaneSize;
    }
    if (value.secondPaneSize !== undefined && isNumber(value.secondPaneSize) && value.secondPaneSize >= 0) {
      normalized.secondPaneSize = value.secondPaneSize;
    }

    return Object.keys(normalized).length ? normalized : null;
  }

  function normalizeResponsiveSectionBreakpoint(value) {
    var normalized = {};

    if (!isPlainObject(value)) {
      return null;
    }
    if (value.title !== undefined) {
      normalized.title = value.title == null ? "" : String(value.title);
    }
    if (value.padding !== undefined) {
      normalized.padding = value.padding;
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

  function cloneMenuItems(items) {
    return ensureArray(items).map(function(item, index) {
      var normalized;

      if (typeof item === "string") {
        return {
          key: "item-" + index,
          text: item,
          enabled: true
        };
      }

      normalized = isPlainObject(item) ? item : {};
      return {
        key: normalized.key != null && normalized.key !== "" ? String(normalized.key) : "item-" + index,
        text: normalized.text != null ? String(normalized.text) : "",
        enabled: normalized.enabled !== false
      };
    });
  }

  function cloneDataGridColumns(columns) {
    return ensureArray(columns).map(function(column, index) {
      var normalized = isPlainObject(column) ? column : {};
      var key = normalized.key != null && normalized.key !== "" ? String(normalized.key) : "";
      var field = normalized.field != null && normalized.field !== "" ? String(normalized.field) : key;

      if (!key) {
        key = field || ("column-" + index);
      }
      if (!field) {
        field = key;
      }

      return {
        key: key,
        field: field,
        title: normalized.title != null ? String(normalized.title) : key,
        width: normalized.width != null && normalized.width !== "" ? String(normalized.width) : "1fr",
        align: normalized.align === "center" || normalized.align === "right" ? normalized.align : "left",
        formatter: typeof normalized.formatter === "function" ? normalized.formatter : null,
        resizable: normalized.resizable !== false
      };
    });
  }

  function cloneDataGridCommands(commands) {
    return ensureArray(commands).map(function(command, index) {
      var normalized = isPlainObject(command) ? command : {};
      return {
        key: normalized.key != null && normalized.key !== "" ? String(normalized.key) : "command-" + index,
        text: normalized.text != null ? String(normalized.text) : "",
        themePreset: normalized.themePreset != null ? String(normalized.themePreset) : "",
        enabled: normalized.enabled === undefined ? true : normalized.enabled,
        visible: normalized.visible === undefined ? true : normalized.visible
      };
    });
  }

  function cloneCollectionRow(row) {
    if (isPlainObject(row)) {
      return Object.assign({}, row);
    }
    return row;
  }

  function normalizeCollectionRows(rows) {
    return ensureArray(rows).map(function(row) {
      return cloneCollectionRow(row);
    });
  }

  function shallowEqualObjects(left, right) {
    var leftKeys;
    var rightKeys;
    var i;

    if (left === right) {
      return true;
    }
    if (!isPlainObject(left) || !isPlainObject(right)) {
      return left === right;
    }

    leftKeys = Object.keys(left);
    rightKeys = Object.keys(right);
    if (leftKeys.length !== rightKeys.length) {
      return false;
    }

    for (i = 0; i < leftKeys.length; i += 1) {
      if (left[leftKeys[i]] !== right[leftKeys[i]]) {
        return false;
      }
    }

    return true;
  }

  function arrayShallowEqual(left, right) {
    var i;

    left = ensureArray(left);
    right = ensureArray(right);
    if (left.length !== right.length) {
      return false;
    }
    for (i = 0; i < left.length; i += 1) {
      if (left[i] !== right[i]) {
        return false;
      }
    }
    return true;
  }

  function uniqueValues(values) {
    var seen = {};
    var output = [];

    ensureArray(values).forEach(function(value) {
      var key = value == null ? "" : String(value);
      if (!key || seen[key]) {
        return;
      }
      seen[key] = true;
      output.push(key);
    });

    return output;
  }

  function parsePixelWidth(value) {
    var text;
    var match;

    if (value == null || value === "") {
      return null;
    }
    if (isNumber(value)) {
      return value;
    }
    text = String(value).trim();
    match = text.match(/^([0-9]+(?:\.[0-9]+)?)px$/i);
    if (!match) {
      return null;
    }
    return parseFloat(match[1]);
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

  function normalizeTextFileTypes(types) {
    if (!Array.isArray(types) || !types.length) {
      return [
        {
          description: "Text files",
          accept: {
            "text/plain": [".txt"]
          }
        }
      ];
    }
    return types;
  }

  function buildFileAcceptAttribute(types) {
    var values = [];

    normalizeTextFileTypes(types).forEach(function(type) {
      var accept = type && type.accept;
      Object.keys(accept || {}).forEach(function(mimeType) {
        var extensions = Array.isArray(accept[mimeType]) ? accept[mimeType] : [];
        if (values.indexOf(mimeType) < 0) {
          values.push(mimeType);
        }
        extensions.forEach(function(extension) {
          if (values.indexOf(extension) < 0) {
            values.push(extension);
          }
        });
      });
    });

    return values.join(",");
  }

  function ensureHiddenFilePickerInput(accept) {
    if (!global.document || !global.document.body || typeof global.document.createElement !== "function") {
      throw new Error("File picker fallback requires document.body.");
    }
    if (!hiddenFilePickerInput) {
      hiddenFilePickerInput = global.document.createElement("input");
      hiddenFilePickerInput.type = "file";
      hiddenFilePickerInput.style.display = "none";
      global.document.body.appendChild(hiddenFilePickerInput);
    }
    hiddenFilePickerInput.accept = accept || "";
    hiddenFilePickerInput.value = "";
    return hiddenFilePickerInput;
  }

  function readTextFileWithFallback(file) {
    return new Promise(function(resolve, reject) {
      var reader;

      if (!file) {
        resolve(null);
        return;
      }
      if (typeof file.text === "function") {
        file.text().then(function(text) {
          resolve({
            name: file.name || "",
            text: String(text == null ? "" : text),
            file: file,
            handle: null,
            method: "input"
          });
        }, reject);
        return;
      }
      if (typeof global.FileReader !== "function") {
        reject(new Error("File picker fallback requires FileReader support."));
        return;
      }

      reader = new global.FileReader();
      reader.onload = function() {
        resolve({
          name: file.name || "",
          text: String(reader.result == null ? "" : reader.result),
          file: file,
          handle: null,
          method: "input"
        });
      };
      reader.onerror = function() {
        reject(new Error("Unable to read selected file."));
      };
      reader.readAsText(file);
    });
  }

  function openTextFileFallback(options) {
    var input = ensureHiddenFilePickerInput(buildFileAcceptAttribute(options.types));

    return new Promise(function(resolve, reject) {
      function finalize(result, error) {
        input.removeEventListener("change", handleChange);
        input.removeEventListener("cancel", handleCancel);
        input.value = "";
        if (error) {
          reject(error);
          return;
        }
        resolve(result || null);
      }

      function handleCancel() {
        finalize(null);
      }

      function handleChange(event) {
        var files = event && event.target && event.target.files ? event.target.files : [];
        if (!files.length) {
          finalize(null);
          return;
        }
        readTextFileWithFallback(files[0]).then(function(result) {
          finalize(result);
        }, function(error) {
          finalize(null, error);
        });
      }

      input.addEventListener("change", handleChange);
      input.addEventListener("cancel", handleCancel);
      input.click();
    });
  }

  function saveTextByHandle(handle, text, method) {
    return handle.createWritable().then(function(writable) {
      return writable.write(text).then(function() {
        return writable.close();
      }).then(function() {
        return {
          name: basename(handle.name || ""),
          handle: handle,
          method: method
        };
      });
    });
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
    this.RowId = extras.RowId;
    this.Row = extras.Row;
    this.Column = extras.Column;
    this.Command = extras.Command;
    this.Index = extras.Index;
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

  function Collection(options) {
    var config = Array.isArray(options) ? { rows: options } : (options || {});

    this._idKey = config.idKey != null && config.idKey !== "" ? String(config.idKey) : "id";
    this._rows = [];
    this._listeners = {};
    this._selectedIds = [];
    this._dirtyIds = [];
    this._deletedIds = [];
    this._cleanRowsById = {};
    this._summaryDefinitions = {};
    this._summaries = {};

    this.SetSummaryDefinitions(config.summaryDefinitions || {});
    this.SetRows(config.rows || [], { resetDirty: true, silent: true });
    if (config.selectedIds) {
      this.SetSelectedIds(config.selectedIds, { silent: true });
    } else if (config.selectedId != null && config.selectedId !== "") {
      this.Select(config.selectedId, { silent: true });
    }
  }

  Collection.prototype._getRowId = function(row) {
    var value;

    if (!isPlainObject(row)) {
      return "";
    }
    value = row[this._idKey];
    return value == null || value === "" ? "" : String(value);
  };

  Collection.prototype._getRowsSnapshot = function() {
    return this._rows.map(function(row) {
      return cloneCollectionRow(row);
    });
  };

  Collection.prototype._reindexCleanRows = function(rows) {
    var collection = this;
    var map = {};

    ensureArray(rows).forEach(function(row) {
      var rowId = collection._getRowId(row);
      if (!rowId) {
        return;
      }
      map[rowId] = cloneCollectionRow(row);
    });

    this._cleanRowsById = map;
  };

  Collection.prototype._recomputeDirtyState = function() {
    var collection = this;
    var dirty = [];

    this._rows.forEach(function(row) {
      var rowId = collection._getRowId(row);
      var cleanRow;
      if (!rowId) {
        return;
      }
      cleanRow = collection._cleanRowsById[rowId];
      if (!cleanRow || !shallowEqualObjects(cleanRow, row)) {
        dirty.push(rowId);
      }
    });

    this._dirtyIds = dirty;
    this._deletedIds = uniqueValues(this._deletedIds.filter(function(rowId) {
      return !!collection._cleanRowsById[rowId] && !collection.GetRow(rowId);
    }));
  };

  Collection.prototype._recomputeSummaries = function() {
    var collection = this;
    var summaries = {};
    var key;

    for (key in this._summaryDefinitions) {
      if (!Object.prototype.hasOwnProperty.call(this._summaryDefinitions, key)) {
        continue;
      }
      summaries[key] = this._summaryDefinitions[key](this._getRowsSnapshot(), collection);
    }

    this._summaries = summaries;
  };

  Collection.prototype._normalizeSelection = function(selectedIds) {
    var collection = this;
    return uniqueValues(selectedIds).filter(function(rowId) {
      return !!collection.GetRow(rowId);
    });
  };

  Collection.prototype._emit = function(key, value) {
    var listeners = ensureArray(this._listeners[key]).slice();
    listeners.forEach(function(listener) {
      listener(value);
    });
  };

  Collection.prototype._notify = function(change) {
    change = change || {};
    this._recomputeDirtyState();
    this._recomputeSummaries();
    this._emit("rows", this.GetRows());
    this._emit("selection", this.GetSelectedIds());
    this._emit("dirty", this.GetDirtyState());
    this._emit("summary", this.GetSummaries());
    this._emit("change", {
      type: change.type || "change",
      rowId: change.rowId || "",
      rows: this.GetRows(),
      selectedIds: this.GetSelectedIds(),
      dirty: this.GetDirtyState(),
      summaries: this.GetSummaries()
    });
  };

  Collection.prototype.GetIdKey = function() {
    return this._idKey;
  };

  Collection.prototype.GetRowId = function(row) {
    return this._getRowId(row);
  };

  Collection.prototype.GetRows = function() {
    return this._getRowsSnapshot();
  };

  Collection.prototype.GetRow = function(id) {
    var rowId = id == null ? "" : String(id);
    var found = this._rows.filter(function(row) {
      return String(row[this._idKey]) === rowId;
    }, this)[0];

    return found ? cloneCollectionRow(found) : null;
  };

  Collection.prototype.SetRows = function(rows, options) {
    var collection = this;
    var normalizedRows = normalizeCollectionRows(rows);
    var ids = {};

    options = options || {};
    normalizedRows.forEach(function(row) {
      var rowId = collection._getRowId(row);
      invariant(!!rowId, "Collection rows must include a non-empty " + collection._idKey + " value.");
      invariant(!ids[rowId], "Duplicate collection row id: " + rowId);
      ids[rowId] = true;
    });

    this._rows = normalizedRows;
    this._selectedIds = this._normalizeSelection(this._selectedIds);
    if (options.resetDirty) {
      this._reindexCleanRows(this._rows);
      this._deletedIds = [];
    } else {
      this._deletedIds = uniqueValues(this._deletedIds.filter(function(rowId) {
        return !!collection._cleanRowsById[rowId] && !collection.GetRow(rowId);
      }));
    }
    this._recomputeDirtyState();
    this._recomputeSummaries();
    if (!options.silent) {
      this._notify({ type: "setRows" });
    }
  };

  Collection.prototype.Insert = function(row, index) {
    var nextRows = this.GetRows();
    var insertionIndex = isNumber(index) ? Math.max(0, Math.min(index, nextRows.length)) : nextRows.length;
    nextRows.splice(insertionIndex, 0, cloneCollectionRow(row));
    this.SetRows(nextRows);
  };

  Collection.prototype.Update = function(id, updater) {
    var rowId = id == null ? "" : String(id);
    var nextRows = this.GetRows();
    var index = -1;
    var currentRow;
    var nextRow;

    nextRows.some(function(row, rowIndex) {
      if (String(row[this._idKey]) === rowId) {
        index = rowIndex;
        return true;
      }
      return false;
    }, this);

    invariant(index >= 0, "Collection row not found: " + rowId);
    currentRow = nextRows[index];
    if (typeof updater === "function") {
      nextRow = updater(cloneCollectionRow(currentRow));
    } else if (isPlainObject(updater)) {
      nextRow = Object.assign({}, currentRow, updater);
    } else {
      nextRow = currentRow;
    }
    nextRows[index] = cloneCollectionRow(nextRow);
    this.SetRows(nextRows);
  };

  Collection.prototype.Upsert = function(row) {
    var rowId = this._getRowId(row);

    invariant(!!rowId, "Collection rows must include a non-empty " + this._idKey + " value.");
    if (this.GetRow(rowId)) {
      this.Update(rowId, row);
      return;
    }
    this.Insert(row);
  };

  Collection.prototype.Remove = function(id) {
    var rowId = id == null ? "" : String(id);
    var nextRows = this.GetRows().filter(function(row) {
      return String(row[this._idKey]) !== rowId;
    }, this);

    if (nextRows.length === this._rows.length) {
      return;
    }
    if (this._cleanRowsById[rowId]) {
      this._deletedIds = uniqueValues(this._deletedIds.concat([rowId]));
    }
    this.SetRows(nextRows);
  };

  Collection.prototype.Select = function(id, options) {
    options = options || {};
    this._selectedIds = this._normalizeSelection([id]);
    if (!options.silent) {
      this._notify({ type: "select", rowId: this._selectedIds[0] || "" });
    }
  };

  Collection.prototype.SetSelectedIds = function(ids, options) {
    options = options || {};
    this._selectedIds = this._normalizeSelection(ids);
    if (!options.silent) {
      this._notify({ type: "select", rowId: this._selectedIds[0] || "" });
    }
  };

  Collection.prototype.ToggleSelected = function(id) {
    var rowId = id == null ? "" : String(id);

    if (!rowId) {
      this.ClearSelection();
      return;
    }
    if (this.IsSelected(rowId)) {
      this.ClearSelection();
      return;
    }
    this.Select(rowId);
  };

  Collection.prototype.ClearSelection = function(options) {
    options = options || {};
    this._selectedIds = [];
    if (!options.silent) {
      this._notify({ type: "clearSelection" });
    }
  };

  Collection.prototype.IsSelected = function(id) {
    var rowId = id == null ? "" : String(id);
    return this._selectedIds.indexOf(rowId) >= 0;
  };

  Collection.prototype.GetSelectedIds = function() {
    return this._selectedIds.slice();
  };

  Collection.prototype.GetSelectedId = function() {
    return this._selectedIds[0] || "";
  };

  Collection.prototype.GetSelectedRows = function() {
    var collection = this;
    return this._selectedIds.map(function(rowId) {
      return collection.GetRow(rowId);
    }).filter(function(row) {
      return !!row;
    });
  };

  Collection.prototype.GetDirtyRowIds = function() {
    return this._dirtyIds.slice();
  };

  Collection.prototype.GetDeletedRowIds = function() {
    return this._deletedIds.slice();
  };

  Collection.prototype.IsDirty = function(id) {
    var rowId = id == null ? "" : String(id);
    return this._dirtyIds.indexOf(rowId) >= 0 || this._deletedIds.indexOf(rowId) >= 0;
  };

  Collection.prototype.HasDirtyRows = function() {
    return this._dirtyIds.length > 0 || this._deletedIds.length > 0;
  };

  Collection.prototype.GetDirtyState = function() {
    return {
      rowIds: this.GetDirtyRowIds(),
      deletedRowIds: this.GetDeletedRowIds(),
      hasDirtyRows: this.HasDirtyRows()
    };
  };

  Collection.prototype.MarkClean = function(ids) {
    var collection = this;
    var selectedIds = uniqueValues(ids);

    if (!selectedIds.length) {
      this._reindexCleanRows(this._rows);
      this._deletedIds = [];
      this._notify({ type: "markClean" });
      return;
    }

    selectedIds.forEach(function(rowId) {
      var row = collection.GetRow(rowId);
      if (row) {
        collection._cleanRowsById[rowId] = cloneCollectionRow(row);
      } else {
        delete collection._cleanRowsById[rowId];
      }
    });
    this._deletedIds = this._deletedIds.filter(function(rowId) {
      return selectedIds.indexOf(rowId) < 0;
    });
    this._notify({ type: "markClean" });
  };

  Collection.prototype.SetSummaryDefinitions = function(definitions) {
    this._summaryDefinitions = Object.assign({}, definitions || {});
    this._recomputeSummaries();
  };

  Collection.prototype.GetSummary = function(key) {
    return this._summaries[key];
  };

  Collection.prototype.GetSummaries = function() {
    return Object.assign({}, this._summaries);
  };

  Collection.prototype.Subscribe = function(key, listener) {
    if (!this._listeners[key]) {
      this._listeners[key] = [];
    }
    this._listeners[key].push(listener);
    var collection = this;
    return function() {
      var listeners = collection._listeners[key];
      if (!listeners) {
        return;
      }
      var index = listeners.indexOf(listener);
      if (index >= 0) {
        listeners.splice(index, 1);
      }
    };
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

  Runtime.prototype.getViewportHeight = function() {
    if (this.document && this.document.body && isNumber(this.document.body.clientHeight) && this.document.body.clientHeight > 0) {
      return this.document.body.clientHeight;
    }
    if (isNumber(global.innerHeight) && global.innerHeight > 0) {
      return global.innerHeight;
    }
    return 720;
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
    if (this.application && this.application.MainPage) {
      this.markDirty(this.application.MainPage);
    }
    this._responsiveControls.forEach(function(control) {
      runtime.markDirty(control);
    });
  };

  Runtime.prototype.scheduleViewportLayoutPass = function() {
    var runtime = this;

    if (typeof global.requestAnimationFrame !== "function") {
      return;
    }

    global.requestAnimationFrame(function() {
      runtime._handleViewportResize();
      runtime.flush();
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
    this.Runtime.scheduleViewportLayoutPass();
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
      "html, body { margin: 0; padding: 0; min-height: 100%; height: 100%; }",
      ".jog-root { position: relative; display: flex; flex-direction: column; min-height: 100vh; height: 100vh; width: 100%; box-sizing: border-box; font-family: var(--jog-font-family); font-size: var(--jog-font-size); background: var(--jog-app-background); color: var(--jog-text-strong); padding: var(--jog-page-padding); }",
      ".jog-page { position: relative; display: flex; flex-direction: column; flex: 1 1 auto; min-height: 100%; min-width: 0; width: 100%; box-sizing: border-box; }",
      ".jog-control { box-sizing: border-box; }",
      ".jog-panel { position: relative; }",
      ".jog-dock-panel { position: relative; min-height: 100%; min-width: 100%; background: var(--jog-surface); border: 1px solid var(--jog-border-soft); border-radius: var(--jog-radius-shell); box-shadow: var(--jog-shadow-shell); overflow: hidden; }",
      ".jog-split-panel { position: relative; display: flex; min-width: 0; min-height: 0; }",
      ".jog-split-panel.horizontal { flex-direction: row; }",
      ".jog-split-panel.vertical { flex-direction: column; }",
      ".jog-stack-panel { position: relative; display: flex; }",
      ".jog-menu-bar { position: relative; display: flex; align-items: center; gap: 4px; padding: 6px; background: var(--jog-surface-muted); border: 1px solid var(--jog-border-soft); border-radius: var(--jog-radius-control); }",
      ".jog-menu-bar-button { border: 0; background: transparent; color: var(--jog-text); border-radius: calc(var(--jog-radius-control) - 2px); padding: 8px 10px; cursor: pointer; font-size: var(--jog-font-size); line-height: var(--jog-line-height); }",
      ".jog-menu-bar-button:hover { background: rgba(15, 23, 42, 0.06); }",
      ".jog-menu-bar-button:disabled { opacity: 0.5; cursor: default; }",
      ".jog-tool-bar { position: relative; display: flex; align-items: center; flex-wrap: wrap; gap: 8px; padding: 8px; background: var(--jog-surface); border: 1px solid var(--jog-border-soft); border-radius: var(--jog-radius-control); box-shadow: var(--jog-shadow-section); }",
      ".jog-status-bar { position: relative; display: flex; align-items: center; gap: 12px; padding: 8px 10px; background: var(--jog-surface-muted); border: 1px solid var(--jog-border-soft); border-radius: var(--jog-radius-control); color: var(--jog-text-muted); }",
      ".jog-tab-control { position: relative; display: flex; flex-direction: column; min-width: 0; min-height: 0; background: var(--jog-surface); border: 1px solid var(--jog-border-soft); border-radius: var(--jog-radius-section); box-shadow: var(--jog-shadow-section); overflow: hidden; }",
      ".jog-tab-header { display: flex; flex-wrap: wrap; gap: 6px; padding: 10px 10px 0; background: var(--jog-surface-muted); border-bottom: 1px solid var(--jog-border-soft); }",
      ".jog-tab-button { border: 1px solid transparent; background: transparent; color: var(--jog-text-muted); border-top-left-radius: var(--jog-radius-control); border-top-right-radius: var(--jog-radius-control); padding: 8px 12px; cursor: pointer; font-size: var(--jog-font-size); line-height: var(--jog-line-height); }",
      ".jog-tab-button.active { background: var(--jog-surface); color: var(--jog-text); border-color: var(--jog-border-soft); border-bottom-color: var(--jog-surface); }",
      ".jog-tab-button:disabled { opacity: 0.5; cursor: default; }",
      ".jog-tab-body { position: relative; display: flex; flex: 1 1 auto; min-width: 0; min-height: 0; padding: 16px; }",
      ".jog-tab-page { position: relative; display: flex; flex: 1 1 auto; min-width: 0; min-height: 0; flex-direction: column; }",
      ".jog-stack-panel.vertical { flex-direction: column; }",
      ".jog-stack-panel.horizontal { flex-direction: row; align-items: center; }",
      ".jog-fill-width { width: 100%; }",
      ".jog-section { position: relative; background: var(--jog-surface); border: 1px solid var(--jog-border-soft); border-radius: var(--jog-radius-section); box-shadow: var(--jog-shadow-section); overflow: hidden; }",
      ".jog-section-header { padding: var(--jog-section-header-y) var(--jog-section-header-x); font-size: var(--jog-title-size); font-weight: 600; color: var(--jog-text); background: var(--jog-surface-muted); border-bottom: 1px solid var(--jog-border-soft); }",
      ".jog-section-body { position: relative; padding: var(--jog-section-body); }",
      ".jog-grid-panel { position: relative; display: grid; align-items: start; }",
      ".jog-data-grid { position: relative; border: 1px solid var(--jog-border-soft); border-radius: var(--jog-radius-section); background: var(--jog-surface); overflow-x: auto; overflow-y: hidden; }",
      ".jog-data-grid-header, .jog-data-grid-row { display: grid; align-items: stretch; min-width: max-content; }",
      ".jog-data-grid-header { background: var(--jog-surface-muted); border-bottom: 1px solid var(--jog-border-soft); }",
      ".jog-data-grid-header-cell { position: relative; padding: 10px 12px; font-size: var(--jog-caption-size); font-weight: 600; color: var(--jog-text); border-right: 1px solid var(--jog-border-soft); }",
      ".jog-data-grid-header-cell:last-child { border-right: 0; }",
      ".jog-data-grid-resize-handle { position: absolute; top: 0; right: -4px; width: 8px; height: 100%; cursor: col-resize; z-index: 1; }",
      ".jog-data-grid-body { position: relative; }",
      ".jog-data-grid-row { border-bottom: 1px solid var(--jog-border-soft); }",
      ".jog-data-grid-row:last-child { border-bottom: 0; }",
      ".jog-data-grid-row.jog-selected { background: rgba(15, 23, 42, 0.06); }",
      ".jog-data-grid-row.jog-dirty { box-shadow: inset 3px 0 0 var(--jog-primary); }",
      ".jog-data-grid-cell { padding: 12px; color: var(--jog-text-muted); border-right: 1px solid var(--jog-border-soft); min-width: 0; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }",
      ".jog-data-grid-cell:last-child { border-right: 0; }",
      ".jog-data-grid-cell.align-right { text-align: right; }",
      ".jog-data-grid-cell.align-center { text-align: center; }",
      ".jog-data-grid-command-cell { display: flex; align-items: center; gap: 8px; white-space: nowrap; }",
      ".jog-data-grid-command { padding-left: 10px; padding-right: 10px; }",
      ".jog-data-grid-empty { padding: 18px 12px; color: var(--jog-text-muted); }",
      ".jog-window { position: absolute; display: flex; flex-direction: column; box-sizing: border-box; border: 1px solid var(--jog-border); border-radius: var(--jog-radius-window); background: var(--jog-surface); box-shadow: var(--jog-shadow-window); overflow: hidden; }",
      ".jog-window-titlebar { background: var(--jog-surface-muted); color: var(--jog-text); padding: 12px 16px; font-weight: 600; cursor: move; user-select: none; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--jog-border-soft); }",
      ".jog-window-content { position: relative; flex: 1 1 auto; min-height: 0; overflow-x: hidden; overflow-y: auto; box-sizing: border-box; padding: var(--jog-window-content); background: var(--jog-surface); }",
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
      fill: false,
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
    if (nextState.fill) {
      this._domNode.style.flex = "1 1 auto";
      this._domNode.style.minWidth = this._domNode.style.minWidth || "0";
      this._domNode.style.minHeight = this._domNode.style.minHeight || "0";
      if (!isDockManagedChild && !isNumber(resolvedState.width)) {
        this._domNode.style.width = "100%";
      }
      if (!isDockManagedChild && !isNumber(resolvedState.height)) {
        this._domNode.style.height = "100%";
      }
    } else if (this._domNode.style.flex) {
      this._domNode.style.flex = "";
    }
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

  Object.defineProperty(Component.prototype, "Fill", {
    get: function() { return !!this._state.fill; },
    set: function(value) { this._setState("fill", !!value); }
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
    if (this._parent) {
      this._parent._markDirty("child-layout");
    }
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
    if (this._parent) {
      this._parent._markDirty("child-layout");
    }
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
    this._layoutSettlePending = false;
    this._layoutSettleAttempts = 0;
  }

  DockPanel.prototype = Object.create(Container.prototype);
  DockPanel.prototype.constructor = DockPanel;

  DockPanel.prototype._createDomNode = function(doc) {
    var node = doc.createElement("div");
    node.className = "jog-control jog-dock-panel";
    return node;
  };

  DockPanel.prototype._applyStateToDom = function(prevState, nextState) {
    var actualHeight;
    var actualWidth;
    var pagePadding;
    var parentHeight;
    var parentNode;
    var parentWidth;
    var panelWidth;
    var panelHeight;
    var resolvedState;
    var reliableHeight;
    var reliableWidth;
    var targetHeight;
    var targetWidth;
    var theme;
    var viewportHeight;
    var viewportWidth;

    Container.prototype._applyStateToDom.call(this, prevState, nextState);
    if (!this._domNode) {
      return;
    }
    resolvedState = this._resolvedResponsiveState || nextState;

    var padding = normalizeBox(resolvedState.padding);
    var top = padding.top;
    var left = padding.left;
    actualWidth = this._domNode.clientWidth || this._domNode.offsetWidth || this.Width || 0;
    actualHeight = this._domNode.clientHeight || this._domNode.offsetHeight || this.Height || 0;
    panelWidth = actualWidth;
    panelHeight = actualHeight;

    if (nextState.fill && this._runtime && this._parent && this._parent._typeName === "Page") {
      parentNode = this._parent._domNode;
      parentWidth = parentNode ? (parentNode.clientWidth || parentNode.offsetWidth || 0) : 0;
      parentHeight = parentNode ? (parentNode.clientHeight || parentNode.offsetHeight || 0) : 0;
      theme = this._application && typeof this._application._resolveTheme === "function" ? this._application._resolveTheme() : null;
      pagePadding = theme && theme.spacing ? parseFloat(theme.spacing.pagePadding) || 0 : 0;
      if (parentWidth > 0) {
        parentWidth = Math.max(parentWidth - (pagePadding * 2), 0);
      }
      if (parentHeight > 0) {
        parentHeight = Math.max(parentHeight - (pagePadding * 2), 0);
      }
      viewportWidth = this._runtime.getViewportWidth();
      viewportHeight = this._runtime.getViewportHeight();
      targetWidth = parentWidth || viewportWidth;
      targetHeight = parentHeight || viewportHeight;
      reliableWidth = actualWidth >= targetWidth * 0.75;
      reliableHeight = actualHeight >= targetHeight * 0.75;
      panelWidth = reliableWidth ? actualWidth : targetWidth;
      panelHeight = reliableHeight ? actualHeight : targetHeight;
    } else if (nextState.fill && this._runtime) {
      panelWidth = panelWidth || this._runtime.getViewportWidth();
      panelHeight = panelHeight || this._runtime.getViewportHeight();
    }

    var right = panelWidth - padding.right;
    var bottom = panelHeight - padding.bottom;

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

    if (nextState.fill && this._runtime && this._parent && this._parent._typeName === "Page") {
      if (reliableWidth && reliableHeight) {
        this._layoutSettleAttempts = 0;
        this._layoutSettlePending = false;
        return;
      }
      if (this._layoutSettlePending || this._layoutSettleAttempts >= 4 || typeof global.requestAnimationFrame !== "function") {
        return;
      }
      this._layoutSettlePending = true;
      this._layoutSettleAttempts += 1;
      var control = this;
      global.requestAnimationFrame(function() {
        control._layoutSettlePending = false;
        control.Refresh();
        if (control._runtime) {
          control._runtime.flush();
        }
      });
    }
  };

  DockPanel.prototype._childUsesFlowLayout = function() {
    return false;
  };

  function SplitPanel() {
    Container.call(this, "SplitPanel");
    this._state.orientation = "horizontal";
    this._state.gap = 12;
    this._state.firstPaneSize = null;
    this._state.secondPaneSize = null;
    this._state.responsive = null;
  }

  SplitPanel.prototype = Object.create(Container.prototype);
  SplitPanel.prototype.constructor = SplitPanel;

  SplitPanel.prototype._createDomNode = function(doc) {
    var node = doc.createElement("div");
    node.className = "jog-control jog-split-panel horizontal";
    return node;
  };

  SplitPanel.prototype._applyStateToDom = function(prevState, nextState) {
    var control = this;
    var resolvedSplit;
    var firstChild;
    var secondChild;
    var firstSize;
    var secondSize;

    Container.prototype._applyStateToDom.call(this, prevState, nextState);
    if (!this._domNode) {
      return;
    }
    if (this._runtime) {
      this._runtime.trackResponsiveControl(this, !!nextState.responsive);
    }

    resolvedSplit = resolveResponsiveValues({
      orientation: nextState.orientation,
      gap: nextState.gap,
      firstPaneSize: nextState.firstPaneSize,
      secondPaneSize: nextState.secondPaneSize
    }, nextState.responsive, this._runtime ? this._runtime.getViewportWidth() : 1280);

    this._domNode.classList.remove("horizontal", "vertical");
    this._domNode.classList.add(resolvedSplit.orientation === "vertical" ? "vertical" : "horizontal");
    this._domNode.style.gap = toCssBox(resolvedSplit.gap != null ? resolvedSplit.gap : 12) || "12px";

    this._children.forEach(function(child) {
      if (!child._domNode) {
        return;
      }
      child._domNode.style.flex = "1 1 0";
      child._domNode.style.minWidth = "0";
      child._domNode.style.minHeight = "0";
      child._domNode.style.width = resolvedSplit.orientation === "horizontal" ? "" : "100%";
      child._domNode.style.height = resolvedSplit.orientation === "vertical" ? "" : "100%";
    });

    firstChild = this._children[0];
    secondChild = this._children[1];
    firstSize = resolvedSplit.firstPaneSize;
    secondSize = resolvedSplit.secondPaneSize;

    if (firstChild && firstChild._domNode && isNumber(firstSize)) {
      firstChild._domNode.style.flex = "0 0 " + toCssPixels(firstSize);
      if (resolvedSplit.orientation === "horizontal") {
        firstChild._domNode.style.width = toCssPixels(firstSize);
        firstChild._domNode.style.height = "100%";
      } else {
        firstChild._domNode.style.height = toCssPixels(firstSize);
        firstChild._domNode.style.width = "100%";
      }
    }

    if (secondChild && secondChild._domNode && isNumber(secondSize)) {
      secondChild._domNode.style.flex = "0 0 " + toCssPixels(secondSize);
      if (resolvedSplit.orientation === "horizontal") {
        secondChild._domNode.style.width = toCssPixels(secondSize);
        secondChild._domNode.style.height = "100%";
      } else {
        secondChild._domNode.style.height = toCssPixels(secondSize);
        secondChild._domNode.style.width = "100%";
      }
    }

    if (this._children.length > 2) {
      this._children.slice(2).forEach(function(child) {
        if (!child._domNode) {
          return;
        }
        child._domNode.style.flex = "1 1 0";
      });
    }
  };

  SplitPanel.prototype._childUsesFlowLayout = function() {
    return true;
  };

  Object.defineProperty(SplitPanel.prototype, "Orientation", {
    get: function() { return this._state.orientation; },
    set: function(value) { this._setState("orientation", value === "vertical" ? "vertical" : "horizontal"); }
  });

  Object.defineProperty(SplitPanel.prototype, "FirstPaneSize", {
    get: function() { return this._state.firstPaneSize; },
    set: function(value) { this._setState("firstPaneSize", isNumber(value) && value >= 0 ? value : null); }
  });

  Object.defineProperty(SplitPanel.prototype, "SecondPaneSize", {
    get: function() { return this._state.secondPaneSize; },
    set: function(value) { this._setState("secondPaneSize", isNumber(value) && value >= 0 ? value : null); }
  });

  Object.defineProperty(SplitPanel.prototype, "Responsive", {
    get: function() { return this._state.responsive; },
    set: function(value) { this._setState("responsive", cloneResponsiveConfig(value, normalizeResponsiveSplitBreakpoint)); }
  });

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

  function MenuBar() {
    Control.call(this, "MenuBar");
    this._state.items = [];
    this._itemNodes = [];
  }

  MenuBar.prototype = Object.create(Control.prototype);
  MenuBar.prototype.constructor = MenuBar;

  MenuBar.prototype._createDomNode = function(doc) {
    var node = doc.createElement("div");
    node.className = "jog-control jog-menu-bar";
    return node;
  };

  MenuBar.prototype._applyStateToDom = function(prevState, nextState) {
    var control = this;

    Control.prototype._applyStateToDom.call(this, prevState, nextState);
    if (!this._domNode || !this._runtime || !this._runtime.document) {
      return;
    }

    while (this._domNode.children.length) {
      this._domNode.removeChild(this._domNode.children[0]);
    }
    this._itemNodes = [];

    ensureArray(nextState.items).forEach(function(item) {
      var button = control._runtime.document.createElement("button");
      button.className = "jog-menu-bar-button";
      button.type = "button";
      button.textContent = item.text;
      button.disabled = item.enabled === false;
      button.addEventListener("click", function(event) {
        if (item.enabled === false) {
          return;
        }
        control._raiseEvent("ItemClick", event, {
          Key: item.key,
          Value: item
        });
      });
      control._domNode.appendChild(button);
      control._itemNodes.push(button);
    });
  };

  MenuBar.prototype.OnItemClick = function(listener) {
    this._registerEvent("ItemClick", listener);
  };

  Object.defineProperty(MenuBar.prototype, "Items", {
    get: function() { return cloneMenuItems(this._state.items); },
    set: function(value) { this._setState("items", cloneMenuItems(value)); }
  });

  function ToolBar() {
    Container.call(this, "ToolBar");
  }

  ToolBar.prototype = Object.create(Container.prototype);
  ToolBar.prototype.constructor = ToolBar;

  ToolBar.prototype._createDomNode = function(doc) {
    var node = doc.createElement("div");
    node.className = "jog-control jog-tool-bar";
    return node;
  };

  ToolBar.prototype._childUsesFlowLayout = function() {
    return true;
  };

  function StatusBar() {
    Container.call(this, "StatusBar");
  }

  StatusBar.prototype = Object.create(Container.prototype);
  StatusBar.prototype.constructor = StatusBar;

  StatusBar.prototype._createDomNode = function(doc) {
    var node = doc.createElement("div");
    node.className = "jog-control jog-status-bar";
    return node;
  };

  StatusBar.prototype._childUsesFlowLayout = function() {
    return true;
  };

  function TabPage() {
    Container.call(this, "TabPage");
    this._state.title = "";
    this._state.tabKey = "";
  }

  TabPage.prototype = Object.create(Container.prototype);
  TabPage.prototype.constructor = TabPage;

  TabPage.prototype._createDomNode = function(doc) {
    var node = doc.createElement("div");
    node.className = "jog-control jog-tab-page";
    return node;
  };

  TabPage.prototype._applyStateToDom = function(prevState, nextState) {
    Container.prototype._applyStateToDom.call(this, prevState, nextState);
    if (!this._domNode) {
      return;
    }
    this._domNode.style.display = nextState.visible ? "flex" : "none";
    this._domNode.style.flexDirection = "column";
    this._domNode.style.flex = "1 1 auto";
    this._domNode.style.minWidth = "0";
    this._domNode.style.minHeight = "0";
  };

  TabPage.prototype._childUsesFlowLayout = function() {
    return true;
  };

  Object.defineProperty(TabPage.prototype, "Title", {
    get: function() { return this._state.title; },
    set: function(value) { this._setState("title", value == null ? "" : String(value)); }
  });

  Object.defineProperty(TabPage.prototype, "TabKey", {
    get: function() { return this._state.tabKey; },
    set: function(value) { this._setState("tabKey", value == null ? "" : String(value)); }
  });

  function TabControl() {
    Container.call(this, "TabControl");
    this._state.activeTab = "";
    this._headerNode = null;
    this._bodyNode = null;
    this._tabButtonNodes = [];
    this._lastRenderedActiveTab = null;
  }

  TabControl.prototype = Object.create(Container.prototype);
  TabControl.prototype.constructor = TabControl;

  TabControl.prototype._createDomNode = function(doc) {
    var node = doc.createElement("div");
    var header = doc.createElement("div");
    var body = doc.createElement("div");

    node.className = "jog-control jog-tab-control";
    header.className = "jog-tab-header";
    body.className = "jog-tab-body";

    node.appendChild(header);
    node.appendChild(body);

    this._headerNode = header;
    this._bodyNode = body;
    return node;
  };

  TabControl.prototype._getChildHostNode = function() {
    return this._bodyNode || this._domNode;
  };

  TabControl.prototype._childUsesFlowLayout = function() {
    return true;
  };

  TabControl.prototype.Add = function(child) {
    invariant(!!child && child._typeName === "TabPage", "TabControl only accepts TabPage children.");
    Container.prototype.Add.call(this, child);
  };

  TabControl.prototype._getPageKey = function(page, index) {
    var state = page && page._state ? page._state : {};
    if (state.tabKey) {
      return state.tabKey;
    }
    if (state.name) {
      return state.name;
    }
    return "tab-" + index;
  };

  TabControl.prototype._getPageTitle = function(page, index) {
    var state = page && page._state ? page._state : {};
    if (state.title) {
      return state.title;
    }
    if (state.name) {
      return state.name;
    }
    return "Tab " + (index + 1);
  };

  TabControl.prototype._resolveActiveKey = function() {
    var activeKey = this._state.activeTab;
    var pages = this._children.slice();
    var found = false;
    var control = this;

    pages.forEach(function(page, index) {
      if (control._getPageKey(page, index) === activeKey) {
        found = true;
      }
    });

    if (found) {
      return activeKey;
    }
    if (!pages.length) {
      return "";
    }
    return this._getPageKey(pages[0], 0);
  };

  TabControl.prototype._applyStateToDom = function(prevState, nextState) {
    var control = this;
    var activeKey;

    Container.prototype._applyStateToDom.call(this, prevState, nextState);
    if (!this._domNode || !this._headerNode || !this._runtime || !this._runtime.document) {
      return;
    }

    activeKey = this._resolveActiveKey();

    while (this._headerNode.children.length) {
      this._headerNode.removeChild(this._headerNode.children[0]);
    }
    this._tabButtonNodes = [];

    this._children.forEach(function(page, index) {
      var pageKey = control._getPageKey(page, index);
      var button = control._runtime.document.createElement("button");
      var isActive = pageKey === activeKey;

      button.className = "jog-tab-button" + (isActive ? " active" : "");
      button.type = "button";
      button.textContent = control._getPageTitle(page, index);
      button.addEventListener("click", function(event) {
        control.ActiveTab = pageKey;
        control._raiseEvent("TabChange", event, {
          Key: pageKey,
          Value: page
        });
      });

      control._headerNode.appendChild(button);
      control._tabButtonNodes.push(button);

      page.Visible = isActive;
    });

    this._headerNode.style.display = this._children.length ? "" : "none";
    this._bodyNode.style.display = "flex";
    this._bodyNode.style.flex = "1 1 auto";
    this._bodyNode.style.minWidth = "0";
    this._bodyNode.style.minHeight = "0";
    this._lastRenderedActiveTab = activeKey;
  };

  TabControl.prototype.OnTabChange = function(listener) {
    this._registerEvent("TabChange", listener);
  };

  Object.defineProperty(TabControl.prototype, "ActiveTab", {
    get: function() { return this._state.activeTab; },
    set: function(value) { this._setState("activeTab", value == null ? "" : String(value)); }
  });

  function SectionPanel() {
    Container.call(this, "SectionPanel");
    this._state.title = "";
    this._state.responsive = null;
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
    var resolvedSection;
    var viewportWidth;

    Container.prototype._applyStateToDom.call(this, prevState, nextState);
    if (!this._domNode) {
      return;
    }
    if (this._runtime) {
      this._runtime.trackResponsiveControl(this, !!(nextState.responsive || nextState.responsiveLayout));
      viewportWidth = this._runtime.getViewportWidth();
    }
    resolvedSection = resolveResponsiveValues({
      title: nextState.title,
      padding: nextState.padding
    }, nextState.responsive, viewportWidth || 1280);
    this._headerNode.textContent = resolvedSection.title || "";
    this._headerNode.style.display = resolvedSection.title ? "" : "none";
    this._bodyNode.style.padding = toCssBox(resolvedSection.padding != null ? resolvedSection.padding : 16);
  };

  SectionPanel.prototype._childUsesFlowLayout = function() {
    return true;
  };

  Object.defineProperty(SectionPanel.prototype, "Title", {
    get: function() { return this._state.title; },
    set: function(value) { this._setState("title", value == null ? "" : String(value)); }
  });

  Object.defineProperty(SectionPanel.prototype, "Responsive", {
    get: function() { return this._state.responsive; },
    set: function(value) { this._setState("responsive", cloneResponsiveConfig(value, normalizeResponsiveSectionBreakpoint)); }
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

  function DataGrid() {
    Control.call(this, "DataGrid");
    this._state.columns = [];
    this._state.columnWidthOverrides = {};
    this._state.rowCommands = [];
    this._state.emptyText = "No rows.";
    this._state.selectionMode = "single";
    this._state.resizableColumns = false;
    this._state.collection = null;
    this._headerNode = null;
    this._bodyNode = null;
    this._emptyNode = null;
    this._collectionUnsubscribe = null;
    this._rowNodes = [];
    this._commandNodes = {};
    this._resizeHandleNodes = {};
    this._activeResize = null;
  }

  DataGrid.prototype = Object.create(Control.prototype);
  DataGrid.prototype.constructor = DataGrid;

  DataGrid.prototype._createDomNode = function(doc) {
    var node = doc.createElement("div");
    var header = doc.createElement("div");
    var body = doc.createElement("div");
    var empty = doc.createElement("div");

    node.className = "jog-control jog-data-grid";
    header.className = "jog-data-grid-header";
    body.className = "jog-data-grid-body";
    empty.className = "jog-data-grid-empty";

    node.appendChild(header);
    node.appendChild(body);
    node.appendChild(empty);

    this._headerNode = header;
    this._bodyNode = body;
    this._emptyNode = empty;
    return node;
  };

  DataGrid.prototype._clearNodeChildren = function(node) {
    while (node && node.children && node.children.length) {
      node.removeChild(node.children[0]);
    }
  };

  DataGrid.prototype._getResolvedColumns = function() {
    var overrides = this._state.columnWidthOverrides || {};

    return cloneDataGridColumns(this._state.columns).map(function(column) {
      if (overrides[column.key] != null) {
        column.width = String(overrides[column.key]);
      }
      return column;
    });
  };

  DataGrid.prototype._getVisibleCommands = function(row, rowIndex) {
    return cloneDataGridCommands(this._state.rowCommands).filter(function(command) {
      if (command.visible === false) {
        return false;
      }
      if (typeof command.visible === "function") {
        return !!command.visible(row, rowIndex);
      }
      return true;
    });
  };

  DataGrid.prototype._getGridTemplateColumns = function(columns, includeCommands) {
    var tracks = columns.map(function(column) {
      return column.width || "1fr";
    });

    if (includeCommands) {
      tracks.push("max-content");
    }
    return tracks.join(" ");
  };

  DataGrid.prototype._canResizeColumn = function(column) {
    if (!this._state.resizableColumns || !column || column.resizable === false) {
      return false;
    }
    return parsePixelWidth(column.width) != null;
  };

  DataGrid.prototype._setColumnWidth = function(columnKey, widthPx) {
    var overrides = Object.assign({}, this._state.columnWidthOverrides || {});
    overrides[columnKey] = Math.max(80, Math.round(widthPx)) + "px";
    this._setState("columnWidthOverrides", overrides);
  };

  DataGrid.prototype._beginColumnResize = function(column, event) {
    var control = this;
    var doc;
    var startWidth;

    if (!this._runtime || !column || !this._canResizeColumn(column)) {
      return;
    }

    doc = this._runtime.document;
    startWidth = parsePixelWidth(column.width);
    if (startWidth == null) {
      return;
    }

    this._activeResize = {
      columnKey: column.key,
      startX: event.clientX || 0,
      startWidth: startWidth,
      onMove: null,
      onUp: null
    };

    this._activeResize.onMove = function(moveEvent) {
      var delta = (moveEvent.clientX || 0) - control._activeResize.startX;
      control._setColumnWidth(control._activeResize.columnKey, control._activeResize.startWidth + delta);
    };

    this._activeResize.onUp = function() {
      if (!control._activeResize) {
        return;
      }
      doc.removeEventListener("mousemove", control._activeResize.onMove);
      doc.removeEventListener("mouseup", control._activeResize.onUp);
      control._activeResize = null;
    };

    doc.addEventListener("mousemove", this._activeResize.onMove);
    doc.addEventListener("mouseup", this._activeResize.onUp);
  };

  DataGrid.prototype._resolveCellText = function(column, row, rowIndex, rowId) {
    var value = row[column.field];

    if (column.formatter) {
      value = column.formatter(value, row, {
        rowId: rowId,
        rowIndex: rowIndex,
        column: column,
        collection: this._state.collection
      });
    }

    return value == null ? "" : String(value);
  };

  DataGrid.prototype._bindCollection = function(collection) {
    var control = this;

    if (this._collectionUnsubscribe) {
      this._collectionUnsubscribe();
      this._collectionUnsubscribe = null;
    }
    if (!collection || typeof collection.Subscribe !== "function") {
      return;
    }
    this._collectionUnsubscribe = collection.Subscribe("change", function() {
      control.Refresh();
    });
  };

  DataGrid.prototype._applyStateToDom = function(prevState, nextState) {
    var control = this;
    var collection = nextState.collection;
    var columns = this._getResolvedColumns();
    var rows = collection && typeof collection.GetRows === "function" ? collection.GetRows() : [];
    var includeCommands = cloneDataGridCommands(nextState.rowCommands).length > 0;

    Control.prototype._applyStateToDom.call(this, prevState, nextState);
    if (!this._domNode || !this._headerNode || !this._bodyNode || !this._emptyNode) {
      return;
    }

    if (prevState.collection !== nextState.collection) {
      this._bindCollection(nextState.collection);
    }

    this._clearNodeChildren(this._headerNode);
    this._clearNodeChildren(this._bodyNode);
    this._rowNodes = [];
    this._commandNodes = {};
    this._resizeHandleNodes = {};

    this._headerNode.style.gridTemplateColumns = this._getGridTemplateColumns(columns, includeCommands);

    columns.forEach(function(column) {
      var headerCell = control._runtime.document.createElement("div");
      headerCell.className = "jog-data-grid-header-cell" + (column.align === "right" ? " align-right" : (column.align === "center" ? " align-center" : ""));
      headerCell.textContent = column.title;
      if (control._canResizeColumn(column)) {
        var handle = control._runtime.document.createElement("div");
        handle.className = "jog-data-grid-resize-handle";
        handle.addEventListener("mousedown", function(event) {
          if (typeof event.preventDefault === "function") {
            event.preventDefault();
          }
          if (typeof event.stopPropagation === "function") {
            event.stopPropagation();
          }
          control._beginColumnResize(column, event);
        });
        headerCell.appendChild(handle);
        control._resizeHandleNodes[column.key] = handle;
      }
      control._headerNode.appendChild(headerCell);
    });

    if (includeCommands) {
      var commandHeader = control._runtime.document.createElement("div");
      commandHeader.className = "jog-data-grid-header-cell";
      commandHeader.textContent = "Actions";
      control._headerNode.appendChild(commandHeader);
    }

    this._headerNode.style.display = columns.length || includeCommands ? "" : "none";
    this._emptyNode.textContent = nextState.emptyText || "No rows.";
    this._emptyNode.style.display = rows.length ? "none" : "";

    rows.forEach(function(row, rowIndex) {
      var rowId = collection ? collection.GetRowId(row) : "";
      var rowNode = control._runtime.document.createElement("div");
      var commands = control._getVisibleCommands(row, rowIndex);

      rowNode.className = "jog-data-grid-row";
      rowNode.style.gridTemplateColumns = control._getGridTemplateColumns(columns, commands.length > 0);
      if (collection && collection.IsSelected(rowId)) {
        rowNode.classList.add("jog-selected");
      }
      if (collection && collection.IsDirty(rowId)) {
        rowNode.classList.add("jog-dirty");
      }
      if (nextState.selectionMode !== "none") {
        rowNode.addEventListener("click", function(event) {
          if (!collection) {
            return;
          }
          collection.Select(rowId);
          control._raiseEvent("SelectionChange", event, {
            RowId: rowId,
            Row: cloneCollectionRow(row),
            Value: rowId,
            Index: rowIndex
          });
        });
      }

      columns.forEach(function(column) {
        var cell = control._runtime.document.createElement("div");
        cell.className = "jog-data-grid-cell" + (column.align === "right" ? " align-right" : (column.align === "center" ? " align-center" : ""));
        cell.textContent = control._resolveCellText(column, row, rowIndex, rowId);
        rowNode.appendChild(cell);
      });

      if (commands.length) {
        var commandCell = control._runtime.document.createElement("div");
        commandCell.className = "jog-data-grid-cell jog-data-grid-command-cell";

        control._commandNodes[rowId] = {};
        commands.forEach(function(command, commandIndex) {
          var button = control._runtime.document.createElement("button");
          var enabled = typeof command.enabled === "function" ? !!command.enabled(row, rowIndex) : command.enabled !== false;

          button.className = "jog-button jog-data-grid-command" + (command.themePreset ? " jog-theme-preset-" + command.themePreset : "");
          button.type = "button";
          button.textContent = command.text;
          button.disabled = !enabled;
          button.addEventListener("click", function(event) {
            control._raiseEvent("RowCommand", event, {
              Key: command.key,
              Command: command,
              RowId: rowId,
              Row: cloneCollectionRow(row),
              Value: rowId,
              Index: commandIndex
            });
          });
          commandCell.appendChild(button);
          control._commandNodes[rowId][command.key] = button;
        });
        rowNode.appendChild(commandCell);
      }

      control._bodyNode.appendChild(rowNode);
      control._rowNodes.push(rowNode);
    });
  };

  DataGrid.prototype.Dispose = function() {
    if (this._activeResize && this._runtime && this._runtime.document) {
      this._runtime.document.removeEventListener("mousemove", this._activeResize.onMove);
      this._runtime.document.removeEventListener("mouseup", this._activeResize.onUp);
      this._activeResize = null;
    }
    if (this._collectionUnsubscribe) {
      this._collectionUnsubscribe();
      this._collectionUnsubscribe = null;
    }
    Control.prototype.Dispose.call(this);
  };

  DataGrid.prototype.OnRowCommand = function(listener) {
    this._registerEvent("RowCommand", listener);
  };

  DataGrid.prototype.OnSelectionChange = function(listener) {
    this._registerEvent("SelectionChange", listener);
  };

  Object.defineProperty(DataGrid.prototype, "Columns", {
    get: function() { return cloneDataGridColumns(this._state.columns); },
    set: function(value) { this._setState("columns", cloneDataGridColumns(value)); }
  });

  Object.defineProperty(DataGrid.prototype, "RowCommands", {
    get: function() { return cloneDataGridCommands(this._state.rowCommands); },
    set: function(value) { this._setState("rowCommands", cloneDataGridCommands(value)); }
  });

  Object.defineProperty(DataGrid.prototype, "EmptyText", {
    get: function() { return this._state.emptyText; },
    set: function(value) { this._setState("emptyText", value == null ? "" : String(value)); }
  });

  Object.defineProperty(DataGrid.prototype, "SelectionMode", {
    get: function() { return this._state.selectionMode; },
    set: function(value) {
      var nextValue = value === "none" ? "none" : "single";
      this._setState("selectionMode", nextValue);
    }
  });

  Object.defineProperty(DataGrid.prototype, "ResizableColumns", {
    get: function() { return !!this._state.resizableColumns; },
    set: function(value) { this._setState("resizableColumns", !!value); }
  });

  Object.defineProperty(DataGrid.prototype, "Collection", {
    get: function() { return this._state.collection; },
    set: function(value) { this._setState("collection", value || null); }
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
    this._domNode.style.flexDirection = "column";
    this._domNode.style.boxSizing = "border-box";
    this._domNode.style.width = isNumber(nextState.width) ? toCssPixels(nextState.width) : "420px";
    this._domNode.style.height = isNumber(nextState.height) ? toCssPixels(nextState.height) : "";
    this._domNode.style.minWidth = isNumber(nextState.minWidth) ? toCssPixels(nextState.minWidth) : "";
    this._domNode.style.minHeight = isNumber(nextState.minHeight) ? toCssPixels(nextState.minHeight) : "";
    if (this._contentNode) {
      this._contentNode.style.flex = "1 1 auto";
      this._contentNode.style.minHeight = "0";
      this._contentNode.style.overflowX = "hidden";
      this._contentNode.style.overflowY = "auto";
      this._contentNode.style.boxSizing = "border-box";
    }
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

  JOG.Browser = {
    OpenTextFile: function(options) {
      var resolved = options || {};
      var pickerOptions = {
        multiple: false,
        types: normalizeTextFileTypes(resolved.types)
      };

      if (typeof global.showOpenFilePicker === "function") {
        return global.showOpenFilePicker(pickerOptions).then(function(handles) {
          var handle = handles && handles.length ? handles[0] : null;
          if (!handle || typeof handle.getFile !== "function") {
            return null;
          }
          return handle.getFile().then(function(file) {
            return file.text().then(function(text) {
              return {
                name: file.name || "",
                text: String(text == null ? "" : text),
                file: file,
                handle: handle,
                method: "picker"
              };
            });
          });
        }).catch(function(error) {
          if (error && error.name === "AbortError") {
            return null;
          }
          throw error;
        });
      }

      return openTextFileFallback(pickerOptions);
    },

    SaveTextFile: function(options) {
      var resolved = options || {};
      var text = String(resolved.text == null ? "" : resolved.text);
      var handle = resolved.handle;
      var suggestedName = basename(resolved.suggestedName || "untitled.txt");
      var pickerOptions = {
        suggestedName: suggestedName,
        types: normalizeTextFileTypes(resolved.types)
      };

      if (!resolved.saveAs && handle && typeof handle.createWritable === "function") {
        return saveTextByHandle(handle, text, "handle");
      }

      if (typeof global.showSaveFilePicker === "function") {
        return global.showSaveFilePicker(pickerOptions).then(function(nextHandle) {
          if (!nextHandle || typeof nextHandle.createWritable !== "function") {
            return null;
          }
          return saveTextByHandle(nextHandle, text, "picker");
        }).catch(function(error) {
          if (error && error.name === "AbortError") {
            return null;
          }
          throw error;
        });
      }

      return new Promise(function(resolve, reject) {
        var blob;
        var link;
        var url;

        if (!global.Blob || !global.URL || typeof global.URL.createObjectURL !== "function" || !global.document || !global.document.body) {
          reject(new Error("File save fallback requires Blob, URL, and document.body support."));
          return;
        }

        blob = new global.Blob([text], { type: "text/plain;charset=utf-8" });
        url = global.URL.createObjectURL(blob);
        link = global.document.createElement("a");
        link.href = url;
        link.download = suggestedName;
        global.document.body.appendChild(link);
        link.click();
        global.document.body.removeChild(link);
        global.URL.revokeObjectURL(url);

        resolve({
          name: link.download || suggestedName,
          handle: null,
          method: "download"
        });
      });
    }
  };

  JOG.Application = Application;
  JOG.Component = Component;
  JOG.Control = Control;
  JOG.Container = Container;
  JOG.Page = Page;
  JOG.Panel = Panel;
  JOG.DockPanel = DockPanel;
  JOG.SplitPanel = SplitPanel;
  JOG.StackPanel = StackPanel;
  JOG.MenuBar = MenuBar;
  JOG.ToolBar = ToolBar;
  JOG.StatusBar = StatusBar;
  JOG.TabPage = TabPage;
  JOG.TabControl = TabControl;
  JOG.SectionPanel = SectionPanel;
  JOG.Grid = Grid;
  JOG.DataGrid = DataGrid;
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
  JOG.Collection = Collection;
  JOG.EventArgs = EventArgs;

  global.JOG = JOG;
})(window);
