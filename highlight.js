$('body').append("<div id='ext-mouse-cursor'></div>");
$('body').append("<div id='ext-mouse-down'></div>");


var mouseMoveHighlight = $("#ext-mouse-cursor");
var mouseDownHighlight = $("#ext-mouse-down");
var mouseUpHighlight = $("#ext-mouse-cursor");

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

    console.log(response);
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
         "position": "fixed",
        //  "opacity": mouseMoveAlpha,
        //  "transition": "opacity 0.2s",
         "border-radius": "50%",
         "width": mouseMoveSize+'px',
         "height": mouseMoveSize+'px',
         "border": mouseMoveBorderSize+"px solid "+ mouseMoveBorderColor,
         "background-color": mouseMoveColor,
     });
  });

	mouseMoveHighlight.css({
			'top':y,
			'left':x,
		});
}


function mouseDown(e){
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


    mouseDownHighlight.css({
         'position': 'fixed',
         'z-index': '99999999',
         "pointer-events": 'none',
         "position": "fixed",
        //  "opacity": "0.5",
        //  "transition": "opacity 0.2s",
         "border-radius": "50%",
         "width": mouseDownSize+'px',
         "height": mouseDownSize+'px',
         "border": mouseDownBorderSize+"px solid "+ mouseDownBorderColor,
         "background-color": mouseDownColor,
     });
  });

	mouseDownHighlight.css({
			'top':y,
			'left':x,
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


    mouseUpHighlight.css({
         'position': 'fixed',
         'z-index': '99999999',
         "pointer-events": 'none',
         "position": "fixed",
        //  "opacity": "0.5",
        //  "transition": "opacity 0.2s",
         "border-radius": "50%",
         "width": mouseUpSize+'px',
         "height": mouseUpSize+'px',
         "border": mouseUpBorderSize+"px solid "+ mouseUpBorderColor,
         "background-color": mouseUpColor,
     });
  });

	mouseUpHighlight.css({
			'top':y,
			'left':x,
		});
}





















// function mouseDown(e){
//   var offset = mouseMoveHighlight.offset();mouseMoveHighlight
//   offset.top = offset.top - (circleBorderSize/2);
//   offset.left = offset.left - (circleBorderSize/2);
//   mouseMoveHighlight.offset(offset);
//
//   mouseMoveHighlight.css({
//     'opacity':'1',
//     "background-color": "transparent",
//     "border": circleBorderSize + 'px solid #29aae1',
//   });
// }



// function mouseUp(e){
//   var offset = mouseMoveHighlight.offset();
//   offset.top = offset.top + (circleBorderSize/2);
//   offset.left = offset.left + (circleBorderSize/2);
//   mouseMoveHighlight.offset(offset);
//
//   mouseMoveHighlight.css({
//
//     "background-color": "#" + mouseMoveColor,
//     "border": circleBorderSize + 'px solid #FF00D4',
//   });
// }

function ext_on() {
  console.log("On");
  $(window).mousedown(mouseDown);
  $(window).mouseup(mouseUp);
  $(window).mousemove(mouseMove);
}

function ext_off() {
  console.log("Off");
  $(window).unbind('mousedown',mouseDown);
//  $(window).unbind('mousemove',mouseMove);
  mouseMoveHighlight.css({
    'display': 'none'
  });
  mouseDownHighlight.css({
    'display': 'none'
  });

}
