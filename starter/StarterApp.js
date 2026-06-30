(function(global) {
  "use strict";

  function StarterPage() {
    JOG.Page.call(this);

    this.Title = "JOG Starter";
    this.Name = "starterPage";

    var shell = new JOG.SectionPanel();
    shell.Name = "starterShell";
    shell.Title = "New JOG App";
    shell.Width = 640;
    shell.Padding = 18;

    var layout = new JOG.StackPanel();
    layout.Name = "starterLayout";
    layout.Orientation = "vertical";
    layout.Gap = 12;

    var intro = new JOG.Label();
    intro.Text = "This starter bundle gives you one page, a few controls, and a simple event handler. Replace this with your own app structure.";

    var buttonRow = new JOG.StackPanel();
    buttonRow.Name = "starterButtonRow";
    buttonRow.Orientation = "horizontal";
    buttonRow.Gap = 10;

    var status = new JOG.Label();
    status.Text = "Status: Ready";

    var action = new JOG.Button();
    action.Text = "Run Starter Action";
    action.OnClick(function() {
      status.Text = "Status: Starter action clicked";
    });

    buttonRow.Add(action);

    layout.Add(intro);
    layout.Add(buttonRow);
    layout.Add(status);
    shell.Add(layout);
    this.Add(shell);
  }

  StarterPage.prototype = Object.create(JOG.Page.prototype);
  StarterPage.prototype.constructor = StarterPage;

  function boot() {
    var app = new JOG.Application();
    app.Run(new StarterPage());
  }

  global.addEventListener("load", boot, false);
})(window);
