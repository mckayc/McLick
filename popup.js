$('body').append("<div id='ext-mouse-cursor'></div>");


function mouse_move(e){
    var elem = $("#ext-mouse-cursor");

    chrome.storage.sync.get(null, function(response) {
     elem.css({
          'display': 'block',
          'z-index': '99999999',
          "pointer-events": 'none',
          "position": "fixed",
          "opacity": "0.5",
          "left": e.x-(response.circle_border_size/2),
          "top": e.y-(response.circle_border_size/2),
          //"border": "7px solid #29aae1",
          "border-radius": "50%",
          "width": response.circle_size+'px',
          "height": response.circle_size+'px',
          "border": (response.circle_border_size*2)+'px solid #29aae1',
          "background": response.favoriteColor
      });
    });
}


//width: 50px;
//height: 50px;
//border-radius: 50%;


//transition: opacity 0.2s;
//border: 7px solid #29aae1;
//background-color: transparent;






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
