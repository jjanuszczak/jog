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

  function setFieldError(store, key, message) {
    store.Set(key, message);
  }

  function validateForm(store) {
    var hasErrors = false;
    var name = (store.Get("customerName") || "").trim();
    var region = (store.Get("customerRegion") || "").trim();
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

    if (!region) {
      setFieldError(store, "customerRegionError", "Select the customer region before saving this intake.");
      hasErrors = true;
    } else {
      setFieldError(store, "customerRegionError", "");
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
    setFieldError(store, "customerRegionError", "");
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
      customerRegion: "",
      customerOwner: "maya",
      customerActive: true,
      customerNotes: "Interested in a pilot rollout during Q4.",
      summary: "",
      saveStatus: "Ready to save.",
      customerNameError: "",
      customerRegionError: "",
      customerActiveError: "",
      customerNotesError: ""
    });

    buildSummary(store);

    var shell = new JOG.SectionPanel();
    shell.Name = "formShell";
    shell.Title = "New Customer Intake";
    shell.MaxWidth = 760;
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
    formGrid.Responsive = {
      base: {
        columns: ["1fr"],
        columnGap: 10
      },
      md: {
        columns: ["160px", "1fr"],
        columnGap: 18
      }
    };

    function setResponsiveFieldPlacement(control, mobileRow, desktopColumn, desktopRow) {
      control.ResponsiveGrid = {
        base: {
          column: 1,
          row: mobileRow
        },
        md: {
          column: desktopColumn,
          row: desktopRow
        }
      };
    }

    var validationSection = new JOG.ValidationSummary();
    validationSection.Name = "validationSection";
    validationSection.BindErrors(store, [
      "customerNameError",
      "customerRegionError",
      "customerActiveError",
      "customerNotesError"
    ]);

    var nameLabel = new JOG.Label();
    nameLabel.Text = "Customer Name";
    nameLabel.GridColumn = 1;
    nameLabel.GridRow = 1;
    setResponsiveFieldPlacement(nameLabel, 1, 1, 1);

    var nameInput = new JOG.TextBox();
    nameInput.Name = "formCustomerName";
    nameInput.GridColumn = 2;
    nameInput.GridRow = 1;
    nameInput.CssClass = "jog-fill-width";
    nameInput.BindText(store, "customerName");
    nameInput.BindError(store, "customerNameError");
    setResponsiveFieldPlacement(nameInput, 2, 2, 1);

    var nameError = new JOG.ValidationMessage();
    nameError.Name = "formCustomerNameError";
    nameError.GridColumn = 2;
    nameError.GridRow = 2;
    nameError.BindMessage(store, "customerNameError");
    setResponsiveFieldPlacement(nameError, 3, 2, 2);

    var tierLabel = new JOG.Label();
    tierLabel.Text = "Tier";
    tierLabel.GridColumn = 1;
    tierLabel.GridRow = 3;
    setResponsiveFieldPlacement(tierLabel, 4, 1, 3);

    var tierSelect = new JOG.DropDownList();
    tierSelect.Name = "formCustomerTier";
    tierSelect.GridColumn = 2;
    tierSelect.GridRow = 3;
    tierSelect.CssClass = "jog-fill-width";
    tierSelect.Options = [
      { value: "enterprise", text: "Enterprise" },
      { value: "growth", text: "Growth" },
      { value: "starter", text: "Starter" }
    ];
    tierSelect.BindSelectedValue(store, "customerTier");
    setResponsiveFieldPlacement(tierSelect, 5, 2, 3);

    var activeCheck = new JOG.CheckBox();
    activeCheck.Name = "formCustomerActive";
    activeCheck.Text = "Customer is active";
    activeCheck.GridColumn = 2;
    activeCheck.GridRow = 4;
    activeCheck.BindChecked(store, "customerActive");
    activeCheck.BindError(store, "customerActiveError");
    setResponsiveFieldPlacement(activeCheck, 6, 2, 4);

    var activeError = new JOG.ValidationMessage();
    activeError.Name = "formCustomerActiveError";
    activeError.GridColumn = 2;
    activeError.GridRow = 5;
    activeError.BindMessage(store, "customerActiveError");
    setResponsiveFieldPlacement(activeError, 7, 2, 5);

    var regionLabel = new JOG.Label();
    regionLabel.Text = "Region";
    regionLabel.GridColumn = 1;
    regionLabel.GridRow = 6;
    setResponsiveFieldPlacement(regionLabel, 8, 1, 6);

    var regionRow = new JOG.StackPanel();
    regionRow.Name = "regionRow";
    regionRow.Orientation = "horizontal";
    regionRow.Gap = 14;
    regionRow.GridColumn = 2;
    regionRow.GridRow = 6;
    regionRow.BindError(store, "customerRegionError");
    setResponsiveFieldPlacement(regionRow, 9, 2, 6);

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

    var regionError = new JOG.ValidationMessage();
    regionError.Name = "formCustomerRegionError";
    regionError.GridColumn = 2;
    regionError.GridRow = 7;
    regionError.BindMessage(store, "customerRegionError");
    setResponsiveFieldPlacement(regionError, 10, 2, 7);

    var ownerLabel = new JOG.Label();
    ownerLabel.Text = "Account Owner";
    ownerLabel.GridColumn = 1;
    ownerLabel.GridRow = 8;
    setResponsiveFieldPlacement(ownerLabel, 11, 1, 8);

    var ownerList = new JOG.ListBox();
    ownerList.Name = "formCustomerOwner";
    ownerList.GridColumn = 2;
    ownerList.GridRow = 8;
    ownerList.CssClass = "jog-fill-width";
    ownerList.SizeRows = 4;
    ownerList.Options = [
      { value: "maya", text: "Maya Santos" },
      { value: "daniel", text: "Daniel Ng" },
      { value: "farah", text: "Farah Rahman" },
      { value: "john", text: "John Januszczak" }
    ];
    ownerList.BindSelectedValue(store, "customerOwner");
    setResponsiveFieldPlacement(ownerList, 12, 2, 8);

    var notesLabel = new JOG.Label();
    notesLabel.Text = "Notes";
    notesLabel.GridColumn = 1;
    notesLabel.GridRow = 9;
    setResponsiveFieldPlacement(notesLabel, 13, 1, 9);

    var notesInput = new JOG.TextArea();
    notesInput.Name = "formCustomerNotes";
    notesInput.GridColumn = 2;
    notesInput.GridRow = 9;
    notesInput.Height = 140;
    notesInput.CssClass = "jog-fill-width";
    notesInput.MinHeight = 140;
    notesInput.Placeholder = "Enter customer notes";
    notesInput.BindText(store, "customerNotes");
    notesInput.BindError(store, "customerNotesError");
    setResponsiveFieldPlacement(notesInput, 14, 2, 9);

    var notesError = new JOG.ValidationMessage();
    notesError.Name = "formCustomerNotesError";
    notesError.GridColumn = 2;
    notesError.GridRow = 10;
    notesError.BindMessage(store, "customerNotesError");
    setResponsiveFieldPlacement(notesError, 15, 2, 10);

    var actions = new JOG.StackPanel();
    actions.Name = "formActions";
    actions.Orientation = "horizontal";
    actions.Gap = 10;
    actions.GridColumn = 2;
    actions.GridRow = 11;
    setResponsiveFieldPlacement(actions, 16, 2, 11);

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
      store.Set("customerRegion", "");
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
    summaryLabel.BindText(store, "summary");

    var statusLabel = new JOG.Label();
    statusLabel.BindText(store, "saveStatus", function(value) {
      return "Status: " + value;
    });

    ["customerName", "customerRegion", "customerActive", "customerNotes"].forEach(function(key) {
      store.Subscribe(key, function() {
        if (key === "customerName" && store.Get("customerNameError")) {
          validateForm(store);
        }
        if (key === "customerRegion" && store.Get("customerRegionError")) {
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
    formGrid.Add(regionError);
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
