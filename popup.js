$('body').append("<div id='ext-mouse-cursor'></div>");


function mouse_move(e){
    var elem = $("#ext-mouse-cursor");
    
    chrome.storage.sync.get(null, function(response) {
     elem.css({
          'display': 'block',
          'z-index': '99999',
          "pointer-events": 'none',
          "position": "fixed",
          "left": e.x-(response.circle_size/2),
          "top": e.y-(response.circle_size/2),
          "border": "1px black solid",
          "width": response.circle_size+'px',
          "height": response.circle_size+'px',
          "border-radius": (response.circle_size*2)+'px',
          "background": response.favoriteColor
      });
    });
}


function ext_on(){
  console.log("On");
  window.addEventListener('mousemove',mouse_move, false);
}

function ext_off(){
  console.log("Off");
  window.removeEventListener("mousemove", mouse_move, false);
  var elem = $("#ext-mouse-cursor").css({
    'display': 'None'
  });
  
}