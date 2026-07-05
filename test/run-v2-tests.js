"use strict";

var fs = require("fs");
var path = require("path");
var vm = require("vm");

function createClassList(node) {
  return {
    add: function(name) {
      if (node._classNames.indexOf(name) < 0) {
        node._classNames.push(name);
      }
      node.className = node._classNames.join(" ");
    },
    remove: function(name) {
      node._classNames = node._classNames.filter(function(existing) {
        return existing !== name;
      });
      node.className = node._classNames.join(" ");
    },
    toggle: function(name, force) {
      var hasName = node._classNames.indexOf(name) >= 0;
      var shouldHave = force;
      if (shouldHave === undefined) {
        shouldHave = !hasName;
      }
      if (shouldHave && !hasName) {
        this.add(name);
      } else if (!shouldHave && hasName) {
        this.remove(name);
      }
    }
  };
}

function createNode(tagName) {
  var style = {
    setProperty: function(name, value) {
      this[name] = value;
    }
  };
  var node = {
    tagName: tagName.toUpperCase(),
    children: [],
    style: style,
    attributes: {},
    parentNode: null,
    textContent: "",
    className: "",
    _classNames: [],
    eventListeners: {},
    title: "",
    id: "",
    disabled: false,
    value: "",
    checked: false,
    files: [],
    name: "",
    size: 0,
    type: "",
    innerHTML: "",
    clientWidth: 0,
    clientHeight: 0,
    appendChild: function(child) {
      child.parentNode = this;
      this.children.push(child);
      return child;
    },
    removeChild: function(child) {
      var index = this.children.indexOf(child);
      if (index >= 0) {
        this.children.splice(index, 1);
      }
      child.parentNode = null;
      return child;
    },
    setAttribute: function(name, value) {
      this.attributes[name] = String(value);
    },
    removeAttribute: function(name) {
      delete this.attributes[name];
    },
    addEventListener: function(name, listener) {
      if (!this.eventListeners[name]) {
        this.eventListeners[name] = [];
      }
      this.eventListeners[name].push(listener);
    },
    removeEventListener: function(name, listener) {
      var listeners = this.eventListeners[name] || [];
      this.eventListeners[name] = listeners.filter(function(existing) {
        return existing !== listener;
      });
    },
    ownerDocument: null,
    focus: function() {
      if (this.ownerDocument) {
        this.ownerDocument.activeElement = this;
      }
    },
    click: function() {
      var listeners = this.eventListeners.click || [];
      listeners.forEach(function(listener) {
        listener({ target: node });
      });
    }
  };

  Object.defineProperty(node, "offsetWidth", {
    get: function() {
      return parseInt(this.style.width, 10) || 0;
    }
  });

  Object.defineProperty(node, "offsetHeight", {
    get: function() {
      return parseInt(this.style.height, 10) || 0;
    }
  });

  node.classList = createClassList(node);
  return node;
}

function createDocument() {
  var document = {
    title: "",
    documentMode: null,
    head: createNode("head"),
    body: createNode("body"),
    activeElement: null,
    eventListeners: {},
    createElement: function(tagName) {
      var node = createNode(tagName);
      node.ownerDocument = document;
      return node;
    },
    addEventListener: function(name, listener) {
      if (!this.eventListeners[name]) {
        this.eventListeners[name] = [];
      }
      this.eventListeners[name].push(listener);
    },
    removeEventListener: function(name, listener) {
      var listeners = this.eventListeners[name] || [];
      this.eventListeners[name] = listeners.filter(function(existing) {
        return existing !== listener;
      });
    }
  };

  document.head.ownerDocument = document;
  document.body.ownerDocument = document;

  document.body.clientWidth = 1280;
  document.body.clientHeight = 720;
  return document;
}

function createJOGSandbox(options) {
  var source = fs.readFileSync(path.join(__dirname, "..", "v2", "runtime", "JOG.js"), "utf8");
  var document = createDocument();
  var animationFrameQueue = [];
  var windowEventListeners = {};
  options = options || {};
  if (options.innerWidth) {
    document.body.clientWidth = options.innerWidth;
  }
  if (options.innerHeight) {
    document.body.clientHeight = options.innerHeight;
  }
  var sandbox = {
    console: options.console || console,
    document: document,
    window: null,
    innerWidth: options.innerWidth || 1280,
    innerHeight: options.innerHeight || 720,
    queueMicrotask: queueMicrotask,
    Promise: Promise,
    setTimeout: setTimeout,
    clearTimeout: clearTimeout,
    navigator: options.navigator || {
      platform: "MacIntel",
      userAgent: "CodexTest"
    },
    MutationObserver: options.MutationObserver || function() {
      this.observe = function() {};
      this.disconnect = function() {};
      this.takeRecords = function() {
        return [];
      };
    },
    Event: options.Event || function(type) {
      this.type = type || "";
    },
    KeyboardEvent: options.KeyboardEvent || function(type) {
      this.type = type || "";
    },
    ClipboardEvent: options.ClipboardEvent || function(type) {
      this.type = type || "";
      this.clipboardData = null;
    },
    InputEvent: options.InputEvent || function(type) {
      this.type = type || "";
      this.data = "";
    },
    HTMLElement: options.HTMLElement || function() {},
    Node: options.Node || function() {},
    Blob: options.Blob || function(parts, config) {
      this.parts = parts || [];
      this.type = config && config.type ? config.type : "";
    },
    FileReader: options.FileReader || function() {
      this.result = "";
      this.onload = null;
      this.onerror = null;
      this.readAsText = function(file) {
        if (file && file._readError) {
          if (typeof this.onerror === "function") {
            this.onerror(new Error(file._readError));
          }
          return;
        }
        this.result = file && file._text != null ? file._text : "";
        if (typeof this.onload === "function") {
          this.onload({ target: this });
        }
      };
    },
    URL: options.URL || {
      _lastObjectUrl: null,
      _revokedObjectUrl: null,
      createObjectURL: function() {
        this._lastObjectUrl = "blob:test";
        return this._lastObjectUrl;
      },
      revokeObjectURL: function(url) {
        this._revokedObjectUrl = url;
      }
    },
    alert: options.alert || function() {},
    requestAnimationFrame: function(callback) {
      animationFrameQueue.push(callback);
      return animationFrameQueue.length;
    },
    cancelAnimationFrame: function(id) {
      if (id > 0 && id <= animationFrameQueue.length) {
        animationFrameQueue[id - 1] = null;
      }
    }
  };

  if (options.showOpenFilePicker) {
    sandbox.showOpenFilePicker = options.showOpenFilePicker;
  }
  if (options.showSaveFilePicker) {
    sandbox.showSaveFilePicker = options.showSaveFilePicker;
  }

  sandbox.window = sandbox;
  sandbox._animationFrameQueue = animationFrameQueue;
  sandbox._windowEventListeners = windowEventListeners;
  sandbox.addEventListener = function(name, listener) {
    if (!windowEventListeners[name]) {
      windowEventListeners[name] = [];
    }
    windowEventListeners[name].push(listener);
  };
  sandbox.removeEventListener = function(name, listener) {
    var listeners = windowEventListeners[name] || [];
    windowEventListeners[name] = listeners.filter(function(existing) {
      return existing !== listener;
    });
  };
  vm.createContext(sandbox);
  vm.runInContext(source, sandbox, { filename: "v2/runtime/JOG.js" });
  return sandbox;
}

function loadJOG(options) {
  return createJOGSandbox(options).JOG;
}

function loadScriptIntoSandbox(sandbox, scriptName) {
  var rootDir = path.join(__dirname, "..", "v2");
  var candidatePaths = [
    path.join(rootDir, scriptName),
    path.join(rootDir, "apps", scriptName),
    path.join(rootDir, "packages", scriptName),
    path.join(rootDir, "runtime", scriptName)
  ];
  var resolvedPath = candidatePaths.find(function(candidate) {
    return fs.existsSync(candidate);
  });
  var source;

  if (!resolvedPath) {
    throw new Error("Unable to resolve script: " + scriptName);
  }

  source = fs.readFileSync(resolvedPath, "utf8");
  vm.runInContext(source, sandbox, { filename: path.relative(path.join(__dirname, ".."), resolvedPath) });
}

function loadExampleApp(scriptName, options, setupScripts) {
  var sandbox = createJOGSandbox(options);
  var originalRun = sandbox.JOG.Application.prototype.Run;
  var scripts = Array.isArray(setupScripts) ? setupScripts.slice() : [];

  sandbox.JOG.Application.prototype.Run = function(page) {
    sandbox.__lastApp = this;
    sandbox.__lastPage = page;
    return originalRun.call(this, page);
  };

  scripts.forEach(function(dependency) {
    loadScriptIntoSandbox(sandbox, dependency);
  });
  loadScriptIntoSandbox(sandbox, scriptName);

  (sandbox._windowEventListeners.load || []).forEach(function(listener) {
    listener();
  });

  return {
    sandbox: sandbox,
    JOG: sandbox.JOG,
    app: sandbox.__lastApp,
    page: sandbox.__lastPage
  };
}

function findControl(root, predicate) {
  var children;
  var i;
  var match;

  if (!root) {
    return null;
  }
  if (predicate(root)) {
    return root;
  }

  children = root.Children || [];
  for (i = 0; i < children.length; i += 1) {
    match = findControl(children[i], predicate);
    if (match) {
      return match;
    }
  }
  return null;
}

function dispatchTextInput(control, value) {
  var listeners = (control._domNode && control._domNode.eventListeners.input) || [];

  control._domNode.value = value == null ? "" : String(value);
  assertEqual(listeners.length > 0, true, "Text input control should expose an input listener.");
  listeners[0]({ target: control._domNode });
}

function dispatchCheckedChange(control, checked) {
  var listeners = (control._inputNode && control._inputNode.eventListeners.change) || [];

  control._inputNode.checked = !!checked;
  assertEqual(listeners.length > 0, true, "Checkable control should expose a change listener.");
  listeners[0]({ target: control._inputNode });
}

function dispatchRadioChange(control) {
  var listeners = (control._inputNode && control._inputNode.eventListeners.change) || [];

  control._inputNode.checked = true;
  control._inputNode.value = control.Value;
  assertEqual(listeners.length > 0, true, "Radio control should expose a change listener.");
  listeners[0]({ target: control._inputNode });
}

function dispatchNodeClick(node) {
  var listeners = (node && node.eventListeners && node.eventListeners.click) || [];

  assertEqual(listeners.length > 0, true, "Node should expose a click listener.");
  listeners[0]({
    target: node,
    stopPropagation: function() {},
    preventDefault: function() {}
  });
}

function dispatchNodeDoubleClick(node) {
  var listeners = (node && node.eventListeners && node.eventListeners.dblclick) || [];

  assertEqual(listeners.length > 0, true, "Node should expose a double-click listener.");
  listeners[0]({
    target: node,
    stopPropagation: function() {},
    preventDefault: function() {}
  });
}

function dispatchNodeMouseDown(node, clientX, clientY) {
  var listeners = (node && node.eventListeners && node.eventListeners.mousedown) || [];

  assertEqual(listeners.length > 0, true, "Node should expose a mousedown listener.");
  listeners[0]({
    target: node,
    clientX: clientX || 0,
    clientY: clientY || 0,
    preventDefault: function() {},
    stopPropagation: function() {}
  });
}

function dispatchDocumentMouseMove(document, clientX, clientY) {
  var listeners = (document && document.eventListeners && document.eventListeners.mousemove) || [];

  assertEqual(listeners.length > 0, true, "Document should expose a mousemove listener.");
  listeners[0]({
    target: document,
    clientX: clientX || 0,
    clientY: clientY || 0
  });
}

function dispatchDocumentMouseUp(document, clientX, clientY) {
  var listeners = (document && document.eventListeners && document.eventListeners.mouseup) || [];

  assertEqual(listeners.length > 0, true, "Document should expose a mouseup listener.");
  listeners[0]({
    target: document,
    clientX: clientX || 0,
    clientY: clientY || 0
  });
}

function dispatchNodeKeyDown(node, key, options) {
  var listeners = (node && node.eventListeners && node.eventListeners.keydown) || [];
  var event;

  assertEqual(listeners.length > 0, true, "Node should expose a keydown listener.");
  options = options || {};
  event = {
    target: node,
    key: key,
    shiftKey: !!options.shiftKey,
    preventDefault: function() {},
    stopPropagation: function() {}
  };
  listeners[0](event);
  return event;
}

function dispatchNodeBlur(node) {
  var listeners = (node && node.eventListeners && node.eventListeners.blur) || [];

  assertEqual(listeners.length > 0, true, "Node should expose a blur listener.");
  listeners[0]({ target: node });
}

function dispatchWindowResize(sandbox, width) {
  var listeners = (sandbox && sandbox._windowEventListeners && sandbox._windowEventListeners.resize) || [];

  sandbox.innerWidth = width;
  sandbox.document.body.clientWidth = width;
  listeners.forEach(function(listener) {
    listener({ target: sandbox.window });
  });
}

function flushAnimationFrames(sandbox) {
  var queue = (sandbox && sandbox._animationFrameQueue) || [];
  var callbacks = queue.slice();

  queue.length = 0;
  callbacks.forEach(function(callback) {
    if (typeof callback === "function") {
      callback(0);
    }
  });
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(message + " Expected: " + expected + " Actual: " + actual);
  }
}

function testStoreSubscribeAndUnsubscribe() {
  var JOG = loadJOG();
  var store = new JOG.Store({ name: "Atlas" });
  var calls = [];
  var unsubscribe = store.Subscribe("name", function(value) {
    calls.push(value);
  });

  store.Set("name", "Northwind");
  unsubscribe();
  store.Set("name", "Acme");

  assertEqual(calls.length, 1, "Store subscription should stop after unsubscribe.");
  assertEqual(calls[0], "Northwind", "Store subscriber should receive changed value.");
}

function testStoreDeriveKeepsComputedKeysInSync() {
  var JOG = loadJOG();
  var store = new JOG.Store({
    firstName: "Atlas",
    status: "Active",
    summary: ""
  });
  var unsubscribe = store.Derive("summary", ["firstName", "status"], function(currentStore) {
    return currentStore.Get("firstName") + " - " + currentStore.Get("status");
  });

  assertEqual(store.Get("summary"), "Atlas - Active", "Store.Derive should compute the initial value.");

  store.Set("status", "Pending");
  assertEqual(store.Get("summary"), "Atlas - Pending", "Store.Derive should refresh when a dependency changes.");

  unsubscribe();
  store.Set("firstName", "Northwind");
  assertEqual(store.Get("summary"), "Atlas - Pending", "Store.Derive should stop updating after unsubscribe.");
}

function testContainerRejectsDuplicateChildNames() {
  var JOG = loadJOG();
  var panel = new JOG.Panel();
  var first = new JOG.Label();
  var second = new JOG.Label();
  var threw = false;

  first.Name = "duplicateName";
  second.Name = "duplicateName";

  panel.Add(first);

  try {
    panel.Add(second);
  } catch (error) {
    threw = /Duplicate child name/.test(error.message);
  }

  assert(threw, "Container should reject duplicate child names.");
}

function testBindErrorTracksStoreAndDisposesCleanly() {
  var JOG = loadJOG();
  var store = new JOG.Store({ fieldError: "" });
  var box = new JOG.TextBox();

  box.BindError(store, "fieldError");
  store.Set("fieldError", "Required");

  assertEqual(box.Invalid, true, "BindError should mark control invalid.");
  assertEqual(box.ErrorText, "Required", "BindError should copy error text.");

  box.Dispose();
  store.Set("fieldError", "Changed after dispose");

  assertEqual(box.ErrorText, "Required", "Disposed control should stop receiving error updates.");
}

function testLabelBindTextFormatsAndDisposesCleanly() {
  var JOG = loadJOG();
  var store = new JOG.Store({ status: "Ready" });
  var label = new JOG.Label();

  label.BindText(store, "status", function(value) {
    return "Status: " + value;
  });
  store.Set("status", "Saved");

  assertEqual(label.Text, "Status: Saved", "BindText should copy formatted store text.");

  label.Dispose();
  store.Set("status", "Disposed");

  assertEqual(label.Text, "Status: Saved", "Disposed label should stop receiving text updates.");
}

function testBindVisibleTracksStoreAndDisposesCleanly() {
  var JOG = loadJOG();
  var store = new JOG.Store({ summary: "" });
  var section = new JOG.SectionPanel();

  section.BindVisible(store, "summary");
  assertEqual(section.Visible, false, "BindVisible should hide control for empty values.");

  store.Set("summary", "Validation failed");
  assertEqual(section.Visible, true, "BindVisible should show control for truthy values.");

  section.Dispose();
  store.Set("summary", "");

  assertEqual(section.Visible, true, "Disposed control should stop receiving visibility updates.");
}

function testBindEnabledTracksStoreAndDisposesCleanly() {
  var JOG = loadJOG();
  var store = new JOG.Store({ canSave: false });
  var button = new JOG.Button();

  button.BindEnabled(store, "canSave");
  assertEqual(button.Enabled, false, "BindEnabled should disable controls for falsy values.");

  store.Set("canSave", true);
  assertEqual(button.Enabled, true, "BindEnabled should enable controls for truthy values.");

  button.Dispose();
  store.Set("canSave", false);
  assertEqual(button.Enabled, true, "Disposed controls should stop receiving enabled-state updates.");
}

function testCollectionBindStoreKeepsDerivedStoreKeysInSync() {
  var JOG = loadJOG();
  var collection = new JOG.Collection({
    rows: [
      { id: "1", account: "Atlas", value: 100 },
      { id: "2", account: "Northwind", value: 200 }
    ],
    summaryDefinitions: {
      totalValue: function(rows) {
        return rows.reduce(function(total, row) {
          return total + row.value;
        }, 0);
      }
    }
  });
  var store = new JOG.Store({ totalText: "", hasSelection: false });
  var unsubscribeTotal = collection.BindStore(store, "totalText", ["summary"], function(currentCollection) {
    return "$" + currentCollection.GetSummary("totalValue");
  });
  var unsubscribeSelection = collection.BindStore(store, "hasSelection", ["selection"], function(currentCollection) {
    return currentCollection.GetSelectedRows().length > 0;
  });

  assertEqual(store.Get("totalText"), "$300", "Collection.BindStore should compute the initial store value.");
  assertEqual(store.Get("hasSelection"), false, "Collection.BindStore should compute initial selection state.");

  collection.Select("2");
  assertEqual(store.Get("hasSelection"), true, "Collection.BindStore should refresh when the bound collection event fires.");

  collection.Update("1", { value: 150 });
  assertEqual(store.Get("totalText"), "$350", "Collection.BindStore should refresh derived summary state.");

  unsubscribeTotal();
  unsubscribeSelection();
  collection.ClearSelection();
  collection.Update("2", { value: 250 });
  assertEqual(store.Get("hasSelection"), true, "Collection.BindStore should stop syncing after unsubscribe.");
  assertEqual(store.Get("totalText"), "$350", "Collection.BindStore should stop updating derived values after unsubscribe.");
}

function testFormStateValidatesClearsAndWatchesStoreErrors() {
  var JOG = loadJOG();
  var store = new JOG.Store({
    name: "",
    stage: "",
    nameError: "",
    stageError: "",
    summary: "",
    isValid: false
  });
  var formState = new JOG.FormState(store, {
    summaryKey: "summary",
    validKey: "isValid",
    validations: [
      {
        errorKey: "nameError",
        validate: function(currentStore) {
          return (currentStore.Get("name") || "").trim().length >= 3 ? "" : "Enter a longer name";
        }
      },
      {
        errorKey: "stageError",
        validate: function(currentStore) {
          return currentStore.Get("stage") ? "" : "Select a stage";
        }
      }
    ]
  });

  assertEqual(formState.Validate(), false, "FormState should report invalid forms.");
  assertEqual(store.Get("nameError"), "Enter a longer name", "FormState should set field errors during validation.");
  assertEqual(store.Get("stageError"), "Select a stage", "FormState should set all configured field errors.");
  assertEqual(store.Get("summary"), "Please fix: Enter a longer name | Select a stage", "FormState should build the configured summary key.");
  assertEqual(store.Get("isValid"), false, "FormState should update the configured valid key.");

  formState.Watch(["name", "stage"]);
  store.Set("name", "Atlas");
  store.Set("stage", "proposal");
  assertEqual(store.Get("nameError"), "", "FormState.Watch should revalidate name when prior errors exist.");
  assertEqual(store.Get("stageError"), "", "FormState.Watch should clear resolved errors.");
  assertEqual(store.Get("summary"), "", "FormState.Watch should clear the summary when validation passes.");
  assertEqual(store.Get("isValid"), true, "FormState.Watch should refresh the valid flag.");

  store.Set("name", "");
  assertEqual(store.Get("nameError"), "", "FormState.Watch should stay quiet until a later invalid run sets errors again.");

  assertEqual(formState.Validate(), false, "FormState should allow explicit revalidation after watch updates.");
  formState.ClearErrors();
  assertEqual(store.Get("nameError"), "", "FormState.ClearErrors should clear field errors.");
  assertEqual(store.Get("stageError"), "", "FormState.ClearErrors should clear every configured field error.");
  assertEqual(store.Get("summary"), "", "FormState.ClearErrors should clear the summary key.");
  assertEqual(store.Get("isValid"), true, "FormState.ClearErrors should mark the form valid.");
}

