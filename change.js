//Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function(tab) {
  console.log('Getting ' + tab.url + ' XY');
  chrome.tabs.executeScript(null,{file:'./content_script.js'});
});





