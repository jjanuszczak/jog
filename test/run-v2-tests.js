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
    eventListeners: {},
    createElement: function(tagName) {
      return createNode(tagName);
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

  document.body.clientWidth = 1280;
  document.body.clientHeight = 720;
  return document;
}

function createJOGSandbox(options) {
  var source = fs.readFileSync(path.join(__dirname, "..", "v2", "JOG.js"), "utf8");
  var document = createDocument();
  var windowEventListeners = {};
  options = options || {};
  var sandbox = {
    console: options.console || console,
    document: document,
    window: null,
    queueMicrotask: queueMicrotask,
    Promise: Promise,
    setTimeout: setTimeout,
    clearTimeout: clearTimeout
  };

  sandbox.window = sandbox;
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
  vm.runInContext(source, sandbox, { filename: "v2/JOG.js" });
  return sandbox;
}

function loadJOG(options) {
  return createJOGSandbox(options).JOG;
}

function loadExampleApp(scriptName, options) {
  var sandbox = createJOGSandbox(options);
  var source = fs.readFileSync(path.join(__dirname, "..", "v2", scriptName), "utf8");
  var originalRun = sandbox.JOG.Application.prototype.Run;

  sandbox.JOG.Application.prototype.Run = function(page) {
    sandbox.__lastApp = this;
    sandbox.__lastPage = page;
    return originalRun.call(this, page);
  };

  vm.runInContext(source, sandbox, { filename: "v2/" + scriptName });

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
  listeners[0]({ target: node });
}

function dispatchNodeKeyDown(node, key) {
  var listeners = (node && node.eventListeners && node.eventListeners.keydown) || [];

  assertEqual(listeners.length > 0, true, "Node should expose a keydown listener.");
  listeners[0]({ target: node, key: key });
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

  editButton._raiseEvent("Click", null);
  app.Runtime.flush();

  assertEqual(dialog.Visible, true, "Edit button should open the dialog.");
  assertEqual(app.Runtime._modalWindows.length, 1, "Opened dialog should register in modal stack.");

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

var tests = [
  { name: "store subscribe and unsubscribe", fn: testStoreSubscribeAndUnsubscribe },
  { name: "container rejects duplicate child names", fn: testContainerRejectsDuplicateChildNames },
  { name: "BindError tracks store and disposes cleanly", fn: testBindErrorTracksStoreAndDisposesCleanly },
  { name: "Label.BindText formats and disposes cleanly", fn: testLabelBindTextFormatsAndDisposesCleanly },
  { name: "BindVisible tracks store and disposes cleanly", fn: testBindVisibleTracksStoreAndDisposesCleanly },
  { name: "ValidationMessage binds text and visibility", fn: testValidationMessageBindsTextAndVisibility },
  { name: "ValidationSummary binds summary and visibility", fn: testValidationSummaryBindsSummaryAndVisibility },
  { name: "application tree dump reports hierarchy", fn: testApplicationDumpTree },
  { name: "application detailed tree dump shows richer state", fn: testApplicationDetailedDumpTreeShowsRicherState },
  { name: "resizable window shows resize handle", fn: testResizableWindowShowsHandle },
  { name: "resizable window supports edge resize", fn: testResizableWindowSupportsEdgeResize },
  { name: "modal windows share overlay and close in stack order", fn: testModalWindowsShareOverlayAndCloseInStackOrder },
  { name: "window lifecycle events track load show and hide", fn: testWindowLifecycleEventsTrackLoadShowAndHide },
  { name: "property setters normalize state", fn: testPropertySettersNormalizeState },
  { name: "SetError and ClearError toggle invalid state", fn: testSetErrorAndClearErrorToggleInvalidState },
  { name: "container remove and clear dispose children", fn: testContainerRemoveAndClearDisposeChildren },
  { name: "disposed controls reject lifecycle operations", fn: testDisposedControlsRejectLifecycleOperations },
  { name: "customer admin dialog integration flow", fn: testCustomerAdminDialogIntegrationFlow },
  { name: "form demo validation and reset integration flow", fn: testFormDemoValidationAndResetIntegrationFlow },
  { name: "customer admin selection and dialog close paths", fn: testCustomerAdminSelectionAndDialogClosePaths },
  { name: "runtime formats event errors clearly", fn: testRuntimeFormatsEventErrorsClearly },
  { name: "debug topics filter runtime logs", fn: testDebugTopicsFilterRuntimeLogs }
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