function testRepeaterRendersCollectionRowsAndRefreshesOnChange() {
  var JOG = loadJOG();
  var app = new JOG.Application();
  var page = new JOG.Page();
  var collection = new JOG.Collection({
    rows: [
      { id: "1", account: "Atlas", stage: "qualified" },
      { id: "2", account: "Northwind", stage: "proposal" }
    ]
  });
  var repeater = new JOG.Repeater();

  repeater.Name = "testRepeater";
  repeater.EmptyText = "No rows.";
  repeater.BindCollection(collection, function(row) {
    var label = new JOG.Label();

    label.Text = row.account + " - " + row.stage;
    return label;
  });

  page.Add(repeater);
  app.Run(page);

  assertEqual(repeater.Children.length, 2, "Repeater should render one child per collection row.");
  assertEqual(repeater.Children[0].Text, "Atlas - qualified", "Repeater should render the first collection row.");

  collection.Update("2", { stage: "negotiation" });
  app.Runtime.flush();
  assertEqual(repeater.Children[1].Text, "Northwind - negotiation", "Repeater should refresh rendered children on collection change.");

  collection.Remove("1");
  app.Runtime.flush();
  assertEqual(repeater.Children.length, 1, "Repeater should remove children for deleted rows.");
  assertEqual(repeater.Children[0].Text, "Northwind - negotiation", "Repeater should keep remaining rows in sync.");

  collection.Remove("2");
  app.Runtime.flush();
  assertEqual(repeater.Children.length, 1, "Repeater should render one empty-state child when the collection is empty.");
  assertEqual(repeater.Children[0].Text, "No rows.", "Repeater should render the configured empty-state label.");
}

function testValidationMessageBindsTextAndVisibility() {
  var JOG = loadJOG();
  var store = new JOG.Store({ fieldError: "" });
  var message = new JOG.ValidationMessage();

  message.BindMessage(store, "fieldError");
  assertEqual(message.Visible, false, "ValidationMessage should start hidden for empty values.");

  store.Set("fieldError", "Required");
  assertEqual(message.Text, "Required", "ValidationMessage should copy error text.");
  assertEqual(message.Visible, true, "ValidationMessage should show when an error exists.");
}

function testValidationSummaryBindsSummaryAndVisibility() {
  var JOG = loadJOG();
  var store = new JOG.Store({ validationSummary: "" });
  var summary = new JOG.ValidationSummary();

  summary.BindSummary(store, "validationSummary");
  assertEqual(summary.Visible, false, "ValidationSummary should start hidden for empty values.");

  store.Set("validationSummary", "Please fix: Required");
  assertEqual(summary.Visible, true, "ValidationSummary should show when a summary exists.");
  assertEqual(summary.Children.length, 1, "ValidationSummary should manage one internal message control.");
  assertEqual(summary.Children[0].Text, "Please fix: Required", "ValidationSummary should bind message text.");
}

function testValidationSummaryCanBuildSummaryFromErrorKeys() {
  var JOG = loadJOG();
  var store = new JOG.Store({
    nameError: "",
    stageError: ""
  });
  var summary = new JOG.ValidationSummary();

  summary.BindErrors(store, ["nameError", "stageError"]);
  assertEqual(summary.Visible, false, "BindErrors should start hidden when all errors are empty.");

  store.Set("nameError", "Enter a name");
  assertEqual(summary.Visible, true, "BindErrors should show when any error exists.");
  assertEqual(summary.Children[0].Text, "Please fix: Enter a name", "BindErrors should use the default summary format.");

  store.Set("stageError", "Select a stage");
  assertEqual(summary.Children[0].Text, "Please fix: Enter a name | Select a stage", "BindErrors should combine multiple error messages.");

  store.Set("nameError", "");
  store.Set("stageError", "");
  assertEqual(summary.Visible, false, "BindErrors should hide again when all errors clear.");
}

function testApplicationDumpTree() {
  var JOG = loadJOG();
  var app = new JOG.Application();
  var page = new JOG.Page();
  var section = new JOG.SectionPanel();
  var label = new JOG.Label();

  page.Name = "mainPage";
  section.Name = "mainSection";
  label.Name = "heroLabel";
  label.Text = "Hello";

  section.Add(label);
  page.Add(section);
  app.Run(page);

  var dump = app.DumpTree();

  assert(dump.indexOf("Page(mainPage)") >= 0, "Tree dump should include page.");
  assert(dump.indexOf("SectionPanel(mainSection)") >= 0, "Tree dump should include nested section.");
  assert(dump.indexOf("Label(heroLabel)") >= 0, "Tree dump should include nested label.");
}

function testApplicationDetailedDumpTreeShowsRicherState() {
  var JOG = loadJOG();
  var app = new JOG.Application();
  var page = new JOG.Page();
  var section = new JOG.SectionPanel();
  var box = new JOG.TextBox();

  page.Name = "mainPage";
  page.Title = "Detailed Page";
  section.Name = "mainSection";
  section.Dock = "fill";
  box.Name = "nameBox";
  box.Text = "Atlas";
  box.Placeholder = "Enter name";
  box.GridColumn = 2;
  box.GridRow = 3;
  box.ColumnSpan = 2;
  box.SetError("Required");

  section.Add(box);
  page.Add(section);
  app.Run(page);

  var dump = app.DumpTree({ detailed: true });

  assert(dump.indexOf('title="Detailed Page"') >= 0, "Detailed tree dump should include page title.");
  assert(dump.indexOf("dock=fill") >= 0, "Detailed tree dump should include dock state.");
  assert(dump.indexOf('text="Atlas"') >= 0, "Detailed tree dump should include text state.");
  assert(dump.indexOf('placeholder="Enter name"') >= 0, "Detailed tree dump should include placeholder state.");
  assert(dump.indexOf("grid=(2,3)") >= 0, "Detailed tree dump should include grid coordinates.");
  assert(dump.indexOf("span=(2,1)") >= 0, "Detailed tree dump should include span values.");
  assert(dump.indexOf("invalid=true") >= 0, "Detailed tree dump should include invalid state.");
  assert(dump.indexOf('error="Required"') >= 0, "Detailed tree dump should include error text.");
}

function testThirdPartyControlRegistrationSupportsMetadataLookupAndVersionChecks() {
  var JOG = loadJOG();

  function SampleControl() {
    JOG.Control.call(this, "SampleControl");
  }

  SampleControl.prototype = Object.create(JOG.Control.prototype);
  SampleControl.prototype.constructor = SampleControl;

  var registration = JOG.RegisterControl({
    fullName: "Acme.SampleControl",
    version: "1.2.0",
    jogVersionRange: "^2.0.0",
    constructor: SampleControl,
    metadata: {
      baseType: "Control",
      properties: ["Value"],
      events: ["OnChange"],
      methods: ["BindValue"]
    }
  });

  assertEqual(registration.fullName, "Acme.SampleControl", "RegisterControl should return the stored full name.");
  assertEqual(registration.metadata.baseType, "Control", "RegisterControl should preserve declared base type.");
  assertEqual(JOG.GetRegisteredControl("Acme.SampleControl").version, "1.2.0", "GetRegisteredControl should look up controls by full name.");
  assertEqual(JOG.GetRegisteredControl(SampleControl).metadata.shortName, "SampleControl", "GetRegisteredControl should also support constructor lookup.");
  assertEqual(JOG.ListRegisteredControls().length, 1, "ListRegisteredControls should enumerate registered controls.");
  assert(JOG.DumpRegisteredControls().indexOf("Acme.SampleControl@1.2.0") >= 0, "DumpRegisteredControls should report full names and versions.");
  assertEqual(JOG.IsVersionCompatible("^2.0.0"), true, "IsVersionCompatible should accept the current major range.");
  assertEqual(JOG.IsVersionCompatible("^3.0.0"), false, "IsVersionCompatible should reject incompatible major ranges.");
}

function testThirdPartyControlRegistrationRejectsDuplicatesAndIncompatibleVersions() {
  var JOG = loadJOG();
  var duplicateThrew = false;
  var incompatibleThrew = false;

  function SampleControl() {
    JOG.Control.call(this, "SampleControl");
  }

  function FutureControl() {
    JOG.Control.call(this, "FutureControl");
  }

  SampleControl.prototype = Object.create(JOG.Control.prototype);
  SampleControl.prototype.constructor = SampleControl;
  FutureControl.prototype = Object.create(JOG.Control.prototype);
  FutureControl.prototype.constructor = FutureControl;

  JOG.RegisterControl({
    fullName: "Acme.SampleControl",
    version: "1.0.0",
    jogVersionRange: "^2.0.0",
    constructor: SampleControl,
    metadata: { baseType: "Control" }
  });

  try {
    JOG.RegisterControl({
      fullName: "Acme.SampleControl",
      version: "1.0.1",
      jogVersionRange: "^2.0.0",
      constructor: SampleControl,
      metadata: { baseType: "Control" }
    });
  } catch (error) {
    duplicateThrew = /already registered/.test(error.message);
  }

  try {
    JOG.RegisterControl({
      fullName: "Acme.FutureControl",
      version: "1.0.0",
      jogVersionRange: "^3.0.0",
      constructor: FutureControl,
      metadata: { baseType: "Control" }
    });
  } catch (error) {
    incompatibleThrew = /unsupported JOG version range/.test(error.message);
  }

  assert(duplicateThrew, "RegisterControl should reject duplicate control names.");
  assert(incompatibleThrew, "RegisterControl should reject incompatible JOG version ranges.");
}

function testSampleThirdPartyControlsRegisterRenderAndBindWithoutPrivateRuntimeAccess() {
  var sandbox = createJOGSandbox();
  var JOG;
  var AcmeJOG;
  var app;
  var page;
  var store;
  var picker;
  var card;
  var label;
  var dump;

  loadScriptIntoSandbox(sandbox, "AcmeJOG.Controls.js");
  JOG = sandbox.JOG;
  AcmeJOG = sandbox.AcmeJOG;

  assertEqual(JOG.ListRegisteredControls().length, 3, "The sample package should register a primitive, a composite container, and a dialog.");
  assertEqual(JOG.GetRegisteredControl("AcmeJOG.TagPicker").metadata.baseType, "Control", "The primitive sample control should register as a Control.");
  assertEqual(JOG.GetRegisteredControl("AcmeJOG.TagPicker").metadata.capabilities.supportsKeyboard, true, "The primitive sample control should advertise keyboard support.");
  assertEqual(JOG.GetRegisteredControl("AcmeJOG.InspectorCard").metadata.baseType, "Container", "The composite sample control should register as a Container.");
  assertEqual(JOG.GetRegisteredControl("AcmeJOG.CommandPaletteDialog").metadata.baseType, "Dialog", "The sample package should also register a dialog control.");

  app = new JOG.Application();
  page = new JOG.Page();
  store = new JOG.Store({ stage: "qualified", stageError: "" });
  picker = new AcmeJOG.TagPicker();
  card = new AcmeJOG.InspectorCard();
  label = new JOG.Label();

  picker.Name = "thirdPartyPicker";
  picker.Items = ["qualified", "proposal", "negotiation"];
  picker.BindValue(store, "stage");
  picker.BindError(store, "stageError");

  card.Name = "thirdPartyCard";
  card.TitleText = "Selection";
  card.FooterText = "Composite host";

  label.Text = "Inside the composite third-party container.";
  card.Add(label);
  page.Add(picker);
  page.Add(card);
  app.Run(page);

  assertEqual(picker._buttonNodes.length, 3, "The third-party picker should render one button per item.");
  assertEqual(picker._domNode.attributes.role, "radiogroup", "The third-party picker should expose a radiogroup role.");
  assertEqual(picker._buttonNodes[0].attributes.role, "radio", "Each third-party picker option should expose a radio role.");
  assertEqual(picker._buttonNodes[0].attributes["aria-checked"], "true", "The selected third-party picker option should expose its checked state.");
  assert(label._domNode.parentNode === card._bodyNode, "The composite third-party container should host ordinary child controls in its custom body node.");

  dispatchNodeClick(picker._buttonNodes[1]);
  app.Runtime.flush();

  assertEqual(picker.Value, "proposal", "The third-party picker should update its value through the public property model.");
  assertEqual(store.Get("stage"), "proposal", "BindValue should keep the store in sync for the third-party picker.");
  assertEqual(picker._buttonNodes[1].className.indexOf("is-selected") >= 0, true, "The selected third-party picker button should render its active style.");

  store.Set("stageError", "Pick a valid stage");
  assertEqual(picker.Invalid, true, "The third-party picker should participate in the shared validation contract.");
  assertEqual(picker.ErrorText, "Pick a valid stage", "BindError should flow error text into the third-party picker.");

  dispatchNodeKeyDown(picker._buttonNodes[1], "ArrowRight");
  app.Runtime.flush();
  assertEqual(picker.Value, "negotiation", "Arrow navigation should move keyboard selection through the third-party picker.");
  assertEqual(store.Get("stage"), "negotiation", "Keyboard navigation should keep bound store state in sync.");
  assertEqual(picker._buttonNodes[2].attributes["aria-checked"], "true", "Keyboard selection should update the exposed checked state.");
  assertEqual(app.Runtime.document.activeElement, picker._buttonNodes[2], "Keyboard navigation should restore focus onto the newly selected third-party picker option after rerender.");

  dispatchNodeKeyDown(picker._buttonNodes[2], "ArrowLeft");
  app.Runtime.flush();
  assertEqual(picker.Value, "proposal", "Arrow navigation should continue working after the control rerenders.");
  assertEqual(app.Runtime.document.activeElement, picker._buttonNodes[1], "Repeated keyboard navigation should keep focus on the current option after rerender.");

  dump = app.DumpTree({ detailed: true });
  assert(dump.indexOf("AcmeJOG.TagPicker(thirdPartyPicker)") >= 0, "Tree dump should use registered third-party control names.");
  assert(dump.indexOf("registered=AcmeJOG.TagPicker@1.0.0") >= 0, "Detailed tree dump should report registered control metadata.");
}

function testThirdPartyDialogUsesPublicWindowShellHooks() {
  var sandbox = createJOGSandbox();
  var JOG;
  var AcmeJOG;
  var app;
  var page;
  var dialog;
  var message;
  var events = [];
  var shell;

  loadScriptIntoSandbox(sandbox, "AcmeJOG.Controls.js");
  JOG = sandbox.JOG;
  AcmeJOG = sandbox.AcmeJOG;

  app = new JOG.Application();
  page = new JOG.Page();
  dialog = new AcmeJOG.CommandPaletteDialog();
  message = new JOG.Label();

  dialog.Name = "thirdPartyDialog";
  dialog.Title = "Review stage";
  dialog.SubtitleText = "Built through the public Window extension surface.";
  dialog.StatusText = "Board mode";
  dialog.FooterNoteText = "Current stage: proposal";
  dialog.ActionText = "Commit";
  dialog.SetBounds(80, 40, 420, 240);
  dialog.Hide();

  message.Text = "Dialog body content should mount inside the custom child host.";
  dialog.Add(message);
  dialog.OnShow(function() {
    events.push("show");
  });
  dialog.OnClose(function() {
    events.push("close");
  });
  dialog.OnCommit(function(args) {
    events.push("commit:" + args.Value);
  });

  page.Add(dialog);
  app.Run(page);

  shell = dialog.GetWindowShell();
  assert(!!shell, "Third-party dialog should expose the stable window shell helper after mount.");
  assertEqual(shell.content.className.indexOf("acme-command-dialog-content") >= 0, true, "Third-party dialog should customize the built-in window content shell.");
  assert(message._domNode.parentNode === dialog._bodyNode, "Third-party dialog children should mount inside the custom body host.");

  dialog.ShowModal();
  app.Runtime.flush();

  assertEqual(events[0], "show", "Showing the third-party dialog should raise the inherited show lifecycle event.");
  assertEqual(app.Runtime._modalWindows.length, 1, "Third-party dialog should participate in the shared modal stack.");
  assertEqual(dialog.Visible, true, "ShowModal should make the third-party dialog visible.");
  assertEqual(shell.title.textContent, "Review stage", "Third-party dialog should reuse the built-in title node through the public shell helper.");
  assertEqual(dialog._statusNode.textContent, "Board mode", "Third-party dialog should apply its custom shell state.");

  dispatchNodeClick(dialog._actionButton);
  app.Runtime.flush();
  assertEqual(events[1], "commit:Commit", "Third-party dialog action button should raise its custom event through the public event helpers.");

  dispatchNodeKeyDown(dialog._domNode, "Escape");
  app.Runtime.flush();
  assertEqual(dialog.Visible, false, "Escape should close the third-party dialog through the inherited window behavior.");
  assertEqual(events[2], "close", "Closing the third-party dialog should raise the inherited close lifecycle event.");
  assertEqual(app.Runtime._modalWindows.length, 0, "Closing the third-party dialog should clear the shared modal stack.");
}

function testThirdPartyControlErrorsReportPackageDiagnosticsClearly() {
  var sandbox = createJOGSandbox({
    console: {
      log: function() {},
      error: function(message) {
        capturedErrors.push(String(message));
      }
    }
  });
  var capturedErrors = [];
  var JOG;
  var AcmeJOG;
  var app;
  var page;
  var picker;
  var thrown = null;

  loadScriptIntoSandbox(sandbox, "AcmeJOG.Controls.js");
  JOG = sandbox.JOG;
  AcmeJOG = sandbox.AcmeJOG;

  app = new JOG.Application();
  page = new JOG.Page();
  picker = new AcmeJOG.TagPicker();

  picker.Items = ["qualified"];
  picker.OnChange(function() {
    throw new Error("Third-party boom");
  });

  page.Add(picker);
  app.Run(page);

  try {
    dispatchNodeClick(picker._buttonNodes[0]);
  } catch (error) {
    thrown = error;
  }

  assert(!!thrown, "Third-party event errors should still throw.");
  assertEqual(thrown.message, "Third-party boom", "Third-party event errors should preserve the original message.");
  assertEqual(capturedErrors.length, 1, "Third-party event errors should produce one formatted runtime error.");
  assert(capturedErrors[0].indexOf("Control: AcmeJOG.TagPicker") >= 0, "Formatted third-party error output should include the registered control name.");
  assert(capturedErrors[0].indexOf("Package: AcmeJOG@1.0.0") >= 0, "Formatted third-party error output should include the package version.");
}

function testMultipleThirdPartyPackagesRegisterAndCoexistCleanly() {
  var sandbox = createJOGSandbox();
  var JOG;
  var AcmeJOG;
  var BeaconJOG;
  var app;
  var page;
  var store;
  var picker;
  var viewSwitch;
  var metricCard;
  var accessoryLabel;
  var dump;

  loadScriptIntoSandbox(sandbox, "AcmeJOG.Controls.js");
  loadScriptIntoSandbox(sandbox, "BeaconJOG.Controls.js");
  JOG = sandbox.JOG;
  AcmeJOG = sandbox.AcmeJOG;
  BeaconJOG = sandbox.BeaconJOG;

  assertEqual(JOG.ListRegisteredControls().length, 5, "Two third-party packages should register five controls side by side.");
  assertEqual(JOG.GetRegisteredControl("BeaconJOG.ViewSwitch").metadata.baseType, "Control", "BeaconJOG.ViewSwitch should register as a Control.");
  assertEqual(JOG.GetRegisteredControl("BeaconJOG.ViewSwitch").metadata.capabilities.supportsKeyboard, true, "BeaconJOG.ViewSwitch should advertise keyboard support.");
  assertEqual(JOG.GetRegisteredControl("BeaconJOG.MetricCard").metadata.baseType, "Container", "BeaconJOG.MetricCard should register as a Container.");
  assert(JOG.DumpRegisteredControls().indexOf("BeaconJOG.ViewSwitch@1.0.0") >= 0, "The registry dump should include the second package.");

  app = new JOG.Application();
  page = new JOG.Page();
  store = new JOG.Store({ stage: "qualified", view: "overview" });
  picker = new AcmeJOG.TagPicker();
  viewSwitch = new BeaconJOG.ViewSwitch();
  metricCard = new BeaconJOG.MetricCard();
  accessoryLabel = new JOG.Label();

  picker.Items = ["qualified", "proposal", "negotiation"];
  picker.BindValue(store, "stage");

  viewSwitch.Name = "beaconViewSwitch";
  viewSwitch.Items = [
    { value: "overview", text: "Overview" },
    { value: "board", text: "Board" },
    { value: "audit", text: "Audit", enabled: false }
  ];
  viewSwitch.BindValue(store, "view");

  metricCard.Name = "beaconMetricCard";
  metricCard.EyebrowText = "Beacon";
  metricCard.ValueText = "overview";
  metricCard.DetailText = "Overview mode";
  metricCard.FooterText = "Composed from core JOG controls.";
  accessoryLabel.Text = "Stage: qualified";
  metricCard.SetAccessory(accessoryLabel);

  viewSwitch.OnChange(function(args) {
    metricCard.ValueText = args.Value;
    metricCard.DetailText = "Current view: " + args.Value;
    accessoryLabel.Text = "Stage: " + store.Get("stage");
  });

  page.Add(picker);
  page.Add(viewSwitch);
  page.Add(metricCard);
  app.Run(page);

  assertEqual(viewSwitch._buttonNodes.length, 3, "The second package primitive control should render all configured options.");
  assertEqual(viewSwitch._domNode.attributes.role, "radiogroup", "BeaconJOG.ViewSwitch should expose radiogroup semantics.");
  assertEqual(viewSwitch._buttonNodes[2].disabled, true, "BeaconJOG.ViewSwitch should honor disabled items.");
  assert(accessoryLabel._domNode.parentNode === metricCard._accessoryHost._domNode, "BeaconJOG.MetricCard should host its accessory through the named slot container.");
  assertEqual(accessoryLabel._domNode.style.position, "", "BeaconJOG.MetricCard accessory content should participate in flow layout instead of absolute overlap.");

  dispatchNodeKeyDown(viewSwitch._buttonNodes[0], "ArrowRight");
  app.Runtime.flush();
  assertEqual(viewSwitch.Value, "board", "BeaconJOG.ViewSwitch should advance keyboard selection to the next enabled item.");
  assertEqual(store.Get("view"), "board", "BeaconJOG.ViewSwitch keyboard selection should keep store state in sync.");
  assertEqual(metricCard.ValueText, "board", "BeaconJOG.MetricCard should reflect view-switch changes through public properties.");
  assertEqual(app.Runtime.document.activeElement, viewSwitch._buttonNodes[1], "BeaconJOG.ViewSwitch should restore focus after rerender.");

  dispatchNodeKeyDown(viewSwitch._buttonNodes[1], "ArrowRight");
  app.Runtime.flush();
  assertEqual(viewSwitch.Value, "overview", "BeaconJOG.ViewSwitch should skip disabled items and wrap to the next enabled option.");
  assertEqual(app.Runtime.document.activeElement, viewSwitch._buttonNodes[0], "Focus should follow the wrapped enabled option.");

  dispatchNodeClick(picker._buttonNodes[2]);
  app.Runtime.flush();
  dispatchNodeKeyDown(viewSwitch._buttonNodes[0], "End");
  app.Runtime.flush();
  assertEqual(viewSwitch.Value, "board", "End should land on the last enabled item when the last configured option is disabled.");
  assertEqual(accessoryLabel.Text, "Stage: negotiation", "The second package composite should stay in sync alongside the first package primitive control.");

  dump = app.DumpTree({ detailed: true });
  assert(dump.indexOf("BeaconJOG.ViewSwitch(beaconViewSwitch)") >= 0, "Tree dump should include the second package primitive control.");
  assert(dump.indexOf("BeaconJOG.MetricCard(beaconMetricCard)") >= 0, "Tree dump should include the second package composite control.");
}

