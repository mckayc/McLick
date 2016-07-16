
// Saves options to chrome.storage
function save_options() {
    // var mouseMoveColor = document.getElementById('mouseMoveColor').value;
    var mouseMoveColor = $('#mouseMoveColor').spectrum("get").toRgbString();
    var mouseMoveSize = document.getElementById('mouseMoveSize').value;
    // var mouseMoveSize = $("#mouseMoveSize").simpleSlider("get");
    var mouseMoveBorderColor = $('#mouseMoveBorderColor').spectrum("get").toRgbString();
    var mouseMoveBorderSize = document.getElementById('mouseMoveBorderSize').value;

    var mouseDownColor = $('#mouseDownColor').spectrum("get").toRgbString();
    var mouseDownSize = document.getElementById('mouseDownSize').value;
    var mouseDownBorderColor = $('#mouseDownBorderColor').spectrum("get").toRgbString();
    var mouseDownBorderSize = document.getElementById('mouseDownBorderSize').value;

    var mouseUpColor = $('#mouseUpColor').spectrum("get").toRgbString();
    var mouseUpSize = document.getElementById('mouseUpSize').value;
    var mouseUpBorderColor = $('#mouseUpBorderColor').spectrum("get").toRgbString();
    var mouseUpBorderSize = document.getElementById('mouseUpBorderSize').value;

    chrome.storage.sync.set({
        mouseMoveColor: mouseMoveColor,
        mouseMoveSize: mouseMoveSize,
        mouseMoveBorderColor: mouseMoveBorderColor,
        mouseMoveBorderSize: mouseMoveBorderSize,

        mouseDownColor: mouseDownColor,
        mouseDownSize: mouseDownSize,
        mouseDownBorderColor: mouseDownBorderColor,
        mouseDownBorderSize: mouseDownBorderSize,

        mouseUpColor: mouseUpColor,
        mouseUpSize: mouseUpSize,
        mouseUpBorderColor: mouseUpBorderColor,
        mouseUpBorderSize: mouseUpBorderSize,

    }, function() {
        // Update status to let user know options were saved.
        var status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(function() {
            status.textContent = '';
        }, 750); window.close("userOptions.html");
    });
}








// Resets default settings to chrome.storage
function reset_options() {
    var resetMouseMoveColor = 'rgba(255,255,10,0.5)';
    var resetMouseMoveSize = '50';
    var resetMouseMoveBorderColor = 'rgba(255,255,255,0)';
    var resetMouseMoveBorderSize = '0';

    var resetMouseDownColor = 'rgba(255,255,255,0)';
    var resetMouseDownSize = '25';
    var resetMouseDownBorderColor = 'rgba(65,65,190,0.7)';
    var resetMouseDownBorderSize = '5';

    var resetMouseUpColor = 'rgba(255,255,255,0)';
    var resetMouseUpSize = '20';
    var resetMouseUpBorderColor = 'rgba(65,65,190,0.6)';
    var resetMouseUpBorderSize = '4';

    chrome.storage.sync.set({
      mouseMoveColor: 'rgba(255,255,10,0.5)',
      mouseMoveSize: '50',
      mouseMoveBorderColor: 'rgba(65,65,190,0.7)',
      mouseMoveBorderSize: '0',

      mouseDownColor: 'rgba(255,255,255,0)',
      mouseDownSize: '25',
      mouseDownBorderColor: 'rgba(64,64,191,0.5)',
      mouseDownBorderSize: '5',

      mouseUpColor: 'rgba(255,255,255,0)',
      mouseUpSize: '20',
      mouseUpBorderColor: 'rgba(65,65,190,0.6)',
      mouseUpBorderSize: '4',

    }, function() {
        // Update status to let user know options were saved to default.
        var status = document.getElementById('status');
        status.textContent = 'Options reset.';
        setTimeout(function() {
            status.textContent = '';
        }, 750); window.close("userOptions.html");
    });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function init() {

    chrome.storage.sync.get({

        mouseMoveColor: 'rgba(255,230,0,0.5)',
        mouseMoveSize: '45',
        mouseMoveBorderColor: 'rgba(255,255,255,0)',
        mouseMoveBorderSize: '0',

        mouseDownColor: 'rgba(255,255,255,0)',
        mouseDownSize: '15',
        mouseDownBorderColor: 'rgba(64,64,191,0.5)',
        mouseDownBorderSize: '4',

        mouseUpColor: 'rgba(255,255,255,0)',
        mouseUpSize: '10',
        mouseUpBorderColor: 'rgba(64,64,191,0.5)',
        mouseUpBorderSize: '3',

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

console.log(items, items.mouseDownBorderColor);
      $('#mouseDownBorderColor').spectrum({
          color: items.mouseDownBorderColor,
          showAlpha: true,
          showInput: true,
          showPalette: true,
          palette: [
              ["rgba(255, 128, 0, .9)", "rgba(255, 128, 0, .5)"],
              ["red", "green", "blue"],
              ["hsla(25, 50, 75, .5)", "rgba(100, .5, .5, .8)"]
          ]
      });

console.log(items, items.mouseUpColor);
      $('#mouseUpColor').spectrum({
          color: items.mouseUpColor,
          showAlpha: true,
          showInput: true,
          showPalette: true,
          palette: [
              ["rgba(255, 128, 0, .9)", "rgba(255, 128, 0, .5)"],
              ["red", "green", "blue"],
              ["hsla(25, 50, 75, .5)", "rgba(100, .5, .5, .8)"]
          ]
      });

console.log(items, items.mouseUpBorderColor);
      $('#mouseUpBorderColor').spectrum({
          color: items.mouseUpBorderColor,
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
        // document.getElementById('mouseDownBorderColor').value = items.mouseDownBorderColor;
        document.getElementById('mouseDownBorderSize').value = items.mouseDownBorderSize;

        // document.getElementById('mouseUpColor').value = items.mouseUpColor;
        document.getElementById('mouseUpSize').value = items.mouseUpSize;
        // document.getElementById('mouseUpBorderColor').value = items.mouseUpBorderColor;
        document.getElementById('mouseUpBorderSize').value = items.mouseUpBorderSize;

    });
}
document.addEventListener('DOMContentLoaded', init);
document.getElementById('save').addEventListener('click', save_options);
document.getElementById('reset').addEventListener('click', reset_options);
