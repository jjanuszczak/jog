(function(global) {
  "use strict";

  function basename(path) {
    var value = String(path || "");
    var slash = Math.max(value.lastIndexOf("/"), value.lastIndexOf("\\"));
    return slash >= 0 ? value.slice(slash + 1) : value;
  }

  function textStats(text) {
    var normalized = String(text == null ? "" : text);
    var lines = normalized.split("\n");
    return {
      lines: lines.length,
      chars: normalized.length
    };
  }

  function createDocumentRecord(id, title) {
    return {
      id: id,
      title: title,
      fileName: title,
      handle: null,
      textArea: null,
      tabPage: null,
      dirty: false
    };
  }

  function NotepadPage() {
    JOG.Page.call(this);

    var nextDocumentId = 1;
    var activeDocumentId = "";
    var documents = [];
    var tabControl;
    var appShell;
    var menuBar;
    var statusBar;
    var fileStatus;
    var caretStatus;
    var metricStatus;
    var errorDialog;
    var errorMessage;

    this.Title = "JOG Notepad";
    this.Name = "notepadPage";

    function activeDocument() {
      var match = null;
      documents.forEach(function(record) {
        if (record.id === activeDocumentId) {
          match = record;
        }
      });
      return match;
    }

    function updateStatusBar() {
      var record = activeDocument();
      var text;
      var value;
      var caret;
      var beforeCaret;
      var lines;
      var column;
      var stats;

      if (!record || !record.textArea || !record.textArea._domNode) {
        fileStatus.Text = "No document";
        caretStatus.Text = "Ln 1, Col 1";
        metricStatus.Text = "0 lines, 0 chars";
        return;
      }

      text = record.textArea._domNode.value || "";
      value = record.fileName || record.title;
      if (record.dirty) {
        value += " *";
      }

      caret = record.textArea._domNode.selectionStart || 0;
      beforeCaret = text.slice(0, caret);
      lines = beforeCaret.split("\n");
      column = lines.length ? lines[lines.length - 1].length + 1 : 1;
      stats = textStats(text);

      fileStatus.Text = value;
      caretStatus.Text = "Ln " + lines.length + ", Col " + column;
      metricStatus.Text = stats.lines + " lines, " + stats.chars + " chars";
    }

    function attachEditorEvents(record) {
      var node;

      if (!record.textArea || !record.textArea._domNode) {
        return;
      }

      node = record.textArea._domNode;

      function refreshCaret() {
        updateStatusBar();
      }

      node.addEventListener("click", refreshCaret);
      node.addEventListener("keyup", refreshCaret);
      node.addEventListener("select", refreshCaret);
    }

    function syncActiveDocument(id) {
      activeDocumentId = id;
      tabControl.ActiveTab = id;
      updateStatusBar();
    }

    function markDocumentDirty(record, dirty) {
      if (!record) {
        return;
      }
      record.dirty = !!dirty;
      if (record.tabPage) {
        record.tabPage.Title = dirty ? record.title + " *" : record.title;
      }
      updateStatusBar();
    }

    function showErrorDialog(title, message) {
      if (!errorDialog || !errorMessage) {
        return;
      }
      errorDialog.Title = title || "Error";
      errorMessage.Text = String(message == null ? "" : message);
      errorDialog.ShowModal();
    }

    function buildDocumentTab(record, initialText) {
      var tabPage = new JOG.TabPage();
      var editor = new JOG.TextArea();

      tabPage.Name = "tabPage" + record.id;
      tabPage.TabKey = record.id;
      tabPage.Title = record.title;

      editor.Name = "editor" + record.id;
      editor.CssClass = "jog-fill-width";
      editor.Fill = true;
      editor.Text = initialText || "";
      editor.OnChange(function() {
        markDocumentDirty(record, true);
      });
      editor.OnFocus(function() {
        syncActiveDocument(record.id);
      });

      tabPage.Add(editor);

      record.textArea = editor;
      record.tabPage = tabPage;

      attachEditorEvents(record);
      return tabPage;
    }

    function createNewDocument(title, text) {
      var record = createDocumentRecord("doc-" + nextDocumentId, title || ("Untitled " + nextDocumentId));
      nextDocumentId += 1;
      documents.push(record);
      tabControl.Add(buildDocumentTab(record, text || ""));
      syncActiveDocument(record.id);
      markDocumentDirty(record, false);
      return record;
    }

    function closeActiveDocument() {
      var record = activeDocument();
      var nextRecord = null;
      var nextIndex = -1;

      if (!record) {
        return;
      }

      if (documents.length === 1) {
        createNewDocument();
      }

      documents.forEach(function(candidate, index) {
        if (candidate.id === record.id) {
          nextIndex = index;
        }
      });

      tabControl.Remove(record.tabPage);
      documents = documents.filter(function(candidate) {
        return candidate.id !== record.id;
      });

      if (documents.length) {
        nextRecord = documents[Math.max(0, Math.min(nextIndex, documents.length - 1))];
        syncActiveDocument(nextRecord.id);
      }

    }

    function openTextFileWithPicker() {
      return JOG.Browser.OpenTextFile({
        types: [
          {
            description: "Text files",
            accept: {
              "text/plain": [".txt", ".md", ".log"]
            }
          }
        ]
      }).then(function(result) {
        var record;

        if (!result) {
          return;
        }
        record = createNewDocument(result.name || ("Opened " + nextDocumentId), result.text || "");
        record.fileName = result.name || record.title;
        record.handle = result.handle || null;
        markDocumentDirty(record, false);
      }).catch(function(error) {
        showErrorDialog("Open Failed", error && error.message ? error.message : "Unable to open the selected file.");
      });
    }

    function saveCurrentDocument(saveAs) {
      var record = activeDocument();
      var text;

      if (!record || !record.textArea || !record.textArea._domNode) {
        return Promise.resolve();
      }

      text = record.textArea._domNode.value || "";
      return JOG.Browser.SaveTextFile({
        text: text,
        handle: record.handle,
        saveAs: !!saveAs,
        suggestedName: record.fileName || record.title || "untitled.txt",
        types: [
          {
            description: "Text files",
            accept: {
              "text/plain": [".txt"]
            }
          }
        ]
      }).then(function(result) {
        if (!result) {
          return;
        }
        record.handle = result.handle || null;
        if (result.name) {
          record.fileName = basename(result.name);
          record.title = record.fileName;
        }
        markDocumentDirty(record, false);
      }).catch(function(error) {
        showErrorDialog("Save Failed", error && error.message ? error.message : "Unable to save the current document.");
      });
    }

    appShell = new JOG.DockPanel();
    appShell.Name = "notepadShell";
    appShell.Fill = true;
    appShell.Padding = 12;
    appShell.MinHeight = 0;
    appShell.MinWidth = 0;

    menuBar = new JOG.MenuBar();
    menuBar.Name = "notepadMenu";
    menuBar.Dock = "top";
    menuBar.Height = 48;
    menuBar.Margin = { bottom: 10 };
    menuBar.Items = [
      { key: "new", text: "New" },
      { key: "open", text: "Open" },
      { key: "save", text: "Save" },
      { key: "saveas", text: "Save As" },
      { key: "close", text: "Close Tab" }
    ];
    menuBar.OnItemClick(function(args) {
      if (args.Key === "new") {
        createNewDocument();
        return;
      }
      if (args.Key === "open") {
        openTextFileWithPicker();
        return;
      }
      if (args.Key === "save") {
        saveCurrentDocument(false);
        return;
      }
      if (args.Key === "saveas") {
        saveCurrentDocument(true);
        return;
      }
      if (args.Key === "close") {
        closeActiveDocument();
      }
    });

    statusBar = new JOG.StatusBar();
    statusBar.Name = "notepadStatus";
    statusBar.Dock = "bottom";
    statusBar.Height = 38;
    statusBar.Margin = { top: 10 };

    fileStatus = new JOG.Label();
    caretStatus = new JOG.Label();
    metricStatus = new JOG.Label();

    fileStatus.Text = "No document";
    caretStatus.Text = "Ln 1, Col 1";
    metricStatus.Text = "0 lines, 0 chars";

    statusBar.Add(fileStatus);
    statusBar.Add(caretStatus);
    statusBar.Add(metricStatus);

    errorDialog = new JOG.Dialog();
    errorDialog.Name = "notepadErrorDialog";
    errorDialog.Title = "Error";
    errorDialog.SetBounds(300, 140, 420, 220);
    errorDialog.MinWidth = 380;
    errorDialog.MinHeight = 200;
    errorDialog.CloseButtonText = "Close";

    var errorLayout = new JOG.StackPanel();
    var errorTitle = new JOG.Label();
    var errorButtonRow = new JOG.StackPanel();
    var dismissErrorButton = new JOG.Button();

    errorLayout.Name = "notepadErrorLayout";
    errorLayout.Orientation = "vertical";
    errorLayout.Spacing = 16;

    errorTitle.Text = "The requested file operation could not be completed.";

    errorMessage = new JOG.Label();
    errorMessage.Name = "notepadErrorMessage";
    errorMessage.Text = "";

    errorButtonRow.Name = "notepadErrorFooter";
    errorButtonRow.Orientation = "horizontal";
    errorButtonRow.Spacing = 10;

    dismissErrorButton.Name = "dismissNotepadError";
    dismissErrorButton.Text = "Close";
    dismissErrorButton.OnClick(function() {
      errorDialog.Close();
    });

    errorButtonRow.Add(dismissErrorButton);
    errorLayout.Add(errorTitle);
    errorLayout.Add(errorMessage);
    errorLayout.Add(errorButtonRow);
    errorDialog.Add(errorLayout);
    errorDialog.Hide();

    tabControl = new JOG.TabControl();
    tabControl.Name = "documentTabs";
    tabControl.Dock = "fill";
    tabControl.OnTabChange(function(args) {
      syncActiveDocument(args.Key);
    });

    appShell.Add(menuBar);
    appShell.Add(statusBar);
    appShell.Add(tabControl);

    this.Add(appShell);
    this.Add(errorDialog);

    createNewDocument();
  }

  NotepadPage.prototype = Object.create(JOG.Page.prototype);
  NotepadPage.prototype.constructor = NotepadPage;

  function boot() {
    var app = new JOG.Application();
    app.Run(new NotepadPage());
  }

  global.addEventListener("load", boot, false);
})(window);