function testLexicalThirdPartyControlRegistersBindsAndSuppressesLoopedUpdates() {
  var sandbox = createJOGSandbox();
  var JOG;
  var LexicalJOG;
  var app;
  var page;
  var store;
  var editor;
  var adapterInstances = [];
  var events = [];
  var focusEvents = [];
  var blurEvents = [];
  var emptyStateJson;
  var dump;

  function serializeFakePlainText(text) {
    if (!text) {
      return LexicalJOG.__EMPTY_EDITOR_STATE_JSON;
    }
    return JSON.stringify({
      root: {
        children: [
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: String(text),
                type: "text",
                version: 1
              }
            ],
            direction: null,
            format: "",
            indent: 0,
            type: "paragraph",
            version: 1
          }
        ],
        direction: null,
        format: "",
        indent: 0,
        type: "root",
        version: 1
      }
    });
  }

  function createFakeLexicalAdapter(options) {
    function isPlainTextEmpty(text) {
      return String(text == null ? "" : text).trim() === "";
    }

    var adapter = {
      _hostNode: null,
      _options: options,
      _value: LexicalJOG.__EMPTY_EDITOR_STATE_JSON,
      _plainText: "",
      _editable: true,
      _disposed: false,
      attach: function(hostNode) {
        this._hostNode = hostNode;
      },
      dispose: function() {
        this._disposed = true;
        this._hostNode = null;
      },
      setEditable: function(editable) {
        this._editable = !!editable;
      },
      setSerializedState: function(serializedValue) {
        this._value = String(serializedValue);
        this._plainText = this._value === LexicalJOG.__EMPTY_EDITOR_STATE_JSON ? "" : this._plainText;
        if (typeof this._options.onChange === "function") {
          this._options.onChange({
            serializedValue: this._value,
            plainText: this._plainText,
            isEmpty: this._value === LexicalJOG.__EMPTY_EDITOR_STATE_JSON,
            originalEvent: null
          });
        }
      },
      setPlainText: function(text) {
        this._plainText = text ? String(text) : "";
        this._value = serializeFakePlainText(this._plainText);
        if (typeof this._options.onChange === "function") {
          this._options.onChange({
            serializedValue: this._value,
            plainText: this._plainText,
            isEmpty: isPlainTextEmpty(this._plainText),
            originalEvent: null
          });
        }
      },
      clear: function() {
        this._value = LexicalJOG.__EMPTY_EDITOR_STATE_JSON;
        this._plainText = "";
        if (typeof this._options.onChange === "function") {
          this._options.onChange({
            serializedValue: this._value,
            plainText: "",
            isEmpty: true,
            originalEvent: null
          });
        }
      },
      getPlainText: function() {
        return this._plainText;
      },
      isEmpty: function() {
        return isPlainTextEmpty(this._plainText);
      },
      focus: function() {
        if (this._hostNode && typeof this._hostNode.focus === "function") {
          this._hostNode.focus();
        }
      },
      simulateUserInput: function(serializedValue) {
        this._value = String(serializedValue);
        this._plainText = this._value === LexicalJOG.__EMPTY_EDITOR_STATE_JSON ? "" : "user note";
        if (typeof this._options.onChange === "function") {
          this._options.onChange({
            serializedValue: this._value,
            plainText: this._plainText,
            isEmpty: isPlainTextEmpty(this._plainText),
            originalEvent: { type: "input" }
          });
        }
      }
    };

    adapterInstances.push(adapter);
    return adapter;
  }

  loadScriptIntoSandbox(sandbox, "LexicalJOG.Controls.js");
  JOG = sandbox.JOG;
  LexicalJOG = sandbox.LexicalJOG;
  LexicalJOG.__setTestingAdapterFactory(createFakeLexicalAdapter);

  assertEqual(JOG.GetRegisteredControl("LexicalJOG.LexicalPlainTextBox").metadata.baseType, "Control", "The Lexical wrapper should register as a Control.");
  assertEqual(JOG.GetRegisteredControl("LexicalJOG.LexicalPlainTextBox").metadata.capabilities.supportsValidation, true, "The Lexical wrapper should advertise validation support.");

  app = new JOG.Application();
  page = new JOG.Page();
  editor = new LexicalJOG.LexicalPlainTextBox();
  emptyStateJson = editor.Value;
  store = new JOG.Store({
    notePlainText: "",
    noteState: emptyStateJson,
    noteError: ""
  });

  editor.Name = "lexicalEditor";
  editor.Placeholder = "Enter account notes";
  editor.BindValue(store, "noteState");
  editor.BindPlainText(store, "notePlainText");
  editor.BindError(store, "noteError");
  editor.OnChange(function(args) {
    events.push(args);
  });
  editor.OnFocus(function(args) {
    focusEvents.push(args);
  });
  editor.OnBlur(function(args) {
    blurEvents.push(args);
  });

  page.Add(editor);
  app.Run(page);

  assertEqual(adapterInstances.length, 1, "The Lexical wrapper should create one adapter instance after attach.");
  assertEqual(editor._domNode.className.indexOf("lexicaljog-plain-text-box") >= 0, true, "The Lexical wrapper should render its package-scoped shell class.");
  assertEqual(editor._placeholderNode.className.indexOf("hidden") < 0, true, "The placeholder should be visible while the editor is empty.");
  assertEqual(adapterInstances[0]._editable, true, "The adapter should start editable when the control is enabled and not read-only.");
  assertEqual(editor._editorHostNode.attributes.contenteditable, "true", "The editor host should expose a contenteditable root while editable.");
  assertEqual(editor._editorHostNode.tabIndex, 0, "The editor host should stay keyboard-focusable while enabled.");
  assertEqual(editor.IsEmpty(), true, "The Lexical wrapper should report empty state when no content exists.");

  store.Set("noteError", "Enter some notes");
  app.Runtime.flush();
  assertEqual(editor.Invalid, true, "The Lexical wrapper should participate in the shared validation contract.");
  assertEqual(editor.ErrorText, "Enter some notes", "BindError should update the Lexical wrapper error text.");
  assertEqual(editor._editorHostNode.attributes["aria-invalid"], "true", "Invalid state should flow into the editable host for accessibility.");

  editor.Focus();
  assertEqual(app.Runtime.document.activeElement, editor._editorHostNode, "Focus should route to the editor host node.");
  editor._focusInHandler({ type: "focusin" });
  assertEqual(focusEvents.length, 1, "Focus should raise one public focus event.");
  assertEqual(focusEvents[0].Value, emptyStateJson, "Focus should expose the current canonical JSON value.");
  assertEqual(focusEvents[0].PlainText, "", "Focus should expose the current plain-text value.");

  adapterInstances[0].simulateUserInput('{"root":{"children":[{"children":[],"direction":null,"format":"","indent":0,"type":"paragraph","version":1,"textFormat":0,"textStyle":"","textStyleHash":"0","childrenSize":0}],"direction":null,"format":"","indent":0,"type":"root","version":1}}');
  app.Runtime.flush();

  assertEqual(events.length, 1, "User-driven editor changes should raise one public change event.");
  assertEqual(store.Get("noteState"), events[0].Value, "BindValue should keep the bound store key in sync with the Lexical wrapper.");
  assertEqual(store.Get("notePlainText"), "user note", "BindPlainText should keep the bound plain-text key in sync with user edits.");
  assertEqual(events[0].PlainText, "user note", "The fake adapter should expose plain-text data through the public change event.");
  assertEqual(editor._placeholderNode.className.indexOf("hidden") >= 0, true, "The placeholder should hide once the editor is non-empty.");
  assertEqual(editor.IsEmpty(), false, "The Lexical wrapper should report non-empty state after user content.");
  assertEqual(editor.GetPlainText(), "user note", "GetPlainText should expose the current adapter text.");

  editor.SetPlainText("plain note");
  app.Runtime.flush();
  assertEqual(editor.GetPlainText(), "plain note", "SetPlainText should update the wrapper through the public plain-text surface.");
  assertEqual(store.Get("noteState"), editor.Value, "SetPlainText should still keep the bound store key aligned with the canonical JSON Value.");
  assertEqual(store.Get("notePlainText"), "plain note", "SetPlainText should also keep the bound plain-text key aligned with the edited text.");
  assertEqual(events.length, 2, "SetPlainText should emit a public change because it performs an explicit editor edit.");
  assertEqual(events[1].PlainText, "plain note", "SetPlainText should expose the edited plain text through the public change payload.");

  adapterInstances[0].setPlainText("   ");
  app.Runtime.flush();
  assertEqual(editor.IsEmpty(), true, "Whitespace-only Lexical content should still count as empty for validation.");
  assertEqual(events.length, 3, "Whitespace-only editor edits should still raise one public change event.");
  assertEqual(events[2].PlainText, "   ", "Whitespace-only editor edits should preserve the raw plain-text payload.");

  store.Set("noteState", emptyStateJson);
  app.Runtime.flush();
  assertEqual(events.length, 3, "Externally-driven value writes should not echo back through OnChange.");
  assertEqual(editor._placeholderNode.className.indexOf("hidden") < 0, true, "Reapplying the empty editor state should restore the placeholder.");

  store.Set("notePlainText", "store note");
  app.Runtime.flush();
  assertEqual(editor.GetPlainText(), "store note", "Externally-driven plain-text writes should update the wrapper through BindPlainText.");
  assertEqual(events.length, 3, "Externally-driven plain-text writes should not echo back through OnChange.");
  assertEqual(store.Get("noteState"), editor.Value, "Externally-driven plain-text writes should still update the canonical JSON Value.");

  editor.ReadOnly = true;
  app.Runtime.flush();
  assertEqual(adapterInstances[0]._editable, false, "ReadOnly should switch the editor adapter into non-editable mode.");
  assertEqual(editor._domNode.className.indexOf("is-readonly") >= 0, true, "ReadOnly should apply the wrapper read-only class.");
  assertEqual(editor._editorHostNode.attributes["aria-readonly"], "true", "ReadOnly should flow into the editable host for accessibility.");
  assertEqual(editor._editorHostNode.attributes.contenteditable, "false", "ReadOnly should flip the contenteditable root off.");

  editor._focusOutHandler({ type: "focusout" });
  assertEqual(blurEvents.length, 1, "Blur should raise one public blur event.");
  assertEqual(blurEvents[0].PlainText, "store note", "Blur should expose the current plain-text value.");

  editor.Clear();
  app.Runtime.flush();
  assertEqual(editor.Value, emptyStateJson, "Clear should restore the canonical empty editor state JSON.");
  assertEqual(editor.Invalid, false, "Clear should also clear the shared validation state.");
  assertEqual(editor.IsEmpty(), true, "Clear should restore the empty-state signal.");
  assertEqual(editor._editorHostNode.attributes["aria-invalid"], "false", "Clearing the error state should also clear aria-invalid on the editable host.");

  dump = app.DumpTree({ detailed: true });
  assert(dump.indexOf("LexicalJOG.LexicalPlainTextBox(lexicalEditor)") >= 0, "Tree dump should report the Lexical wrapper by its registered third-party name.");
  assert(dump.indexOf("registered=LexicalJOG.LexicalPlainTextBox@1.0.0") >= 0, "Detailed tree dump should include Lexical wrapper package metadata.");

  editor.Dispose();
  assertEqual(adapterInstances[0]._disposed, true, "Disposing the control should dispose the underlying adapter.");
  LexicalJOG.__setTestingAdapterFactory(null);
}

function testLexicalRichTextThirdPartyControlSupportsFormattingCommands() {
  var sandbox = createJOGSandbox();
  var JOG;
  var LexicalJOG;
  var app;
  var page;
  var store;
  var editor;
  var adapterInstances = [];
  var events = [];

  function serializeFakeRichText(text, formats) {
    var activeFormats = Array.isArray(formats) ? formats.slice().sort() : [];

    if (!text && activeFormats.length === 0) {
      return LexicalJOG.__EMPTY_EDITOR_STATE_JSON;
    }
    return JSON.stringify({
      root: {
        children: [
          {
            children: text ? [
              {
                detail: 0,
                format: activeFormats.join(","),
                mode: "normal",
                style: "",
                text: String(text),
                type: "text",
                version: 1
              }
            ] : [],
            direction: null,
            format: "",
            indent: 0,
            type: "paragraph",
            version: 1
          }
        ],
        direction: null,
        format: "",
        indent: 0,
        type: "root",
        version: 1
      }
    });
  }

  function isPlainTextEmpty(text) {
    return String(text == null ? "" : text).trim() === "";
  }

  function createFakeLexicalAdapter(options) {
    var adapter = {
      _hostNode: null,
      _options: options,
      _mode: options.mode || "plainText",
      _plainText: "",
      _formats: [],
      _value: LexicalJOG.__EMPTY_EDITOR_STATE_JSON,
      _editable: options.editable !== false,
      _disposed: false,
      attach: function(hostNode) {
        this._hostNode = hostNode;
      },
      dispose: function() {
        this._disposed = true;
      },
      setEditable: function(editable) {
        this._editable = !!editable;
      },
      setSerializedState: function(serializedValue) {
        this._value = String(serializedValue);
        this._plainText = this._value === LexicalJOG.__EMPTY_EDITOR_STATE_JSON ? "" : this._plainText;
      },
      setPlainText: function(text) {
        this._plainText = text ? String(text) : "";
        this._value = serializeFakeRichText(this._plainText, this._formats);
        if (typeof this._options.onChange === "function") {
          this._options.onChange({
            serializedValue: this._value,
            plainText: this._plainText,
            isEmpty: isPlainTextEmpty(this._plainText),
            originalEvent: null
          });
        }
      },
      clear: function() {
        this._plainText = "";
        this._formats = [];
        this._value = LexicalJOG.__EMPTY_EDITOR_STATE_JSON;
        if (typeof this._options.onChange === "function") {
          this._options.onChange({
            serializedValue: this._value,
            plainText: "",
            isEmpty: true,
            originalEvent: null
          });
        }
      },
      getPlainText: function() {
        return this._plainText;
      },
      isEmpty: function() {
        return isPlainTextEmpty(this._plainText);
      },
      formatText: function(formatType) {
        var index = this._formats.indexOf(formatType);

        if (index >= 0) {
          this._formats.splice(index, 1);
        } else {
          this._formats.push(formatType);
        }
        this._value = serializeFakeRichText(this._plainText, this._formats);
        if (typeof this._options.onChange === "function") {
          this._options.onChange({
            serializedValue: this._value,
            plainText: this._plainText,
            isEmpty: isPlainTextEmpty(this._plainText),
            originalEvent: { type: "command", formatType: formatType }
          });
        }
        return true;
      },
      focus: function() {
        if (this._hostNode && typeof this._hostNode.focus === "function") {
          this._hostNode.focus();
        }
      },
      simulateUserInput: function(text, formats) {
        this._plainText = text == null ? "" : String(text);
        this._formats = Array.isArray(formats) ? formats.slice() : [];
        this._value = serializeFakeRichText(this._plainText, this._formats);
        if (typeof this._options.onChange === "function") {
          this._options.onChange({
            serializedValue: this._value,
            plainText: this._plainText,
            isEmpty: isPlainTextEmpty(this._plainText),
            originalEvent: { type: "input" }
          });
        }
      }
    };

    adapterInstances.push(adapter);
    return adapter;
  }

  loadScriptIntoSandbox(sandbox, "LexicalJOG.Controls.js");
  JOG = sandbox.JOG;
  LexicalJOG = sandbox.LexicalJOG;
  LexicalJOG.__setTestingAdapterFactory(createFakeLexicalAdapter);

  assertEqual(JOG.GetRegisteredControl("LexicalJOG.LexicalRichTextBox").metadata.baseType, "Control", "The Lexical rich-text wrapper should register as a Control.");
  assertEqual(JOG.GetRegisteredControl("LexicalJOG.LexicalRichTextBox").metadata.capabilities.supportsRichText, true, "The Lexical rich-text wrapper should advertise rich-text support.");

  app = new JOG.Application();
  page = new JOG.Page();
  editor = new LexicalJOG.LexicalRichTextBox();
  store = new JOG.Store({
    notePlainText: "",
    noteState: editor.Value
  });

  editor.Name = "lexicalRichTextEditor";
  editor.Placeholder = "Write formatted notes";
  editor.BindValue(store, "noteState");
  editor.BindPlainText(store, "notePlainText");
  editor.OnChange(function(args) {
    events.push(args);
  });

  page.Add(editor);
  app.Run(page);

  assertEqual(adapterInstances.length, 1, "The Lexical rich-text wrapper should create one adapter instance after attach.");
  assertEqual(adapterInstances[0]._mode, "richText", "The Lexical rich-text wrapper should create the adapter in rich-text mode.");
  assertEqual(editor._domNode.className.indexOf("lexicaljog-rich-text-box") >= 0, true, "The Lexical rich-text wrapper should render its package-scoped shell class.");

  adapterInstances[0].simulateUserInput("Board-approved terms", []);
  app.Runtime.flush();

  assertEqual(events.length, 1, "User-driven rich-text edits should raise one public change event.");
  assertEqual(editor.GetPlainText(), "Board-approved terms", "The Lexical rich-text wrapper should still expose the current plain text.");
  assertEqual(store.Get("notePlainText"), "Board-approved terms", "BindPlainText should stay aligned for the rich-text wrapper.");

  editor.ToggleBold();
  app.Runtime.flush();
  assertEqual(events.length, 2, "Toggling bold should raise one public change event.");
  assertEqual(events[1].PlainText, "Board-approved terms", "Formatting commands should preserve the public plain-text payload.");
  assert(events[1].Value.indexOf('"format":"bold"') >= 0, "Toggling bold should update the canonical JSON Value.");
  assertEqual(store.Get("notePlainText"), "Board-approved terms", "Formatting commands should not disturb the bound plain-text store key.");

  editor.ToggleItalic();
  app.Runtime.flush();
  assertEqual(events.length, 3, "Toggling italic should raise one public change event.");
  assert(events[2].Value.indexOf('"format":"bold,italic"') >= 0 || events[2].Value.indexOf('"format":"italic,bold"') >= 0, "Multiple formatting commands should accumulate in the canonical JSON Value.");

  editor.FormatText("underline");
  app.Runtime.flush();
  assertEqual(events.length, 4, "Formatting underline through the generic command API should raise one public change event.");
  assert(events[3].Value.indexOf("underline") >= 0, "Underline formatting should update the canonical JSON Value through the generic command API.");

  assertEqual(editor.FormatText("unknown"), false, "Unknown formatting commands should be rejected by the public rich-text wrapper.");
  assertEqual(events.length, 4, "Rejected formatting commands should not emit extra change events.");

  store.Set("notePlainText", "Plain text reset");
  app.Runtime.flush();
  assertEqual(editor.GetPlainText(), "Plain text reset", "Externally-driven plain-text writes should still work for the rich-text wrapper.");

  editor.Dispose();
  assertEqual(adapterInstances[0]._disposed, true, "Disposing the rich-text wrapper should dispose the underlying adapter.");
  LexicalJOG.__setTestingAdapterFactory(null);
}

