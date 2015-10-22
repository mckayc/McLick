$('body').append("<div id='ext-mouse-cursor'></div>");

var follower = $("#ext-mouse-cursor");

var circleSize = 0;
var circleBorderSize = 0;
var favoriteColor = '000000';
var mouseDownColor = '000000';

function mouseMove(e){
  var x = e.clientX-follower.outerWidth()/2;
  var y = e.clientY-follower.outerHeight()/2;

  chrome.storage.sync.get(null, function(response) {
    circleSize = parseInt(response.circleSize, 10);
    circleBorderSize = parseInt(response.circleBorderSize, 10);
    favoriteColor = response.favoriteColor;
    mouseDownColor = response.mouseDownColor;


    follower.css({
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

	follower.css({
			'top':y,
			'left':x,
		});
}



function mouseDown(e){
  var offset = follower.offset();
  offset.top = offset.top - (circleBorderSize/2);
  offset.left = offset.left - (circleBorderSize/2);
  follower.offset(offset);

  follower.css({
    'opacity':'1',
    "background-color": "transparent",
    "border": circleBorderSize + 'px solid #29aae1',
  });
}



function mouseUp(e){
  var offset = follower.offset();
  offset.top = offset.top + (circleBorderSize/2);
  offset.left = offset.left + (circleBorderSize/2);
  follower.offset(offset);

  follower.css({

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
  var follower = $("#ext-mouse-cursor").css({
    'display': 'none'
  });

}
