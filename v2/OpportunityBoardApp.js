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

  function createOpportunityFormState(store) {
    return new JOG.FormState(store, {
      summaryKey: "opportunityValidationSummaryText",
      validations: [
        {
          errorKey: "accountError",
          validate: function(currentStore) {
            return (currentStore.Get("account") || "").trim().length < 3
              ? "Enter an account name with at least 3 characters."
              : "";
          }
        },
        {
          errorKey: "stageError",
          validate: function(currentStore) {
            return (currentStore.Get("stage") || "").trim()
              ? ""
              : "Select a pipeline stage.";
          }
        },
        {
          errorKey: "valueError",
          validate: function(currentStore) {
            return parseCurrency(currentStore.Get("value")) > 0
              ? ""
              : "Enter a positive opportunity value.";
          }
        },
        {
          errorKey: "productError",
          validate: function(currentStore) {
            return (currentStore.Get("product") || "").trim().length >= 2
              ? ""
              : "Enter the product or package being sold.";
          }
        },
        {
          errorKey: "ownerError",
          validate: function(currentStore) {
            return (currentStore.Get("owner") || "").trim()
              ? ""
              : "Select an owner for this opportunity.";
          }
        }
      ]
    });
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

  function loadOpportunityIntoStore(store, formState, record, mode) {
    store.Set("editingId", record.id);
    store.Set("editorMode", mode);
    store.Set("editorTitle", mode === "add" ? "Add Opportunity" : "Edit Opportunity");
    store.Set("account", record.account);
    store.Set("stage", record.stage);
    store.Set("value", record.value ? String(record.value) : "");
    store.Set("product", record.product);
    store.Set("owner", record.owner);
    store.Set("nextStep", record.nextStep || "");
    formState.ClearErrors();
  }

  var STAGE_WEIGHTS = {
    prospect: 0.15,
    qualified: 0.35,
    proposal: 0.6,
    negotiation: 0.8,
    closedwon: 1
  };

  var STAGE_LABELS = {
    prospect: "Prospect",
    qualified: "Qualified",
    proposal: "Proposal",
    negotiation: "Negotiation",
    closedwon: "Closed Won"
  };

  var OWNER_LABELS = {
    maya: "Maya Santos",
    daniel: "Daniel Ng",
    farah: "Farah Rahman",
    john: "John Januszczak"
  };

  function createOpportunitySummaries() {
    return {
      totalOpen: function(rows) {
        return rows.length;
      },
      pipelineValue: function(rows) {
        return rows.reduce(function(total, row) {
          return total + (row.value || 0);
        }, 0);
      },
      weightedValue: function(rows) {
        return rows.reduce(function(total, row) {
          return total + ((row.value || 0) * (STAGE_WEIGHTS[row.stage] || 0));
        }, 0);
      },
      lateStageCount: function(rows) {
        return rows.filter(function(row) {
          return row.stage === "proposal" || row.stage === "negotiation" || row.stage === "closedwon";
        }).length;
      },
      highestRecord: function(rows) {
        return rows.reduce(function(current, row) {
          if (!current || row.value > current.value) {
            return row;
          }
          return current;
        }, null);
      },
      dirtyCount: function(rows, collection) {
        return collection.GetDirtyRowIds().length + collection.GetDeletedRowIds().length;
      }
    };
  }

  function describeHeadline(collection) {
    var highestRecord = collection.GetSummary("highestRecord");

    return highestRecord
      ? highestRecord.account + " is the largest open deal at " + formatCurrency(highestRecord.value) + "."
      : "No opportunities in the board yet.";
  }

  function getOwnerLabel(ownerKey) {
    return OWNER_LABELS[ownerKey] || ownerKey || "";
  }

  function getStageLabel(stageKey) {
    return STAGE_LABELS[stageKey] || stageKey || "";
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

  function OpportunityEditorDialog(store, formState, onSave) {
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
    validation.BindSummary(store, "opportunityValidationSummaryText");

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
      if (!formState.Validate()) {
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

    var nextOpportunityId = 4;
    var opportunityCollection = new JOG.Collection({
      idKey: "id",
      summaryDefinitions: createOpportunitySummaries(),
      rows: [
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
      ]
    });
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
      opportunityValidationSummaryText: "",
      totalOpenText: "0",
      pipelineValueText: "$0",
      weightedValueText: "$0",
      lateStageText: "0",
      dirtyRowsText: "0",
      headlineText: "",
      selectionStatusMessage: "Ready.",
      actionStatusMessage: "",
      statusMessage: "Ready.",
      hasSelection: false,
      hasDirtyRows: false
    });
    var opportunityFormState = createOpportunityFormState(editorStore);
    opportunityFormState.Watch(["account", "stage", "value", "product", "owner"]);

    editorStore.Derive("statusMessage", ["selectionStatusMessage", "actionStatusMessage"], function(currentStore) {
      return currentStore.Get("actionStatusMessage") || currentStore.Get("selectionStatusMessage") || "Ready.";
    });

    this.Title = "JOG V2 Opportunity Board";
    this.Name = "opportunityBoardPage";

    var shell = new JOG.WorkspaceShell();
    shell.Name = "opportunityBoardShell";
    shell.Width = 1180;
    shell.Height = 760;
    shell.Padding = 18;
    shell.ResponsiveLayout = {
      base: { padding: 12 },
      md: { padding: 18 }
    };

    var topBar = new JOG.PageHeader();
    topBar.Name = "opportunityTopBar";
    topBar.Gap = 16;
    topBar.TitleText = "Opportunity Board";
    topBar.SubtitleText = "A CRM-style sample using Collection plus DataGrid for selection, summaries, and row commands.";

    var sidebar = new JOG.SectionPanel();
    sidebar.Name = "opportunitySidebar";
    sidebar.Title = "Pipeline Snapshot";
    sidebar.Width = 270;
    sidebar.Padding = 12;
    sidebar.Gap = 24;
    sidebar.ThemePreset = "primary";
    sidebar.ResponsiveLayout = {
      base: {
        dock: "top",
        width: null,
        height: 284,
        gap: 18
      },
      md: {
        dock: "left",
        width: 270,
        height: null,
        gap: 24
      }
    };
    sidebar.Responsive = {
      base: {
        title: "Pipeline",
        padding: 10
      },
      md: {
        title: "Pipeline Snapshot",
        padding: 12
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
    var dirtyCard = createMetricCard("Dirty Rows", editorStore, "dirtyRowsText");
    var accountListTitle = new JOG.Label();
    accountListTitle.Text = "Pipeline Accounts";

    var accountRepeater = new JOG.Repeater();
    accountRepeater.Name = "opportunityAccountRepeater";
    accountRepeater.Orientation = "vertical";
    accountRepeater.Gap = 8;
    accountRepeater.EmptyText = "No opportunities in the board.";
    accountRepeater.BindCollection(opportunityCollection, function(row, index, collection) {
      var button = new JOG.Button();

      button.Name = "opportunityAccountLink" + String(index + 1);
      button.Text = row.account + " - " + getStageLabel(row.stage);
      button.ThemePreset = collection.IsSelected(row.id) ? "primary" : "quiet";
      button.OnClick(function() {
        collection.Select(row.id);
        editorStore.Set("actionStatusMessage", "");
      });
      return button;
    });

    sidebarStack.Add(headline);
    sidebarStack.Add(totalCard);
    sidebarStack.Add(pipelineCard);
    sidebarStack.Add(weightedCard);
    sidebarStack.Add(lateStageCard);
    sidebarStack.Add(dirtyCard);
    sidebarStack.Add(accountListTitle);
    sidebarStack.Add(accountRepeater);
    sidebar.Add(sidebarStack);

    var boardSection = new JOG.SectionPanel();
    boardSection.Name = "opportunityBoardSection";
    boardSection.Title = "Active Opportunities";
    boardSection.Padding = 12;
    boardSection.Responsive = {
      base: {
        title: "Opportunities",
        padding: 10
      },
      md: {
        title: "Active Opportunities",
        padding: 12
      }
    };

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

    var clearSelectionButton = new JOG.Button();
    clearSelectionButton.Text = "Clear Selection";
    clearSelectionButton.ThemePreset = "quiet";
    clearSelectionButton.BindEnabled(editorStore, "hasSelection");

    var markCleanButton = new JOG.Button();
    markCleanButton.Text = "Mark Clean";
    markCleanButton.ThemePreset = "quiet";
    markCleanButton.BindEnabled(editorStore, "hasDirtyRows");

    var statusLabel = new JOG.Label();
    statusLabel.BindText(editorStore, "statusMessage", function(value) {
      return "Status: " + value;
    });

    actionRow.Add(addButton);
    actionRow.Add(clearSelectionButton);
    actionRow.Add(markCleanButton);
    actionRow.Add(statusLabel);

    var boardGrid = new JOG.DataGrid();
    boardGrid.Name = "opportunityDataGrid";
    boardGrid.Collection = opportunityCollection;
    boardGrid.ResizableColumns = true;
    boardGrid.EmptyText = "No opportunities yet. Use Add Opportunity to create the first record.";
    boardGrid.Columns = [
      { key: "account", title: "Account", width: "180px" },
      { key: "stage", title: "Stage", width: "120px", formatter: function(value) { return getStageLabel(value); } },
      { key: "value", title: "Value", width: "120px", align: "right", formatter: function(value) { return formatCurrency(value); } },
      { key: "product", title: "Product", width: "160px" },
      { key: "owner", title: "Owner", width: "150px", formatter: function(value) { return getOwnerLabel(value); } },
      { key: "nextStep", title: "Next Step", width: "280px" }
    ];
    boardGrid.RowCommands = [
      { key: "edit", text: "Edit", themePreset: "primary" },
      { key: "delete", text: "Delete", themePreset: "danger" }
    ];

    boardLayout.Add(actionRow);
    boardLayout.Add(boardGrid);
    boardSection.Add(boardLayout);

    opportunityCollection.BindStore(editorStore, "totalOpenText", ["summary"], function(collection) {
      return String(collection.GetSummary("totalOpen") || 0);
    });
    opportunityCollection.BindStore(editorStore, "pipelineValueText", ["summary"], function(collection) {
      return formatCurrency(collection.GetSummary("pipelineValue") || 0);
    });
    opportunityCollection.BindStore(editorStore, "weightedValueText", ["summary"], function(collection) {
      return formatCurrency(collection.GetSummary("weightedValue") || 0);
    });
    opportunityCollection.BindStore(editorStore, "lateStageText", ["summary"], function(collection) {
      return String(collection.GetSummary("lateStageCount") || 0);
    });
    opportunityCollection.BindStore(editorStore, "dirtyRowsText", ["summary"], function(collection) {
      return String(collection.GetSummary("dirtyCount") || 0);
    });
    opportunityCollection.BindStore(editorStore, "headlineText", ["summary"], function(collection) {
      return describeHeadline(collection);
    });
    opportunityCollection.BindStore(editorStore, "hasSelection", ["selection"], function(collection) {
      return collection.GetSelectedRows().length > 0;
    });
    opportunityCollection.BindStore(editorStore, "hasDirtyRows", ["dirty"], function(collection) {
      return collection.HasDirtyRows();
    });
    opportunityCollection.BindStore(editorStore, "selectionStatusMessage", ["change"], function(collection) {
      var selected = collection.GetSelectedRows()[0];

      if (!selected) {
        return collection.HasDirtyRows() ? "No row selected. Pending local changes exist." : "Ready.";
      }

      return (
        "Selected " + selected.account + " in " + getStageLabel(selected.stage) + " for " + formatCurrency(selected.value) + "."
      );
    });

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

      if (opportunityCollection.GetRow(record.id)) {
        opportunityCollection.Update(record.id, record);
      } else {
        opportunityCollection.Insert(record);
      }

      opportunityCollection.Select(record.id);
      editorStore.Set(
        "actionStatusMessage",
        (editorStore.Get("editorMode") === "add" ? "Added " : "Saved changes to ") + record.account + "."
      );
    }

    var editorDialog = new OpportunityEditorDialog(editorStore, opportunityFormState, saveOpportunity);
    editorDialog.Hide();
    editorDialog.OnHide(function() {
      opportunityFormState.ClearErrors();
    });

    addButton.OnClick(function() {
      loadOpportunityIntoStore(editorStore, opportunityFormState, createEmptyOpportunity(nextOpportunityId), "add");
      nextOpportunityId += 1;
      editorStore.Set("actionStatusMessage", "Adding a new opportunity.");
      editorDialog.ShowModal();
    });

    clearSelectionButton.OnClick(function() {
      opportunityCollection.ClearSelection();
      editorStore.Set("actionStatusMessage", "");
    });

    markCleanButton.OnClick(function() {
      opportunityCollection.MarkClean();
      editorStore.Set("actionStatusMessage", "Marked the current board snapshot as clean.");
    });

    boardGrid.OnSelectionChange(function(args) {
      var row = args.Row;

      if (!row) {
        return;
      }
      editorStore.Set("actionStatusMessage", "");
    });

    boardGrid.OnRowCommand(function(args) {
      var row = args.Row;

      if (!row) {
        return;
      }
      if (args.Key === "edit") {
        loadOpportunityIntoStore(editorStore, opportunityFormState, cloneOpportunity(row), "edit");
        editorStore.Set("actionStatusMessage", "Editing " + row.account + ".");
        editorDialog.ShowModal();
        return;
      }
      if (args.Key === "delete") {
        opportunityCollection.Remove(row.id);
        editorStore.Set("actionStatusMessage", "Deleted " + row.account + ".");
      }
    });

    shell.Header = topBar;
    shell.Sidebar = sidebar;
    shell.Content = boardSection;

    this.Add(shell);
    this.Add(editorDialog);
  }

  OpportunityBoardPage.prototype = Object.create(JOG.Page.prototype);
  OpportunityBoardPage.prototype.constructor = OpportunityBoardPage;

  function boot() {
    var app = new JOG.Application();
    app.Run(new OpportunityBoardPage());
  }

  global.addEventListener("load", boot, false);
})(window);