function testFlatpickrThirdPartyControlRegistersBindsAndSuppressesLoopedUpdates() {
  var sandbox = createJOGSandbox();
  var JOG;
  var FlatpickrJOG;
  var app;
  var page;
  var store;
  var picker;
  var adapterInstances = [];
  var changes = [];
  var opens = 0;
  var closes = 0;
  var dump;

  function createFakeFlatpickrAdapter(options) {
    var adapter = {
      _hostNode: null,
      _options: options,
      _value: options.value || "",
      _minDate: options.minDate || "",
      _maxDate: options.maxDate || "",
      _placeholder: options.placeholder || "",
      _enabled: options.enabled !== false,
      _readOnly: options.readOnly === true,
      _disposed: false,
      attach: function(hostNode) {
        this._hostNode = hostNode;
        this.setPlaceholder(this._placeholder);
        this.setInteractive(this._enabled, this._readOnly);
      },
      dispose: function() {
        this._disposed = true;
        this._hostNode = null;
      },
      setValue: function(value) {
        this._value = value == null ? "" : String(value);
        if (typeof this._options.onChange === "function") {
          this._options.onChange({
            value: this._value,
            isEmpty: !this._value,
            originalEvent: null
          });
        }
      },
      setMinDate: function(value) {
        this._minDate = value == null ? "" : String(value);
      },
      setMaxDate: function(value) {
        this._maxDate = value == null ? "" : String(value);
      },
      setPlaceholder: function(value) {
        this._placeholder = value == null ? "" : String(value);
        if (this._hostNode) {
          this._hostNode.placeholder = this._placeholder;
        }
      },
      setInteractive: function(enabled, readOnly) {
        this._enabled = !!enabled;
        this._readOnly = !!readOnly;
        if (this._hostNode) {
          this._hostNode.disabled = !this._enabled;
          this._hostNode.readOnly = !this._enabled || this._readOnly;
          this._hostNode.setAttribute("aria-readonly", !this._enabled || this._readOnly ? "true" : "false");
        }
      },
      clear: function() {
        this._value = "";
        if (typeof this._options.onChange === "function") {
          this._options.onChange({
            value: "",
            isEmpty: true,
            originalEvent: null
          });
        }
      },
      getValue: function() {
        return this._value;
      },
      isEmpty: function() {
        return !this._value;
      },
      focus: function() {
        if (this._hostNode && typeof this._hostNode.focus === "function") {
          this._hostNode.focus();
        }
      },
      open: function() {
        if (typeof this._options.onOpen === "function") {
          this._options.onOpen({ originalEvent: null });
        }
      },
      close: function() {
        if (typeof this._options.onClose === "function") {
          this._options.onClose({ originalEvent: null });
        }
      },
      simulateUserInput: function(value) {
        this._value = value == null ? "" : String(value);
        if (typeof this._options.onChange === "function") {
          this._options.onChange({
            value: this._value,
            isEmpty: !this._value,
            originalEvent: { type: "change" }
          });
        }
      }
    };

    adapterInstances.push(adapter);
    return adapter;
  }

  loadScriptIntoSandbox(sandbox, "FlatpickrJOG.Controls.js");
  JOG = sandbox.JOG;
  FlatpickrJOG = sandbox.FlatpickrJOG;
  FlatpickrJOG.__setTestingAdapterFactory(createFakeFlatpickrAdapter);

  assertEqual(JOG.GetRegisteredControl("FlatpickrJOG.DatePicker").metadata.baseType, "Control", "The Flatpickr wrapper should register as a Control.");
  assertEqual(JOG.GetRegisteredControl("FlatpickrJOG.DatePicker").metadata.capabilities.supportsValidation, true, "The Flatpickr wrapper should advertise validation support.");

  app = new JOG.Application();
  page = new JOG.Page();
  picker = new FlatpickrJOG.DatePicker();
  store = new JOG.Store({
    followUpDate: "",
    followUpDateError: ""
  });

  picker.Name = "flatpickrDatePicker";
  picker.Placeholder = "Choose the next follow-up date";
  picker.MinDate = "2026-07-01";
  picker.MaxDate = "2026-12-31";
  picker.BindValue(store, "followUpDate");
  picker.BindError(store, "followUpDateError");
  picker.OnChange(function(args) {
    changes.push(args.Value);
  });
  picker.OnOpen(function() {
    opens += 1;
  });
  picker.OnClose(function() {
    closes += 1;
  });

  page.Add(picker);
  app.Run(page);

  assertEqual(adapterInstances.length, 1, "The Flatpickr wrapper should create one adapter instance after attach.");
  assertEqual(picker._domNode.className.indexOf("flatpickrjog-date-picker") >= 0, true, "The Flatpickr wrapper should render its package-scoped shell class.");
  assertEqual(picker._inputNode.placeholder, "Choose the next follow-up date", "The Flatpickr wrapper should flow placeholder state into the hosted input.");
  assertEqual(adapterInstances[0]._minDate, "2026-07-01", "The Flatpickr wrapper should apply the initial min date constraint.");
  assertEqual(adapterInstances[0]._maxDate, "2026-12-31", "The Flatpickr wrapper should apply the initial max date constraint.");
  assertEqual(adapterInstances[0]._enabled, true, "The Flatpickr wrapper should start enabled.");
  assertEqual(adapterInstances[0]._readOnly, false, "The Flatpickr wrapper should start editable when not read-only.");
  assertEqual(picker.IsEmpty(), true, "The Flatpickr wrapper should report empty state when no date is selected.");

  store.Set("followUpDateError", "Pick a valid follow-up date");
  assertEqual(picker.Invalid, true, "The Flatpickr wrapper should participate in the shared validation contract.");
  assertEqual(picker.ErrorText, "Pick a valid follow-up date", "BindError should update the Flatpickr wrapper error text.");

  picker.Focus();
  assertEqual(app.Runtime.document.activeElement, picker._inputNode, "Focus should route to the hosted Flatpickr input.");

  picker.Open();
  app.Runtime.flush();
  assertEqual(opens, 1, "Open should raise one public open event.");
  assertEqual(picker._domNode.className.indexOf("is-open") >= 0, true, "Open should apply the wrapper open class.");

  adapterInstances[0].simulateUserInput("2026-07-18");
  app.Runtime.flush();
  assertEqual(changes.length, 1, "User-driven date changes should raise one public change event.");
  assertEqual(changes[0], "2026-07-18", "The Flatpickr wrapper should emit the canonical date string through OnChange.");
  assertEqual(store.Get("followUpDate"), "2026-07-18", "BindValue should keep the bound store key in sync with the Flatpickr wrapper.");
  assertEqual(picker.IsEmpty(), false, "The Flatpickr wrapper should report non-empty state after user selection.");

  picker.Close();
  app.Runtime.flush();
  assertEqual(closes, 1, "Close should raise one public close event.");
  assertEqual(picker._domNode.className.indexOf("is-open") < 0, true, "Close should remove the wrapper open class.");

  store.Set("followUpDate", "2026-08-05");
  app.Runtime.flush();
  assertEqual(changes.length, 1, "Externally-driven value writes should not echo back through OnChange.");
  assertEqual(picker.Value, "2026-08-05", "External store writes should still update the wrapper value.");

  picker.ReadOnly = true;
  app.Runtime.flush();
  assertEqual(adapterInstances[0]._readOnly, true, "ReadOnly should switch the adapter into non-editable mode.");
  assertEqual(picker._domNode.className.indexOf("is-readonly") >= 0, true, "ReadOnly should apply the wrapper read-only class.");
  assertEqual(picker._inputNode.readOnly, true, "ReadOnly should flip the hosted input into read-only mode.");

  picker.Clear();
  app.Runtime.flush();
  assertEqual(picker.Value, "", "Clear should restore the canonical empty date value.");
  assertEqual(picker.Invalid, false, "Clear should also clear the shared validation state.");
  assertEqual(picker.IsEmpty(), true, "Clear should restore the empty-state signal.");

  dump = app.DumpTree({ detailed: true });
  assert(dump.indexOf("FlatpickrJOG.DatePicker(flatpickrDatePicker)") >= 0, "Tree dump should report the Flatpickr wrapper by its registered third-party name.");
  assert(dump.indexOf("registered=FlatpickrJOG.DatePicker@1.0.0") >= 0, "Detailed tree dump should include Flatpickr wrapper package metadata.");

  picker.Dispose();
  assertEqual(adapterInstances[0]._disposed, true, "Disposing the control should dispose the underlying Flatpickr adapter.");
  FlatpickrJOG.__setTestingAdapterFactory(null);
}

function testChartThirdPartyControlRegistersBindsAndRefreshesFromCollection() {
  var sandbox = createJOGSandbox();
  var JOG;
  var ChartJOG;
  var app;
  var page;
  var chart;
  var collection;
  var adapterInstances = [];
  var pointClicks = [];
  var dump;

  function createFakeChartAdapter(options) {
    var adapter = {
      _canvasNode: null,
      _rootNode: null,
      _options: options,
      _config: options.config || null,
      _disposed: false,
      attach: function(canvasNode, rootNode) {
        this._canvasNode = canvasNode;
        this._rootNode = rootNode;
      },
      dispose: function() {
        this._disposed = true;
        this._canvasNode = null;
        this._rootNode = null;
      },
      setConfig: function(config) {
        this._config = config;
      },
      simulatePointClick: function(index) {
        var model = this._config && this._config.model ? this._config.model : { items: [], labels: [], values: [] };

        if (typeof this._options.onPointClick === "function") {
          this._options.onPointClick({
            index: index,
            item: model.items[index] || null,
            label: model.labels[index] || "",
            value: model.values[index] || 0,
            originalEvent: { type: "click" }
          });
        }
      }
    };

    adapterInstances.push(adapter);
    return adapter;
  }

  loadScriptIntoSandbox(sandbox, "ChartJOG.Controls.js");
  JOG = sandbox.JOG;
  ChartJOG = sandbox.ChartJOG;
  ChartJOG.__setTestingAdapterFactory(createFakeChartAdapter);

  assertEqual(JOG.GetRegisteredControl("ChartJOG.BarChart").metadata.baseType, "Control", "The Chart wrapper should register as a Control.");
  assertEqual(JOG.GetRegisteredControl("ChartJOG.BarChart").metadata.capabilities.supportsCollection, true, "The Chart wrapper should advertise collection support.");

  app = new JOG.Application();
  page = new JOG.Page();
  collection = new JOG.Collection({
    rows: [
      { id: "qualified", stage: "Qualified", count: 12 },
      { id: "proposal", stage: "Proposal", count: 7 }
    ]
  });
  chart = new ChartJOG.BarChart();

  chart.Name = "pipelineChart";
  chart.TitleText = "Open pipeline by stage";
  chart.SeriesLabel = "Open deals";
  chart.EmptyText = "No pipeline data available.";
  chart.BindCollection(collection, {
    labelField: "stage",
    valueField: "count"
  });
  chart.OnPointClick(function(args) {
    pointClicks.push(args);
  });

  page.Add(chart);
  app.Run(page);

  assertEqual(adapterInstances.length, 1, "The Chart wrapper should create one adapter instance after attach.");
  assertEqual(chart._domNode.className.indexOf("chartjog-bar-chart") >= 0, true, "The Chart wrapper should render its package-scoped shell class.");
  assertEqual(chart.Items.length, 2, "BindCollection should hydrate Items from the collection on mount.");
  assertEqual(adapterInstances[0]._config.model.labels[0], "Qualified", "The chart adapter config should map labels from the configured field.");
  assertEqual(adapterInstances[0]._config.model.values[1], 7, "The chart adapter config should map values from the configured field.");
  assertEqual(chart._emptyNode.className.indexOf("hidden") >= 0, true, "The empty-state label should hide when rows exist.");

  collection.Update("proposal", { count: 9 });
  app.Runtime.flush();

  assertEqual(chart.Items[1].count, 9, "Collection updates should refresh the chart Items property.");
  assertEqual(adapterInstances[0]._config.model.values[1], 9, "Collection updates should rebuild the adapter config.");

  adapterInstances[0].simulatePointClick(1);
  app.Runtime.flush();

  assertEqual(pointClicks.length, 1, "Chart point clicks should raise one public event.");
  assertEqual(pointClicks[0].Label, "Proposal", "PointClick should expose the clicked label.");
  assertEqual(pointClicks[0].Value, 9, "PointClick should expose the clicked value.");
  assertEqual(pointClicks[0].Item.count, 9, "PointClick should expose the clicked source item.");

  collection.SetRows([]);
  app.Runtime.flush();

  assertEqual(chart.Items.length, 0, "Clearing the collection should clear chart Items.");
  assertEqual(chart._emptyNode.className.indexOf("hidden") < 0, true, "The empty-state label should show when no rows remain.");

  dump = app.DumpTree({ detailed: true });
  assert(dump.indexOf("ChartJOG.BarChart(pipelineChart)") >= 0, "Tree dump should report the Chart wrapper by its registered third-party name.");
  assert(dump.indexOf("registered=ChartJOG.BarChart@1.0.0") >= 0, "Detailed tree dump should include Chart wrapper package metadata.");

  chart.Dispose();
  assertEqual(adapterInstances[0]._disposed, true, "Disposing the control should dispose the underlying chart adapter.");
  ChartJOG.__setTestingAdapterFactory(null);
}

function testGridSupportsNamedAreasAndAutoRows() {
  var JOG = loadJOG();
  var app = new JOG.Application();
  var page = new JOG.Page();
  var grid = new JOG.Grid();
  var title = new JOG.Label();
  var sidebar = new JOG.SectionPanel();

  grid.Name = "dashboardGrid";
  grid.Columns = ["220px", "1fr"];
  grid.Areas = '"sidebar title"';
  grid.AutoRows = "minmax(48px, auto)";
  grid.AutoFlow = "row dense";

  title.Name = "dashboardTitle";
  title.GridArea = "title";
  title.Text = "Revenue";

  sidebar.Name = "dashboardSidebar";
  sidebar.GridArea = "sidebar";
  sidebar.Title = "Filters";

  grid.Add(sidebar);
  grid.Add(title);
  page.Add(grid);
  app.Run(page);

  assertEqual(grid._domNode.style.gridTemplateAreas, '"sidebar title"', "Grid should render named areas.");
  assertEqual(grid._domNode.style.gridAutoRows, "minmax(48px, auto)", "Grid should render automatic row sizing.");
  assertEqual(grid._domNode.style.gridAutoFlow, "row dense", "Grid should render automatic flow mode.");
  assertEqual(title._domNode.style.gridArea, "title", "Child should render named grid area placement.");
  assertEqual(title._domNode.style.gridColumn, "", "Named area placement should clear explicit grid columns.");
}

function testGridResponsiveBreakpointsApplyOnMountAndResize() {
  var sandbox = createJOGSandbox({ innerWidth: 540 });
  var JOG = sandbox.JOG;
  var app = new JOG.Application();
  var page = new JOG.Page();
  var grid = new JOG.Grid();
  var label = new JOG.Label();
  var input = new JOG.TextBox();

  grid.Name = "responsiveGrid";
  grid.Columns = ["160px", "1fr"];
  grid.ColumnGap = 18;
  grid.Responsive = {
    base: { columns: ["1fr"], columnGap: 10 },
    md: { columns: ["160px", "1fr"], columnGap: 18 }
  };

  label.Name = "responsiveLabel";
  label.Text = "Name";
  label.GridColumn = 1;
  label.GridRow = 1;

  input.Name = "responsiveInput";
  input.GridColumn = 2;
  input.GridRow = 1;
  input.ResponsiveGrid = {
    base: { column: 1, row: 2 },
    md: { column: 2, row: 1 }
  };

  grid.Add(label);
  grid.Add(input);
  page.Add(grid);
  app.Run(page);

  assertEqual(grid._domNode.style.gridTemplateColumns, "1fr", "Responsive grid should use base columns on narrow mount.");
  assertEqual(grid._domNode.style.columnGap, "10px", "Responsive grid should use base gap on narrow mount.");
  assertEqual(input._domNode.style.gridColumn, "1 / span 1", "Responsive child should move into the single mobile column.");
  assertEqual(input._domNode.style.gridRow, "2 / span 1", "Responsive child should move to the stacked mobile row.");

  dispatchWindowResize(sandbox, 960);
  app.Runtime.flush();

  assertEqual(grid._domNode.style.gridTemplateColumns, "160px 1fr", "Responsive grid should restore desktop columns after resize.");
  assertEqual(grid._domNode.style.columnGap, "18px", "Responsive grid should restore desktop gap after resize.");
  assertEqual(input._domNode.style.gridColumn, "2 / span 1", "Responsive child should return to desktop column placement.");
  assertEqual(input._domNode.style.gridRow, "1 / span 1", "Responsive child should return to desktop row placement.");
}

function testResponsiveDockAndStackLayoutsApplyOnMountAndResize() {
  var sandbox = createJOGSandbox({ innerWidth: 540 });
  var JOG = sandbox.JOG;
  var app = new JOG.Application();
  var page = new JOG.Page();
  var shell = new JOG.DockPanel();
  var sidebar = new JOG.SectionPanel();
  var content = new JOG.SectionPanel();
  var actionRow = new JOG.StackPanel();

  shell.Width = 900;
  shell.Height = 600;
  shell.Padding = 24;
  shell.Gap = 14;
  shell.ResponsiveLayout = {
    base: { padding: 12, gap: 10 },
    md: { padding: 24, gap: 14 }
  };

  sidebar.Title = "Sidebar";
  sidebar.Dock = "left";
  sidebar.Width = 220;
  sidebar.ResponsiveLayout = {
    base: { dock: "top", width: null, height: 120, gap: 10 },
    md: { dock: "left", width: 220, height: null, gap: 20 }
  };

  content.Title = "Content";
  content.Dock = "fill";

  actionRow.Name = "responsiveActionRow";
  actionRow.Orientation = "horizontal";
  actionRow.Responsive = {
    base: { orientation: "vertical", gap: 12 },
    md: { orientation: "horizontal", gap: 8 }
  };
  actionRow.Add(new JOG.Button());
  actionRow.Add(new JOG.Button());

  content.Add(actionRow);
  shell.Add(sidebar);
  shell.Add(content);
  page.Add(shell);
  app.Run(page);

  assertEqual(sidebar._domNode.style.top, "12px", "Responsive dock child should dock to the top on narrow mount.");
  assertEqual(sidebar._domNode.style.height, "120px", "Responsive dock child should use mobile height on narrow mount.");
  assertEqual(content._domNode.style.top, "142px", "DockPanel should place fill content after responsive mobile dock gap.");
  assertEqual(actionRow._domNode.className.indexOf("vertical") >= 0, true, "Responsive StackPanel should switch to vertical on narrow mount.");
  assertEqual(actionRow._domNode.style.gap, "12px", "Responsive StackPanel should use its mobile gap on narrow mount.");

  dispatchWindowResize(sandbox, 980);
  app.Runtime.flush();

  assertEqual(sidebar._domNode.style.left, "24px", "Responsive dock child should dock left on wider resize.");
  assertEqual(sidebar._domNode.style.width, "220px", "Responsive dock child should restore desktop width on wider resize.");
  assertEqual(content._domNode.style.left, "264px", "DockPanel should place fill content after responsive desktop dock gap.");
  assertEqual(actionRow._domNode.className.indexOf("horizontal") >= 0, true, "Responsive StackPanel should return to horizontal on wider resize.");
  assertEqual(actionRow._domNode.style.gap, "8px", "Responsive StackPanel should restore desktop gap on wider resize.");
}

function testDockPanelGapSupportsShellSpacingOnMountAndResize() {
  var sandbox = createJOGSandbox({ innerWidth: 540 });
  var JOG = sandbox.JOG;
  var app = new JOG.Application();
  var page = new JOG.Page();
  var shell = new JOG.DockPanel();
  var header = new JOG.PageHeader();
  var sidebar = new JOG.SectionPanel();
  var content = new JOG.SectionPanel();

  shell.Width = 960;
  shell.Height = 640;
  shell.Padding = 20;
  shell.Gap = 12;
  shell.ResponsiveLayout = {
    base: { padding: 12, gap: 8 },
    md: { padding: 20, gap: 12 }
  };

  header.Dock = "top";
  header.Height = 90;
  header.Gap = 10;
  header.TitleText = "Shell";
  header.SubtitleText = "Gap test";

  sidebar.Dock = "left";
  sidebar.Width = 220;
  sidebar.Gap = 24;
  sidebar.ResponsiveLayout = {
    base: {
      dock: "top",
      width: null,
      height: 120,
      gap: 16
    },
    md: {
      dock: "left",
      width: 220,
      height: null,
      gap: 24
    }
  };

  content.Dock = "fill";

  shell.Add(header);
  shell.Add(sidebar);
  shell.Add(content);
  page.Add(shell);
  app.Run(page);

  assertEqual(content._domNode.style.top, "248px", "DockPanel should stack top-docked regions using child gap overrides on narrow mount.");
  assertEqual(content._domNode.style.left, "12px", "DockPanel should keep fill content aligned to shell padding until a left dock is active.");

  dispatchWindowResize(sandbox, 980);
  app.Runtime.flush();

  assertEqual(content._domNode.style.top, "120px", "DockPanel should preserve header gap after responsive resize.");
  assertEqual(content._domNode.style.left, "264px", "DockPanel should preserve left-dock gap after responsive resize.");
}

function testWorkspaceShellAssignsSlotsAndMaintainsResponsiveLayout() {
  var sandbox = createJOGSandbox({ innerWidth: 560 });
  var JOG = sandbox.JOG;
  var app = new JOG.Application();
  var page = new JOG.Page();
  var shell = new JOG.WorkspaceShell();
  var header = new JOG.PageHeader();
  var sidebar = new JOG.SectionPanel();
  var content = new JOG.SectionPanel();

  shell.Width = 960;
  shell.Height = 640;
  shell.Padding = 20;
  shell.SidebarLayout = {
    base: {
      dock: "top",
      width: null,
      height: 120,
      gap: 14
    },
    md: {
      dock: "left",
      width: 220,
      height: null,
      gap: 18
    }
  };

  header.Name = "workspaceHeader";
  header.Height = 88;
  header.Gap = 12;
  header.TitleText = "Workspace";
  header.SubtitleText = "Header slot";

  sidebar.Name = "workspaceSidebar";

  content.Name = "workspaceContent";

  shell.Content = content;
  shell.Sidebar = sidebar;
  shell.Header = header;

  page.Add(shell);
  app.Run(page);

  assertEqual(shell._children[0], header, "WorkspaceShell should keep the header first even when assigned last.");
  assertEqual(shell._children[1], sidebar, "WorkspaceShell should keep the sidebar second.");
  assertEqual(shell._children[2], content, "WorkspaceShell should keep the content third.");
  assertEqual(header.Dock, "top", "WorkspaceShell should default the header to top docking.");
  assertEqual(sidebar.ResponsiveLayout.md.width, 220, "WorkspaceShell should project SidebarLayout onto the sidebar child.");
  assertEqual(sidebar._domNode.style.top, "120px", "WorkspaceShell should let the responsive sidebar dock above content on narrow mount.");
  assertEqual(content._domNode.style.top, "254px", "WorkspaceShell should place content after the header and responsive sidebar gaps on narrow mount.");

  dispatchWindowResize(sandbox, 980);
  app.Runtime.flush();

  assertEqual(sidebar._domNode.style.left, "20px", "WorkspaceShell should restore the sidebar to left docking on wide resize.");
  assertEqual(content._domNode.style.left, "258px", "WorkspaceShell should place fill content after the sidebar gap on wide resize.");
}

