(function(global) {
  "use strict";

  function buildSummary(store) {
    var summary = [
      "Name: " + store.Get("customerName"),
      "Tier: " + store.Get("customerTier"),
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
      customerActive: true,
      customerNotes: "Interested in a pilot rollout during Q4.",
      summary: ""
    });

    buildSummary(store);

    var shell = new JOG.SectionPanel();
    shell.Name = "formShell";
    shell.Title = "New Customer Intake";
    shell.Width = 760;
    shell.Padding = 18;

    var layout = new JOG.StackPanel();
    layout.Name = "formLayout";
    layout.Orientation = "vertical";
    layout.Gap = 12;

    var intro = new JOG.Label();
    intro.Text = "This form demo exercises TextBox, DropDownList, CheckBox, and TextArea controls together.";

    var nameLabel = new JOG.Label();
    nameLabel.Text = "Customer Name";

    var nameInput = new JOG.TextBox();
    nameInput.Name = "formCustomerName";
    nameInput.Width = 320;
    nameInput.BindText(store, "customerName");

    var tierLabel = new JOG.Label();
    tierLabel.Text = "Tier";

    var tierSelect = new JOG.DropDownList();
    tierSelect.Name = "formCustomerTier";
    tierSelect.Width = 220;
    tierSelect.Options = [
      { value: "enterprise", text: "Enterprise" },
      { value: "growth", text: "Growth" },
      { value: "starter", text: "Starter" }
    ];
    tierSelect.BindSelectedValue(store, "customerTier");

    var activeCheck = new JOG.CheckBox();
    activeCheck.Name = "formCustomerActive";
    activeCheck.Text = "Customer is active";
    activeCheck.BindChecked(store, "customerActive");

    var notesLabel = new JOG.Label();
    notesLabel.Text = "Notes";

    var notesInput = new JOG.TextArea();
    notesInput.Name = "formCustomerNotes";
    notesInput.Width = 520;
    notesInput.Height = 140;
    notesInput.Placeholder = "Enter customer notes";
    notesInput.BindText(store, "customerNotes");

    var actions = new JOG.StackPanel();
    actions.Name = "formActions";
    actions.Orientation = "horizontal";
    actions.Gap = 10;

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

    ["customerName", "customerTier", "customerActive", "customerNotes"].forEach(function(key) {
      store.Subscribe(key, function() {
        buildSummary(store);
      });
    });

    summarySection.Add(summaryLabel);

    layout.Add(intro);
    layout.Add(nameLabel);
    layout.Add(nameInput);
    layout.Add(tierLabel);
    layout.Add(tierSelect);
    layout.Add(activeCheck);
    layout.Add(notesLabel);
    layout.Add(notesInput);
    layout.Add(actions);

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
