window.addEventListener("load", function() {
  "use strict";

  JOG.RegisterStyleBlock("ThirdPartyDemoApp", [
    "#thirdPartyDemoContent { overflow-x: hidden; overflow-y: auto; padding-right: 6px; }"
  ].join("\n"));

  var app = new JOG.Application();
  var page = new JOG.Page();
  var shell = new JOG.WorkspaceShell();
  var header = new JOG.PageHeader();
  var sidebar = new AcmeJOG.InspectorCard();
  var content = new JOG.StackPanel();
  var registryLabel = new JOG.Label();
  var pickerLabel = new JOG.Label();
  var picker = new AcmeJOG.TagPicker();
  var pickerError = new JOG.ValidationMessage();
  var summaryCard = new AcmeJOG.InspectorCard();
  var summaryLabel = new JOG.Label();
  var saveButton = new JOG.Button();
  var viewLabel = new JOG.Label();
  var viewSwitch = new BeaconJOG.ViewSwitch();
  var metricCard = new BeaconJOG.MetricCard();
  var metricAccessory = new JOG.Label();
  var dialogButton = new JOG.Button();
  var stageDialog = new AcmeJOG.CommandPaletteDialog();
  var dialogSummary = new JOG.Label();
  var pipelineLabel = new JOG.Label();
  var pipelineChart = new ChartJOG.BarChart();
  var pipelineSummaryCard = new AcmeJOG.InspectorCard();
  var pipelineSummaryLabel = new JOG.Label();
  var pipelineRefreshButton = new JOG.Button();
  var followUpLabel = new JOG.Label();
  var followUpPicker = new FlatpickrJOG.DatePicker();
  var followUpError = new JOG.ValidationMessage();
  var planningValidationSummary = new JOG.ValidationSummary();
  var followUpSummaryCard = new AcmeJOG.InspectorCard();
  var followUpSummaryLabel = new JOG.Label();
  var followUpSaveButton = new JOG.Button();
  var followUpClearButton = new JOG.Button();
  var noteLabel = new JOG.Label();
  var noteFormatBar = new JOG.ToolBar();
  var noteBoldButton = new JOG.Button();
  var noteItalicButton = new JOG.Button();
  var noteUnderlineButton = new JOG.Button();
  var noteCommandButtons = new JOG.StackPanel();
  var noteCommandHint = new JOG.Label();
  var noteFormatBoldButton = new JOG.Button();
  var noteFormatItalicButton = new JOG.Button();
  var noteFormatUnderlineButton = new JOG.Button();
  var noteEditor = new LexicalJOG.LexicalRichTextBox();
  var noteError = new JOG.ValidationMessage();
  var noteSummaryCard = new AcmeJOG.InspectorCard();
  var noteSummaryLabel = new JOG.Label();
  var noteJsonCard = new AcmeJOG.InspectorCard();
  var noteJsonLabel = new JOG.Label();
  var noteSaveButton = new JOG.Button();
  var noteClearButton = new JOG.Button();
  var emptyNoteState = noteEditor.Value;
  var store = new JOG.Store({
    selectedStage: "qualified",
    stageError: "",
    stageSummary: "Qualified deals usually move into solution review next.",
    selectedView: "board",
    viewSummary: "Board view keeps the pipeline focused on active deals.",
    pipelineSummary: "",
    followUpDate: "",
    followUpDateError: "",
    followUpDateSummary: "No follow-up date selected yet.",
    notePlainText: "",
    noteState: emptyNoteState,
    noteError: "",
    noteSummary: "No notes captured yet.",
    noteJsonSummary: emptyNoteState
  });
  var followUpFormState;
  var noteFormState;
  var pipelineCollection = new JOG.Collection({
    idKey: "id",
    rows: [
      { id: "qualified", stage: "Qualified", count: 18, color: "#2563eb" },
      { id: "proposal", stage: "Proposal", count: 11, color: "#0f766e" },
      { id: "negotiation", stage: "Negotiation", count: 6, color: "#b45309" }
    ]
  });

  function setPipelineDefaultSummary() {
    var total = pipelineCollection.GetRows().reduce(function(sum, row) {
      return sum + row.count;
    }, 0);

    store.Set("pipelineSummary", "Current snapshot: " + total + " open deals across three stages.");
  }

  function createRequiredThirdPartyValidation(options) {
    var formState = new JOG.FormState(store, {
      validations: [
        {
          errorKey: options.errorKey,
          validate: function() {
            return options.isEmpty() ? options.errorMessage : "";
          }
        }
      ]
    });

    formState.Watch(options.watchKeys);

    return {
      Validate: function() {
        var isValid = formState.Validate();
        if (!isValid && options.control && typeof options.control.Focus === "function") {
          options.control.Focus();
        }
        return isValid;
      },
      ClearErrors: function() {
        formState.ClearErrors();
      }
    };
  }

  page.Title = "Third-Party Controls Demo";

  shell.Fill = true;
  shell.Padding = 20;
  shell.Gap = 16;
  shell.SidebarLayout = {
    base: { dock: "top", height: 186, gap: 14 },
    md: { dock: "left", width: 300, gap: 18 }
  };

  header.Height = 88;
  header.TitleText = "Third-Party Control Package Demo";
  header.SubtitleText = "AcmeJOG, BeaconJOG, ChartJOG, FlatpickrJOG, and LexicalJOG all register through the public extension API while using different implementation styles.";

  sidebar.TitleText = "Package Registry";
  sidebar.FooterText = "Loaded packages: AcmeJOG.Controls, BeaconJOG.Controls, ChartJOG.Controls, FlatpickrJOG.Controls, and LexicalJOG.Controls";
  registryLabel.Text = JOG.DumpRegisteredControls();
  registryLabel.CssClass = "jog-fill-width";
  sidebar.Add(registryLabel);

  content.Orientation = "vertical";
  content.Spacing = 14;
  content.Padding = 16;
  content.Fill = true;
  content.Name = "thirdPartyDemoContent";

  pickerLabel.Text = "Pipeline stage";
  pickerLabel.ThemePreset = "strong";

  picker.Items = [
    { value: "qualified", text: "Qualified" },
    { value: "proposal", text: "Proposal" },
    { value: "negotiation", text: "Negotiation" }
  ];
  picker.BindValue(store, "selectedStage");
  picker.BindError(store, "stageError");
  picker.OnChange(function() {
    metricAccessory.Text = "Selected stage: " + store.Get("selectedStage");
    metricCard.DetailText = store.Get("viewSummary");
  });

  pickerError.BindMessage(store, "stageError");

  summaryCard.TitleText = "Selected stage";
  summaryCard.FooterText = "Composite third-party containers can host ordinary JOG children.";
  summaryCard.Fill = true;
  summaryLabel.BindText(store, "stageSummary");
  summaryCard.Add(summaryLabel);

  viewLabel.Text = "View mode";
  viewLabel.ThemePreset = "strong";

  viewSwitch.Items = [
    { key: "overview", value: "overview", text: "Overview" },
    { key: "board", value: "board", text: "Board" },
    { key: "audit", value: "audit", text: "Audit", enabled: false }
  ];
  viewSwitch.BindValue(store, "selectedView");

  metricCard.EyebrowText = "BeaconJOG Metric Card";
  metricCard.FooterText = "Composite control built from core JOG controls plus one named accessory slot.";
  metricAccessory.ThemePreset = "strong";
  metricCard.SetAccessory(metricAccessory);

  dialogButton.Text = "Open third-party dialog";
  dialogButton.OnClick(function() {
    stageDialog.Title = "Promote selected stage";
    stageDialog.SubtitleText = "Custom chrome and child hosting are built through the public Window hooks.";
    stageDialog.StatusText = store.Get("selectedView") === "overview" ? "Review mode" : "Board mode";
    stageDialog.FooterNoteText = "Current stage: " + store.Get("selectedStage");
    dialogSummary.Text = "Promote " + store.Get("selectedStage") + " while preserving the " + store.Get("selectedView") + " view context.";
    stageDialog.ShowModal();
  });

  saveButton.Text = "Validate Selection";
  saveButton.ThemePreset = "primary";
  saveButton.OnClick(function() {
    if (!store.Get("selectedStage")) {
      store.Set("stageError", "Choose a stage before continuing.");
      return;
    }

    store.Set("stageError", "");
    store.Set("stageSummary", "Current stage: " + store.Get("selectedStage") + ".");
  });

  store.Derive("stageSummary", ["selectedStage"], function(currentStore) {
    var value = currentStore.Get("selectedStage");
    if (!value) {
      return "No stage selected yet.";
    }
    return "Current stage: " + value + ".";
  });

  store.Derive("viewSummary", ["selectedView", "selectedStage"], function(currentStore) {
    var view = currentStore.Get("selectedView");
    var stage = currentStore.Get("selectedStage");

    if (view === "overview") {
      return "Overview view summarizes the " + stage + " stage at a glance.";
    }
    if (view === "board") {
      return "Board view keeps the " + stage + " stage in active pipeline context.";
    }
    return "Audit view is disabled in this sample package.";
  });

  viewSwitch.OnChange(function(args) {
    var view = args.Value;
    metricCard.ValueText = view === "overview" ? "Overview" : "Board";
    metricCard.DetailText = store.Get("viewSummary");
    metricAccessory.Text = "Selected stage: " + store.Get("selectedStage");
    if (stageDialog.Visible) {
      stageDialog.StatusText = view === "overview" ? "Review mode" : "Board mode";
      dialogSummary.Text = "Promote " + store.Get("selectedStage") + " while preserving the " + view + " view context.";
    }
  });

  metricCard.ValueText = "Board";
  metricCard.DetailText = store.Get("viewSummary");
  metricAccessory.Text = "Selected stage: " + store.Get("selectedStage");

  pipelineLabel.Text = "Pipeline mix";
  pipelineLabel.ThemePreset = "strong";

  pipelineChart.Name = "thirdPartyChart";
  pipelineChart.Height = 280;
  pipelineChart.MinHeight = 280;
  pipelineChart.TitleText = "Open pipeline by stage";
  pipelineChart.SeriesLabel = "Open deals";
  pipelineChart.EmptyText = "No pipeline totals available.";
  pipelineChart.ThemePreset = "muted";
  pipelineChart.BindCollection(pipelineCollection, {
    labelField: "stage",
    valueField: "count"
  });
  pipelineChart.OnPointClick(function(args) {
    store.Set("pipelineSummary", args.Label + ": " + args.Value + " open deals in the current snapshot.");
  });

  pipelineSummaryCard.TitleText = "Selected chart point";
  pipelineSummaryCard.FooterText = "This wrapper proves a collection-backed third-party visualization surface instead of another input control.";
  pipelineSummaryCard.Fill = true;
  pipelineSummaryLabel.BindText(store, "pipelineSummary");
  pipelineSummaryCard.Add(pipelineSummaryLabel);

  pipelineRefreshButton.Text = "Refresh pipeline snapshot";
  pipelineRefreshButton.ThemePreset = "primary";
  pipelineRefreshButton.OnClick(function() {
    pipelineCollection.Update("qualified", function(row) {
      return Object.assign({}, row, { count: row.count + 1 });
    });
    pipelineCollection.Update("proposal", function(row) {
      return Object.assign({}, row, { count: row.count + 2 });
    });
    pipelineCollection.Update("negotiation", function(row) {
      return Object.assign({}, row, { count: row.count + 1 });
    });
    setPipelineDefaultSummary();
  });

  setPipelineDefaultSummary();

  followUpLabel.Text = "Next follow-up date";
  followUpLabel.ThemePreset = "strong";

  followUpPicker.Name = "thirdPartyFlatpickrDatePicker";
  followUpPicker.Placeholder = "Pick the next executive follow-up date.";
  followUpPicker.MinDate = "2026-07-01";
  followUpPicker.MaxDate = "2026-12-31";
  followUpPicker.ThemePreset = "muted";
  followUpPicker.BindValue(store, "followUpDate");
  followUpPicker.BindError(store, "followUpDateError");
  followUpPicker.OnChange(function(args) {
    store.Set("followUpDateSummary", args.Value ? "Next follow-up scheduled for " + args.Value + "." : "No follow-up date selected yet.");
  });

  followUpError.BindMessage(store, "followUpDateError");
  planningValidationSummary.BindErrors(store, ["followUpDateError", "noteError"]);

  followUpFormState = createRequiredThirdPartyValidation({
    control: followUpPicker,
    errorKey: "followUpDateError",
    errorMessage: "Choose a follow-up date before validating the wrapper.",
    isEmpty: function() {
      return followUpPicker.IsEmpty();
    },
    watchKeys: ["followUpDate"]
  });

  followUpSummaryCard.TitleText = "Follow-up date";
  followUpSummaryCard.FooterText = "This wrapper keeps a third-party popup date picker behind a normal JOG Value, BindValue, and validation contract.";
  followUpSummaryCard.Fill = true;
  followUpSummaryLabel.BindText(store, "followUpDateSummary");
  followUpSummaryCard.Add(followUpSummaryLabel);

  followUpSaveButton.Text = "Validate date";
  followUpSaveButton.ThemePreset = "primary";
  followUpSaveButton.OnClick(function() {
    if (!followUpFormState.Validate()) {
      return;
    }
    store.Set("followUpDateSummary", "Next follow-up scheduled for " + store.Get("followUpDate") + ".");
  });

  followUpClearButton.Text = "Clear date";
  followUpClearButton.OnClick(function() {
    followUpPicker.Clear();
    followUpFormState.ClearErrors();
    store.Set("followUpDate", "");
    store.Set("followUpDateSummary", "No follow-up date selected yet.");
  });

  noteLabel.Text = "Account notes";
  noteLabel.ThemePreset = "strong";

  noteFormatBar.Gap = 8;
  noteBoldButton.Text = "Bold";
  noteBoldButton.OnClick(function() {
    noteEditor.ToggleBold();
  });
  noteItalicButton.Text = "Italic";
  noteItalicButton.OnClick(function() {
    noteEditor.ToggleItalic();
  });
  noteUnderlineButton.Text = "Underline";
  noteUnderlineButton.OnClick(function() {
    noteEditor.ToggleUnderline();
  });
  noteFormatBar.Add(noteBoldButton);
  noteFormatBar.Add(noteItalicButton);
  noteFormatBar.Add(noteUnderlineButton);

  noteCommandButtons.Orientation = "horizontal";
  noteCommandButtons.Spacing = 8;
  noteCommandHint.Text = "The toolbar above uses wrapper convenience methods. The buttons below call the generic FormatText(formatType) API directly.";
  noteCommandHint.ThemePreset = "muted";
  noteFormatBoldButton.Text = "Format bold";
  noteFormatBoldButton.OnClick(function() {
    noteEditor.FormatText("bold");
  });
  noteFormatItalicButton.Text = "Format italic";
  noteFormatItalicButton.OnClick(function() {
    noteEditor.FormatText("italic");
  });
  noteFormatUnderlineButton.Text = "Format underline";
  noteFormatUnderlineButton.OnClick(function() {
    noteEditor.FormatText("underline");
  });
  noteCommandButtons.Add(noteFormatBoldButton);
  noteCommandButtons.Add(noteFormatItalicButton);
  noteCommandButtons.Add(noteFormatUnderlineButton);

  noteEditor.Name = "thirdPartyLexicalEditor";
  noteEditor.Height = 180;
  noteEditor.MinHeight = 180;
  noteEditor.Placeholder = "Capture the next-call summary, objections, and the commercial blocker. Inline formatting is preserved in the Lexical JSON value.";
  noteEditor.ThemePreset = "muted";
  noteEditor.BindPlainText(store, "notePlainText");
  noteEditor.BindError(store, "noteError");
  noteEditor.OnChange(function(args) {
    store.Set("noteSummary", store.Get("notePlainText") || "No notes captured yet.");
    store.Set("noteJsonSummary", args.Value);
    store.Set("noteState", args.Value);
  });

  noteError.BindMessage(store, "noteError");

  noteFormState = createRequiredThirdPartyValidation({
    control: noteEditor,
    errorKey: "noteError",
    errorMessage: "Enter notes before validating the editor wrapper.",
    isEmpty: function() {
      return noteEditor.IsEmpty();
    },
    watchKeys: ["notePlainText"]
  });

  noteSummaryCard.TitleText = "Plain-text notes";
  noteSummaryCard.FooterText = "The rich-text wrapper still exposes a plain-text summary surface for ordinary form state and validation flows.";
  noteSummaryCard.Fill = true;
  noteSummaryLabel.BindText(store, "noteSummary");
  noteSummaryCard.Add(noteSummaryLabel);

  noteJsonCard.TitleText = "Serialized editor state";
  noteJsonCard.FooterText = "Formatting stays in the canonical Lexical JSON value even when app code binds the editor like a normal notes field.";
  noteJsonCard.Fill = true;
  noteJsonLabel.BindText(store, "noteJsonSummary");
  noteJsonCard.Add(noteJsonLabel);

  noteSaveButton.Text = "Validate notes";
  noteSaveButton.ThemePreset = "primary";
  noteSaveButton.OnClick(function() {
    if (!noteFormState.Validate()) {
      return;
    }
    store.Set("noteSummary", store.Get("notePlainText") || "No notes captured yet.");
    store.Set("noteJsonSummary", store.Get("noteState"));
  });

  noteClearButton.Text = "Clear notes";
  noteClearButton.OnClick(function() {
    noteEditor.Clear();
    noteFormState.ClearErrors();
    store.Set("notePlainText", "");
    store.Set("noteState", emptyNoteState);
    store.Set("noteSummary", "No notes captured yet.");
    store.Set("noteJsonSummary", emptyNoteState);
  });

  stageDialog.Name = "thirdPartyStageDialog";
  stageDialog.Hide();
  stageDialog.Width = 480;
  stageDialog.MinWidth = 420;
  stageDialog.SetBounds(120, 88, 480, 280);
  stageDialog.ActionText = "Confirm promotion";
  stageDialog.CloseButtonText = "Dismiss";
  stageDialog.FooterNoteText = "Current stage: qualified";

  dialogSummary.Text = "Promote qualified while preserving the board view context.";
  stageDialog.Add(dialogSummary);
  stageDialog.OnCommit(function() {
    store.Set("stageSummary", "Promoted " + store.Get("selectedStage") + " from the third-party dialog.");
    stageDialog.Close();
  });

  content.Add(pickerLabel);
  content.Add(picker);
  content.Add(pickerError);
  content.Add(saveButton);
  content.Add(dialogButton);
  content.Add(summaryCard);
  content.Add(viewLabel);
  content.Add(viewSwitch);
  content.Add(metricCard);
  content.Add(pipelineLabel);
  content.Add(pipelineChart);
  content.Add(pipelineRefreshButton);
  content.Add(pipelineSummaryCard);
  content.Add(followUpLabel);
  content.Add(followUpPicker);
  content.Add(followUpError);
  content.Add(planningValidationSummary);
  content.Add(followUpSaveButton);
  content.Add(followUpClearButton);
  content.Add(followUpSummaryCard);
  content.Add(noteLabel);
  content.Add(noteFormatBar);
  content.Add(noteCommandHint);
  content.Add(noteCommandButtons);
  content.Add(noteEditor);
  content.Add(noteError);
  content.Add(noteSaveButton);
  content.Add(noteClearButton);
  content.Add(noteSummaryCard);
  content.Add(noteJsonCard);

  shell.Header = header;
  shell.Sidebar = sidebar;
  shell.Content = content;

  page.Add(shell);
  page.Add(stageDialog);
  app.Run(page);
});