function testSectionPanelResponsiveTitleAndPadding() {
  var sandbox = createJOGSandbox({ innerWidth: 560 });
  var JOG = sandbox.JOG;
  var app = new JOG.Application();
  var page = new JOG.Page();
  var section = new JOG.SectionPanel();

  section.Title = "Desktop Summary";
  section.Padding = 18;
  section.Responsive = {
    base: {
      title: "Summary",
      padding: 10
    },
    md: {
      title: "Desktop Summary",
      padding: 18
    }
  };
  page.Add(section);
  app.Run(page);

  assertEqual(section._headerNode.textContent, "Summary", "Responsive SectionPanel should use the mobile title on narrow mount.");
  assertEqual(section._bodyNode.style.padding, "10px", "Responsive SectionPanel should use the mobile body padding on narrow mount.");

  dispatchWindowResize(sandbox, 980);
  app.Runtime.flush();

  assertEqual(section._headerNode.textContent, "Desktop Summary", "Responsive SectionPanel should restore the desktop title on wider resize.");
  assertEqual(section._bodyNode.style.padding, "18px", "Responsive SectionPanel should restore the desktop body padding on wider resize.");
}

function testSplitPanelResponsiveOrientationAndSizing() {
  var sandbox = createJOGSandbox({ innerWidth: 560 });
  var JOG = sandbox.JOG;
  var app = new JOG.Application();
  var page = new JOG.Page();
  var split = new JOG.SplitPanel();
  var nav = new JOG.SectionPanel();
  var content = new JOG.SectionPanel();

  split.Width = 920;
  split.Height = 520;
  split.FirstPaneSize = 220;
  split.Gap = 24;
  split.Responsive = {
    base: {
      orientation: "vertical",
      firstPaneSize: 160,
      gap: 12
    },
    md: {
      orientation: "horizontal",
      firstPaneSize: 220,
      gap: 24
    }
  };

  nav.Fill = true;
  content.Fill = true;
  split.Add(nav);
  split.Add(content);
  page.Add(split);
  app.Run(page);

  assertEqual(split._domNode.className.indexOf("vertical") >= 0, true, "SplitPanel should use vertical orientation on narrow mount.");
  assertEqual(split._domNode.style.gap, "12px", "SplitPanel should apply responsive mobile gap.");
  assertEqual(nav._domNode.style.height, "160px", "SplitPanel should size the first pane height on vertical layout.");
  assertEqual(nav._domNode.style.width, "100%", "SplitPanel should stretch first pane width on vertical layout.");

  dispatchWindowResize(sandbox, 980);
  app.Runtime.flush();

  assertEqual(split._domNode.className.indexOf("horizontal") >= 0, true, "SplitPanel should restore horizontal orientation on wide resize.");
  assertEqual(split._domNode.style.gap, "24px", "SplitPanel should restore desktop gap.");
  assertEqual(nav._domNode.style.width, "220px", "SplitPanel should size the first pane width on horizontal layout.");
  assertEqual(nav._domNode.style.height, "100%", "SplitPanel should stretch first pane height on horizontal layout.");
}

function testFillPropertySupportsTabWorkspaceEditors() {
  var JOG = loadJOG();
  var app = new JOG.Application();
  var page = new JOG.Page();
  var shell = new JOG.DockPanel();
  var tabs = new JOG.TabControl();
  var tab = new JOG.TabPage();
  var editor = new JOG.TextArea();

  shell.Fill = true;
  shell.Width = 900;
  shell.Height = 620;

  tabs.Dock = "fill";
  tabs.Fill = true;

  tab.Title = "Document";
  tab.TabKey = "doc";

  editor.Fill = true;
  editor.CssClass = "jog-fill-width";

  tab.Add(editor);
  tabs.Add(tab);
  shell.Add(tabs);
  page.Add(shell);
  app.Run(page);

  assertEqual(tabs._domNode.style.flex, "1 1 auto", "Fill should let TabControl stretch inside a workspace shell.");
  assertEqual(tab._domNode.style.display, "flex", "TabPage should use flex layout for fill content.");
  assertEqual(editor._domNode.style.flex, "1 1 auto", "Fill should let editors stretch inside tab pages.");
  assertEqual(editor._domNode.style.height, "100%", "Fill should give editors full tab-page height.");
}

function testBrowserOpenTextFileUsesModernPicker() {
  var sandbox = createJOGSandbox({
    showOpenFilePicker: function() {
      return Promise.resolve([
        {
          name: "notes.md",
          getFile: function() {
            return Promise.resolve({
              name: "notes.md",
              text: function() {
                return Promise.resolve("# Notes");
              }
            });
          }
        }
      ]);
    }
  });

  return sandbox.JOG.Browser.OpenTextFile({
    types: [
      {
        description: "Text files",
        accept: {
          "text/plain": [".txt", ".md"]
        }
      }
    ]
  }).then(function(result) {
    assertEqual(result.name, "notes.md", "Modern picker should preserve the opened file name.");
    assertEqual(result.text, "# Notes", "Modern picker should return file text.");
    assertEqual(result.method, "picker", "Modern picker should report its method.");
    assertEqual(!!result.handle, true, "Modern picker should return the file handle.");
  });
}

function testBrowserOpenTextFileUsesFallbackInput() {
  var sandbox = createJOGSandbox();
  var originalAppendChild = sandbox.document.body.appendChild;

  sandbox.document.body.appendChild = function(child) {
    var appended = originalAppendChild.call(this, child);

    if (child.tagName === "INPUT") {
      child.click = function() {
        child.files = [
          {
            name: "fallback.txt",
            _text: "fallback body"
          }
        ];
        (child.eventListeners.change || []).forEach(function(listener) {
          listener({ target: child });
        });
      };
    }

    return appended;
  };

  return sandbox.JOG.Browser.OpenTextFile({
    types: [
      {
        description: "Text files",
        accept: {
          "text/plain": [".txt", ".md", ".log"]
        }
      }
    ]
  }).then(function(result) {
    assertEqual(result.name, "fallback.txt", "Fallback input should preserve the selected file name.");
    assertEqual(result.text, "fallback body", "Fallback input should read plain text content.");
    assertEqual(result.method, "input", "Fallback input should report its method.");
  });
}

function testBrowserSaveTextFileUsesExistingHandle() {
  var sandbox = createJOGSandbox();
  var writes = [];
  var closed = false;
  var handle = {
    name: "draft.txt",
    createWritable: function() {
      return Promise.resolve({
        write: function(value) {
          writes.push(value);
          return Promise.resolve();
        },
        close: function() {
          closed = true;
          return Promise.resolve();
        }
      });
    }
  };

  return sandbox.JOG.Browser.SaveTextFile({
    text: "hello world",
    handle: handle,
    suggestedName: "ignored.txt"
  }).then(function(result) {
    assertEqual(writes.length, 1, "Existing handle save should write once.");
    assertEqual(writes[0], "hello world", "Existing handle save should write the provided text.");
    assertEqual(closed, true, "Existing handle save should close the writable.");
    assertEqual(result.name, "draft.txt", "Existing handle save should return the handle name.");
    assertEqual(result.method, "handle", "Existing handle save should report its method.");
    assertEqual(result.handle, handle, "Existing handle save should preserve the handle.");
  });
}

function testBrowserSaveTextFileUsesDownloadFallback() {
  var sandbox = createJOGSandbox();
  var createdUrls = [];
  var revokedUrls = [];

  sandbox.URL.createObjectURL = function(blob) {
    createdUrls.push(blob);
    return "blob:download-1";
  };
  sandbox.URL.revokeObjectURL = function(url) {
    revokedUrls.push(url);
  };

  return sandbox.JOG.Browser.SaveTextFile({
    text: "download body",
    suggestedName: "export.txt"
  }).then(function(result) {
    assertEqual(createdUrls.length, 1, "Download fallback should create one object URL.");
    assertEqual(createdUrls[0].parts[0], "download body", "Download fallback should package the provided text.");
    assertEqual(revokedUrls[0], "blob:download-1", "Download fallback should revoke the created object URL.");
    assertEqual(result.name, "export.txt", "Download fallback should preserve the suggested file name.");
    assertEqual(result.method, "download", "Download fallback should report its method.");
    assertEqual(result.handle, null, "Download fallback should not return a file handle.");
  });
}

function testNotepadLoadsVisibleWorkspace() {
  var loaded = loadExampleApp("NotepadApp.js");
  var shell = findControl(loaded.page, function(control) {
    return control.Name === "notepadShell";
  });
  var tabs = findControl(loaded.page, function(control) {
    return control.Name === "documentTabs";
  });
  var firstEditor = findControl(loaded.page, function(control) {
    return control.Name === "editordoc-1";
  });

  assert(!!shell, "Notepad should render its shell.");
  assert(!!tabs, "Notepad should render its tab workspace.");
  assert(!!firstEditor, "Notepad should create its first document editor on load.");
  assertEqual(shell._domNode.style.height !== "0px", true, "Notepad shell should not collapse to zero height.");
  assertEqual(tabs._domNode.style.height !== "0px", true, "Notepad tab workspace should not collapse to zero height.");
  assertEqual(firstEditor._domNode.style.height, "100%", "Notepad editor should stretch inside the visible tab workspace.");
}

function testNotepadSettlesShellLayoutAfterMount() {
  var loaded = loadExampleApp("NotepadApp.js", { innerWidth: 0, innerHeight: 0 });
  var shell = findControl(loaded.page, function(control) {
    return control.Name === "notepadShell";
  });
  var tabs = findControl(loaded.page, function(control) {
    return control.Name === "documentTabs";
  });
  var status = findControl(loaded.page, function(control) {
    return control.Name === "notepadStatus";
  });

  loaded.sandbox.innerWidth = 1280;
  loaded.sandbox.innerHeight = 720;
  loaded.sandbox.document.body.clientWidth = 1280;
  loaded.sandbox.document.body.clientHeight = 720;
  flushAnimationFrames(loaded.sandbox);

  assertEqual(shell._domNode.style.width, "100%", "Notepad shell should remain fill-sized after the deferred layout pass.");
  assertEqual(tabs._domNode.style.width !== "0px", true, "Notepad tab workspace should expand after the deferred layout pass.");
  assertEqual(tabs._domNode.style.height !== "0px", true, "Notepad tab workspace should gain height after the deferred layout pass.");
  assertEqual(status._domNode.style.top !== "0px", true, "Notepad status bar should be laid out by the deferred layout pass.");
}

function testDockPanelSchedulesSettlePassForTinyFirstMeasure() {
  var loaded = loadExampleApp("NotepadApp.js");
  var shell = findControl(loaded.page, function(control) {
    return control.Name === "notepadShell";
  });

  shell._domNode.clientWidth = 48;
  shell._domNode.clientHeight = 72;
  shell.Refresh();
  loaded.app.Runtime.flush();

  assertEqual(loaded.sandbox._animationFrameQueue.length > 0, true, "A page-level fill DockPanel should schedule a settle pass when first measured tiny.");

  shell._domNode.clientWidth = 1248;
  shell._domNode.clientHeight = 656;
  flushAnimationFrames(loaded.sandbox);

  assertEqual(shell._layoutSettlePending, false, "DockPanel settle pass should clear after the follow-up frame runs.");
}

function testNotepadKeepsStatusBarAfterTabOpenAndClose() {
  var loaded = loadExampleApp("NotepadApp.js");
  var menu = findControl(loaded.page, function(control) {
    return control.Name === "notepadMenu";
  });
  var shell = findControl(loaded.page, function(control) {
    return control.Name === "notepadShell";
  });
  var status = findControl(loaded.page, function(control) {
    return control.Name === "notepadStatus";
  });
  var tabs = findControl(loaded.page, function(control) {
    return control.Name === "documentTabs";
  });

  dispatchNodeClick(menu._itemNodes[0]);
  loaded.app.Runtime.flush();

  assertEqual(tabs.Children.length, 2, "Notepad should add a second tab from the New menu item.");
  assertEqual(status._domNode.style.top !== "0px", true, "Status bar should remain laid out after opening a tab.");
  assertEqual(tabs._domNode.style.height !== "0px", true, "Tab workspace should remain visible after opening a tab.");

  dispatchNodeClick(menu._itemNodes[4]);
  loaded.app.Runtime.flush();

  assertEqual(tabs.Children.length, 1, "Notepad should close the active tab from the Close Tab menu item.");
  assertEqual(status._domNode.style.top !== "0px", true, "Status bar should remain laid out after closing a tab.");
  assertEqual(tabs._domNode.style.height !== "0px", true, "Tab workspace should remain visible after closing a tab.");
  assertEqual(shell._domNode.style.height !== "0px", true, "Shell should remain visible after tab mutations.");
}

function testNotepadShowsDialogWhenOpenFails() {
  var loaded = loadExampleApp("NotepadApp.js", {
    showOpenFilePicker: function() {
      return Promise.reject(new Error("Disk unavailable"));
    },
    alert: function() {
      throw new Error("Notepad should not call global alert for open failures.");
    }
  });
  var menu = findControl(loaded.page, function(control) {
    return control.Name === "notepadMenu";
  });
  var dialog = findControl(loaded.page, function(control) {
    return control.Name === "notepadErrorDialog";
  });
  var message = findControl(loaded.page, function(control) {
    return control.Name === "notepadErrorMessage";
  });

  dispatchNodeClick(menu._itemNodes[1]);

  return Promise.resolve().then(function() {
    return Promise.resolve();
  }).then(function() {
    loaded.app.Runtime.flush();
    assertEqual(dialog.Visible, true, "Notepad should show a JOG dialog when open fails.");
    assertEqual(dialog.Title, "Open Failed", "Open failure dialog should use the open-specific title.");
    assertEqual(message.Text, "Disk unavailable", "Open failure dialog should show the failure message.");
  });
}

function testNotepadShowsDialogWhenSaveFails() {
  var loaded = loadExampleApp("NotepadApp.js", {
    showSaveFilePicker: function() {
      return Promise.reject(new Error("Write blocked"));
    },
    alert: function() {
      throw new Error("Notepad should not call global alert for save failures.");
    }
  });
  var menu = findControl(loaded.page, function(control) {
    return control.Name === "notepadMenu";
  });
  var dialog = findControl(loaded.page, function(control) {
    return control.Name === "notepadErrorDialog";
  });
  var message = findControl(loaded.page, function(control) {
    return control.Name === "notepadErrorMessage";
  });

  dispatchNodeClick(menu._itemNodes[3]);

  return Promise.resolve().then(function() {
    return Promise.resolve();
  }).then(function() {
    loaded.app.Runtime.flush();
    assertEqual(dialog.Visible, true, "Notepad should show a JOG dialog when save fails.");
    assertEqual(dialog.Title, "Save Failed", "Save failure dialog should use the save-specific title.");
    assertEqual(message.Text, "Write blocked", "Save failure dialog should show the failure message.");
  });
}

function testDockManagedFillChildrenUseDockGeometry() {
  var loaded = loadExampleApp("CustomerAdminApp.js");
  var shell = findControl(loaded.page, function(control) {
    return control.Name === "customerShell";
  });
  var workspace = findControl(loaded.page, function(control) {
    return control.Name === "customerWorkspace";
  });

  assertEqual(workspace._domNode.style.width !== "100%", true, "Dock-managed fill children should not keep a raw 100% width override.");
  assertEqual(workspace._domNode.style.height !== "100%", true, "Dock-managed fill children should not keep a raw 100% height override.");
  assertEqual(workspace._domNode.style.left !== "", true, "Customer workspace should still receive dock positioning.");
  assertEqual(shell._typeName, "WorkspaceShell", "Customer shell should use the shared workspace shell primitive.");
}

function testThemePresetsApplyPresetClasses() {
  var JOG = loadJOG();
  var app = new JOG.Application();
  var page = new JOG.Page();
  var section = new JOG.SectionPanel();
  var label = new JOG.Label();
  var primaryButton = new JOG.Button();
  var dangerButton = new JOG.Button();

  section.ThemePreset = "primary";
  section.Title = "Summary";

  label.ThemePreset = "strong";
  label.Text = "Top Line";

  primaryButton.ThemePreset = "primary";
  primaryButton.Text = "Save";

  dangerButton.ThemePreset = "danger";
  dangerButton.Text = "Delete";

  section.Add(label);
  section.Add(primaryButton);
  section.Add(dangerButton);
  page.Add(section);
  app.Run(page);

  assertEqual(section._domNode.className.indexOf("jog-theme-preset-primary") >= 0, true, "Section preset should add its preset class.");
  assertEqual(label._domNode.className.indexOf("jog-theme-preset-strong") >= 0, true, "Label preset should add its preset class.");
  assertEqual(primaryButton._domNode.className.indexOf("jog-theme-preset-primary") >= 0, true, "Primary button preset should add its preset class.");
  assertEqual(dangerButton._domNode.className.indexOf("jog-theme-preset-danger") >= 0, true, "Danger button preset should add its preset class.");
}

function testGlobalThemeAppliesToMountedApplications() {
  var JOG = loadJOG();
  var firstApp = new JOG.Application();
  var firstPage = new JOG.Page();
  var secondApp = new JOG.Application();
  var secondPage = new JOG.Page();
  var dialog = new JOG.Dialog();

  firstPage.Title = "First";
  secondPage.Title = "Second";
  secondPage.Add(dialog);

  firstApp.Run(firstPage);
  secondApp.Run(secondPage);

  JOG.SetTheme({
    colors: {
      appBackground: "#101820",
      overlay: "rgba(1, 2, 3, 0.7)"
    },
    typography: {
      fontFamily: "Georgia, serif"
    }
  });

  dialog.ShowModal();
  secondApp.Runtime.flush();

  assertEqual(firstPage._domNode.style["--jog-app-background"], "#101820", "Global theme should update mounted page roots.");
  assertEqual(secondPage._domNode.style["--jog-font-family"], "Georgia, serif", "Global theme should update typography tokens.");
  assertEqual(secondApp.Runtime._activeModalOverlay.style.background, "rgba(1, 2, 3, 0.7)", "Global theme should update modal overlay styling.");
  assertEqual(JOG.GetTheme().colors.appBackground, "#101820", "GetTheme should return the merged global theme.");
}

function testApplicationThemeOverridesGlobalTheme() {
  var JOG = loadJOG();
  var app = new JOG.Application();
  var page = new JOG.Page();
  var win = new JOG.Window();

  JOG.SetTheme({
    colors: {
      primary: "#112233",
      primaryText: "#f0f0f0",
      appBackground: "#ddeeff"
    }
  });

  app.Theme = {
    colors: {
      primary: "#aa5500",
      primaryText: "#fff4cc",
      appBackground: "#fff7ed"
    }
  };

  page.Add(win);
  app.Run(page);

  assertEqual(page._domNode.style["--jog-primary"], "#aa5500", "Application theme should override global primary color.");
  assertEqual(page._domNode.style["--jog-primary-text"], "#fff4cc", "Application theme should override global primary text.");
  assertEqual(page._domNode.style["--jog-app-background"], "#fff7ed", "Application theme should override global page background.");
  assertEqual(win._closeNode.className.indexOf("jog-window-close") >= 0, true, "Window close button should use the themed window-close class.");
}

function testResizableWindowShowsHandle() {
  var JOG = loadJOG();
  var app = new JOG.Application();
  var page = new JOG.Page();
  var win = new JOG.Window();

  win.Name = "resizableWindow";
  win.Resizable = true;
  win.SetBounds(20, 30, 400, 220);
  page.Add(win);
  app.Run(page);

  assertEqual(win._resizeHandleNode.style.display, "", "Resizable window should show resize handle.");
}

function testResizableWindowSupportsEdgeResize() {
  var JOG = loadJOG();
  var app = new JOG.Application();
  var page = new JOG.Page();
  var win = new JOG.Window();
  var leftHandle;
  var downListeners;
  var moveListeners;
  var upListeners;

  win.Name = "edgeResizableWindow";
  win.Resizable = true;
  win.MinWidth = 320;
  win.SetBounds(40, 30, 400, 220);
  page.Add(win);
  app.Run(page);

  leftHandle = win._resizeHandles.w;
  downListeners = leftHandle.eventListeners.mousedown || [];
  assertEqual(downListeners.length > 0, true, "Left resize handle should register mouse listeners.");

  downListeners[0]({
    clientX: 40,
    clientY: 30,
    preventDefault: function() {},
    stopPropagation: function() {}
  });

  moveListeners = app.Runtime.document.eventListeners.mousemove || [];
  upListeners = app.Runtime.document.eventListeners.mouseup || [];

  assertEqual(moveListeners.length > 0, true, "Resize should attach mousemove listener.");
  assertEqual(upListeners.length > 0, true, "Resize should attach mouseup listener.");

  moveListeners[0]({
    clientX: 120,
    clientY: 30
  });
  app.Runtime.flush();

  assertEqual(win.Left, 120, "Left-edge resize should move the window origin.");
  assertEqual(win.Width, 320, "Left-edge resize should clamp width to MinWidth.");

  upListeners[0]();
}

