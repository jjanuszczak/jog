(function(global) {
  "use strict";

  var harborTheme = {
    colors: {
      appBackground: "#e7efe8",
      surface: "#fbf8f1",
      surfaceMuted: "#f1ece1",
      text: "#173125",
      textMuted: "#4f665b",
      textStrong: "#1d2f27",
      border: "#9db2a6",
      borderSoft: "#cfd8d1",
      primary: "#244e41",
      primaryText: "#f5fbf8",
      danger: "#b54d2b",
      dangerText: "#8b3317",
      overlay: "rgba(13, 31, 24, 0.28)",
      resizeGrip: "#6f8c80"
    },
    typography: {
      fontFamily: "\"Trebuchet MS\", Arial, sans-serif"
    }
  };

  var ledgerTheme = {
    colors: {
      appBackground: "#f4efe2",
      surface: "#fffdf8",
      surfaceMuted: "#f3ead7",
      text: "#3d2415",
      textMuted: "#6e584b",
      textStrong: "#44291a",
      border: "#c7b49d",
      borderSoft: "#dfd2c1",
      primary: "#8a4b2a",
      primaryText: "#fff8f1",
      danger: "#b54d2b",
      dangerText: "#8b3317",
      overlay: "rgba(56, 33, 18, 0.24)",
      resizeGrip: "#9d7f67"
    },
    typography: {
      fontFamily: "Georgia, serif"
    }
  };

  var defaultTheme = null;

  function CustomerWindow(store) {
    JOG.Dialog.call(this);

    this.Title = "Customer Detail";
    this.Name = "customerWindow";
    this.SetBounds(220, 100, 420, 240);
    this.Resizable = true;
    this.MinWidth = 360;
    this.MinHeight = 220;

    var layout = new JOG.StackPanel();
    layout.Name = "customerWindowLayout";
    layout.Orientation = "vertical";
    layout.Spacing = 12;

    var nameLabel = new JOG.Label();
    nameLabel.Text = "Customer Name";

    var nameBox = new JOG.TextBox();
    nameBox.Name = "customerName";
    nameBox.Placeholder = "Type a customer name";
    nameBox.BindText(store, "name");

    var saveButton = new JOG.Button();
    saveButton.Text = "Save";
    saveButton.OnClick(function() {
      global.alert("Saved customer: " + store.Get("name"));
    });

    layout.Add(nameLabel);
    layout.Add(nameBox);
    layout.Add(saveButton);
    this.Add(layout);
  }

  CustomerWindow.prototype = Object.create(JOG.Dialog.prototype);
  CustomerWindow.prototype.constructor = CustomerWindow;

  function AuditWindow(store) {
    JOG.Dialog.call(this);
    var dialog = this;

    this.Title = "Audit Detail";
    this.Name = "auditWindow";
    this.SetBounds(280, 150, 360, 220);
    this.MinWidth = 320;
    this.MinHeight = 200;

    var layout = new JOG.StackPanel();
    layout.Name = "auditWindowLayout";
    layout.Orientation = "vertical";
    layout.Spacing = 12;

    var intro = new JOG.Label();
    intro.Text = "This second dialog exists to exercise modal stacking.";

    var currentName = new JOG.Label();
    currentName.Text = "Current customer: " + store.Get("name");
    store.Subscribe("name", function(value) {
      currentName.Text = "Current customer: " + value;
    });

    var closeButton = new JOG.Button();
    closeButton.Text = "Close Audit Window";
    closeButton.OnClick(function() {
      dialog.Close();
    });

    layout.Add(intro);
    layout.Add(currentName);
    layout.Add(closeButton);
    this.Add(layout);
  }

  AuditWindow.prototype = Object.create(JOG.Dialog.prototype);
  AuditWindow.prototype.constructor = AuditWindow;

  function MainPage() {
    JOG.Page.call(this);

    this.Title = "JOG V2 Theme Example";
    this.Name = "mainPage";

    var state = new JOG.Store({
      name: "Acme Trading"
    });

    var pageLayout = new JOG.StackPanel();
    pageLayout.Name = "pageLayout";
    pageLayout.Orientation = "vertical";
    pageLayout.Gap = 12;
    pageLayout.Location(0, 0);
    pageLayout.Width = 520;

    var pageSection = new JOG.SectionPanel();
    pageSection.Name = "pageSection";
    pageSection.Title = "Customer Demo";
    pageSection.Width = 560;
    pageSection.Padding = 16;
    pageSection.Add(pageLayout);

    var hero = new JOG.Label();
    hero.Text = "JOG V2 theme example. Switch the palette live, then open the dialogs to verify the theme flows through page chrome, controls, and modal overlay.";

    var helper = new JOG.Label();
    helper.Text = "Edit the customer name below, switch themes, then open the customer window and audit window to verify modal stacking under the active theme.";

    var menuStatus = new JOG.Label();
    menuStatus.Text = "Last menu action: none";

    var shellStatus = new JOG.Label();
    shellStatus.Text = "Dialogs ready";

    var menuBar = new JOG.MenuBar();
    menuBar.Name = "exampleMenuBar";
    menuBar.Items = [
      { key: "file", text: "File" },
      { key: "view", text: "View" },
      { key: "help", text: "Help" }
    ];
    menuBar.OnItemClick(function(args) {
      menuStatus.Text = "Last menu action: " + args.Key;
    });

    var toolBar = new JOG.ToolBar();
    toolBar.Name = "exampleToolBar";

    var resetToolbarButton = new JOG.Button();
    resetToolbarButton.Text = "Reset Theme";
    resetToolbarButton.OnClick(function() {
      JOG.SetTheme(defaultTheme);
      menuStatus.Text = "Last menu action: toolbar-reset-theme";
    });

    var openToolbarDialogButton = new JOG.Button();
    openToolbarDialogButton.Text = "Open Dialog";
    openToolbarDialogButton.OnClick(function() {
      customerWindow.ShowModal();
      menuStatus.Text = "Last menu action: toolbar-open-dialog";
    });

    toolBar.Add(resetToolbarButton);
    toolBar.Add(openToolbarDialogButton);

    var statusBar = new JOG.StatusBar();
    statusBar.Name = "exampleStatusBar";
    statusBar.Add(menuStatus);
    statusBar.Add(shellStatus);

    var themeRow = new JOG.StackPanel();
    themeRow.Name = "themeRow";
    themeRow.Orientation = "horizontal";
    themeRow.Gap = 12;

    var harborButton = new JOG.Button();
    harborButton.Name = "harborThemeButton";
    harborButton.Text = "Use Harbor Theme";
    harborButton.OnClick(function() {
      JOG.SetTheme(harborTheme);
    });

    var ledgerButton = new JOG.Button();
    ledgerButton.Name = "ledgerThemeButton";
    ledgerButton.Text = "Use Ledger Theme";
    ledgerButton.OnClick(function() {
      JOG.SetTheme(ledgerTheme);
    });

    var defaultButton = new JOG.Button();
    defaultButton.Name = "defaultThemeButton";
    defaultButton.Text = "Use Default Theme";
    defaultButton.OnClick(function() {
      JOG.SetTheme(defaultTheme);
    });

    themeRow.Add(harborButton);
    themeRow.Add(ledgerButton);
    themeRow.Add(defaultButton);

    var customerName = new JOG.TextBox();
    customerName.Name = "customerNameInline";
    customerName.Placeholder = "Customer name";
    customerName.BindText(state, "name");
    customerName.Width = 320;

    var preview = new JOG.Label();
    preview.Text = "Current customer: " + state.Get("name");
    state.Subscribe("name", function(value) {
      preview.Text = "Current customer: " + value;
    });

    var openWindow = new JOG.Button();
    openWindow.Text = "Open Customer Window";

    var openAuditWindow = new JOG.Button();
    openAuditWindow.Text = "Open Audit Window";

    var openStackedFlow = new JOG.Button();
    openStackedFlow.Text = "Open Stacked Dialogs";

    var customerWindow = new CustomerWindow(state);
    customerWindow.Hide();

    var auditWindow = new AuditWindow(state);
    auditWindow.Hide();

    openWindow.OnClick(function() {
      customerWindow.ShowModal();
      shellStatus.Text = "Customer dialog open";
    });

    openAuditWindow.OnClick(function() {
      auditWindow.ShowModal();
      shellStatus.Text = "Audit dialog open";
    });

    openStackedFlow.OnClick(function() {
      customerWindow.ShowModal();
      auditWindow.ShowModal();
      shellStatus.Text = "Stacked dialogs open";
    });

    pageLayout.Add(hero);
    pageLayout.Add(helper);
    pageLayout.Add(menuBar);
    pageLayout.Add(toolBar);
    pageLayout.Add(themeRow);
    pageLayout.Add(customerName);
    pageLayout.Add(preview);
    pageLayout.Add(openWindow);
    pageLayout.Add(openAuditWindow);
    pageLayout.Add(openStackedFlow);
    pageLayout.Add(statusBar);

    this.Add(pageSection);
    this.Add(customerWindow);
    this.Add(auditWindow);
  }

  MainPage.prototype = Object.create(JOG.Page.prototype);
  MainPage.prototype.constructor = MainPage;

  function boot() {
    var app = new JOG.Application();
    defaultTheme = JOG.GetTheme();
    app.Run(new MainPage());
  }

  global.addEventListener("load", boot, false);
})(window);
