// Saves options to chrome.storage
function save_options() {
    // var mouseMoveColor = document.getElementById('mouseMoveColor').value;
    var mouseMoveColor = $('#mouseMoveColor').spectrum("get").toRgbString();
    var mouseMoveSize = document.getElementById('mouseMoveSize').value;
    var mouseMoveBorderColor = $('#mouseMoveBorderColor').spectrum("get").toRgbString();
    var mouseMoveBorderSize = document.getElementById('mouseMoveBorderSize').value;

    var mouseDownColor = $('#mouseDownColor').spectrum("get").toRgbString();
    var mouseDownSize = document.getElementById('mouseDownSize').value;
    var mouseDownBorderColor = document.getElementById('mouseDownBorderColor').value;
    var mouseDownBorderSize = document.getElementById('mouseDownBorderSize').value;


    chrome.storage.sync.set({
        mouseMoveColor: mouseMoveColor,
        mouseMoveSize: mouseMoveSize,
        mouseMoveBorderColor: mouseMoveBorderColor,
        mouseMoveBorderSize: mouseMoveBorderSize,

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

    // Use default value color = 'red' and likesColor = true.
    chrome.storage.sync.get({
        // mouseMoveColor: 'none',
        mouseMoveColor: 'rbga(255,0,0,0)',
        mouseMoveSize: '20',
        mouseMoveBorderColor: 'rbga(255,0,0,0)',
        mouseMoveBorderSize: '5',

        mouseDownColor: 'rbga(255,0,0,0)',
        mouseDownSize: '20',
        mouseDownBorderColor: 'none',
        mouseDownBorderSize: '5',

    }, function(items) {

console.log(items, items.mouseMoveColor);
      $('#mouseMoveColor').spectrum({
          color: items.mouseMoveColor,
          showAlpha: true,
          showInput: true,
          showPalette: true,
          palette: [
              ["rgba(255, 128, 0, .9)", "rgba(255, 128, 0, .5)"],
              ["red", "green", "blue"],
              ["hsla(25, 50, 75, .5)", "rgba(100, .5, .5, .8)"]
          ]
      });

console.log(items, items.mouseMoveBorderColor);
      $('#mouseMoveBorderColor').spectrum({
          color: items.mouseMoveBorderColor,
          showAlpha: true,
          showInput: true,
          showPalette: true,
          palette: [
              ["rgba(255, 128, 0, .9)", "rgba(255, 128, 0, .5)"],
              ["red", "green", "blue"],
              ["hsla(25, 50, 75, .5)", "rgba(100, .5, .5, .8)"]
          ]
      });










console.log(items, items.mouseDownColor);
      $('#mouseDownColor').spectrum({
          color: items.mouseDownColor,
          showAlpha: true,
          showInput: true,
          showPalette: true,
          palette: [
              ["rgba(255, 128, 0, .9)", "rgba(255, 128, 0, .5)"],
              ["red", "green", "blue"],
              ["hsla(25, 50, 75, .5)", "rgba(100, .5, .5, .8)"]
          ]
      });


        // document.getElementById('mouseMoveColor').value = items.mouseMoveColor;
        document.getElementById('mouseMoveSize').value = items.mouseMoveSize;
        // document.getElementById('mouseMoveBorderColor').value = items.mouseMoveBorderColor;
        document.getElementById('mouseMoveBorderSize').value = items.mouseMoveBorderSize;

        // document.getElementById('mouseDownColor').value = items.mouseDownColor;
        document.getElementById('mouseDownSize').value = items.mouseDownSize;
        document.getElementById('mouseDownBorderColor').value = items.mouseDownBorderColor;
        document.getElementById('mouseDownBorderSize').value = items.mouseDownBorderSize;

    });
}
document.addEventListener('DOMContentLoaded', init);
document.getElementById('save').addEventListener('click', save_options);
