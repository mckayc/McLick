$('body').append("<div id='ext-mouse-cursor'></div>");

var follower = $("#ext-mouse-cursor");

function mouseMove(e){
    var x = e.clientX-follower.outerWidth()/2;
    var y = e.clientY-follower.outerHeight()/2;


    	follower.css({
    			'top':y,
    			'left':x,
    		});

    chrome.storage.sync.get(null, function(response) {
     follower.css({
          'display': 'block',
          'z-index': '99999999',
          "pointer-events": 'none',
          "position": "fixed",
          "opacity": "0.5",
          "transition": "opacity 0.2s",
          "border-radius": "50%",
          "width": response.circle_size+'px',
          "height": response.circle_size+'px',
          "background": "#" + response.favoriteColor
      });

      function mouseDown(e){
        follower.css({
          'opacity':1,
          "background-color": "transparent",
          "border": response.circle_border_size + 'px solid #29aae1'
        })
      }

  //  The extension runs to a crawl and dies when bollow code is live.

  //    function mouseUp(e){
  //      follower.css({
  //        'opacity':0.5,
  //        'border-color':'#29aae1',
  //      });
  //    }


      $(window).mousedown(mouseDown);
      $(window).mouseup(mouseUp);
      $(window).mousemove(mouseMove);


    });
}


function ext_on(){
  console.log("On");
  window.addEventListener('mousemove',mouseMove, false);
}

function ext_off(){
  console.log("Off");
  window.removeEventListener("mousemove", mouseMove, false);
  var follower = $("#ext-mouse-cursor").css({
    'display': 'None'
  });

}
