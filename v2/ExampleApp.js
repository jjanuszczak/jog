(function(global) {
  "use strict";

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

    this.Title = "JOG V2 Example";
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
    hero.Text = "JOG V2 example. This page is intentionally sparse so the runtime is easier to evaluate.";

    var helper = new JOG.Label();
    helper.Text = "Edit the customer name below, then open the customer window and the audit window to verify modal stacking. Resize the customer window from any edge or corner.";

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
    });

    openAuditWindow.OnClick(function() {
      auditWindow.ShowModal();
    });

    openStackedFlow.OnClick(function() {
      customerWindow.ShowModal();
      auditWindow.ShowModal();
    });

    pageLayout.Add(hero);
    pageLayout.Add(helper);
    pageLayout.Add(customerName);
    pageLayout.Add(preview);
    pageLayout.Add(openWindow);
    pageLayout.Add(openAuditWindow);
    pageLayout.Add(openStackedFlow);

    this.Add(pageSection);
    this.Add(customerWindow);
    this.Add(auditWindow);
  }

  MainPage.prototype = Object.create(JOG.Page.prototype);
  MainPage.prototype.constructor = MainPage;

  function boot() {
    var app = new JOG.Application();
    app.Run(new MainPage());
  }

  global.addEventListener("load", boot, false);
})(window);