function testModalWindowsShareOverlayAndCloseInStackOrder() {
  var JOG = loadJOG();
  var app = new JOG.Application();
  var page = new JOG.Page();
  var first = new JOG.Dialog();
  var second = new JOG.Dialog();

  first.Name = "firstDialog";
  second.Name = "secondDialog";
  first.SetBounds(20, 20, 320, 180);
  second.SetBounds(40, 40, 320, 180);
  first.Hide();
  second.Hide();

  page.Add(first);
  page.Add(second);
  app.Run(page);

  first.ShowModal();
  app.Runtime.flush();

  assert(!!app.Runtime._activeModalOverlay, "First modal should create an overlay.");
  assertEqual(app.Runtime._modalWindows.length, 1, "First modal should register in modal stack.");
  assert(Number(app.Runtime._activeModalOverlay.style.zIndex) < Number(first._domNode.style.zIndex), "Overlay should stay behind the active modal.");

  second.ShowModal();
  app.Runtime.flush();

  assertEqual(app.Runtime._modalWindows.length, 2, "Second modal should extend modal stack.");
  assert(Number(app.Runtime._activeModalOverlay.style.zIndex) < Number(second._domNode.style.zIndex), "Overlay should stay behind the top modal.");
  assert(Number(app.Runtime._activeModalOverlay.style.zIndex) > Number(first._domNode.style.zIndex), "Overlay should sit above lower modal windows.");

  second.Close();
  app.Runtime.flush();

  assert(!!app.Runtime._activeModalOverlay, "Closing the top modal should keep overlay for lower modal.");
  assertEqual(app.Runtime._modalWindows.length, 1, "Closing the top modal should shrink modal stack.");
  assertEqual(app.Runtime._modalWindows[0], first, "Remaining modal should stay registered.");
  assert(Number(app.Runtime._activeModalOverlay.style.zIndex) < Number(first._domNode.style.zIndex), "Overlay should move back under the remaining modal.");

  first.Close();
  app.Runtime.flush();

  assertEqual(app.Runtime._activeModalOverlay, null, "Closing the last modal should remove overlay.");
  assertEqual(app.Runtime._modalWindows.length, 0, "Closing the last modal should clear modal stack.");
}

function testModalFocusTrapCyclesAndRestoresFocus() {
  var JOG = loadJOG();
  var app = new JOG.Application();
  var page = new JOG.Page();
  var launchButton = new JOG.Button();
  var dialog = new JOG.Dialog();
  var body = new JOG.StackPanel();
  var firstButton = new JOG.Button();
  var secondButton = new JOG.Button();

  launchButton.Text = "Launch";
  dialog.Name = "focusTrapDialog";
  dialog.Title = "Focus trap";
  dialog.SetBounds(40, 40, 320, 220);
  dialog.Hide();

  body.Orientation = "vertical";
  body.Spacing = 10;
  firstButton.Text = "First action";
  secondButton.Text = "Second action";
  body.Add(firstButton);
  body.Add(secondButton);
  dialog.Add(body);

  page.Add(launchButton);
  page.Add(dialog);
  app.Run(page);

  launchButton._domNode.focus();
  assertEqual(app.Runtime.document.activeElement, launchButton._domNode, "Test should start with focus on the launch button.");

  dialog.ShowModal();
  app.Runtime.flush();

  assertEqual(app.Runtime.document.activeElement, firstButton._domNode, "Opening a modal should move focus to the first focusable control inside the dialog.");

  dispatchNodeKeyDown(dialog._domNode, "Tab");
  assertEqual(app.Runtime.document.activeElement, secondButton._domNode, "Tab should advance focus within the modal body.");

  dispatchNodeKeyDown(dialog._domNode, "Tab");
  assertEqual(app.Runtime.document.activeElement, dialog._closeNode, "Tab should continue to the dialog chrome after body controls.");

  dispatchNodeKeyDown(dialog._domNode, "Tab");
  assertEqual(app.Runtime.document.activeElement, firstButton._domNode, "Tab should wrap to the first modal control instead of escaping the dialog.");

  dispatchNodeKeyDown(dialog._domNode, "Tab", { shiftKey: true });
  assertEqual(app.Runtime.document.activeElement, dialog._closeNode, "Shift+Tab should wrap backward inside the modal.");

  dialog.Close();
  app.Runtime.flush();
  assertEqual(app.Runtime.document.activeElement, launchButton._domNode, "Closing the last modal should restore focus to the previously focused element.");
}

function testNestedModalsRestoreFocusToUnderlyingDialog() {
  var JOG = loadJOG();
  var app = new JOG.Application();
  var page = new JOG.Page();
  var first = new JOG.Dialog();
  var second = new JOG.Dialog();
  var firstBody = new JOG.StackPanel();
  var firstAction = new JOG.Button();
  var secondBody = new JOG.StackPanel();
  var secondAction = new JOG.Button();

  first.Hide();
  second.Hide();
  first.Title = "First";
  second.Title = "Second";
  first.SetBounds(20, 20, 320, 180);
  second.SetBounds(60, 60, 320, 180);

  firstBody.Add(firstAction);
  secondBody.Add(secondAction);
  firstAction.Text = "Underlying";
  secondAction.Text = "Top";
  first.Add(firstBody);
  second.Add(secondBody);

  page.Add(first);
  page.Add(second);
  app.Run(page);

  first.ShowModal();
  app.Runtime.flush();
  firstAction._domNode.focus();

  second.ShowModal();
  app.Runtime.flush();
  assertEqual(app.Runtime.document.activeElement, secondAction._domNode, "Top modal should take focus when it opens.");

  second.Close();
  app.Runtime.flush();
  assertEqual(app.Runtime.document.activeElement, firstAction._domNode, "Closing the top modal should restore focus to the underlying dialog.");
}

function testWindowLifecycleEventsTrackLoadShowAndHide() {
  var JOG = loadJOG();
  var app = new JOG.Application();
  var page = new JOG.Page();
  var win = new JOG.Window();
  var events = [];

  win.Name = "lifecycleWindow";
  win.Hide();
  win.OnLoad(function() {
    events.push("load");
  });
  win.OnShow(function() {
    events.push("show");
  });
  win.OnHide(function() {
    events.push("hide");
  });

  page.Add(win);
  app.Run(page);

  assertEqual(events.join(","), "load", "Hidden initial window should only fire load on first mount.");

  win.Show();
  app.Runtime.flush();
  assertEqual(events.join(","), "load,show", "Show should fire when window becomes visible.");

  win.Hide();
  app.Runtime.flush();
  assertEqual(events.join(","), "load,show,hide", "Hide should fire when window becomes hidden.");

  win.Show();
  app.Runtime.flush();
  assertEqual(events.join(","), "load,show,hide,show", "Show should fire again on later visibility changes.");
}

function testExampleAppThemeSwitchingFlow() {
  var example = loadExampleApp("ExampleApp.js");
  var page = example.page;
  var harborButton = findControl(page, function(control) {
    return control && control.Name === "harborThemeButton";
  });
  var ledgerButton = findControl(page, function(control) {
    return control && control.Name === "ledgerThemeButton";
  });
  var defaultButton = findControl(page, function(control) {
    return control && control.Name === "defaultThemeButton";
  });

  assertEqual(page.Title, "JOG V2 Theme Example", "Example app should expose the theme-focused title.");
  assert(!!harborButton && !!ledgerButton && !!defaultButton, "Example app should expose the theme switch buttons.");
  assertEqual(page._domNode.style["--jog-primary"], "#0f172a", "Example app should boot with the built-in default theme.");

  dispatchNodeClick(ledgerButton._domNode);
  assertEqual(page._domNode.style["--jog-primary"], "#8a4b2a", "Ledger theme button should update the mounted app theme.");

  dispatchNodeClick(harborButton._domNode);
  assertEqual(page._domNode.style["--jog-primary"], "#244e41", "Harbor theme button should restore the original theme.");

  dispatchNodeClick(defaultButton._domNode);
  assertEqual(page._domNode.style["--jog-primary"], "#0f172a", "Default theme button should restore the built-in theme.");
}

function testPropertySettersNormalizeState() {
  var JOG = loadJOG();
  var section = new JOG.SectionPanel();
  var box = new JOG.TextBox();
  var check = new JOG.CheckBox();
  var radio = new JOG.RadioButton();
  var list = new JOG.DropDownList();

  section.Dock = "left";
  assertEqual(section.Dock, "left", "Dock should keep supported values.");
  section.Dock = "diagonal";
  assertEqual(section.Dock, "none", "Dock should fall back to none for unsupported values.");

  box.ColumnSpan = 3;
  box.RowSpan = 2;
  assertEqual(box.ColumnSpan, 3, "ColumnSpan should keep positive numeric values.");
  assertEqual(box.RowSpan, 2, "RowSpan should keep positive numeric values.");

  box.ColumnSpan = 0;
  box.RowSpan = -1;
  assertEqual(box.ColumnSpan, 1, "ColumnSpan should normalize invalid values to 1.");
  assertEqual(box.RowSpan, 1, "RowSpan should normalize invalid values to 1.");

  box.Visible = 0;
  box.Enabled = "";
  assertEqual(box.Visible, false, "Visible should coerce falsy values to false.");
  assertEqual(box.Enabled, false, "Enabled should coerce falsy values to false.");

  box.Visible = "yes";
  box.Enabled = 1;
  assertEqual(box.Visible, true, "Visible should coerce truthy values to true.");
  assertEqual(box.Enabled, true, "Enabled should coerce truthy values to true.");

  box.Placeholder = null;
  assertEqual(box.Placeholder, "", "Placeholder should normalize null to empty string.");
  box.Placeholder = 42;
  assertEqual(box.Placeholder, "42", "Placeholder should stringify non-null values.");

  check.Checked = "checked";
  assertEqual(check.Checked, true, "Checked should coerce truthy values to true.");
  check.Checked = 0;
  assertEqual(check.Checked, false, "Checked should coerce falsy values to false.");

  radio.Value = 7;
  assertEqual(radio.Value, "7", "RadioButton value should stringify non-null values.");

  list.SelectedValue = null;
  assertEqual(list.SelectedValue, "", "SelectedValue should normalize null to empty string.");
  list.SelectedValue = 123;
  assertEqual(list.SelectedValue, "123", "SelectedValue should stringify non-null values.");
}

function testSetErrorAndClearErrorToggleInvalidState() {
  var JOG = loadJOG();
  var box = new JOG.TextBox();

  box.SetError("Required");
  assertEqual(box.Invalid, true, "SetError should mark control invalid.");
  assertEqual(box.ErrorText, "Required", "SetError should copy the error text.");

  box.SetError(null);
  assertEqual(box.Invalid, false, "SetError should clear invalid when message normalizes empty.");
  assertEqual(box.ErrorText, "", "SetError should normalize null to empty text.");

  box.ErrorText = "Manual";
  box.Invalid = true;
  box.ClearError();
  assertEqual(box.Invalid, false, "ClearError should reset invalid state.");
  assertEqual(box.ErrorText, "", "ClearError should remove error text.");
}

function testContainerRemoveAndClearDisposeChildren() {
  var JOG = loadJOG();
  var panel = new JOG.Panel();
  var first = new JOG.Label();
  var second = new JOG.Label();

  panel.Add(first);
  panel.Add(second);
  panel.Remove(first);

  assertEqual(panel.Children.length, 1, "Remove should shrink container child list.");
  assertEqual(first.Parent, null, "Remove should detach child parent reference.");
  assertEqual(first._lifecycle, "Disposed", "Remove should dispose detached child.");

  panel.Clear();

  assertEqual(panel.Children.length, 0, "Clear should remove every child.");
  assertEqual(second.Parent, null, "Clear should detach remaining child parent reference.");
  assertEqual(second._lifecycle, "Disposed", "Clear should dispose remaining children.");
}

function testDisposedControlsRejectLifecycleOperations() {
  var JOG = loadJOG();
  var box = new JOG.TextBox();
  var failures = [];

  box.Dispose();

  [
    { name: "Show", fn: function() { box.Show(); }, pattern: /Cannot show a disposed control/ },
    { name: "Hide", fn: function() { box.Hide(); }, pattern: /Cannot hide a disposed control/ },
    { name: "Focus", fn: function() { box.Focus(); }, pattern: /Cannot focus a disposed control/ }
  ].forEach(function(step) {
    try {
      step.fn();
      failures.push(step.name);
    } catch (error) {
      assert(step.pattern.test(error.message), step.name + " should explain disposed-control failure.");
    }
  });

  assertEqual(failures.length, 0, "Disposed controls should reject lifecycle operations.");
}

function testCustomerAdminDialogIntegrationFlow() {
  var loaded = loadExampleApp("CustomerAdminApp.js");
  var app = loaded.app;
  var page = loaded.page;
  var dialog = findControl(page, function(control) {
    return control.Name === "editCustomerDialog";
  });
  var dialogValidation = findControl(page, function(control) {
    return control.Name === "dialogValidationSection";
  });
  var inlineValidation = findControl(page, function(control) {
    return control.Name === "inlineValidationSection";
  });
  var inlineName = findControl(page, function(control) {
    return control.Name === "inlineSelectedName";
  });
  var inlineStatus = findControl(page, function(control) {
    return control.Name === "inlineSelectedStatus";
  });
  var dialogName = findControl(page, function(control) {
    return control.Name === "dialogCustomerName";
  });
  var dialogStatus = findControl(page, function(control) {
    return control.Name === "dialogCustomerStatus";
  });
  var customerOneButton = findControl(page, function(control) {
    return control._typeName === "Button" && control.Text === "Acme Trading";
  });
  var selectedSummary = findControl(page, function(control) {
    return control._typeName === "Label" && control.Text === "Acme Trading - Active";
  });
  var messageLabel = findControl(page, function(control) {
    return control._typeName === "Label" && control.Text === "Status: Ready";
  });
  var editButton = findControl(page, function(control) {
    return control._typeName === "Button" && control.Text === "Edit Selected Customer";
  });
  var saveButton = findControl(page, function(control) {
    return control._typeName === "Button" && control.Text === "Save Customer";
  });

  assertEqual(dialog.Visible, false, "Edit dialog should start hidden.");
  assertEqual(dialog._domNode.style.display, "none", "Hidden dialog should not force itself visible on initial render.");

  editButton._raiseEvent("Click", null);
  app.Runtime.flush();

  assertEqual(dialog.Visible, true, "Edit button should open the dialog.");
  assertEqual(app.Runtime._modalWindows.length, 1, "Opened dialog should register in modal stack.");
  assertEqual(dialog._contentNode.style.overflowY, "auto", "Dialog content should scroll vertically when content exceeds the window body.");
  assertEqual(dialog._contentNode.style.overflowX, "hidden", "Dialog content should clip horizontal overflow inside the window body.");
  assertEqual(dialog._contentNode.style.flex, "1 1 auto", "Dialog content should stretch within the window shell.");

  dispatchTextInput(dialogName, "No");
  dispatchTextInput(dialogStatus, "Unknown");
  app.Runtime.flush();

  saveButton._raiseEvent("Click", null);
  app.Runtime.flush();

  assertEqual(dialog.Visible, true, "Invalid save should leave dialog open.");
  assertEqual(dialogValidation.Visible, true, "Invalid dialog save should show dialog validation summary.");
  assertEqual(inlineValidation.Visible, true, "Shared validation state should also update the inline editor.");
  assert(dialogValidation.Children[0].Text.indexOf("Please fix:") >= 0, "Dialog validation summary should explain the failure.");
  assertEqual(inlineStatus.Invalid, true, "Inline status field should reflect shared validation state.");
  assertEqual(messageLabel.Text, "Status: Validation failed. Fix the selected customer fields.", "Failed dialog save should update the shared status label.");

  dispatchTextInput(dialogName, "Acme Labs");
  dispatchTextInput(dialogStatus, "Pending");
  app.Runtime.flush();

  saveButton._raiseEvent("Click", null);
  app.Runtime.flush();

  assertEqual(dialog.Visible, false, "Successful save should close the dialog.");
  assertEqual(app.Runtime._modalWindows.length, 0, "Closing the dialog should clear the modal stack.");
  assertEqual(customerOneButton.Text, "Acme Labs", "Successful dialog save should persist the selected customer name.");
  assertEqual(selectedSummary.Text, "Acme Labs - Pending", "Successful dialog save should refresh the selected summary.");
  assertEqual(inlineName.Text, "Acme Labs", "Shared store should keep inline editor in sync with dialog edits.");
  assertEqual(inlineStatus.Text, "Pending", "Shared store should keep inline status in sync with dialog edits.");
  assertEqual(messageLabel.Text, "Status: Saved Acme Labs as Pending", "Successful dialog save should update the shared status label.");
}

function testFormDemoValidationAndResetIntegrationFlow() {
  var loaded = loadExampleApp("FormApp.js");
  var app = loaded.app;
  var page = loaded.page;
  var validationSection = findControl(page, function(control) {
    return control.Name === "validationSection";
  });
  var nameInput = findControl(page, function(control) {
    return control.Name === "formCustomerName";
  });
  var activeCheck = findControl(page, function(control) {
    return control.Name === "formCustomerActive";
  });
  var notesInput = findControl(page, function(control) {
    return control.Name === "formCustomerNotes";
  });
  var regionRow = findControl(page, function(control) {
    return control.Name === "regionRow";
  });
  var regionSea = findControl(page, function(control) {
    return control.Name === "regionSea";
  });
  var nameError = findControl(page, function(control) {
    return control.Name === "formCustomerNameError";
  });
  var activeError = findControl(page, function(control) {
    return control.Name === "formCustomerActiveError";
  });
  var regionError = findControl(page, function(control) {
    return control.Name === "formCustomerRegionError";
  });
  var notesError = findControl(page, function(control) {
    return control.Name === "formCustomerNotesError";
  });
  var summaryLabel = findControl(page, function(control) {
    return control._typeName === "Label" && control.Text.indexOf("Name: Atlas Bio") === 0;
  });
  var statusLabel = findControl(page, function(control) {
    return control._typeName === "Label" && control.Text === "Status: Ready to save.";
  });
  var saveButton = findControl(page, function(control) {
    return control._typeName === "Button" && control.Text === "Save Form";
  });
  var resetButton = findControl(page, function(control) {
    return control._typeName === "Button" && control.Text === "Reset";
  });

  dispatchTextInput(nameInput, "Al");
  dispatchCheckedChange(activeCheck, false);
  dispatchTextInput(notesInput, "Short");
  app.Runtime.flush();

  saveButton._raiseEvent("Click", null);
  app.Runtime.flush();

  assertEqual(validationSection.Visible, true, "Invalid form save should show the validation summary.");
  assertEqual(nameError.Visible, true, "Invalid name should show its validation message.");
  assertEqual(activeError.Visible, true, "Unchecked active field should show its validation message.");
  assertEqual(regionError.Visible, true, "Missing region should show its validation message.");
  assertEqual(notesError.Visible, true, "Short notes should show their validation message.");
  assertEqual(regionRow.Invalid, true, "Radio group container should reflect region validation state.");
  assertEqual(statusLabel.Text, "Status: Validation failed. Fix the highlighted fields.", "Invalid form save should update the status binding.");

  dispatchTextInput(nameInput, "Atlas Bio Labs");
  dispatchCheckedChange(activeCheck, true);
  dispatchRadioChange(regionSea);
  dispatchTextInput(notesInput, "Interested in a pilot rollout for regional labs.");
  app.Runtime.flush();

  saveButton._raiseEvent("Click", null);
  app.Runtime.flush();

  assertEqual(validationSection.Visible, false, "Successful form save should hide the validation summary.");
  assertEqual(summaryLabel.Text.indexOf("Name: Atlas Bio Labs") >= 0, true, "Successful form save should rebuild the summary.");
  assertEqual(summaryLabel.Text.indexOf("Region: sea") >= 0, true, "Summary should reflect the selected radio value.");
  assertEqual(summaryLabel.Text.indexOf("| Saved") >= 0, true, "Successful form save should mark the summary as saved.");
  assertEqual(statusLabel.Text, "Status: Saved successfully.", "Successful form save should update the status binding.");

  resetButton._raiseEvent("Click", null);
  app.Runtime.flush();

  assertEqual(nameInput.Text, "Atlas Bio", "Reset should restore the default name.");
  assertEqual(activeCheck.Checked, true, "Reset should restore the default checkbox state.");
  assertEqual(regionSea.Checked, false, "Reset should clear the radio selection when the default region is empty.");
  assertEqual(notesInput.Text, "Interested in a pilot rollout during Q4.", "Reset should restore the default notes.");
  assertEqual(validationSection.Visible, false, "Reset should clear validation summary visibility.");
  assertEqual(statusLabel.Text, "Status: Form reset.", "Reset should update the status binding.");
}

