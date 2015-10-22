// Saves options to chrome.storage
function save_options() {
    var mouseMoveColor = document.getElementById('mouseMoveColor').value;
    var mouseDownColor = document.getElementById('mouseDownColor').value;

    var mouseMoveBorderColor = document.getElementById('mouseMoveBorderColor').value;


    var mouseMoveSize = document.getElementById('mouseMoveSize').value;
    var mouseDownSize = document.getElementById('mouseDownSize').value;

    var mouseMoveBorderSize = document.getElementById('mouseMoveBorderSize').value;

    chrome.storage.sync.set({
        mouseMoveColor: mouseMoveColor,
        mouseDownColor: mouseDownColor,
        mouseMoveBorderColor: mouseMoveBorderColor,
        mouseMoveSize: mouseMoveSize,
        mouseDownSize: mouseDownSize,
        mouseMoveBorderSize: mouseMoveBorderSize
    }, function() {
        // Update status to let user know options were saved.
        var status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(function() {
            status.textContent = '';
        }, 750); window.close("userOptions.html");
    });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
    // Use default value color = 'red' and likesColor = true.
    chrome.storage.sync.get({
        mouseMoveColor: 'none',
        mouseDownColor: 'none',

        mouseMoveBorderColor: 'none',

        mouseMoveSize: '20',
        mouseDownSize: '20',
        mouseMoveBorderSize: '5'
    }, function(items) {
        document.getElementById('mouseMoveColor').value = items.mouseMoveColor;
        document.getElementById('mouseDownColor').value = items.mouseDownColor;

        document.getElementById('mouseMoveBorderColor').value = items.mouseMoveBorderColor;




        document.getElementById('circle_size').value = items.mouseMoveSize;
        document.getElementById('mouseDownSize').value = items.mouseDownSize;
        document.getElementById('mouseMoveBorderSize').value = items.mouseMoveBorderSize;
    });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);
