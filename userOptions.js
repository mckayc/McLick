// Saves options to chrome.storage
function save_options() {
    var mouseMoveColor = document.getElementById('mouseMoveColor').value;
    var mouseMoveSize = document.getElementById('mouseMoveSize').value;
    var mouseMoveBorderColor = document.getElementById('mouseMoveBorderColor').value;
    var mouseMoveBorderSize = document.getElementById('mouseMoveBorderSize').value;

    var mouseDownColor = document.getElementById('mouseDownColor').value;
    var mouseDownSize = document.getElementById('mouseDownSize').value;
    var mouseDownBorderColor = document.getElementById('mouseDownBorderColor').value;
    var mouseDownBorderSize = document.getElementById('mouseDownBorderSize').value;

    var mouseRgba = $('#borderColorPicker').spectrum("get").toRgbString();

    chrome.storage.sync.set({
        mouseMoveColor: mouseMoveColor,
        mouseMoveSize: mouseMoveSize,
        mouseMoveBorderColor: mouseMoveBorderColor,
        mouseMoveBorderSize: mouseMoveBorderSize,
        mouseRgba: mouseRgba,
        mouseDownColor: mouseDownColor,
        mouseDownSize: mouseDownSize,
        mouseDownBorderColor: mouseDownBorderColor,
        mouseDownBorderSize: mouseDownBorderSize,

    }, function() {
        // Update status to let user know options were saved.
        var status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(function() {
            status.textContent = '';
        }, 750); window.close("userOptions.html");
    });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function init() {

  // $('#borderColorPicker').spectrum("get").toHexString();
  // $('#borderColorPicker').spectrum("get").getAlpha();


    // Use default value color = 'red' and likesColor = true.
    chrome.storage.sync.get({
        mouseMoveColor: 'none',
        mouseMoveSize: '20',
        mouseMoveBorderColor: 'none',
        mouseMoveBorderSize: '5',

        mouseDownColor: 'none',
        mouseDownSize: '20',
        mouseDownBorderColor: 'none',
        mouseDownBorderSize: '5',
        mouseRgba: 'rbga(255,0,0,0)',

    }, function(items) {

console.log(items, items.mouseRgba);
      $('#borderColorPicker').spectrum({
          color: items.mouseRgba,
          showAlpha: true,
          showInput: true,
          showPalette: true,
          palette: [
              ["rgba(255, 128, 0, .9)", "rgba(255, 128, 0, .5)"],
              ["red", "green", "blue"],
              ["hsla(25, 50, 75, .5)", "rgba(100, .5, .5, .8)"]
          ]
      });

        document.getElementById('mouseMoveColor').value = items.mouseMoveColor;
        document.getElementById('mouseMoveSize').value = items.mouseMoveSize;
        document.getElementById('mouseMoveBorderColor').value = items.mouseMoveBorderColor;
        document.getElementById('mouseMoveBorderSize').value = items.mouseMoveBorderSize;

        document.getElementById('mouseDownColor').value = items.mouseDownColor;
        document.getElementById('mouseDownSize').value = items.mouseDownSize;
        document.getElementById('mouseDownBorderColor').value = items.mouseDownBorderColor;
        document.getElementById('mouseDownBorderSize').value = items.mouseDownBorderSize;

    });
}
document.addEventListener('DOMContentLoaded', init);
document.getElementById('save').addEventListener('click', save_options);
