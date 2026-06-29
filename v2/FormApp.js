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

  function buildValidationSummary(store) {
    var messages = [
      store.Get("customerNameError"),
      store.Get("customerActiveError"),
      store.Get("customerNotesError")
    ].filter(function(message) {
      return !!message;
    });

    if (!messages.length) {
      store.Set("validationSummary", "");
      return;
    }

    store.Set("validationSummary", "Please fix: " + messages.join(" | "));
  }

  function setFieldError(store, key, message) {
    store.Set(key, message);
    buildValidationSummary(store);
  }

  function validateForm(store) {
    var hasErrors = false;
    var name = (store.Get("customerName") || "").trim();
    var notes = (store.Get("customerNotes") || "").trim();

    if (name.length < 3) {
      setFieldError(store, "customerNameError", "Enter a customer name with at least 3 characters.");
      hasErrors = true;
    } else {
      setFieldError(store, "customerNameError", "");
    }

    if (notes.length < 12) {
      setFieldError(store, "customerNotesError", "Enter notes with at least 12 characters.");
      hasErrors = true;
    } else {
      setFieldError(store, "customerNotesError", "");
    }

    if (!store.Get("customerActive")) {
      setFieldError(store, "customerActiveError", "Confirm the customer is active before saving this intake.");
      hasErrors = true;
    } else {
      setFieldError(store, "customerActiveError", "");
    }

    return !hasErrors;
  }

  function clearValidation(store) {
    setFieldError(store, "customerNameError", "");
    setFieldError(store, "customerActiveError", "");
    setFieldError(store, "customerNotesError", "");
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
      summary: "",
      saveStatus: "Ready to save.",
      validationSummary: "",
      customerNameError: "",
      customerActiveError: "",
      customerNotesError: ""
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

    var validationSection = new JOG.SectionPanel();
    validationSection.Name = "validationSection";
    validationSection.Title = "Validation Summary";
    validationSection.Padding = 14;
    validationSection.Visible = false;

    var validationLabel = new JOG.Label();
    validationLabel.CssClass = "jog-error-text";
    validationLabel.Text = "";
    store.Subscribe("validationSummary", function(value) {
      validationLabel.Text = value || "";
      validationSection.Visible = !!value;
    });

    validationSection.Add(validationLabel);

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
    nameInput.BindError(store, "customerNameError");

    var nameError = new JOG.Label();
    nameError.Name = "formCustomerNameError";
    nameError.CssClass = "jog-error-text";
    nameError.GridColumn = 2;
    nameError.GridRow = 2;
    nameError.Text = "";
    store.Subscribe("customerNameError", function(value) {
      nameError.Text = value || "";
      nameError.Visible = !!value;
    });
    nameError.Visible = false;

    var tierLabel = new JOG.Label();
    tierLabel.Text = "Tier";
    tierLabel.GridColumn = 1;
    tierLabel.GridRow = 3;

    var tierSelect = new JOG.DropDownList();
    tierSelect.Name = "formCustomerTier";
    tierSelect.GridColumn = 2;
    tierSelect.GridRow = 3;
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
    activeCheck.GridRow = 4;
    activeCheck.BindChecked(store, "customerActive");
    activeCheck.BindError(store, "customerActiveError");

    var activeError = new JOG.Label();
    activeError.Name = "formCustomerActiveError";
    activeError.CssClass = "jog-error-text";
    activeError.GridColumn = 2;
    activeError.GridRow = 5;
    activeError.Text = "";
    store.Subscribe("customerActiveError", function(value) {
      activeError.Text = value || "";
      activeError.Visible = !!value;
    });
    activeError.Visible = false;

    var regionLabel = new JOG.Label();
    regionLabel.Text = "Region";
    regionLabel.GridColumn = 1;
    regionLabel.GridRow = 6;

    var regionRow = new JOG.StackPanel();
    regionRow.Name = "regionRow";
    regionRow.Orientation = "horizontal";
    regionRow.Gap = 14;
    regionRow.GridColumn = 2;
    regionRow.GridRow = 6;

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
    ownerLabel.GridRow = 7;

    var ownerList = new JOG.ListBox();
    ownerList.Name = "formCustomerOwner";
    ownerList.GridColumn = 2;
    ownerList.GridRow = 7;
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
    notesLabel.GridRow = 8;

    var notesInput = new JOG.TextArea();
    notesInput.Name = "formCustomerNotes";
    notesInput.GridColumn = 2;
    notesInput.GridRow = 8;
    notesInput.Width = 520;
    notesInput.Height = 140;
    notesInput.MinWidth = 520;
    notesInput.MinHeight = 140;
    notesInput.Placeholder = "Enter customer notes";
    notesInput.BindText(store, "customerNotes");
    notesInput.BindError(store, "customerNotesError");

    var notesError = new JOG.Label();
    notesError.Name = "formCustomerNotesError";
    notesError.CssClass = "jog-error-text";
    notesError.GridColumn = 2;
    notesError.GridRow = 9;
    notesError.Text = "";
    store.Subscribe("customerNotesError", function(value) {
      notesError.Text = value || "";
      notesError.Visible = !!value;
    });
    notesError.Visible = false;

    var actions = new JOG.StackPanel();
    actions.Name = "formActions";
    actions.Orientation = "horizontal";
    actions.Gap = 10;
    actions.GridColumn = 2;
    actions.GridRow = 10;

    var saveButton = new JOG.Button();
    saveButton.Text = "Save Form";
    saveButton.OnClick(function() {
      if (!validateForm(store)) {
        store.Set("saveStatus", "Validation failed. Fix the highlighted fields.");
        return;
      }
      buildSummary(store);
      store.Set("summary", store.Get("summary") + " | Saved");
      store.Set("saveStatus", "Saved successfully.");
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
      clearValidation(store);
      buildSummary(store);
      store.Set("saveStatus", "Form reset.");
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

    var statusLabel = new JOG.Label();
    statusLabel.Text = "Status: " + store.Get("saveStatus");
    store.Subscribe("saveStatus", function(value) {
      statusLabel.Text = "Status: " + value;
    });

    ["customerName", "customerActive", "customerNotes"].forEach(function(key) {
      store.Subscribe(key, function() {
        if (key === "customerName" && store.Get("customerNameError")) {
          validateForm(store);
        }
        if (key === "customerActive" && store.Get("customerActiveError")) {
          validateForm(store);
        }
        if (key === "customerNotes" && store.Get("customerNotesError")) {
          validateForm(store);
        }
      });
    });

    ["customerName", "customerTier", "customerRegion", "customerOwner", "customerActive", "customerNotes"].forEach(function(key) {
      store.Subscribe(key, function() {
        buildSummary(store);
      });
    });

    summarySection.Add(summaryLabel);
    summarySection.Add(statusLabel);

    layout.Add(intro);
    layout.Add(validationSection);
    formGrid.Add(nameLabel);
    formGrid.Add(nameInput);
    formGrid.Add(nameError);
    formGrid.Add(tierLabel);
    formGrid.Add(tierSelect);
    formGrid.Add(activeCheck);
    formGrid.Add(activeError);
    formGrid.Add(regionLabel);
    formGrid.Add(regionRow);
    formGrid.Add(ownerLabel);
    formGrid.Add(ownerList);
    formGrid.Add(notesLabel);
    formGrid.Add(notesInput);
    formGrid.Add(notesError);
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
