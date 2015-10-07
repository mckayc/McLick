var clicks = 0;
document.addEventListener('click', getClickPosition, false);
       function getClickPosition(e) {
                  //reload the page if clicks are greater than 1
       		if(clicks>0){
          		window.location.reload()
                  //get mouse coordinates and print them to the screen
       		}else {
       			var xPosition = e.clientX;
       			var yPosition = e.clientY;
       			alert('X : ' + String(xPosition) + '  Y : ' + String(yPosition));
       			clicks +=1;
       }

       };