function testCustomerAdminSelectionAndDialogClosePaths() {
  var loaded = loadExampleApp("CustomerAdminApp.js");
  var app = loaded.app;
  var page = loaded.page;
  var dialog = findControl(page, function(control) {
    return control.Name === "editCustomerDialog";
  });
  var inlineName = findControl(page, function(control) {
    return control.Name === "inlineSelectedName";
  });
  var inlineStatus = findControl(page, function(control) {
    return control.Name === "inlineSelectedStatus";
  });
  var dialogName = findControl(page, function(control) {
    return control.Name === "dialogCustomerName";
  });
  var dialogStatus = findControl(page, function(control) {
    return control.Name === "dialogCustomerStatus";
  });
  var customerTwoButton = findControl(page, function(control) {
    return control._typeName === "Button" && control.Text === "Northwind Foods";
  });
  var customerTwoSummary = findControl(page, function(control) {
    return control._typeName === "Label" && control.Parent && control.Parent.Name === "sidebarStack" && control.Text === "Northwind Foods - Pending";
  });
  var selectedSummary = findControl(page, function(control) {
    return control._typeName === "Label" && control.Parent && control.Parent.Name === "detailStack" && control.Text === "Acme Trading - Active";
  });
  var selectedMarker = findControl(page, function(control) {
    return control._typeName === "Label" && control.Parent && control.Parent.Name === "detailStack" && control.Text === "Selected: Acme Trading";
  });
  var messageLabel = findControl(page, function(control) {
    return control._typeName === "Label" && control.Text === "Status: Ready";
  });
  var editButton = findControl(page, function(control) {
    return control._typeName === "Button" && control.Text === "Edit Selected Customer";
  });
  var cancelButton = findControl(page, function(control) {
    return control._typeName === "Button" && control.Text === "Cancel";
  });

  customerTwoButton._raiseEvent("Click", null);
  app.Runtime.flush();

  assertEqual(selectedSummary.Text, "Northwind Foods - Pending", "Selecting another customer should update the selected summary.");
  assertEqual(selectedMarker.Text, "Selected: Northwind Foods", "Selecting another customer should update the sidebar marker.");
  assertEqual(inlineName.Text, "Northwind Foods", "Selecting another customer should rebind the inline name field.");
  assertEqual(inlineStatus.Text, "Pending", "Selecting another customer should rebind the inline status field.");

  editButton._raiseEvent("Click", null);
  app.Runtime.flush();
  assertEqual(dialog.Visible, true, "Edit button should open the dialog for the selected customer.");

  dispatchTextInput(dialogName, "Northwind Labs");
  dispatchTextInput(dialogStatus, "Inactive");
  app.Runtime.flush();

  cancelButton._raiseEvent("Click", null);
  app.Runtime.flush();

  assertEqual(dialog.Visible, false, "Cancel button should close the dialog.");
  assertEqual(app.Runtime._modalWindows.length, 0, "Cancel button should clear the modal stack.");
  assertEqual(customerTwoButton.Text, "Northwind Foods", "Cancel should not persist the selected customer name.");
  assertEqual(customerTwoSummary.Text, "Northwind Foods - Pending", "Cancel should not persist the sidebar summary.");
  assertEqual(selectedSummary.Text, "Northwind Foods - Pending", "Cancel should not update the persisted selected summary.");
  assertEqual(inlineName.Text, "Northwind Labs", "Cancel should leave shared draft edits in bound fields.");
  assertEqual(inlineStatus.Text, "Inactive", "Cancel should leave shared draft status edits in bound fields.");
  assertEqual(messageLabel.Text, "Status: Ready", "Cancel should not change the status message.");

  editButton._raiseEvent("Click", null);
  app.Runtime.flush();
  assertEqual(dialog.Visible, true, "Dialog should reopen after a cancel.");

  dispatchNodeKeyDown(dialog._domNode, "Escape");
  app.Runtime.flush();

  assertEqual(dialog.Visible, false, "Escape should close the dialog when close-on-escape is enabled.");
  assertEqual(app.Runtime._modalWindows.length, 0, "Escape close should clear the modal stack.");

  editButton._raiseEvent("Click", null);
  app.Runtime.flush();
  assertEqual(dialog.Visible, true, "Dialog should reopen after escape close.");

  dispatchNodeClick(dialog._closeNode);
  app.Runtime.flush();

  assertEqual(dialog.Visible, false, "Window chrome close button should close the dialog.");
  assertEqual(app.Runtime._modalWindows.length, 0, "Window chrome close should clear the modal stack.");
}

function testThirdPartyDemoNotesValidationFlow() {
  var sandbox = createJOGSandbox();
  var originalRun = sandbox.JOG.Application.prototype.Run;
  var JOG;
  var FlatpickrJOG;
  var LexicalJOG;
  var ChartJOG;
  var app;
  var page;
  var followUpPicker;
  var validateDateButton;
  var noteEditor;
  var validateNotesButton;
  var planningSummary;
  var noteError;

  function serializePlainText(text) {
    if (!text) {
      return LexicalJOG.__EMPTY_EDITOR_STATE_JSON;
    }
    return JSON.stringify({
      root: {
        children: [
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: String(text),
                type: "text",
                version: 1
              }
            ],
            direction: null,
            format: "",
            indent: 0,
            type: "paragraph",
            version: 1
          }
        ],
        direction: null,
        format: "",
        indent: 0,
        type: "root",
        version: 1
      }
    });
  }

  sandbox.JOG.Application.prototype.Run = function(nextPage) {
    sandbox.__lastApp = this;
    sandbox.__lastPage = nextPage;
    return originalRun.call(this, nextPage);
  };

  loadScriptIntoSandbox(sandbox, "AcmeJOG.Controls.js");
  loadScriptIntoSandbox(sandbox, "BeaconJOG.Controls.js");
  loadScriptIntoSandbox(sandbox, "ChartJOG.Controls.js");
  loadScriptIntoSandbox(sandbox, "FlatpickrJOG.Controls.js");
  loadScriptIntoSandbox(sandbox, "LexicalJOG.Controls.js");

  JOG = sandbox.JOG;
  FlatpickrJOG = sandbox.FlatpickrJOG;
  LexicalJOG = sandbox.LexicalJOG;
  ChartJOG = sandbox.ChartJOG;

  FlatpickrJOG.__setTestingAdapterFactory(function(options) {
    return {
      _value: options.value || "",
      _hostNode: null,
      attach: function(hostNode) {
        this._hostNode = hostNode;
      },
      dispose: function() {},
      setValue: function(value) {
        this._value = value == null ? "" : String(value);
        if (typeof options.onChange === "function") {
          options.onChange({
            value: this._value,
            isEmpty: !this._value,
            originalEvent: null
          });
        }
      },
      setMinDate: function() {},
      setMaxDate: function() {},
      setPlaceholder: function(value) {
        if (this._hostNode) {
          this._hostNode.placeholder = value || "";
        }
      },
      setInteractive: function(enabled, readOnly) {
        if (this._hostNode) {
          this._hostNode.disabled = !enabled;
          this._hostNode.readOnly = !enabled || !!readOnly;
          this._hostNode.setAttribute("aria-readonly", !enabled || readOnly ? "true" : "false");
        }
      },
      clear: function() {
        this.setValue("");
      },
      getValue: function() {
        return this._value;
      },
      isEmpty: function() {
        return !this._value;
      },
      focus: function() {
        if (this._hostNode && typeof this._hostNode.focus === "function") {
          this._hostNode.focus();
        }
      },
      open: function() {},
      close: function() {}
    };
  });

  ChartJOG.__setTestingAdapterFactory(function(options) {
    return {
      attach: function() {},
      dispose: function() {},
      setConfig: function(config) {
        this._config = config;
      }
    };
  });

  LexicalJOG.__setTestingAdapterFactory(function(options) {
    return {
      _hostNode: null,
      _plainText: "",
      _value: LexicalJOG.__EMPTY_EDITOR_STATE_JSON,
      attach: function(hostNode) {
        this._hostNode = hostNode;
      },
      dispose: function() {},
      setEditable: function() {},
      setSerializedState: function(serializedValue) {
        this._value = String(serializedValue);
        this._plainText = this._value === LexicalJOG.__EMPTY_EDITOR_STATE_JSON ? "" : this._plainText;
        if (typeof options.onChange === "function") {
          options.onChange({
            serializedValue: this._value,
            plainText: this._plainText,
            isEmpty: String(this._plainText).trim() === "",
            originalEvent: null
          });
        }
      },
      setPlainText: function(text) {
        this._plainText = text == null ? "" : String(text);
        this._value = serializePlainText(this._plainText);
        if (typeof options.onChange === "function") {
          options.onChange({
            serializedValue: this._value,
            plainText: this._plainText,
            isEmpty: String(this._plainText).trim() === "",
            originalEvent: null
          });
        }
      },
      clear: function() {
        this._plainText = "";
        this._value = LexicalJOG.__EMPTY_EDITOR_STATE_JSON;
        if (typeof options.onChange === "function") {
          options.onChange({
            serializedValue: this._value,
            plainText: "",
            isEmpty: true,
            originalEvent: null
          });
        }
      },
      getPlainText: function() {
        return this._plainText;
      },
      isEmpty: function() {
        return String(this._plainText).trim() === "";
      },
      focus: function() {
        if (this._hostNode && typeof this._hostNode.focus === "function") {
          this._hostNode.focus();
        }
      }
    };
  });

  loadScriptIntoSandbox(sandbox, "ThirdPartyDemoApp.js");
  (sandbox._windowEventListeners.load || []).forEach(function(listener) {
    listener();
  });

  app = sandbox.__lastApp;
  page = sandbox.__lastPage;
  followUpPicker = findControl(page, function(control) {
    return control.Name === "thirdPartyFlatpickrDatePicker";
  });
  validateDateButton = findControl(page, function(control) {
    return control._typeName === "Button" && control.Text === "Validate date";
  });
  noteEditor = findControl(page, function(control) {
    return control.Name === "thirdPartyLexicalEditor";
  });
  validateNotesButton = findControl(page, function(control) {
    return control._typeName === "Button" && control.Text === "Validate notes";
  });
  planningSummary = findControl(page, function(control) {
    return control._typeName === "ValidationSummary";
  });
  noteError = findControl(page, function(control) {
    return control._typeName === "ValidationMessage" && control.Text === "";
  });

  validateDateButton._raiseEvent("Click", null);
  app.Runtime.flush();

  assertEqual(followUpPicker.Invalid, true, "Third-party demo date validation should mark the Flatpickr wrapper invalid when empty.");
  assertEqual(followUpPicker.ErrorText, "Choose a follow-up date before validating the wrapper.", "Third-party demo date validation should set the expected date error message.");
  assertEqual(app.Runtime.document.activeElement, followUpPicker._inputNode, "Third-party demo date validation should focus the date picker after an empty validate.");
  assertEqual(planningSummary.Visible, true, "Third-party demo validation summary should show after an empty third-party date validate.");
  assertEqual(planningSummary.Children[0].Text, "Please fix: Choose a follow-up date before validating the wrapper.", "Third-party demo validation summary should include the date error.");

  followUpPicker._pickerAdapter.setValue("2026-07-20");
  app.Runtime.flush();

  assertEqual(followUpPicker.Invalid, false, "Entering a date after an error should clear the Flatpickr wrapper invalid state.");
  assertEqual(planningSummary.Visible, false, "Third-party demo validation summary should hide after the date error clears.");

  validateNotesButton._raiseEvent("Click", null);
  app.Runtime.flush();
  noteError = findControl(page, function(control) {
    return control._typeName === "ValidationMessage" && control.Text === "Enter notes before validating the editor wrapper.";
  });

  assertEqual(noteEditor.Invalid, true, "Third-party demo notes validation should mark the Lexical wrapper invalid when empty.");
  assertEqual(noteEditor.ErrorText, "Enter notes before validating the editor wrapper.", "Third-party demo notes validation should set the expected error message.");
  assertEqual(noteEditor._editorHostNode.attributes["aria-invalid"], "true", "Third-party demo notes validation should expose aria-invalid on the editable host.");
  assertEqual(app.Runtime.document.activeElement, noteEditor._editorHostNode, "Third-party demo notes validation should focus the editor after an empty validate.");
  assert(!!noteError, "Third-party demo notes validation should create a visible validation message for empty notes.");
  assertEqual(noteError.Text, "Enter notes before validating the editor wrapper.", "Third-party demo notes validation should show the visible validation message.");
  assertEqual(noteError.Visible, true, "Third-party demo notes validation should show the validation message control.");
  assertEqual(planningSummary.Visible, true, "Third-party demo validation summary should show after an empty Lexical validate.");
  assertEqual(planningSummary.Children[0].Text, "Please fix: Enter notes before validating the editor wrapper.", "Third-party demo validation summary should include the notes error.");

  noteEditor.SetPlainText("Next call is blocked on security review.");
  app.Runtime.flush();

  assertEqual(noteEditor.Invalid, false, "Typing notes after an error should clear the Lexical wrapper invalid state.");
  assertEqual(noteError.Visible, false, "Typing notes after an error should hide the validation message.");
  assertEqual(planningSummary.Visible, false, "Third-party demo validation summary should hide after the notes error clears.");

  FlatpickrJOG.__setTestingAdapterFactory(null);
  LexicalJOG.__setTestingAdapterFactory(null);
  ChartJOG.__setTestingAdapterFactory(null);
}

function testRuntimeFormatsEventErrorsClearly() {
  var capturedErrors = [];
  var customConsole = {
    log: function() {},
    error: function(message) {
      capturedErrors.push(String(message));
    }
  };
  var JOG = loadJOG({ console: customConsole });
  var app = new JOG.Application();
  var page = new JOG.Page();
  var button = new JOG.Button();
  var thrown = null;

  button.Name = "diagnosticButton";
  button.OnClick(function() {
    throw new Error("Boom");
  });
  page.Add(button);
  app.Run(page);

  try {
    button._raiseEvent("Click", null);
  } catch (error) {
    thrown = error;
  }

  assert(!!thrown, "Event error should still throw.");
  assertEqual(thrown.message, "Boom", "Event error should preserve original error.");
  assertEqual(capturedErrors.length, 1, "Runtime should log one formatted event error.");
  assert(capturedErrors[0].indexOf("[JOG][Error][Event]") >= 0, "Formatted error should include phase header.");
  assert(capturedErrors[0].indexOf("Control: Button(diagnosticButton)") >= 0, "Formatted error should include control name.");
  assert(capturedErrors[0].indexOf("Event: Click") >= 0, "Formatted error should include event name.");
  assert(capturedErrors[0].indexOf("Message: Boom") >= 0, "Formatted error should include original message.");
}

function testDebugTopicsFilterRuntimeLogs() {
  var capturedLogs = [];
  var customConsole = {
    log: function(message) {
      capturedLogs.push(String(message));
    },
    error: function() {}
  };
  var JOG = loadJOG({ console: customConsole });
  var app = new JOG.Application();
  var page = new JOG.Page();
  var button = new JOG.Button();

  app.Debug = true;
  app.DebugTopics = ["event"];

  button.Name = "filterButton";
  button.OnClick(function() {});
  page.Add(button);
  app.Run(page);
  capturedLogs.length = 0;

  button._raiseEvent("Click", null);

  assertEqual(capturedLogs.length, 1, "DebugTopics should suppress non-matching debug logs.");
  assert(capturedLogs[0].indexOf("[JOG][Event]") >= 0, "DebugTopics should keep matching event logs.");
}

function testMenuBarRendersItemsAndRaisesClickEvents() {
  var JOG = loadJOG();
  var app = new JOG.Application();
  var page = new JOG.Page();
  var menuBar = new JOG.MenuBar();
  var capturedKey = null;

  menuBar.Items = [
    { key: "file", text: "File" },
    { key: "edit", text: "Edit", enabled: false },
    { key: "help", text: "Help" }
  ];
  menuBar.OnItemClick(function(args) {
    capturedKey = args.Key;
  });

  page.Add(menuBar);
  app.Run(page);

  assertEqual(menuBar._itemNodes.length, 3, "MenuBar should render one button per item.");
  assertEqual(menuBar._itemNodes[0].textContent, "File", "MenuBar should render item text.");
  assertEqual(menuBar._itemNodes[1].disabled, true, "MenuBar should disable disabled items.");

  dispatchNodeClick(menuBar._itemNodes[0]);
  assertEqual(capturedKey, "file", "MenuBar should raise item click events with the item key.");
}

function testToolBarUsesFlowLayoutForChildControls() {
  var JOG = loadJOG();
  var app = new JOG.Application();
  var page = new JOG.Page();
  var toolBar = new JOG.ToolBar();
  var button = new JOG.Button();

  button.Text = "Run";
  toolBar.Add(button);
  page.Add(toolBar);
  app.Run(page);

  assertEqual(button._domNode.style.position, "", "ToolBar children should use flow layout.");
  assert(button._domNode.parentNode === toolBar._domNode, "ToolBar should host child controls directly.");
}

function testStatusBarUsesFlowLayoutForChildControls() {
  var JOG = loadJOG();
  var app = new JOG.Application();
  var page = new JOG.Page();
  var statusBar = new JOG.StatusBar();
  var label = new JOG.Label();

  label.Text = "Ready";
  statusBar.Add(label);
  page.Add(statusBar);
  app.Run(page);

  assertEqual(label._domNode.style.position, "", "StatusBar children should use flow layout.");
  assert(label._domNode.parentNode === statusBar._domNode, "StatusBar should host child controls directly.");
}

function testPageHeaderUsesStackedTitleSubtitleLayout() {
  var JOG = loadJOG();
  var app = new JOG.Application();
  var page = new JOG.Page();
  var shell = new JOG.DockPanel();
  var header = new JOG.PageHeader();
  var content = new JOG.SectionPanel();

  shell.Width = 920;
  shell.Height = 640;
  shell.Padding = 20;

  header.Name = "testPageHeader";
  header.Dock = "top";
  header.Margin = { bottom: 18 };
  header.TitleText = "Deals";
  header.SubtitleText = "Pipeline summary and next actions.";

  content.Name = "testPageHeaderContent";
  content.Dock = "fill";

  shell.Add(header);
  shell.Add(content);
  page.Add(shell);
  app.Run(page);

  assertEqual(header._titleNode.textContent, "Deals", "PageHeader should render its title text.");
  assertEqual(header._subtitleNode.textContent, "Pipeline summary and next actions.", "PageHeader should render its subtitle text.");
  assertEqual(header._domNode.style.height !== "0px", true, "PageHeader should size itself without a fixed explicit height.");
  assertEqual(content._domNode.style.top !== "0px", true, "Docked content should sit below the PageHeader.");
}

function testTabControlSwitchesVisiblePage() {
  var JOG = loadJOG();
  var app = new JOG.Application();
  var page = new JOG.Page();
  var tabs = new JOG.TabControl();
  var first = new JOG.TabPage();
  var second = new JOG.TabPage();
  var capturedKey = null;

  first.TabKey = "first";
  first.Title = "First";
  first.Add(new JOG.Label());

  second.TabKey = "second";
  second.Title = "Second";
  second.Add(new JOG.Label());

  tabs.Add(first);
  tabs.Add(second);
  tabs.OnTabChange(function(args) {
    capturedKey = args.Key;
  });

  page.Add(tabs);
  app.Run(page);

  assertEqual(tabs._tabButtonNodes.length, 2, "TabControl should render one tab button per TabPage.");
  assertEqual(first._domNode.style.position, "", "TabPage children should use flow layout inside TabControl.");
  assertEqual(first.Visible, true, "The first tab should be active by default.");
  assertEqual(second.Visible, false, "Inactive tab pages should be hidden.");

  dispatchNodeClick(tabs._tabButtonNodes[1]);
  app.Runtime.flush();

  assertEqual(tabs.ActiveTab, "second", "Clicking a tab button should update ActiveTab.");
  assertEqual(first.Visible, false, "The previous tab page should be hidden after switching.");
  assertEqual(second.Visible, true, "The selected tab page should become visible.");
  assertEqual(capturedKey, "second", "TabControl should raise TabChange with the selected tab key.");
}

function testPageDirectChildrenUseFlowLayoutWhileWindowsRemainAbsolute() {
  var JOG = loadJOG();
  var app = new JOG.Application();
  var page = new JOG.Page();
  var label = new JOG.Label();
  var win = new JOG.Window();

  label.Name = "flowLabel";
  label.Text = "Hello world from JOG.";

  win.Name = "floatingWindow";
  win.Title = "Floating";
  win.SetBounds(40, 30, 320, 180);

  page.Add(label);
  page.Add(win);
  app.Run(page);

  assertEqual(label._domNode.style.position, "", "Direct page labels should use flow layout.");
  assertEqual(win._domNode.style.position, "absolute", "Windows on a page should remain absolutely positioned.");
}

function testCollectionTracksUpdatesSelectionDirtyStateAndSummaries() {
  var JOG = loadJOG();
  var collection = new JOG.Collection({
    idKey: "id",
    rows: [
      { id: "a", name: "Northwind", value: 10 },
      { id: "b", name: "Atlas", value: 20 }
    ],
    summaryDefinitions: {
      total: function(rows) {
        return rows.reduce(function(sum, row) {
          return sum + row.value;
        }, 0);
      },
      dirtyCount: function(rows, currentCollection) {
        return currentCollection.GetDirtyRowIds().length + currentCollection.GetDeletedRowIds().length;
      }
    }
  });

  assertEqual(collection.GetSummary("total"), 30, "Collection should compute summaries from initial rows.");
  assertEqual(collection.HasDirtyRows(), false, "Initial collection state should be clean.");

  collection.Select("b");
  assertEqual(collection.GetSelectedId(), "b", "Collection should track the selected row id.");

  collection.Update("b", { value: 35 });
  assertEqual(collection.GetSummary("total"), 45, "Collection summaries should update after row changes.");
  assertEqual(collection.IsDirty("b"), true, "Updated rows should be marked dirty.");

  collection.Remove("a");
  assertEqual(collection.GetDeletedRowIds().length, 1, "Removing a baseline row should track deleted ids.");
  assertEqual(collection.GetDeletedRowIds()[0], "a", "Deleted row ids should include removed records.");
  assertEqual(collection.GetSummary("dirtyCount"), 2, "Dirty summaries should include updated and deleted rows.");

  collection.MarkClean();
  assertEqual(collection.HasDirtyRows(), false, "MarkClean should reset dirty state.");
  assertEqual(collection.GetDeletedRowIds().length, 0, "MarkClean should clear deleted row ids.");
}

function testDataGridRendersSelectionCommandsAndCollectionRefresh() {
  var JOG = loadJOG();
  var app = new JOG.Application();
  var page = new JOG.Page();
  var collection = new JOG.Collection({
    rows: [
      { id: "1", account: "Northwind", value: 100 },
      { id: "2", account: "Atlas", value: 200 }
    ]
  });
  var grid = new JOG.DataGrid();
  var capturedSelection = "";
  var capturedCommand = "";

  grid.Columns = [
    { key: "account", title: "Account", width: "1fr" },
    { key: "value", title: "Value", width: "120px", align: "right", formatter: function(value) { return "$" + value; } }
  ];
  grid.RowCommands = [
    { key: "edit", text: "Edit", themePreset: "quiet" }
  ];
  grid.Collection = collection;

  grid.OnSelectionChange(function(args) {
    capturedSelection = args.RowId;
  });
  grid.OnRowCommand(function(args) {
    capturedCommand = args.Key + ":" + args.RowId;
  });

  page.Add(grid);
  app.Run(page);

  assertEqual(grid._headerNode.children.length, 3, "DataGrid should render one header cell per column plus commands.");
  assertEqual(grid._rowNodes.length, 2, "DataGrid should render one row node per collection row.");
  assertEqual(grid._rowNodes[0].children[0].textContent, "Northwind", "DataGrid should render field values.");
  assertEqual(grid._rowNodes[0].children[1].textContent, "$100", "DataGrid should apply cell formatters.");

  dispatchNodeClick(grid._rowNodes[1]);
  app.Runtime.flush();

  assertEqual(collection.GetSelectedId(), "2", "Clicking a grid row should update collection selection.");
  assertEqual(capturedSelection, "2", "Grid selection events should expose the row id.");
  assertEqual(grid._rowNodes[1].className.indexOf("jog-selected") >= 0, true, "Selected rows should render with the selected class.");

  dispatchNodeClick(grid._commandNodes["2"].edit);
  assertEqual(capturedCommand, "edit:2", "Grid row commands should expose command and row id.");

  collection.Update("2", { account: "Atlas Renewed", value: 240 });
  app.Runtime.flush();

  assertEqual(grid._rowNodes[1].children[0].textContent, "Atlas Renewed", "Grid should refresh rendered rows after collection updates.");
  assertEqual(grid._rowNodes[1].className.indexOf("jog-dirty") >= 0, true, "Dirty rows should render with the dirty class.");
}

