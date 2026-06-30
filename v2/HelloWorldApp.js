(function(global) {
  "use strict";

  function boot() {
    // Application is the runtime host. It manages mounting, rendering, styles, and events.
    var app = new JOG.Application();

    // Page is the root container for normal app content.
    var page = new JOG.Page();

    // Controls are plain JavaScript objects. JOG will create and update the DOM for them.
    var helloLabel = new JOG.Label();

    // Setting the page title updates document.title when the app runs.
    page.Title = "Hello World";

    // Name is optional but useful for diagnostics and tree inspection.
    page.Name = "helloWorldPage";

    // Controls can also be named for easier debugging.
    helloLabel.Name = "helloWorldLabel";

    // State lives on the control object. JOG will render this text into the label node.
    helloLabel.Text = "Hello world from JOG.";

    // Compose the UI by adding child controls to containers.
    // JOG uses this control tree, not handwritten HTML, as the source of truth.
    page.Add(helloLabel);

    // Run mounts the page into document.body and triggers the first render.
    app.Run(page);
  }

  // Wait for the browser to finish loading before booting the JOG application.
  global.addEventListener("load", boot, false);
})(window);
