
// Saves options to chrome.storage
function save_options() {
    // var mouseMoveColor = document.getElementById('mouseMoveColor').value;
    var mouseMoveColor = $('#mouseMoveColor').spectrum("get").toRgbString();
    var mouseMoveSize = document.getElementById('mouseMoveSize').value;
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

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function init() {

    chrome.storage.sync.get({

        mouseMoveColor: 'rbga(255,0,0,0)',
        mouseMoveSize: '20',
        mouseMoveBorderColor: 'rbga(255,0,0,0)',
        mouseMoveBorderSize: '5',

        mouseDownColor: 'rbga(255,0,0,0)',
        mouseDownSize: '20',
        mouseDownBorderColor: 'rbga(255,0,0,0)',
        mouseDownBorderSize: '5',

        mouseUpColor: 'rbga(255,0,0,0)',
        mouseUpSize: '20',
        mouseUpBorderColor: 'rbga(255,0,0,0)',
        mouseUpBorderSize: '5',

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
