"use strict";

var DEFAULT_THEME_VARIABLE_NAMES = [
  "--jog-app-background",
  "--jog-surface",
  "--jog-surface-muted",
  "--jog-text",
  "--jog-text-muted",
  "--jog-text-strong",
  "--jog-border",
  "--jog-border-soft",
  "--jog-primary",
  "--jog-primary-text",
  "--jog-danger",
  "--jog-danger-text",
  "--jog-overlay",
  "--jog-resize-grip",
  "--jog-font-family",
  "--jog-font-size",
  "--jog-caption-size",
  "--jog-title-size",
  "--jog-line-height",
  "--jog-radius-control",
  "--jog-radius-section",
  "--jog-radius-shell",
  "--jog-radius-window",
  "--jog-page-padding",
  "--jog-section-header-x",
  "--jog-section-header-y",
  "--jog-section-body",
  "--jog-window-content",
  "--jog-control-padding-x",
  "--jog-control-padding-y",
  "--jog-close-button-x",
  "--jog-close-button-y",
  "--jog-field-gap",
  "--jog-list-padding",
  "--jog-shadow-shell",
  "--jog-shadow-section",
  "--jog-shadow-window",
  "--jog-shadow-invalid-ring"
];

function initializeValueBridge(control, options) {
  var stateKey = options && options.stateKey ? options.stateKey : "value";
  var emptyValue = options ? options.emptyValue : "";

  control._suppressAdapterChange = false;
  control._lastAppliedValue = emptyValue;
  control._lastEmittedValue = emptyValue;
  control.SetStateValue(stateKey, emptyValue);
}

function syncAdapterValueIntoControl(control, options) {
  var stateKey = options && options.stateKey ? options.stateKey : "value";
  var nextValue = options ? options.nextValue : undefined;
  var payload = options ? options.payload : null;
  var eventName = options && options.eventName ? options.eventName : "Change";
  var eventExtras;

  control._lastAppliedValue = nextValue;
  control._lastEmittedValue = nextValue;

  if (options && typeof options.afterSync === "function") {
    options.afterSync(nextValue, payload);
  }

  if (control._suppressAdapterChange) {
    control._suppressAdapterChange = false;
    if (control.GetStateValue(stateKey) !== nextValue) {
      control.SetStateValue(stateKey, nextValue);
    }
    if (options && typeof options.afterSuppressed === "function") {
      options.afterSuppressed(nextValue, payload);
    }
    return false;
  }

  if (control.GetStateValue(stateKey) !== nextValue) {
    control.SetStateValue(stateKey, nextValue);
  }

  if (options && typeof options.eventExtras === "function") {
    eventExtras = options.eventExtras(nextValue, payload);
  } else if (options && options.eventExtras) {
    eventExtras = options.eventExtras;
  } else {
    eventExtras = { Value: nextValue };
  }

  control.RaiseEvent(eventName, payload ? payload.originalEvent || null : null, eventExtras);
  return true;
}

function applyValueToAdapter(control, options) {
  var nextValue = options ? options.nextValue : undefined;

  if (options && typeof options.beforeApply === "function") {
    options.beforeApply(nextValue);
  }

  if (!options || !options.adapter || typeof options.setAdapterValue !== "function") {
    control._lastAppliedValue = nextValue;
    return false;
  }
  if (nextValue === control._lastAppliedValue) {
    return false;
  }

  control._suppressAdapterChange = true;
  options.setAdapterValue(nextValue);
  control._lastAppliedValue = nextValue;
  control._lastEmittedValue = nextValue;

  if (typeof options.afterApply === "function") {
    options.afterApply(nextValue);
  }

  return true;
}

function bindValue(control, store, key, options) {
  var propertyName = options && options.propertyName ? options.propertyName : "Value";
  var eventMethodName = options && options.eventMethodName ? options.eventMethodName : "OnChange";
  var normalize = options && typeof options.normalize === "function" ? options.normalize : function(value) {
    return value;
  };
  var getEventValue = options && typeof options.getEventValue === "function" ? options.getEventValue : function(args) {
    return args.Value;
  };
  var unsubscribe = store.Subscribe(key, function(value) {
    control[propertyName] = normalize(value);
  });

  control.TrackBinding(unsubscribe);
  control[propertyName] = normalize(store.Get(key));
  control[eventMethodName](function(args) {
    store.Set(key, getEventValue(args));
  });
}

function bindCollection(control, collection, options) {
  var propertyName = options && options.propertyName ? options.propertyName : "Items";
  var eventKeys = Array.isArray(options && options.eventKeys) && options.eventKeys.length ? options.eventKeys.slice() : ["change"];
  var mapRows = options && typeof options.mapRows === "function" ? options.mapRows : function(rows) {
    return rows.slice();
  };
  var unsubscribes = [];

  function update() {
    var rows = collection && typeof collection.GetRows === "function" ? collection.GetRows() : [];
    control[propertyName] = mapRows(rows, collection);
  }

  eventKeys.forEach(function(eventKey) {
    unsubscribes.push(collection.Subscribe(eventKey, update));
  });
  control.TrackBinding(function() {
    unsubscribes.forEach(function(unsubscribe) {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    });
  });

  update();
}

function syncThemeVariablesFromNode(globalObject, sourceNode, targetNode, variableNames) {
  var computedStyle;
  var names = Array.isArray(variableNames) && variableNames.length ? variableNames : DEFAULT_THEME_VARIABLE_NAMES;

  if (!sourceNode || !targetNode || !globalObject || typeof globalObject.getComputedStyle !== "function") {
    return;
  }

  computedStyle = globalObject.getComputedStyle(sourceNode);
  names.forEach(function(name) {
    var value = computedStyle.getPropertyValue(name);
    if (value) {
      targetNode.style.setProperty(name, value);
    }
  });
}

module.exports = {
  applyValueToAdapter: applyValueToAdapter,
  bindCollection: bindCollection,
  bindValue: bindValue,
  initializeValueBridge: initializeValueBridge,
  syncAdapterValueIntoControl: syncAdapterValueIntoControl,
  syncThemeVariablesFromNode: syncThemeVariablesFromNode,
  THEME_VARIABLE_NAMES: DEFAULT_THEME_VARIABLE_NAMES.slice()
};
