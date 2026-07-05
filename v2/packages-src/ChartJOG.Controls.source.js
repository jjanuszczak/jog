(function(global) {
  "use strict";

  var chartAutoModule = require("chart.js/auto");
  var ChartConstructor = chartAutoModule.Chart || chartAutoModule;
  var thirdPartyHelpers = require("./ThirdPartyJOG.Helpers");
  var JOG = global.JOG;
  var ChartJOG = global.ChartJOG || {};
  var testingAdapterFactory = null;

  if (!JOG) {
    throw new Error("ChartJOG.Controls.js requires JOG to load first.");
  }

  JOG.RegisterStyleBlock("ChartJOG.Controls", [
    ".chartjog-bar-chart { position: relative; display: flex; min-width: 0; min-height: 0; box-sizing: border-box; border: 1px solid var(--jog-border); border-radius: var(--jog-radius-control); background: var(--jog-surface); color: var(--jog-text); overflow: hidden; }",
    ".chartjog-bar-chart-host { position: relative; flex: 1 1 auto; min-height: 220px; padding: var(--jog-control-padding-y) var(--jog-control-padding-x); }",
    ".chartjog-bar-chart-canvas { display: block; width: 100%; height: 100%; }",
    ".chartjog-bar-chart-empty { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; padding: calc(var(--jog-control-padding-y) * 2) calc(var(--jog-control-padding-x) * 2); color: var(--jog-text-muted); text-align: center; pointer-events: none; }",
    ".chartjog-bar-chart-empty.hidden { display: none; }",
    ".chartjog-bar-chart.jog-theme-preset-muted { background: var(--jog-surface-muted); }",
    ".chartjog-bar-chart.jog-theme-preset-primary { border-color: color-mix(in srgb, var(--jog-primary) 38%, var(--jog-border)); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--jog-primary) 12%, transparent); }"
  ].join("\n"));

  function normalizeItems(items) {
    if (!Array.isArray(items)) {
      return [];
    }
    return items.map(function(item) {
      if (item && typeof item === "object") {
        return Object.assign({}, item);
      }
      return {
        label: item == null ? "" : String(item),
        value: 0
      };
    });
  }

  function normalizeFieldName(value, fallback) {
    if (value == null || value === "") {
      return fallback;
    }
    return String(value);
  }

  function normalizeText(value, fallback) {
    if (value == null || value === "") {
      return fallback || "";
    }
    return String(value);
  }

  function normalizeNumber(value) {
    var parsed = Number(value);

    if (!isFinite(parsed)) {
      return 0;
    }
    return parsed;
  }

  function getThemeValue(node, name, fallback) {
    var computedStyle;
    var value;

    if (!node || !global || typeof global.getComputedStyle !== "function") {
      return fallback;
    }
    computedStyle = global.getComputedStyle(node);
    value = computedStyle.getPropertyValue(name);
    return value ? value.trim() : fallback;
  }

  function createChartModel(control) {
    var items = normalizeItems(control.Items);
    var labelField = normalizeFieldName(control.LabelField, "label");
    var valueField = normalizeFieldName(control.ValueField, "value");
    var labels = [];
    var values = [];
    var pointItems = [];

    items.forEach(function(item) {
      labels.push(item[labelField] == null ? "" : String(item[labelField]));
      values.push(normalizeNumber(item[valueField]));
      pointItems.push(item);
    });

    return {
      items: pointItems,
      labels: labels,
      values: values,
      isEmpty: pointItems.length === 0
    };
  }

  function createChartConfig(control, model, rootNode) {
    var primary = getThemeValue(rootNode, "--jog-primary", "#2563eb");
    var border = getThemeValue(rootNode, "--jog-border-soft", "rgba(148, 163, 184, 0.35)");
    var text = getThemeValue(rootNode, "--jog-text", "#0f172a");
    var textMuted = getThemeValue(rootNode, "--jog-text-muted", "#64748b");
    var textStrong = getThemeValue(rootNode, "--jog-text-strong", text);
    var fontFamily = getThemeValue(rootNode, "--jog-font-family", "sans-serif");
    var datasetColors = model.items.map(function(item) {
      return item.color || primary;
    });

    return {
      type: "bar",
      data: {
        labels: model.labels,
        datasets: [
          {
            label: normalizeText(control.SeriesLabel, "Series"),
            data: model.values,
            backgroundColor: datasetColors,
            borderColor: datasetColors,
            borderWidth: 1,
            borderRadius: 6,
            maxBarThickness: 42
          }
        ]
      },
      options: {
        animation: false,
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: !!control.TitleText,
            text: normalizeText(control.TitleText, ""),
            color: textStrong,
            font: {
              family: fontFamily,
              size: 14,
              weight: "600"
            },
            padding: {
              bottom: 12
            }
          },
          tooltip: {
            enabled: !model.isEmpty
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: textMuted,
              font: {
                family: fontFamily
              }
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: border
            },
            ticks: {
              color: textMuted,
              font: {
                family: fontFamily
              }
            }
          }
        }
      },
      model: model
    };
  }

  function createDefaultChartAdapter(options) {
    var chart = null;
    var canvasNode = null;
    var rootNode = null;
    var activeConfig = options.config || null;

    function renderChart() {
      var context;
      var nextConfig;

      if (!canvasNode || !activeConfig || !ChartConstructor) {
        return;
      }

      nextConfig = createChartConfig(activeConfig.control, activeConfig.model, rootNode);
      if (!chart) {
        if (typeof canvasNode.getContext !== "function") {
          return;
        }
        context = canvasNode.getContext("2d");
        if (!context) {
          return;
        }
        chart = new ChartConstructor(context, {
          type: nextConfig.type,
          data: nextConfig.data,
          options: Object.assign({}, nextConfig.options, {
            onClick: function(event, elements) {
              var pointIndex;
              var item;

              if (!elements || !elements.length || typeof options.onPointClick !== "function") {
                return;
              }
              pointIndex = elements[0].index;
              item = activeConfig.model.items[pointIndex] || null;
              options.onPointClick({
                index: pointIndex,
                item: item,
                label: activeConfig.model.labels[pointIndex] || "",
                value: activeConfig.model.values[pointIndex] || 0,
                originalEvent: event || null
              });
            }
          })
        });
        return;
      }

      chart.data = nextConfig.data;
      chart.options = Object.assign({}, chart.options, nextConfig.options);
      if (typeof chart.update === "function") {
        chart.update();
      }
    }

    return {
      attach: function(nextCanvasNode, nextRootNode) {
        canvasNode = nextCanvasNode;
        rootNode = nextRootNode || null;
        renderChart();
      },
      dispose: function() {
        if (chart && typeof chart.destroy === "function") {
          chart.destroy();
        }
        chart = null;
        canvasNode = null;
        rootNode = null;
      },
      setConfig: function(config) {
        activeConfig = config || null;
        renderChart();
      }
    };
  }

  function createChartAdapter(options) {
    if (typeof testingAdapterFactory === "function") {
      return testingAdapterFactory(options);
    }
    return createDefaultChartAdapter(options);
  }

  function BarChart() {
    JOG.Control.call(this, "BarChart");
    this._chartAdapter = null;
    this._canvasNode = null;
    this._hostNode = null;
    this._emptyNode = null;
    this.SetStateValue("items", []);
    this.SetStateValue("labelField", "label");
    this.SetStateValue("valueField", "value");
    this.SetStateValue("seriesLabel", "Series");
    this.SetStateValue("titleText", "");
    this.SetStateValue("emptyText", "No chart data.");
    this.SetStateValue("chartEmpty", true);
  }

  BarChart.prototype = Object.create(JOG.Control.prototype);
  BarChart.prototype.constructor = BarChart;

  BarChart.prototype.CreateDom = function(doc) {
    var node = doc.createElement("div");
    var host = doc.createElement("div");
    var canvas = doc.createElement("canvas");
    var empty = doc.createElement("div");

    node.className = "jog-control chartjog-bar-chart";
    host.className = "chartjog-bar-chart-host";
    canvas.className = "chartjog-bar-chart-canvas";
    empty.className = "chartjog-bar-chart-empty";
    empty.setAttribute("aria-hidden", "true");
    node.setAttribute("role", "img");
    node.tabIndex = 0;

    host.appendChild(canvas);
    host.appendChild(empty);
    node.appendChild(host);

    this._hostNode = host;
    this._canvasNode = canvas;
    this._emptyNode = empty;

    return node;
  };

  BarChart.prototype._buildAdapterConfig = function() {
    return {
      control: this,
      model: createChartModel(this)
    };
  };

  BarChart.prototype._applyAdapterConfig = function() {
    var config;

    if (!this._chartAdapter) {
      return null;
    }
    config = this._buildAdapterConfig();
    this.SetStateValue("chartEmpty", config.model.isEmpty);
    this._chartAdapter.setConfig(config);
    return config;
  };

  BarChart.prototype._handlePointClick = function(payload) {
    this.RaiseEvent("PointClick", payload ? payload.originalEvent || null : null, {
      Index: payload ? payload.index : -1,
      Item: payload ? payload.item || null : null,
      Label: payload ? payload.label || "" : "",
      Value: payload ? payload.value || 0 : 0
    });
  };

  BarChart.prototype.OnAttached = function() {
    var control = this;

    if (!this._canvasNode) {
      return;
    }

    this._chartAdapter = createChartAdapter({
      config: this._buildAdapterConfig(),
      onPointClick: function(payload) {
        control._handlePointClick(payload);
      }
    });
    this._chartAdapter.attach(this._canvasNode, this._domNode);
    this._applyAdapterConfig();
  };

  BarChart.prototype.OnDisposed = function() {
    if (this._chartAdapter) {
      this._chartAdapter.dispose();
      this._chartAdapter = null;
    }
    this._canvasNode = null;
    this._hostNode = null;
    this._emptyNode = null;
  };

  BarChart.prototype.ApplyState = function(prevState, nextState) {
    var activeConfig = null;
    var chartEmpty = !!nextState.chartEmpty;
    var emptyText;

    JOG.Control.prototype.ApplyState.call(this, prevState, nextState);
    if (!this._domNode || !this._emptyNode) {
      return;
    }

    if (
      this._chartAdapter &&
      (
        prevState.items !== nextState.items ||
        prevState.labelField !== nextState.labelField ||
        prevState.valueField !== nextState.valueField ||
        prevState.seriesLabel !== nextState.seriesLabel ||
        prevState.titleText !== nextState.titleText
      )
    ) {
      activeConfig = this._applyAdapterConfig();
      chartEmpty = !!(activeConfig && activeConfig.model && activeConfig.model.isEmpty);
    }

    emptyText = nextState.emptyText || "No chart data.";
    this._emptyNode.textContent = emptyText;
    this._emptyNode.classList.toggle("hidden", !chartEmpty);
    this._domNode.setAttribute("aria-label", nextState.titleText ? nextState.titleText : emptyText);
  };

  BarChart.prototype.Focus = function() {
    if (this._lifecycle === "Disposed") {
      JOG.Control.prototype.Focus.call(this);
      return;
    }
    if (this._domNode && typeof this._domNode.focus === "function") {
      this._domNode.focus();
      return;
    }
    JOG.Control.prototype.Focus.call(this);
  };

  BarChart.prototype.BindCollection = function(collection, options) {
    var bindingOptions = options || {};

    if (bindingOptions.labelField) {
      this.LabelField = bindingOptions.labelField;
    }
    if (bindingOptions.valueField) {
      this.ValueField = bindingOptions.valueField;
    }

    thirdPartyHelpers.bindCollection(this, collection, {
      propertyName: "Items",
      eventKeys: bindingOptions.eventKeys || ["change"],
      mapRows: function(rows) {
        return rows.map(function(row) {
          return Object.assign({}, row);
        });
      }
    });
  };

  BarChart.prototype.OnPointClick = function(listener) {
    this.RegisterEvent("PointClick", listener);
  };

  JOG.DefineControlProperty(BarChart.prototype, "Items", {
    stateKey: "items",
    normalize: normalizeItems
  });

  JOG.DefineControlProperty(BarChart.prototype, "LabelField", {
    stateKey: "labelField",
    normalize: function(value) {
      return normalizeFieldName(value, "label");
    }
  });

  JOG.DefineControlProperty(BarChart.prototype, "ValueField", {
    stateKey: "valueField",
    normalize: function(value) {
      return normalizeFieldName(value, "value");
    }
  });

  JOG.DefineControlProperty(BarChart.prototype, "SeriesLabel", {
    stateKey: "seriesLabel",
    normalize: function(value) {
      return normalizeText(value, "Series");
    }
  });

  JOG.DefineControlProperty(BarChart.prototype, "TitleText", {
    stateKey: "titleText",
    normalize: function(value) {
      return normalizeText(value, "");
    }
  });

  JOG.DefineControlProperty(BarChart.prototype, "EmptyText", {
    stateKey: "emptyText",
    normalize: function(value) {
      return normalizeText(value, "No chart data.");
    }
  });

  ChartJOG.BarChart = BarChart;
  ChartJOG.__setTestingAdapterFactory = function(factory) {
    testingAdapterFactory = typeof factory === "function" ? factory : null;
  };

  JOG.RegisterControl({
    fullName: "ChartJOG.BarChart",
    version: "1.0.0",
    jogVersionRange: "^2.0.0",
    constructor: BarChart,
    metadata: {
      baseType: "Control",
      shortName: "BarChart",
      packageName: "ChartJOG",
      packageVersion: "1.0.0",
      properties: ["Items", "LabelField", "ValueField", "SeriesLabel", "TitleText", "EmptyText", "ThemePreset"],
      events: ["OnPointClick"],
      methods: ["Focus", "BindCollection"],
      themePresets: ["muted", "primary"],
      capabilities: {
        supportsValidation: false,
        supportsKeyboard: false,
        supportsResponsiveLayout: true,
        supportsCollection: true,
        supportsChildren: false,
        supportsFocusRestore: false
      }
    }
  });

  global.ChartJOG = ChartJOG;
})(typeof window !== "undefined" ? window : globalThis);
