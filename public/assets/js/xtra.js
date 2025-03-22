function inspect() {
    const proccy = document.getElementById("browserFrame");
    if (!proccy) return;

    const proccyWindow = proccy.contentWindow;
    const proccyDocument = proccy.contentDocument;

    if (!proccyWindow || !proccyDocument) return;

    if (proccyWindow.eruda?._isInit) {
      proccyWindow.eruda.destroy();
    } else {
      let script = proccyDocument.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/eruda";
      script.onload = function () {
        if (!proccyWindow) return;
        proccyWindow.eruda.init();
        proccyWindow.eruda.show();
      };
      proccyDocument.head.appendChild(script);
    }
  }