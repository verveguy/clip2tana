/*

  code injected into the actual tab context rather than running in our 
  "isolated world" context. Allows us to access various globals
  within the page itself. Most important for tana Node access
  
*/

function invokeDocumentCopy() {
  try {
    var successful = document.execCommand('copy');
    var msg = successful ? 'successful' : 'unsuccessful';
  } catch (err) {
    console.error('Fallback: Oops, unable to copy', err);
  }
};

(() => {
  window.addEventListener("message",
    function (event) {
      const command = event.data?.command;
      // initial invocation message handler
      if (command === "clip2tana") {
        console.log("INJECT GOT MESSAGE: " + event.data.command);
        // TODO: ask the user what command to run
        // for now assume it is 'chatgpt'
        invokeDocumentCopy();
      }
      // helper messages for getting/setting clipboard
      else if (command === "get-clipboard") {
      }
      else if (command === "set-clipboard") {
      }
    });
  //console.log("GOT INSIDE");
})();