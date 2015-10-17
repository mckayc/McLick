var toggle = false;

chrome.browserAction.onClicked.addListener(function(tab) {
  toggle = !toggle;
  if(toggle){
    chrome.browserAction.setIcon({path: "icon-on.png", tabId:tab.id});
    chrome.tabs.executeScript(tab.id, {code:"ext_on()"});
  }
  else{
    chrome.browserAction.setIcon({path: "icon-off.png", tabId:tab.id});
    chrome.tabs.executeScript(tab.id, {code:"ext_off()"});
  }
});