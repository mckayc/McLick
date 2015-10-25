$('body').append("<div id='ext-mouse-move'></div>");
$('body').append("<div id='ext-mouse-down'></div>");
$('body').append("<div id='ext-mouse-up'></div>");


var mouseMoveHighlight = $("#ext-mouse-move");
var mouseDownHighlight = $("#ext-mouse-down");
var mouseUpHighlight = $("#ext-mouse-up");

var mouseMoveColor = '000000';
var mouseMoveSize = 0;
var mouseMoveBorderColor = '000000';
var mouseMoveBorderSize = 0;

var mouseDownColor = '000000';
var mouseDownSize = 0;
var mouseDownBorderColor = '000000';
var mouseDownBorderSize = 0;

var mouseUpColor = '000000';
var mouseUpSize = 0;
var mouseUpBorderColor = '000000';
var mouseUpBorderSize = 0;


function mouseMove(e){
  var x = e.clientX-mouseMoveHighlight.outerWidth()/2;
  var y = e.clientY-mouseMoveHighlight.outerHeight()/2;

  chrome.storage.sync.get(null, function(response) {

    mouseMoveColor = response.mouseMoveColor;
    mouseMoveSize = parseInt(response.mouseMoveSize, 10);
    mouseMoveBorderColor = response.mouseMoveBorderColor;
    mouseMoveBorderSize = parseInt(response.mouseMoveBorderSize, 10);

    mouseDownColor = response.mouseDownColor;
    mouseDownSize = parseInt(response.mouseDownSize, 10);
    mouseDownBorderColor = response.mouseDownBorderColor;
    mouseDownBorderSize = parseInt(response.mouseDownBorderSize, 10);

    mouseUpColor = response.mouseUpColor;
    mouseUpSize = parseInt(response.mouseUpSize, 10);
    mouseUpBorderColor = response.mouseUpBorderColor;
    mouseUpBorderSize = parseInt(response.mouseUpBorderSize, 10);

    mouseMoveHighlight.css({
         'position': 'fixed',
         'z-index': '99999999',
         "pointer-events": 'none',
         'top':y,
   			 'left':x,

        //  "opacity": mouseMoveAlpha,
        //  "transition": "opacity 0.2s",

         "border-radius": "50%",
         "width": mouseMoveSize+'px',
         "height": mouseMoveSize+'px',
         "border": mouseMoveBorderSize+"px solid "+ mouseMoveBorderColor,
         "background-color": mouseMoveColor,
     });
  });
}

function mouseDown(e){
  console.log("Mouse Down.")
  var x = e.clientX-mouseDownHighlight.outerWidth()/2;
  var y = e.clientY-mouseDownHighlight.outerHeight()/2;

  chrome.storage.sync.get(null, function(response) {
    mouseMoveColor = response.mouseMoveColor;
    mouseMoveSize = parseInt(response.mouseMoveSize, 10);
    mouseMoveBorderColor = response.mouseMoveBorderColor;
    mouseMoveBorderSize = parseInt(response.mouseMoveBorderSize, 10);

    mouseDownColor = response.mouseDownColor;
    mouseDownSize = parseInt(response.mouseDownSize, 10);
    mouseDownBorderColor = response.mouseDownBorderColor;
    mouseDownBorderSize = parseInt(response.mouseDownBorderSize, 10);

    mouseUpColor = response.mouseUpColor;
    mouseUpSize = parseInt(response.mouseUpSize, 10);
    mouseUpBorderColor = response.mouseUpBorderColor;
    mouseUpBorderSize = parseInt(response.mouseUpBorderSize, 10);

    if (mouseDownHighlight.outerHeight() === 0) {
      mouseDownHighlight.css({
        "border-radius": "50%",
        "width": mouseDownSize+'px',
        "height": mouseDownSize+'px',
        "border": mouseDownBorderSize+"px solid "+ mouseDownBorderColor
      });
      x = e.clientX-mouseDownHighlight.outerWidth()/2;
      y = e.clientY-mouseDownHighlight.outerHeight()/2;
    }

    mouseDownHighlight.css({
         'position': 'fixed',
         'z-index': '99999999',
         "pointer-events": 'none',
         'top':y,
   			 'left':x,
         "border-radius": "50%",
         "width": mouseDownSize+'px',
         "height": mouseDownSize+'px',
         "border": mouseDownBorderSize+"px solid "+ mouseDownBorderColor,
         "background-color": mouseDownColor,

        //  "opacity": "0.5",
         "transition": "opacity .25s",

        //  "visibility": "hidden",
        //  "opacity": "0",
        //  "transition": "visibility 0s 2s, opacity 2s linear",


     });
  });
}

function mouseUp(e){
  var x = e.clientX-mouseUpHighlight.outerWidth()/2;
  var y = e.clientY-mouseUpHighlight.outerHeight()/2;

  chrome.storage.sync.get(null, function(response) {
    mouseMoveColor = response.mouseMoveColor;
    mouseMoveSize = parseInt(response.mouseMoveSize, 10);
    mouseMoveBorderColor = response.mouseMoveBorderColor;
    mouseMoveBorderSize = parseInt(response.mouseMoveBorderSize, 10);

    mouseDownColor = response.mouseDownColor;
    mouseDownSize = parseInt(response.mouseDownSize, 10);
    mouseDownBorderColor = response.mouseDownBorderColor;
    mouseDownBorderSize = parseInt(response.mouseDownBorderSize, 10);

    mouseUpColor = response.mouseUpColor;
    mouseUpSize = parseInt(response.mouseUpSize, 10);
    mouseUpBorderColor = response.mouseUpBorderColor;
    mouseUpBorderSize = parseInt(response.mouseUpBorderSize, 10);

    if (mouseUpHighlight.outerHeight() === 0) {
      mouseUpHighlight.css({
        "border-radius": "50%",
        "width": mouseUpSize+'px',
        "height": mouseUpSize+'px',
        "border": mouseUpBorderSize+"px solid "+ mouseUpBorderColor
      });
      x = e.clientX-mouseUpHighlight.outerWidth()/2;
      y = e.clientY-mouseUpHighlight.outerHeight()/2;
    }

    mouseUpHighlight.css({
         'position': 'fixed',
         'z-index': '99999999',
         "pointer-events": 'none',
         'top':y,
         'left':x,

        //  "opacity": "0.5",
        //  "transition": "opacity 0.3s",

        // "visibility": "hidden",
        // "opacity": "0",
        // "transition": "visibility 0s 2s, opacity 2s linear",

         "border-radius": "50%",
         "width": mouseUpSize+'px',
         "height": mouseUpSize+'px',
         "border": mouseUpBorderSize+"px solid "+ mouseUpBorderColor,
         "background-color": mouseUpColor,
     });
  });
}


function ext_on() {
  console.log("On");
  $(window).mousemove(mouseMove);
  $(window).mousedown(mouseDown);
  $(window).mouseup(mouseUp);

  mouseMoveHighlight.css({
    'display': 'inline'
  });
  mouseDownHighlight.css({
    'display': 'inline'
  });
  mouseUpHighlight.css({
    'display': 'inline'
  });



}

function ext_off() {
  console.log("Off");
  $(window).unbind('mousemove',mouseMove);
  $(window).unbind('mousedown',mouseDown);
  $(window).unbind('mouseup',mouseUp);

  mouseMoveHighlight.css({
    'display': 'none'
  });
  mouseDownHighlight.css({
    'display': 'none'
  });
  mouseUpHighlight.css({
    'display': 'none'
  });

}
