$('body').append("<div id='ext-mouse-cursor'></div>");

var mouseMoveHighlight = $("#ext-mouse-cursor");
var mouseDownHighlight = $("#ext-mouse-cursor");


var mouseMoveColor = '000000';
var mouseMoveSize = 0;
var mouseMoveBorderColor = '000000';
var mouseMoveBorderSize = 0;

var mouseDownColor = '000000';
var mouseDownSize = 0;
var mouseDownBorderColor = '000000';
var mouseDownBorderSize = 0;



function mouseMove(e){
  var x = e.clientX-mouseMoveHighlight.outerWidth()/2;
  var y = e.clientY-mouseMoveHighlight.outerHeight()/2;

  chrome.storage.sync.get(null, function(response) {
    // mouseMoveColor = response.mouseMoveColor;
    console.log(response);
    mouseMoveColor = response.mouseRgba;
    mouseMoveSize = parseInt(response.mouseMoveSize, 10);
    mouseMoveBorderColor = response.mouseMoveBorderColor;
    mouseMoveBorderSize = parseInt(response.mouseMoveBorderSize, 10);

    mouseDownColor = response.mouseDownColor;
    mouseDownSize = parseInt(response.mouseDownSize, 10);
    mouseDownBorderColor = response.mouseDownBorderColor;
    mouseDownBorderSize = parseInt(response.mouseDownBorderSize, 10);


    mouseMoveHighlight.css({
         'display': 'block',
         'z-index': '99999999',
         "pointer-events": 'none',
         "position": "fixed",
        //  "opacity": mouseMoveAlpha,
         "transition": "opacity 0.2s",
         "border-radius": "50%",
         "width": mouseMoveSize+'px',
         "height": mouseMoveSize+'px',
         "border":"none",
         "background-color": mouseMoveColor
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


    mouseDownHighlight.css({
         'display': 'block',
         'z-index': '99999999',
         "pointer-events": 'none',
         "position": "fixed",
         "opacity": "0.5",
         "transition": "opacity 0.2s",
         "border-radius": "50%",
         "width": mouseDownSize+'px',
         "height": mouseDownSize+'px',
         "border":"none",
         "background-color": "#" + mouseDownColor
     });
  });

	mouseDownHighlight.css({
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
//  $(window).mouseup(mouseUp);
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
