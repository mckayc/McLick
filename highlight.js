$('body').append("<div id='ext-mouse-cursor'></div>");

var mouseMoveHighlight = $("#ext-mouse-cursor");
var mouseDownHighlight = $("#ext-mouse-cursor");


var circleSize = 0;
var mouseDownSize = 0;
var circleBorderSize = 0;
var favoriteColor = '000000';
var mouseDownColor = '000000';



function mouseMove(e){
  var x = e.clientX-mouseMoveHighlight.outerWidth()/2;
  var y = e.clientY-mouseMoveHighlight.outerHeight()/2;

  chrome.storage.sync.get(null, function(response) {
    circleSize = parseInt(response.circleSize, 10);
    mouseDownSize = parseInt(response.mouseDownSize, 10);
    circleBorderSize = parseInt(response.circleBorderSize, 10);
    favoriteColor = response.favoriteColor;
    mouseDownColor = response.mouseDownColor;


    mouseMoveHighlight.css({
         'display': 'block',
         'z-index': '99999999',
         "pointer-events": 'none',
         "position": "fixed",
         "opacity": "0.5",
         "transition": "opacity 0.2s",
         "border-radius": "50%",
         "width": circleSize+'px',
         "height": circleSize+'px',
         "border":"none",
         "background-color": "#" + favoriteColor
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
    mouseDownSize = parseInt(response.mouseDownSize, 10);
    circleBorderSize = parseInt(response.circleBorderSize, 10);
    favoriteColor = response.favoriteColor;
    mouseDownColor = response.mouseDownColor;


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
//   var offset = mouseMoveHighlight.offset();
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



function mouseUp(e){
  var offset = mouseMoveHighlight.offset();
  offset.top = offset.top + (circleBorderSize/2);
  offset.left = offset.left + (circleBorderSize/2);
  mouseMoveHighlight.offset(offset);

  mouseMoveHighlight.css({

    "background-color": "#" + favoriteColor,
    "border": circleBorderSize + 'px solid #FF00D4',
  });
}

function ext_on() {
  console.log("On");
  $(window).mousedown(mouseDown);
  $(window).mouseup(mouseUp);
  $(window).mousemove(mouseMove);
}

function ext_off() {
  console.log("Off");
  $(window).unbind('mousedown',mouseDown);
  $(window).unbind('mouseup',mouseUp);
  $(window).unbind('mousemove',mouseMove);
  var mouseMoveHighlight = $("#ext-mouse-cursor").css({
    'display': 'none'
  });
  var mouseDownHighlight = $("#ext-mouse-cursor").css({
    'display': 'none'
  });

}
