(function(global) {
  "use strict";

  function buildSummary(store) {
    var summary = [
      "Name: " + store.Get("customerName"),
      "Tier: " + store.Get("customerTier"),
      "Region: " + store.Get("customerRegion"),
      "Owner: " + store.Get("customerOwner"),
      "Active: " + (store.Get("customerActive") ? "Yes" : "No"),
      "Notes: " + store.Get("customerNotes")
    ].join(" | ");
    store.Set("summary", summary);
  }

  function CustomerFormPage() {
    JOG.Page.call(this);

    this.Title = "JOG V2 Form Demo";
    this.Name = "customerFormPage";

    var store = new JOG.Store({
      customerName: "Atlas Bio",
      customerTier: "growth",
      customerRegion: "sea",
      customerOwner: "maya",
      customerActive: true,
      customerNotes: "Interested in a pilot rollout during Q4.",
      summary: ""
    });

    buildSummary(store);

    var shell = new JOG.SectionPanel();
    shell.Name = "formShell";
    shell.Title = "New Customer Intake";
    shell.Width = 760;
    shell.MinWidth = 760;
    shell.Padding = 18;

    var layout = new JOG.StackPanel();
    layout.Name = "formLayout";
    layout.Orientation = "vertical";
    layout.Gap = 14;

    var intro = new JOG.Label();
    intro.Text = "This form demo exercises TextBox, DropDownList, RadioButton, ListBox, CheckBox, and TextArea controls in a desktop-style layout.";

    var formGrid = new JOG.Grid();
    formGrid.Name = "formGrid";
    formGrid.Columns = ["160px", "1fr"];
    formGrid.ColumnGap = 18;
    formGrid.RowGap = 12;

    var nameLabel = new JOG.Label();
    nameLabel.Text = "Customer Name";
    nameLabel.GridColumn = 1;
    nameLabel.GridRow = 1;

    var nameInput = new JOG.TextBox();
    nameInput.Name = "formCustomerName";
    nameInput.GridColumn = 2;
    nameInput.GridRow = 1;
    nameInput.Width = 360;
    nameInput.MinWidth = 360;
    nameInput.BindText(store, "customerName");

    var tierLabel = new JOG.Label();
    tierLabel.Text = "Tier";
    tierLabel.GridColumn = 1;
    tierLabel.GridRow = 2;

    var tierSelect = new JOG.DropDownList();
    tierSelect.Name = "formCustomerTier";
    tierSelect.GridColumn = 2;
    tierSelect.GridRow = 2;
    tierSelect.Width = 240;
    tierSelect.MinWidth = 240;
    tierSelect.Options = [
      { value: "enterprise", text: "Enterprise" },
      { value: "growth", text: "Growth" },
      { value: "starter", text: "Starter" }
    ];
    tierSelect.BindSelectedValue(store, "customerTier");

    var activeCheck = new JOG.CheckBox();
    activeCheck.Name = "formCustomerActive";
    activeCheck.Text = "Customer is active";
    activeCheck.GridColumn = 2;
    activeCheck.GridRow = 3;
    activeCheck.BindChecked(store, "customerActive");

    var regionLabel = new JOG.Label();
    regionLabel.Text = "Region";
    regionLabel.GridColumn = 1;
    regionLabel.GridRow = 4;

    var regionRow = new JOG.StackPanel();
    regionRow.Name = "regionRow";
    regionRow.Orientation = "horizontal";
    regionRow.Gap = 14;
    regionRow.GridColumn = 2;
    regionRow.GridRow = 4;

    var seaRadio = new JOG.RadioButton();
    seaRadio.Name = "regionSea";
    seaRadio.Text = "Southeast Asia";
    seaRadio.GroupName = "customerRegion";
    seaRadio.Value = "sea";
    seaRadio.BindSelectedValue(store, "customerRegion");

    var menaRadio = new JOG.RadioButton();
    menaRadio.Name = "regionMena";
    menaRadio.Text = "Middle East";
    menaRadio.GroupName = "customerRegion";
    menaRadio.Value = "mena";
    menaRadio.BindSelectedValue(store, "customerRegion");

    var euRadio = new JOG.RadioButton();
    euRadio.Name = "regionEu";
    euRadio.Text = "Europe";
    euRadio.GroupName = "customerRegion";
    euRadio.Value = "eu";
    euRadio.BindSelectedValue(store, "customerRegion");

    regionRow.Add(seaRadio);
    regionRow.Add(menaRadio);
    regionRow.Add(euRadio);

    var ownerLabel = new JOG.Label();
    ownerLabel.Text = "Account Owner";
    ownerLabel.GridColumn = 1;
    ownerLabel.GridRow = 5;

    var ownerList = new JOG.ListBox();
    ownerList.Name = "formCustomerOwner";
    ownerList.GridColumn = 2;
    ownerList.GridRow = 5;
    ownerList.Width = 280;
    ownerList.MinWidth = 280;
    ownerList.SizeRows = 4;
    ownerList.Options = [
      { value: "maya", text: "Maya Santos" },
      { value: "daniel", text: "Daniel Ng" },
      { value: "farah", text: "Farah Rahman" },
      { value: "john", text: "John Januszczak" }
    ];
    ownerList.BindSelectedValue(store, "customerOwner");

    var notesLabel = new JOG.Label();
    notesLabel.Text = "Notes";
    notesLabel.GridColumn = 1;
    notesLabel.GridRow = 6;

    var notesInput = new JOG.TextArea();
    notesInput.Name = "formCustomerNotes";
    notesInput.GridColumn = 2;
    notesInput.GridRow = 6;
    notesInput.Width = 520;
    notesInput.Height = 140;
    notesInput.MinWidth = 520;
    notesInput.MinHeight = 140;
    notesInput.Placeholder = "Enter customer notes";
    notesInput.BindText(store, "customerNotes");

    var actions = new JOG.StackPanel();
    actions.Name = "formActions";
    actions.Orientation = "horizontal";
    actions.Gap = 10;
    actions.GridColumn = 2;
    actions.GridRow = 7;

    var saveButton = new JOG.Button();
    saveButton.Text = "Save Form";
    saveButton.OnClick(function() {
      buildSummary(store);
      store.Set("summary", store.Get("summary") + " | Saved");
    });

    var resetButton = new JOG.Button();
    resetButton.Text = "Reset";
    resetButton.OnClick(function() {
      store.Set("customerName", "Atlas Bio");
      store.Set("customerTier", "growth");
      store.Set("customerRegion", "sea");
      store.Set("customerOwner", "maya");
      store.Set("customerActive", true);
      store.Set("customerNotes", "Interested in a pilot rollout during Q4.");
      buildSummary(store);
    });

    actions.Add(saveButton);
    actions.Add(resetButton);

    var summarySection = new JOG.SectionPanel();
    summarySection.Name = "summarySection";
    summarySection.Title = "Form Summary";
    summarySection.Padding = 16;
    summarySection.Margin = { top: 8 };

    var summaryLabel = new JOG.Label();
    summaryLabel.Text = store.Get("summary");
    store.Subscribe("summary", function(value) {
      summaryLabel.Text = value;
    });

    ["customerName", "customerTier", "customerRegion", "customerOwner", "customerActive", "customerNotes"].forEach(function(key) {
      store.Subscribe(key, function() {
        buildSummary(store);
      });
    });

    summarySection.Add(summaryLabel);

    layout.Add(intro);
    formGrid.Add(nameLabel);
    formGrid.Add(nameInput);
    formGrid.Add(tierLabel);
    formGrid.Add(tierSelect);
    formGrid.Add(activeCheck);
    formGrid.Add(regionLabel);
    formGrid.Add(regionRow);
    formGrid.Add(ownerLabel);
    formGrid.Add(ownerList);
    formGrid.Add(notesLabel);
    formGrid.Add(notesInput);
    formGrid.Add(actions);

    layout.Add(formGrid);

    shell.Add(layout);
    shell.Add(summarySection);
    this.Add(shell);
  }

  CustomerFormPage.prototype = Object.create(JOG.Page.prototype);
  CustomerFormPage.prototype.constructor = CustomerFormPage;

  function boot() {
    var app = new JOG.Application();
    app.Run(new CustomerFormPage());
  }

  global.addEventListener("load", boot, false);
})(window);
