(function(global) {
  "use strict";

  function setSelectedCustomer(store, customerKey) {
    var name = store.Get(customerKey + "Name");
    var status = store.Get(customerKey + "Status");
    store.Set("selectedCustomerKey", customerKey);
    store.Set("selectedName", name);
    store.Set("selectedStatus", status);
    store.Set("selectedSummary", name + " - " + status);
    store.Set("sidebarSelection", "Selected: " + name);
  }

  function setSelectedFieldError(store, key, message) {
    store.Set(key, message);
  }

  function validateSelectedCustomer(store) {
    var hasErrors = false;
    var name = (store.Get("selectedName") || "").trim();
    var status = (store.Get("selectedStatus") || "").trim();
    var allowedStatuses = ["active", "pending", "inactive"];

    if (name.length < 3) {
      setSelectedFieldError(store, "selectedNameError", "Enter a customer name with at least 3 characters.");
      hasErrors = true;
    } else {
      setSelectedFieldError(store, "selectedNameError", "");
    }

    if (!status) {
      setSelectedFieldError(store, "selectedStatusError", "Enter a customer status.");
      hasErrors = true;
    } else if (allowedStatuses.indexOf(status.toLowerCase()) < 0) {
      setSelectedFieldError(store, "selectedStatusError", "Status must be Active, Pending, or Inactive.");
      hasErrors = true;
    } else {
      setSelectedFieldError(store, "selectedStatusError", "");
    }

    return !hasErrors;
  }

  function clearSelectedValidation(store) {
    setSelectedFieldError(store, "selectedNameError", "");
    setSelectedFieldError(store, "selectedStatusError", "");
  }

  function persistSelectedCustomer(store) {
    var customerKey = store.Get("selectedCustomerKey");
    var name = store.Get("selectedName");
    var status = store.Get("selectedStatus");
    var summary = name + " - " + status;

    if (!customerKey) {
      return;
    }

    store.Set(customerKey + "Name", name);
    store.Set(customerKey + "Status", status);
    store.Set(customerKey + "Summary", summary);
    store.Set("selectedSummary", summary);
    store.Set("sidebarSelection", "Selected: " + name);
  }

  function EditCustomerDialog(store) {
    JOG.Dialog.call(this);

    this.Name = "editCustomerDialog";
    this.Title = "Edit Customer";
    this.SetBounds(260, 100, 460, 400);
    this.MinWidth = 460;
    this.MinHeight = 400;
    this.CloseButtonText = "Done";

    var layout = new JOG.StackPanel();
    layout.Name = "editLayout";
    layout.Orientation = "vertical";
    layout.Spacing = 16;

    var header = new JOG.Label();
    header.Text = "Update the selected customer record. This dialog shares the same validation routine as the inline editor.";

    var validationSection = new JOG.ValidationSummary();
    validationSection.Name = "dialogValidationSection";
    validationSection.BindErrors(store, [
      "selectedNameError",
      "selectedStatusError"
    ]);

    var nameLabel = new JOG.Label();
    nameLabel.Text = "Customer Name";

    var nameInput = new JOG.TextBox();
    nameInput.Name = "dialogCustomerName";
    nameInput.MinWidth = 320;
    nameInput.BindText(store, "selectedName");
    nameInput.BindError(store, "selectedNameError");

    var nameError = new JOG.ValidationMessage();
    nameError.Name = "dialogCustomerNameError";
    nameError.BindMessage(store, "selectedNameError");

    var statusLabel = new JOG.Label();
    statusLabel.Text = "Status";

    var statusInput = new JOG.TextBox();
    statusInput.Name = "dialogCustomerStatus";
    statusInput.MinWidth = 320;
    statusInput.BindText(store, "selectedStatus");
    statusInput.BindError(store, "selectedStatusError");

    var statusHint = new JOG.Label();
    statusHint.Text = "Allowed values: Active, Pending, Inactive";

    var statusError = new JOG.ValidationMessage();
    statusError.Name = "dialogCustomerStatusError";
    statusError.BindMessage(store, "selectedStatusError");

    var footer = new JOG.StackPanel();
    footer.Name = "editFooter";
    footer.Orientation = "horizontal";
    footer.Spacing = 10;

    var saveButton = new JOG.Button();
    saveButton.Text = "Save Customer";
    saveButton.OnClick(function() {
      if (!validateSelectedCustomer(store)) {
        store.Set("message", "Validation failed. Fix the selected customer fields.");
        return;
      }
      persistSelectedCustomer(store);
      store.Set("message", "Saved " + store.Get("selectedName") + " as " + store.Get("selectedStatus"));
      this.Close();
    }.bind(this));

    var closeButton = new JOG.Button();
    closeButton.Text = "Cancel";
    closeButton.OnClick(function() {
      this.Close();
    }.bind(this));

    footer.Add(saveButton);
    footer.Add(closeButton);

    layout.Add(header);
    layout.Add(validationSection);
    layout.Add(nameLabel);
    layout.Add(nameInput);
    layout.Add(nameError);
    layout.Add(statusLabel);
    layout.Add(statusInput);
    layout.Add(statusHint);
    layout.Add(statusError);
    layout.Add(footer);

    this.Add(layout);
  }

  EditCustomerDialog.prototype = Object.create(JOG.Dialog.prototype);
  EditCustomerDialog.prototype.constructor = EditCustomerDialog;

  function CustomerAdminPage() {
    JOG.Page.call(this);

    this.Title = "JOG V2 Customer Admin";
    this.Name = "customerAdminPage";

    var store = new JOG.Store({
      customerOneName: "Acme Trading",
      customerOneStatus: "Active",
      customerOneSummary: "Acme Trading - Active",
      customerTwoName: "Northwind Foods",
      customerTwoStatus: "Pending",
      customerTwoSummary: "Northwind Foods - Pending",
      selectedCustomerKey: "customerOne",
      selectedName: "Acme Trading",
      selectedStatus: "Active",
      selectedSummary: "Acme Trading - Active",
      sidebarSelection: "Selected: Acme Trading",
      message: "Ready",
      selectedNameError: "",
      selectedStatusError: ""
    });

    var shell = new JOG.DockPanel();
    shell.Name = "customerShell";
    shell.Fill = true;
    shell.Padding = 24;
    shell.Gap = 20;

    var topBar = new JOG.PageHeader();
    topBar.Name = "topBar";
    topBar.Dock = "top";
    topBar.TitleText = "Customer Admin";
    topBar.SubtitleText = "A quieter CRUD-style test app for the V2 runtime.";

    var workspace = new JOG.SplitPanel();
    workspace.Name = "customerWorkspace";
    workspace.Dock = "fill";
    workspace.FirstPaneSize = 240;
    workspace.Gap = 24;
    workspace.Responsive = {
      base: {
        orientation: "vertical",
        firstPaneSize: 200,
        gap: 16
      },
      md: {
        orientation: "horizontal",
        firstPaneSize: 240,
        gap: 24
      }
    };

    var sidebar = new JOG.SectionPanel();
    sidebar.Name = "sidebar";
    sidebar.Title = "Customers";
    sidebar.Padding = 16;
    sidebar.Fill = true;

    var sidebarStack = new JOG.StackPanel();
    sidebarStack.Name = "sidebarStack";
    sidebarStack.Orientation = "vertical";
    sidebarStack.Gap = 10;

    var customerOneButton = new JOG.Button();
    customerOneButton.Text = store.Get("customerOneName");
    store.Subscribe("customerOneName", function(value) {
      customerOneButton.Text = value;
    });

    var customerOneSummary = new JOG.Label();
    customerOneSummary.Text = store.Get("customerOneSummary");
    store.Subscribe("customerOneSummary", function(value) {
      customerOneSummary.Text = value;
    });

    customerOneButton.OnClick(function() {
      setSelectedCustomer(store, "customerOne");
    });

    var customerTwoButton = new JOG.Button();
    customerTwoButton.Text = store.Get("customerTwoName");
    store.Subscribe("customerTwoName", function(value) {
      customerTwoButton.Text = value;
    });

    var customerTwoSummary = new JOG.Label();
    customerTwoSummary.Text = store.Get("customerTwoSummary");
    store.Subscribe("customerTwoSummary", function(value) {
      customerTwoSummary.Text = value;
    });

    customerTwoButton.OnClick(function() {
      setSelectedCustomer(store, "customerTwo");
    });

    sidebarStack.Add(customerOneButton);
    sidebarStack.Add(customerOneSummary);
    sidebarStack.Add(customerTwoButton);
    sidebarStack.Add(customerTwoSummary);
    sidebar.Add(sidebarStack);

    var detail = new JOG.SectionPanel();
    detail.Name = "detail";
    detail.Title = "Selected Customer";
    detail.Padding = 16;
    detail.Fill = true;

    var detailStack = new JOG.StackPanel();
    detailStack.Name = "detailStack";
    detailStack.Orientation = "vertical";
    detailStack.Gap = 12;

    var selectedSummary = new JOG.Label();
    selectedSummary.Text = store.Get("selectedSummary");
    store.Subscribe("selectedSummary", function(value) {
      selectedSummary.Text = value;
    });

    var selectedMarker = new JOG.Label();
    selectedMarker.Text = store.Get("sidebarSelection");
    store.Subscribe("sidebarSelection", function(value) {
      selectedMarker.Text = value;
    });

    var message = new JOG.Label();
    message.Text = "Status: " + store.Get("message");
    store.Subscribe("message", function(value) {
      message.Text = "Status: " + value;
    });

    var editButton = new JOG.Button();
    editButton.Text = "Edit Selected Customer";

    var inlineName = new JOG.TextBox();
    inlineName.Name = "inlineSelectedName";
    inlineName.BindText(store, "selectedName");
    inlineName.Width = 280;

    var inlineStatus = new JOG.TextBox();
    inlineStatus.Name = "inlineSelectedStatus";
    inlineStatus.BindText(store, "selectedStatus");
    inlineStatus.Width = 280;
    inlineStatus.BindError(store, "selectedStatusError");

    var applyInline = new JOG.Button();
    applyInline.Text = "Apply Inline Changes";

    var fieldLabel = new JOG.Label();
    fieldLabel.Text = "Quick Edit";

    var inlineValidationSection = new JOG.ValidationSummary();
    inlineValidationSection.Name = "inlineValidationSection";
    inlineValidationSection.BindErrors(store, [
      "selectedNameError",
      "selectedStatusError"
    ]);

    var inlineNameError = new JOG.ValidationMessage();
    inlineNameError.Name = "inlineSelectedNameError";
    inlineNameError.BindMessage(store, "selectedNameError");
    inlineName.BindError(store, "selectedNameError");

    var inlineStatusHint = new JOG.Label();
    inlineStatusHint.Text = "Allowed values: Active, Pending, Inactive";

    var inlineStatusError = new JOG.ValidationMessage();
    inlineStatusError.Name = "inlineSelectedStatusError";
    inlineStatusError.BindMessage(store, "selectedStatusError");

    var actions = new JOG.StackPanel();
    actions.Name = "detailActions";
    actions.Orientation = "horizontal";
    actions.Spacing = 10;

    actions.Add(applyInline);
    actions.Add(editButton);

    detailStack.Add(selectedSummary);
    detailStack.Add(selectedMarker);
    detailStack.Add(fieldLabel);
    detailStack.Add(inlineValidationSection);
    detailStack.Add(inlineName);
    detailStack.Add(inlineNameError);
    detailStack.Add(inlineStatus);
    detailStack.Add(inlineStatusHint);
    detailStack.Add(inlineStatusError);
    detailStack.Add(actions);
    detailStack.Add(message);
    detail.Add(detailStack);

    var editDialog = new EditCustomerDialog(store);
    editDialog.Hide();

    applyInline.OnClick(function() {
      if (!validateSelectedCustomer(store)) {
        store.Set("message", "Validation failed. Fix the selected customer fields.");
        return;
      }
      persistSelectedCustomer(store);
      store.Set("message", "Inline changes staged for " + store.Get("selectedName"));
    });

    editButton.OnClick(function() {
      clearSelectedValidation(store);
      editDialog.ShowModal();
    });

    ["selectedName", "selectedStatus"].forEach(function(key) {
      store.Subscribe(key, function() {
        if (key === "selectedName" && store.Get("selectedNameError")) {
          validateSelectedCustomer(store);
        }
        if (key === "selectedStatus" && store.Get("selectedStatusError")) {
          validateSelectedCustomer(store);
        }
      });
    });

    workspace.Add(sidebar);
    workspace.Add(detail);

    shell.Add(topBar);
    shell.Add(workspace);

    this.Add(shell);
    this.Add(editDialog);
  }

  CustomerAdminPage.prototype = Object.create(JOG.Page.prototype);
  CustomerAdminPage.prototype.constructor = CustomerAdminPage;

  function boot() {
    var app = new JOG.Application();
    app.Run(new CustomerAdminPage());
  }

  global.addEventListener("load", boot, false);
})(window);
