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
  var node = {
    tagName: tagName.toUpperCase(),
    children: [],
    style: {},
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
    focus: function() {}
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
    head: createNode("head"),
    body: createNode("body"),
    createElement: function(tagName) {
      return createNode(tagName);
    },
    addEventListener: function() {},
    removeEventListener: function() {}
  };

  document.body.clientWidth = 1280;
  document.body.clientHeight = 720;
  return document;
}

function loadJOG() {
  var source = fs.readFileSync(path.join(__dirname, "..", "v2", "JOG.js"), "utf8");
  var document = createDocument();
  var sandbox = {
    console: console,
    document: document,
    window: null,
    queueMicrotask: queueMicrotask,
    Promise: Promise,
    setTimeout: setTimeout,
    clearTimeout: clearTimeout
  };

  sandbox.window = sandbox;
  sandbox.addEventListener = function() {};
  vm.createContext(sandbox);
  vm.runInContext(source, sandbox, { filename: "v2/JOG.js" });
  return sandbox.JOG;
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

var tests = [
  { name: "store subscribe and unsubscribe", fn: testStoreSubscribeAndUnsubscribe },
  { name: "container rejects duplicate child names", fn: testContainerRejectsDuplicateChildNames },
  { name: "BindError tracks store and disposes cleanly", fn: testBindErrorTracksStoreAndDisposesCleanly },
  { name: "application tree dump reports hierarchy", fn: testApplicationDumpTree },
  { name: "resizable window shows resize handle", fn: testResizableWindowShowsHandle }
];

var failed = 0;

tests.forEach(function(test) {
  try {
    test.fn();
    console.log("PASS " + test.name);
  } catch (error) {
    failed += 1;
    console.error("FAIL " + test.name);
    console.error(error.stack || error.message);
  }
});

if (failed > 0) {
  process.exitCode = 1;
} else {
  console.log("PASS all tests (" + tests.length + ")");
}
