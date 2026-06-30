(function(global) {
  "use strict";

  function formatCurrency(value) {
    var amount = Number(value) || 0;
    var parts = Math.round(amount).toString().split("");
    var output = [];

    while (parts.length > 3) {
      output.unshift(parts.splice(parts.length - 3, 3).join(""));
    }
    if (parts.length) {
      output.unshift(parts.join(""));
    }

    return "$" + output.join(",");
  }

  function parseCurrency(value) {
    var normalized = String(value == null ? "" : value).replace(/[^0-9.-]/g, "");
    var amount = parseFloat(normalized);

    return isNaN(amount) ? 0 : amount;
  }

  function setFieldError(store, key, message) {
    store.Set(key, message);
  }

  function clearValidation(store) {
    setFieldError(store, "accountError", "");
    setFieldError(store, "stageError", "");
    setFieldError(store, "valueError", "");
    setFieldError(store, "productError", "");
    setFieldError(store, "ownerError", "");
  }

  function validateOpportunity(store) {
    var hasErrors = false;
    var account = (store.Get("account") || "").trim();
    var stage = (store.Get("stage") || "").trim();
    var value = parseCurrency(store.Get("value"));
    var product = (store.Get("product") || "").trim();
    var owner = (store.Get("owner") || "").trim();

    if (account.length < 3) {
      setFieldError(store, "accountError", "Enter an account name with at least 3 characters.");
      hasErrors = true;
    } else {
      setFieldError(store, "accountError", "");
    }

    if (!stage) {
      setFieldError(store, "stageError", "Select a pipeline stage.");
      hasErrors = true;
    } else {
      setFieldError(store, "stageError", "");
    }

    if (value <= 0) {
      setFieldError(store, "valueError", "Enter a positive opportunity value.");
      hasErrors = true;
    } else {
      setFieldError(store, "valueError", "");
    }

    if (product.length < 2) {
      setFieldError(store, "productError", "Enter the product or package being sold.");
      hasErrors = true;
    } else {
      setFieldError(store, "productError", "");
    }

    if (!owner) {
      setFieldError(store, "ownerError", "Select an owner for this opportunity.");
      hasErrors = true;
    } else {
      setFieldError(store, "ownerError", "");
    }

    return !hasErrors;
  }

  function createEmptyOpportunity(nextId) {
    return {
      id: nextId,
      account: "",
      stage: "",
      value: "",
      product: "",
      owner: "",
      nextStep: ""
    };
  }

  function cloneOpportunity(record) {
    return {
      id: record.id,
      account: record.account,
      stage: record.stage,
      value: record.value,
      product: record.product,
      owner: record.owner,
      nextStep: record.nextStep
    };
  }

  function loadOpportunityIntoStore(store, record, mode) {
    store.Set("editingId", record.id);
    store.Set("editorMode", mode);
    store.Set("editorTitle", mode === "add" ? "Add Opportunity" : "Edit Opportunity");
    store.Set("account", record.account);
    store.Set("stage", record.stage);
    store.Set("value", record.value ? String(record.value) : "");
    store.Set("product", record.product);
    store.Set("owner", record.owner);
    store.Set("nextStep", record.nextStep || "");
    clearValidation(store);
  }

  function buildMetrics(records, store) {
    var stageWeight = {
      prospect: 0.15,
      qualified: 0.35,
      proposal: 0.6,
      negotiation: 0.8,
      closedwon: 1
    };
    var totalValue = 0;
    var weightedValue = 0;
    var lateStageCount = 0;
    var highestRecord = null;

    records.forEach(function(record) {
      totalValue += record.value;
      weightedValue += record.value * (stageWeight[record.stage] || 0);
      if (record.stage === "proposal" || record.stage === "negotiation" || record.stage === "closedwon") {
        lateStageCount += 1;
      }
      if (!highestRecord || record.value > highestRecord.value) {
        highestRecord = record;
      }
    });

    store.Set("totalOpenText", String(records.length));
    store.Set("pipelineValueText", formatCurrency(totalValue));
    store.Set("weightedValueText", formatCurrency(weightedValue));
    store.Set("lateStageText", String(lateStageCount));
    store.Set(
      "headlineText",
      highestRecord
        ? highestRecord.account + " is the largest open deal at " + formatCurrency(highestRecord.value) + "."
        : "No opportunities in the board yet."
    );
    store.Set("emptyStateText", records.length ? "" : "No opportunities yet. Use Add Opportunity to create the first record.");
  }

  function createMetricCard(title, store, key) {
    var card = new JOG.SectionPanel();
    card.Title = title;
    card.Padding = 14;

    var value = new JOG.Label();
    value.BindText(store, key);

    card.Add(value);
    return card;
  }

  function OpportunityEditorDialog(store, onSave) {
    JOG.Dialog.call(this);

    this.Name = "opportunityEditorDialog";
    this.Title = "Edit Opportunity";
    this.SetBounds(260, 64, 560, 580);
    this.MinWidth = 360;
    this.MinHeight = 540;
    this.CloseButtonText = "Close";

    var dialog = this;
    var layout = new JOG.StackPanel();
    layout.Name = "opportunityEditorLayout";
    layout.Orientation = "vertical";
    layout.Gap = 10;

    var intro = new JOG.Label();
    intro.BindText(store, "editorMode", function(value) {
      return value === "add"
        ? "Create a new pipeline record for the board."
        : "Update the selected opportunity without leaving the page.";
    });

    var validation = new JOG.ValidationSummary();
    validation.Name = "opportunityValidationSummary";
    validation.BindErrors(store, [
      "accountError",
      "stageError",
      "valueError",
      "productError",
      "ownerError"
    ]);

    var formGrid = new JOG.Grid();
    formGrid.Name = "opportunityEditorGrid";
    formGrid.Columns = ["150px", "1fr"];
    formGrid.ColumnGap = 18;
    formGrid.RowGap = 8;
    formGrid.Responsive = {
      base: {
        columns: ["1fr"],
        columnGap: 10
      },
      md: {
        columns: ["150px", "1fr"],
        columnGap: 18
      }
    };

    function addField(row, labelText, control, errorControl) {
      var mobileRow = (((row - 1) / 2) * 3) + 1;
      var label = new JOG.Label();
      label.Text = labelText;
      label.GridColumn = 1;
      label.GridRow = row;
      label.ResponsiveGrid = {
        base: { column: 1, row: mobileRow },
        md: { column: 1, row: row }
      };

      control.GridColumn = 2;
      control.GridRow = row;
      control.ResponsiveGrid = {
        base: { column: 1, row: mobileRow + 1 },
        md: { column: 2, row: row }
      };

      errorControl.GridColumn = 2;
      errorControl.GridRow = row + 1;
      errorControl.ResponsiveGrid = {
        base: { column: 1, row: mobileRow + 2 },
        md: { column: 2, row: row + 1 }
      };

      formGrid.Add(label);
      formGrid.Add(control);
      formGrid.Add(errorControl);
    }

    var accountInput = new JOG.TextBox();
    accountInput.Name = "opportunityAccountInput";
    accountInput.CssClass = "jog-fill-width";
    accountInput.BindText(store, "account");
    accountInput.BindError(store, "accountError");

    var accountError = new JOG.ValidationMessage();
    accountError.Name = "opportunityAccountError";
    accountError.BindMessage(store, "accountError");

    var stageInput = new JOG.DropDownList();
    stageInput.Name = "opportunityStageInput";
    stageInput.CssClass = "jog-fill-width";
    stageInput.Options = [
      { value: "", text: "Select stage" },
      { value: "prospect", text: "Prospect" },
      { value: "qualified", text: "Qualified" },
      { value: "proposal", text: "Proposal" },
      { value: "negotiation", text: "Negotiation" },
      { value: "closedwon", text: "Closed Won" }
    ];
    stageInput.BindSelectedValue(store, "stage");
    stageInput.BindError(store, "stageError");

    var stageError = new JOG.ValidationMessage();
    stageError.Name = "opportunityStageError";
    stageError.BindMessage(store, "stageError");

    var valueInput = new JOG.TextBox();
    valueInput.Name = "opportunityValueInput";
    valueInput.CssClass = "jog-fill-width";
    valueInput.BindText(store, "value");
    valueInput.BindError(store, "valueError");

    var valueError = new JOG.ValidationMessage();
    valueError.Name = "opportunityValueError";
    valueError.BindMessage(store, "valueError");

    var productInput = new JOG.TextBox();
    productInput.Name = "opportunityProductInput";
    productInput.CssClass = "jog-fill-width";
    productInput.BindText(store, "product");
    productInput.BindError(store, "productError");

    var productError = new JOG.ValidationMessage();
    productError.Name = "opportunityProductError";
    productError.BindMessage(store, "productError");

    var ownerInput = new JOG.DropDownList();
    ownerInput.Name = "opportunityOwnerInput";
    ownerInput.CssClass = "jog-fill-width";
    ownerInput.Options = [
      { value: "", text: "Select owner" },
      { value: "maya", text: "Maya Santos" },
      { value: "daniel", text: "Daniel Ng" },
      { value: "farah", text: "Farah Rahman" },
      { value: "john", text: "John Januszczak" }
    ];
    ownerInput.BindSelectedValue(store, "owner");
    ownerInput.BindError(store, "ownerError");

    var ownerError = new JOG.ValidationMessage();
    ownerError.Name = "opportunityOwnerError";
    ownerError.BindMessage(store, "ownerError");

    var nextStepInput = new JOG.TextArea();
    nextStepInput.Name = "opportunityNextStepInput";
    nextStepInput.CssClass = "jog-fill-width";
    nextStepInput.Height = 120;
    nextStepInput.BindText(store, "nextStep");

    var nextStepSpacer = new JOG.ValidationMessage();
    nextStepSpacer.Name = "opportunityNextStepSpacer";
    nextStepSpacer.Text = "";
    nextStepSpacer.Visible = false;

    addField(1, "Account", accountInput, accountError);
    addField(3, "Stage", stageInput, stageError);
    addField(5, "Value", valueInput, valueError);
    addField(7, "Product", productInput, productError);
    addField(9, "Owner", ownerInput, ownerError);
    addField(11, "Next Step", nextStepInput, nextStepSpacer);

    var footer = new JOG.StackPanel();
    footer.Name = "opportunityEditorFooter";
    footer.Orientation = "horizontal";
    footer.Gap = 8;
    footer.Responsive = {
      base: { orientation: "vertical", gap: 12 },
      md: { orientation: "horizontal", gap: 10 }
    };

    var saveButton = new JOG.Button();
    saveButton.Text = "Save Opportunity";
    saveButton.ThemePreset = "primary";
    saveButton.OnClick(function() {
      if (!validateOpportunity(store)) {
        return;
      }
      onSave();
      dialog.Close();
    });

    var cancelButton = new JOG.Button();
    cancelButton.Text = "Cancel";
    cancelButton.ThemePreset = "quiet";
    cancelButton.OnClick(function() {
      dialog.Close();
    });

    footer.Add(saveButton);
    footer.Add(cancelButton);

    store.Subscribe("editorTitle", function(value) {
      dialog.Title = value;
    });

    layout.Add(intro);
    layout.Add(validation);
    layout.Add(formGrid);
    layout.Add(footer);
    this.Add(layout);
  }

  OpportunityEditorDialog.prototype = Object.create(JOG.Dialog.prototype);
  OpportunityEditorDialog.prototype.constructor = OpportunityEditorDialog;

  function OpportunityBoardPage() {
    JOG.Page.call(this);

    var page = this;
    var nextOpportunityId = 4;
    var opportunities = [
      {
        id: 1,
        account: "Northwind Foods",
        stage: "proposal",
        value: 145000,
        product: "Analytics Cloud",
        owner: "maya",
        nextStep: "Send security appendix and lock the executive review."
      },
      {
        id: 2,
        account: "Atlas Bio",
        stage: "qualified",
        value: 68000,
        product: "Workflow Suite",
        owner: "daniel",
        nextStep: "Map deployment scope with the operations lead."
      },
      {
        id: 3,
        account: "Summit Capital",
        stage: "negotiation",
        value: 220000,
        product: "Investor Portal",
        owner: "farah",
        nextStep: "Trade revised commercial terms with procurement this week."
      }
    ];

    var editorStore = new JOG.Store({
      editingId: "",
      editorMode: "edit",
      editorTitle: "Edit Opportunity",
      account: "",
      stage: "",
      value: "",
      product: "",
      owner: "",
      nextStep: "",
      accountError: "",
      stageError: "",
      valueError: "",
      productError: "",
      ownerError: "",
      totalOpenText: "0",
      pipelineValueText: "$0",
      weightedValueText: "$0",
      lateStageText: "0",
      headlineText: "",
      emptyStateText: "",
      statusMessage: "Ready."
    });

    this.Title = "JOG V2 Opportunity Board";
    this.Name = "opportunityBoardPage";

    var shell = new JOG.DockPanel();
    shell.Name = "opportunityBoardShell";
    shell.Width = 1180;
    shell.Height = 760;
    shell.Padding = 18;
    shell.ResponsiveLayout = {
      base: { padding: 12 },
      md: { padding: 18 }
    };

    var topBar = new JOG.Panel();
    topBar.Name = "opportunityTopBar";
    topBar.Dock = "top";
    topBar.Height = 74;
    topBar.Margin = { top: 0, right: 0, bottom: 16, left: 0 };

    var title = new JOG.Label();
    title.Text = "Opportunity Board";
    title.ThemePreset = "strong";
    title.Location(0, 12);

    var subtitle = new JOG.Label();
    subtitle.Text = "A CRM-style sample with dynamic opportunity rows, edit and delete actions, and a modal add flow.";
    subtitle.Location(0, 36);

    topBar.Add(title);
    topBar.Add(subtitle);

    var sidebar = new JOG.SectionPanel();
    sidebar.Name = "opportunitySidebar";
    sidebar.Title = "Pipeline Snapshot";
    sidebar.Dock = "left";
    sidebar.Width = 270;
    sidebar.Padding = 12;
    sidebar.Margin = { top: 0, right: 24, bottom: 0, left: 0 };
    sidebar.ThemePreset = "primary";
    sidebar.ResponsiveLayout = {
      base: {
        dock: "top",
        width: null,
        height: 236,
        margin: { bottom: 18 }
      },
      md: {
        dock: "left",
        width: 270,
        height: null,
        margin: { top: 0, right: 24, bottom: 0, left: 0 }
      }
    };

    var sidebarStack = new JOG.StackPanel();
    sidebarStack.Name = "opportunitySidebarStack";
    sidebarStack.Orientation = "vertical";
    sidebarStack.Gap = 12;
    sidebarStack.Responsive = {
      base: { orientation: "horizontal", gap: 10 },
      lg: { orientation: "vertical", gap: 12 }
    };

    var headline = new JOG.Label();
    headline.BindText(editorStore, "headlineText");
    headline.ThemePreset = "strong";

    var totalCard = createMetricCard("Open Deals", editorStore, "totalOpenText");
    var pipelineCard = createMetricCard("Pipeline Value", editorStore, "pipelineValueText");
    var weightedCard = createMetricCard("Weighted Value", editorStore, "weightedValueText");
    var lateStageCard = createMetricCard("Late Stage Deals", editorStore, "lateStageText");

    sidebarStack.Add(headline);
    sidebarStack.Add(totalCard);
    sidebarStack.Add(pipelineCard);
    sidebarStack.Add(weightedCard);
    sidebarStack.Add(lateStageCard);
    sidebar.Add(sidebarStack);

    var boardSection = new JOG.SectionPanel();
    boardSection.Name = "opportunityBoardSection";
    boardSection.Title = "Active Opportunities";
    boardSection.Dock = "fill";
    boardSection.Padding = 12;

    var boardLayout = new JOG.StackPanel();
    boardLayout.Name = "opportunityBoardLayout";
    boardLayout.Orientation = "vertical";
    boardLayout.Gap = 10;

    var actionRow = new JOG.StackPanel();
    actionRow.Name = "opportunityActionRow";
    actionRow.Orientation = "horizontal";
    actionRow.Gap = 10;
    actionRow.Responsive = {
      base: { orientation: "vertical", gap: 12 },
      md: { orientation: "horizontal", gap: 10 }
    };

    var addButton = new JOG.Button();
    addButton.Text = "Add Opportunity";
    addButton.ThemePreset = "primary";

    var statusLabel = new JOG.Label();
    statusLabel.BindText(editorStore, "statusMessage", function(value) {
      return "Status: " + value;
    });

    actionRow.Add(addButton);
    actionRow.Add(statusLabel);

    var headerCard = new JOG.SectionPanel();
    headerCard.Name = "opportunityHeaderCard";
    headerCard.Title = "";
    headerCard.Padding = 8;
    headerCard.ThemePreset = "muted";

    var headerGrid = new JOG.Grid();
    headerGrid.Name = "opportunityHeaderGrid";
    headerGrid.Columns = ["180px", "110px", "120px", "150px", "130px", "minmax(220px, 1fr)", "132px"];
    headerGrid.ColumnGap = 12;
    headerGrid.RowGap = 0;

    [
      "Account",
      "Stage",
      "Value",
      "Product",
      "Owner",
      "Next Step",
      "Actions"
    ].forEach(function(text, index) {
      var label = new JOG.Label();
      label.Text = text;
      label.GridColumn = index + 1;
      label.GridRow = 1;
      headerGrid.Add(label);
    });

    headerCard.Add(headerGrid);

    var emptyState = new JOG.Label();
    emptyState.Name = "opportunityEmptyState";
    emptyState.BindText(editorStore, "emptyStateText");
    emptyState.BindVisible(editorStore, "emptyStateText");

    var rowsHost = new JOG.StackPanel();
    rowsHost.Name = "opportunityRowsHost";
    rowsHost.Orientation = "vertical";
    rowsHost.Gap = 8;

    boardLayout.Add(actionRow);
    boardLayout.Add(headerCard);
    boardLayout.Add(emptyState);
    boardLayout.Add(rowsHost);
    boardSection.Add(boardLayout);

    function updateBoard() {
      rowsHost.Clear();

      opportunities.forEach(function(record) {
        var rowCard = new JOG.SectionPanel();
        rowCard.Name = "opportunityRow" + record.id;
        rowCard.Title = "";
        rowCard.Padding = 8;

        var rowGrid = new JOG.Grid();
        rowGrid.Name = "opportunityRowGrid" + record.id;
        rowGrid.Columns = ["180px", "110px", "120px", "150px", "130px", "minmax(220px, 1fr)", "132px"];
        rowGrid.ColumnGap = 10;
        rowGrid.RowGap = 2;

        function addValue(column, valueText) {
          var label = new JOG.Label();
          label.Text = valueText;
          label.GridColumn = column;
          label.GridRow = 1;
          rowGrid.Add(label);
        }

        addValue(1, record.account);
        addValue(2, record.stage);
        addValue(3, formatCurrency(record.value));
        addValue(4, record.product);
        addValue(5, record.owner);
        addValue(6, record.nextStep);

        var actions = new JOG.StackPanel();
        actions.Name = "opportunityActions" + record.id;
        actions.Orientation = "horizontal";
        actions.Gap = 6;
        actions.GridColumn = 7;
        actions.GridRow = 1;
        actions.Responsive = {
          base: { orientation: "vertical", gap: 8 },
          md: { orientation: "horizontal", gap: 8 }
        };

        var editButton = new JOG.Button();
        editButton.Text = "Edit";
        editButton.ThemePreset = "quiet";
        editButton.Width = 58;
        editButton.OnClick(function() {
          loadOpportunityIntoStore(editorStore, cloneOpportunity(record), "edit");
          editorStore.Set("statusMessage", "Editing " + record.account + ".");
          editorDialog.ShowModal();
        });

        var deleteButton = new JOG.Button();
        deleteButton.Text = "Delete";
        deleteButton.ThemePreset = "danger";
        deleteButton.Width = 68;
        deleteButton.OnClick(function() {
          opportunities = opportunities.filter(function(existing) {
            return existing.id !== record.id;
          });
          editorStore.Set("statusMessage", "Deleted " + record.account + ".");
          updateBoard();
        });

        actions.Add(editButton);
        actions.Add(deleteButton);
        rowGrid.Add(actions);

        rowCard.Add(rowGrid);
        rowsHost.Add(rowCard);
      });

      buildMetrics(opportunities, editorStore);
      page.Refresh();
    }

    function saveOpportunity() {
      var record = {
        id: editorStore.Get("editingId"),
        account: (editorStore.Get("account") || "").trim(),
        stage: editorStore.Get("stage"),
        value: parseCurrency(editorStore.Get("value")),
        product: (editorStore.Get("product") || "").trim(),
        owner: editorStore.Get("owner"),
        nextStep: (editorStore.Get("nextStep") || "").trim()
      };
      var existing = opportunities.filter(function(item) {
        return item.id === record.id;
      })[0];

      if (existing) {
        existing.account = record.account;
        existing.stage = record.stage;
        existing.value = record.value;
        existing.product = record.product;
        existing.owner = record.owner;
        existing.nextStep = record.nextStep;
        editorStore.Set("statusMessage", "Saved changes to " + record.account + ".");
      } else {
        opportunities.push(record);
        editorStore.Set("statusMessage", "Added " + record.account + " to the board.");
      }

      updateBoard();
    }

    var editorDialog = new OpportunityEditorDialog(editorStore, saveOpportunity);
    editorDialog.Hide();
    editorDialog.OnHide(function() {
      clearValidation(editorStore);
    });

    addButton.OnClick(function() {
      loadOpportunityIntoStore(editorStore, createEmptyOpportunity(nextOpportunityId), "add");
      nextOpportunityId += 1;
      editorStore.Set("statusMessage", "Adding a new opportunity.");
      editorDialog.ShowModal();
    });

    shell.Add(topBar);
    shell.Add(sidebar);
    shell.Add(boardSection);

    this.Add(shell);
    this.Add(editorDialog);

    updateBoard();
  }

  OpportunityBoardPage.prototype = Object.create(JOG.Page.prototype);
  OpportunityBoardPage.prototype.constructor = OpportunityBoardPage;

  function boot() {
    var app = new JOG.Application();
    app.Run(new OpportunityBoardPage());
  }

  global.addEventListener("load", boot, false);
})(window);
