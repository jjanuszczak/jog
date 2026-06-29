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
    helper.Text = "Edit the customer name below, then open the modal window. Drag the lower-right corner to resize it.";

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

    var customerWindow = new CustomerWindow(state);
    customerWindow.Hide();

    openWindow.OnClick(function() {
      customerWindow.ShowModal();
    });

    pageLayout.Add(hero);
    pageLayout.Add(helper);
    pageLayout.Add(customerName);
    pageLayout.Add(preview);
    pageLayout.Add(openWindow);

    this.Add(pageSection);
    this.Add(customerWindow);
  }

  MainPage.prototype = Object.create(JOG.Page.prototype);
  MainPage.prototype.constructor = MainPage;

  function boot() {
    var app = new JOG.Application();
    app.Run(new MainPage());
  }

  global.addEventListener("load", boot, false);
})(window);
