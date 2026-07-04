window.addEventListener("load", function() {
  "use strict";

  var app = new JOG.Application();
  var store = new JOG.Store({
    selectedStage: "qualified",
    stageError: "",
    stageSummary: "Qualified deals usually move into solution review next.",
    selectedView: "board",
    viewSummary: "Board view keeps the pipeline focused on active deals."
  });
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

  page.Title = "Third-Party Controls Demo";

  shell.Fill = true;
  shell.Padding = 20;
  shell.Gap = 16;
  shell.SidebarLayout = {
    base: { dock: "top", height: 170, gap: 14 },
    md: { dock: "left", width: 300, gap: 18 }
  };

  header.Height = 88;
  header.TitleText = "Third-Party Control Package Demo";
  header.SubtitleText = "AcmeJOG and BeaconJOG controls both register through the public extension API while using different authoring patterns.";

  sidebar.TitleText = "Package Registry";
  sidebar.FooterText = "Loaded packages: AcmeJOG.Controls and BeaconJOG.Controls";
  registryLabel.Text = JOG.DumpRegisteredControls();
  registryLabel.CssClass = "jog-fill-width";
  sidebar.Add(registryLabel);

  content.Orientation = "vertical";
  content.Spacing = 14;
  content.Padding = 16;
  content.Fill = true;

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

  shell.Header = header;
  shell.Sidebar = sidebar;
  shell.Content = content;

  page.Add(shell);
  page.Add(stageDialog);
  app.Run(page);
});