function testDataGridSupportsResizablePixelWidthColumns() {
  var JOG = loadJOG();
  var app = new JOG.Application();
  var page = new JOG.Page();
  var collection = new JOG.Collection({
    rows: [
      { id: "1", account: "Northwind", stage: "Proposal" }
    ]
  });
  var grid = new JOG.DataGrid();

  grid.ResizableColumns = true;
  grid.Columns = [
    { key: "account", title: "Account", width: "180px", minWidth: 160, maxWidth: 260 },
    { key: "stage", title: "Stage", width: "120px" }
  ];
  grid.Collection = collection;

  page.Add(grid);
  app.Run(page);

  assert(!!grid._resizeHandleNodes.account, "Resizable pixel-width columns should render a resize handle.");
  assertEqual(grid._headerNode.style.gridTemplateColumns, "180px 120px", "Grid should start with configured pixel widths.");

  dispatchNodeMouseDown(grid._resizeHandleNodes.account, 180, 0);
  dispatchDocumentMouseMove(app.Runtime.document, 230, 0);
  app.Runtime.flush();

  assertEqual(grid._headerNode.style.gridTemplateColumns, "230px 120px", "Dragging a resize handle should update the header track width.");
  assertEqual(grid._rowNodes[0].style.gridTemplateColumns, "230px 120px", "Dragging a resize handle should update row track widths.");

  dispatchDocumentMouseUp(app.Runtime.document, 230, 0);

  dispatchNodeMouseDown(grid._resizeHandleNodes.account, 230, 0);
  dispatchDocumentMouseMove(app.Runtime.document, 80, 0);
  app.Runtime.flush();
  assertEqual(grid._headerNode.style.gridTemplateColumns, "160px 120px", "Column resizing should respect configured minimum widths.");
  dispatchDocumentMouseUp(app.Runtime.document, 80, 0);

  dispatchNodeMouseDown(grid._resizeHandleNodes.account, 160, 0);
  dispatchDocumentMouseMove(app.Runtime.document, 360, 0);
  app.Runtime.flush();
  assertEqual(grid._headerNode.style.gridTemplateColumns, "260px 120px", "Column resizing should respect configured maximum widths.");
  dispatchDocumentMouseUp(app.Runtime.document, 360, 0);
}

function testDataGridSupportsBoundedFlexibleColumns() {
  var JOG = loadJOG();
  var app = new JOG.Application();
  var page = new JOG.Page();
  var collection = new JOG.Collection({
    rows: [
      { id: "1", account: "Northwind", nextStep: "Coordinate the rollout with legal and operations." }
    ]
  });
  var grid = new JOG.DataGrid();

  grid.Columns = [
    { key: "account", title: "Account", width: "180px" },
    { key: "nextStep", title: "Next Step", minWidth: 220, maxWidth: 420, overflow: "wrap" }
  ];
  grid.Collection = collection;

  page.Add(grid);
  app.Run(page);

  assertEqual(
    grid._headerNode.style.gridTemplateColumns,
    "180px minmax(220px, 420px)",
    "Flexible columns should honor both minimum and maximum bounds in the grid track."
  );
  assertEqual(
    grid._rowNodes[0].style.gridTemplateColumns,
    "180px minmax(220px, 420px)",
    "Row tracks should mirror bounded flexible column sizing."
  );
}

function testDataGridSupportsSortingFilteringAndOverflowModes() {
  var JOG = loadJOG();
  var app = new JOG.Application();
  var page = new JOG.Page();
  var collection = new JOG.Collection({
    rows: [
      { id: "1", account: "Northwind", value: 100, nextStep: "Send revised pricing" },
      { id: "2", account: "Atlas", value: 220, nextStep: "Review rollout plan with operations" },
      { id: "3", account: "Beacon", value: 150, nextStep: "Confirm executive sponsor" }
    ]
  });
  var grid = new JOG.DataGrid();
  var capturedSort = "";
  var capturedEdit = "";

  grid.Columns = [
    { key: "account", title: "Account", width: "160px", editable: true },
    { key: "value", title: "Value", width: "120px", align: "right", sortValue: function(value) { return value; } },
    { key: "nextStep", title: "Next Step", width: "220px", overflow: "wrap", editable: true }
  ];
  grid.Collection = collection;
  grid.FilterColumns = ["account", "nextStep"];
  grid.OnSortChange(function(args) {
    capturedSort = args.SortKey + ":" + args.SortDirection;
  });
  grid.OnCellEditCommit(function(args) {
    capturedEdit = args.Column.key + ":" + args.Value;
  });

  page.Add(grid);
  app.Run(page);

  dispatchNodeClick(grid._headerNode.children[1]);
  app.Runtime.flush();
  assertEqual(capturedSort, "value:asc", "Sorting should raise SortChange with the column key and direction.");
  assertEqual(grid.SortKey, "value", "Sorting should persist the selected sort key.");
  assertEqual(grid._rowNodes[0].children[0].textContent, "Northwind", "Ascending sort should place the lowest value first.");

  dispatchNodeClick(grid._headerNode.children[1]);
  app.Runtime.flush();
  assertEqual(grid.SortDirection, "desc", "Clicking the same header again should reverse the sort direction.");
  assertEqual(grid._rowNodes[0].children[0].textContent, "Atlas", "Descending sort should place the highest value first.");

  grid.FilterText = "pricing";
  app.Runtime.flush();
  assertEqual(grid._rowNodes.length, 1, "FilterText should reduce the grid to matching rows.");
  assertEqual(grid._rowNodes[0].children[0].textContent, "Northwind", "Filtering should match configured filter columns.");
  assertEqual(grid._rowNodes[0].children[2].className.indexOf("jog-data-grid-cell-wrap") >= 0, true, "Wrap overflow should apply a dedicated cell class.");

  grid.ClearSort();
  grid.FilterText = "";
  app.Runtime.flush();
  assertEqual(grid._rowNodes.length, 3, "Clearing the filter should restore all rows.");
  assertEqual(grid.SortDirection, "", "ClearSort should reset the sort direction.");

  dispatchNodeDoubleClick(grid._rowNodes[0].children[0]);
  app.Runtime.flush();
  assertEqual(grid._rowNodes[0].children[0].children[0].tagName, "INPUT", "Editable cells should swap in an editor on double click.");
  dispatchNodeClick(grid._rowNodes[0].children[0].children[0]);
  app.Runtime.flush();
  assertEqual(grid._rowNodes[0].children[0].children[0].tagName, "INPUT", "Clicking into the active editor should not collapse edit mode.");
  grid._rowNodes[0].children[0].children[0].value = "Northwind Labs";
  dispatchNodeDoubleClick(grid._rowNodes[0].children[2]);
  app.Runtime.flush();
  assertEqual(grid._rowNodes[0].children[2].children[0].tagName, "INPUT", "Editing a second cell should move the active editor.");
  assertEqual(collection.GetRow("1").account, "Northwind Labs", "Moving to a new editable cell should commit the previous edit first.");
  grid._rowNodes[0].children[2].children[0].value = "Share the updated rollout plan";
  dispatchNodeKeyDown(grid._rowNodes[0].children[2].children[0], "Enter");
  app.Runtime.flush();
  assertEqual(collection.GetRow("1").nextStep, "Share the updated rollout plan", "Enter should commit a text-cell edit.");
  assertEqual(collection.GetRow("1").account, "Northwind Labs", "Inline editing should commit collection updates.");
  assertEqual(capturedEdit, "nextStep:Share the updated rollout plan", "Inline editing should raise a commit event with the updated value.");
}

function testOpportunityBoardUsesCollectionAndDataGridFlow() {
  var loaded = loadExampleApp("OpportunityBoardApp.js");
  var shell = findControl(loaded.page, function(control) {
    return control.Name === "opportunityBoardShell";
  });
  var clearSelectionButton = findControl(loaded.page, function(control) {
    return control._typeName === "Button" && control.Text === "Clear Selection";
  });
  var markCleanButton = findControl(loaded.page, function(control) {
    return control._typeName === "Button" && control.Text === "Mark Clean";
  });
  var header = findControl(loaded.page, function(control) {
    return control.Name === "opportunityTopBar";
  });
  var grid = findControl(loaded.page, function(control) {
    return control.Name === "opportunityDataGrid";
  });
  var filterInput = findControl(loaded.page, function(control) {
    return control.Name === "opportunityFilterInput";
  });
  var accountRepeater = findControl(loaded.page, function(control) {
    return control.Name === "opportunityAccountRepeater";
  });
  var dialog = findControl(loaded.page, function(control) {
    return control.Name === "opportunityEditorDialog";
  });
  var statusLabel = findControl(loaded.page, function(control) {
    return control._typeName === "Label" && control.Text.indexOf("Status:") === 0;
  });

  assertEqual(shell._typeName, "WorkspaceShell", "OpportunityBoard should use the shared workspace shell primitive.");
  assertEqual(header._typeName, "PageHeader", "OpportunityBoard should use the shared page header primitive.");
  assertEqual(header._domNode.style.height !== "0px", true, "OpportunityBoard header should size itself without a fixed height.");
  assertEqual(clearSelectionButton.Enabled, false, "OpportunityBoard should disable Clear Selection until a row is selected.");
  assertEqual(markCleanButton.Enabled, false, "OpportunityBoard should disable Mark Clean until local changes exist.");
  assert(!!grid, "OpportunityBoard should render a DataGrid.");
  assertEqual(filterInput.Text, "", "OpportunityBoard should start with an empty grid filter.");
  assertEqual(accountRepeater._typeName, "Repeater", "OpportunityBoard should use the repeater helper for sidebar account rows.");
  assertEqual(accountRepeater.Children.length, 3, "OpportunityBoard repeater should render seeded opportunity rows.");
  assertEqual(grid.Collection.GetRows().length, 3, "OpportunityBoard should start with seeded collection rows.");

  dispatchNodeClick(grid._rowNodes[1]);
  loaded.app.Runtime.flush();
  assertEqual(grid.Collection.GetSelectedId(), "2", "OpportunityBoard grid selection should flow through the collection.");
  assertEqual(statusLabel.Text.indexOf("Atlas Bio") >= 0, true, "OpportunityBoard status should reflect the selected row.");
  assertEqual(clearSelectionButton.Enabled, true, "OpportunityBoard should enable Clear Selection after a row is selected.");
  assertEqual(grid.ResizableColumns, true, "OpportunityBoard should enable resizable grid columns.");
  assertEqual(accountRepeater.Children[1].ThemePreset, "primary", "OpportunityBoard repeater should highlight the selected row.");

  dispatchNodeClick(grid._commandNodes["2"].edit);
  loaded.app.Runtime.flush();
  assertEqual(dialog.Visible, true, "OpportunityBoard edit command should open the editor dialog.");

  grid.Collection.Update("2", { value: 86000 });
  loaded.app.Runtime.flush();
  assertEqual(markCleanButton.Enabled, true, "OpportunityBoard should enable Mark Clean after local changes.");
  assertEqual(accountRepeater.Children[1].Text, "Atlas Bio - Qualified", "OpportunityBoard repeater should stay in sync after collection updates.");
  assertEqual(
    grid._headerNode.style.gridTemplateColumns.indexOf("minmax(220px, 420px)") >= 0,
    true,
    "OpportunityBoard should demonstrate a bounded flexible grid column for wider datasets."
  );

  dispatchTextInput(filterInput, "summit");
  loaded.app.Runtime.flush();
  assertEqual(grid.FilterText, "summit", "OpportunityBoard should bind the filter input into the DataGrid filter text.");
  assertEqual(grid._rowNodes.length, 1, "OpportunityBoard filter should narrow visible grid rows.");
}

var tests = [
  { name: "store subscribe and unsubscribe", fn: testStoreSubscribeAndUnsubscribe },
  { name: "store derive keeps computed keys in sync", fn: testStoreDeriveKeepsComputedKeysInSync },
  { name: "container rejects duplicate child names", fn: testContainerRejectsDuplicateChildNames },
  { name: "BindError tracks store and disposes cleanly", fn: testBindErrorTracksStoreAndDisposesCleanly },
  { name: "Label.BindText formats and disposes cleanly", fn: testLabelBindTextFormatsAndDisposesCleanly },
  { name: "BindVisible tracks store and disposes cleanly", fn: testBindVisibleTracksStoreAndDisposesCleanly },
  { name: "BindEnabled tracks store and disposes cleanly", fn: testBindEnabledTracksStoreAndDisposesCleanly },
  { name: "collection BindStore keeps derived store keys in sync", fn: testCollectionBindStoreKeepsDerivedStoreKeysInSync },
  { name: "FormState validates clears and watches store errors", fn: testFormStateValidatesClearsAndWatchesStoreErrors },
  { name: "Repeater renders collection rows and refreshes on change", fn: testRepeaterRendersCollectionRowsAndRefreshesOnChange },
  { name: "ValidationMessage binds text and visibility", fn: testValidationMessageBindsTextAndVisibility },
  { name: "ValidationSummary binds summary and visibility", fn: testValidationSummaryBindsSummaryAndVisibility },
  { name: "ValidationSummary can build summary from error keys", fn: testValidationSummaryCanBuildSummaryFromErrorKeys },
  { name: "application tree dump reports hierarchy", fn: testApplicationDumpTree },
  { name: "application detailed tree dump shows richer state", fn: testApplicationDetailedDumpTreeShowsRicherState },
  { name: "third-party control registration supports metadata lookup and version checks", fn: testThirdPartyControlRegistrationSupportsMetadataLookupAndVersionChecks },
  { name: "third-party control registration rejects duplicates and incompatible versions", fn: testThirdPartyControlRegistrationRejectsDuplicatesAndIncompatibleVersions },
  { name: "sample third-party controls register render and bind without private runtime access", fn: testSampleThirdPartyControlsRegisterRenderAndBindWithoutPrivateRuntimeAccess },
  { name: "third-party dialog uses public window shell hooks", fn: testThirdPartyDialogUsesPublicWindowShellHooks },
  { name: "third-party control errors report package diagnostics clearly", fn: testThirdPartyControlErrorsReportPackageDiagnosticsClearly },
  { name: "multiple third-party packages register and coexist cleanly", fn: testMultipleThirdPartyPackagesRegisterAndCoexistCleanly },
  { name: "Lexical third-party control registers binds and suppresses looped updates", fn: testLexicalThirdPartyControlRegistersBindsAndSuppressesLoopedUpdates },
  { name: "Lexical rich-text third-party control supports formatting commands", fn: testLexicalRichTextThirdPartyControlSupportsFormattingCommands },
  { name: "Flatpickr third-party control registers binds and suppresses looped updates", fn: testFlatpickrThirdPartyControlRegistersBindsAndSuppressesLoopedUpdates },
  { name: "Chart third-party control registers and refreshes from collection", fn: testChartThirdPartyControlRegistersBindsAndRefreshesFromCollection },
  { name: "Grid supports named areas and auto rows", fn: testGridSupportsNamedAreasAndAutoRows },
  { name: "Grid responsive breakpoints apply on mount and resize", fn: testGridResponsiveBreakpointsApplyOnMountAndResize },
  { name: "responsive dock and stack layouts apply on mount and resize", fn: testResponsiveDockAndStackLayoutsApplyOnMountAndResize },
  { name: "dock panel gap supports shell spacing on mount and resize", fn: testDockPanelGapSupportsShellSpacingOnMountAndResize },
  { name: "workspace shell assigns slots and maintains responsive layout", fn: testWorkspaceShellAssignsSlotsAndMaintainsResponsiveLayout },
  { name: "section panel responsive title and padding", fn: testSectionPanelResponsiveTitleAndPadding },
  { name: "split panel responsive orientation and sizing", fn: testSplitPanelResponsiveOrientationAndSizing },
  { name: "fill property supports tab workspace editors", fn: testFillPropertySupportsTabWorkspaceEditors },
  { name: "browser open text file uses modern picker", fn: testBrowserOpenTextFileUsesModernPicker },
  { name: "browser open text file uses fallback input", fn: testBrowserOpenTextFileUsesFallbackInput },
  { name: "browser save text file uses existing handle", fn: testBrowserSaveTextFileUsesExistingHandle },
  { name: "browser save text file uses download fallback", fn: testBrowserSaveTextFileUsesDownloadFallback },
  { name: "notepad loads visible workspace", fn: testNotepadLoadsVisibleWorkspace },
  { name: "notepad settles shell layout after mount", fn: testNotepadSettlesShellLayoutAfterMount },
  { name: "dock panel schedules settle pass for tiny first measure", fn: testDockPanelSchedulesSettlePassForTinyFirstMeasure },
  { name: "notepad keeps status bar after tab open and close", fn: testNotepadKeepsStatusBarAfterTabOpenAndClose },
  { name: "notepad shows dialog when open fails", fn: testNotepadShowsDialogWhenOpenFails },
  { name: "notepad shows dialog when save fails", fn: testNotepadShowsDialogWhenSaveFails },
  { name: "dock managed fill children use dock geometry", fn: testDockManagedFillChildrenUseDockGeometry },
  { name: "theme presets apply preset classes", fn: testThemePresetsApplyPresetClasses },
  { name: "global theme applies to mounted applications", fn: testGlobalThemeAppliesToMountedApplications },
  { name: "application theme overrides global theme", fn: testApplicationThemeOverridesGlobalTheme },
  { name: "resizable window shows resize handle", fn: testResizableWindowShowsHandle },
  { name: "resizable window supports edge resize", fn: testResizableWindowSupportsEdgeResize },
  { name: "modal windows share overlay and close in stack order", fn: testModalWindowsShareOverlayAndCloseInStackOrder },
  { name: "modal focus trap cycles and restores focus", fn: testModalFocusTrapCyclesAndRestoresFocus },
  { name: "nested modals restore focus to underlying dialog", fn: testNestedModalsRestoreFocusToUnderlyingDialog },
  { name: "window lifecycle events track load show and hide", fn: testWindowLifecycleEventsTrackLoadShowAndHide },
  { name: "example app theme switching flow", fn: testExampleAppThemeSwitchingFlow },
  { name: "property setters normalize state", fn: testPropertySettersNormalizeState },
  { name: "SetError and ClearError toggle invalid state", fn: testSetErrorAndClearErrorToggleInvalidState },
  { name: "container remove and clear dispose children", fn: testContainerRemoveAndClearDisposeChildren },
  { name: "disposed controls reject lifecycle operations", fn: testDisposedControlsRejectLifecycleOperations },
  { name: "customer admin dialog integration flow", fn: testCustomerAdminDialogIntegrationFlow },
  { name: "form demo validation and reset integration flow", fn: testFormDemoValidationAndResetIntegrationFlow },
  { name: "customer admin selection and dialog close paths", fn: testCustomerAdminSelectionAndDialogClosePaths },
  { name: "third-party demo notes validation flow", fn: testThirdPartyDemoNotesValidationFlow },
  { name: "runtime formats event errors clearly", fn: testRuntimeFormatsEventErrorsClearly },
  { name: "debug topics filter runtime logs", fn: testDebugTopicsFilterRuntimeLogs },
  { name: "menu bar renders items and raises click events", fn: testMenuBarRendersItemsAndRaisesClickEvents },
  { name: "tool bar uses flow layout for child controls", fn: testToolBarUsesFlowLayoutForChildControls },
  { name: "status bar uses flow layout for child controls", fn: testStatusBarUsesFlowLayoutForChildControls },
  { name: "page header uses stacked title subtitle layout", fn: testPageHeaderUsesStackedTitleSubtitleLayout },
  { name: "tab control switches visible page", fn: testTabControlSwitchesVisiblePage },
  { name: "page direct children use flow layout while windows remain absolute", fn: testPageDirectChildrenUseFlowLayoutWhileWindowsRemainAbsolute },
  { name: "collection tracks updates selection dirty state and summaries", fn: testCollectionTracksUpdatesSelectionDirtyStateAndSummaries },
  { name: "data grid renders selection commands and collection refresh", fn: testDataGridRendersSelectionCommandsAndCollectionRefresh },
  { name: "data grid supports resizable pixel-width columns", fn: testDataGridSupportsResizablePixelWidthColumns },
  { name: "data grid supports bounded flexible columns", fn: testDataGridSupportsBoundedFlexibleColumns },
  { name: "data grid supports sorting filtering and overflow modes", fn: testDataGridSupportsSortingFilteringAndOverflowModes },
  { name: "opportunity board uses collection and data grid flow", fn: testOpportunityBoardUsesCollectionAndDataGridFlow }
];

var failed = 0;

Promise.resolve().then(async function() {
  var i;
  var test;

  for (i = 0; i < tests.length; i += 1) {
    test = tests[i];
    try {
      await Promise.resolve(test.fn());
      console.log("PASS " + test.name);
    } catch (error) {
      failed += 1;
      console.error("FAIL " + test.name);
      console.error(error.stack || error.message);
    }
  }

  if (failed > 0) {
    process.exitCode = 1;
  } else {
    console.log("PASS all tests (" + tests.length + ")");
  }
});
