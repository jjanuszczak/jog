(function(global) {
  "use strict";

  function boot() {
    var app = new JOG.Application();
    var page = new JOG.Page();
    var helloLabel = new JOG.Label();

    page.Title = "Hello World";
    page.Name = "helloWorldPage";
    
    helloLabel.Name = "helloWorldLabel";
    helloLabel.Text = "Hello world from JOG.";

    page.Add(helloLabel);

    app.Run(page);
  }

  global.addEventListener("load", boot, false);
})(window);
