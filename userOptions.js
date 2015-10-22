// Saves options to chrome.storage
function save_options() {
    var color = document.getElementById('color').value;
    var mouseDownColor = document.getElementById('mouseDownColor').value;


    var circleSize = document.getElementById('circle_size').value;
    var circleBorderSize = document.getElementById('circle_border_size').value;

    chrome.storage.sync.set({
        favoriteColor: color,
        mouseDownColor: mouseDownColor,
        circleSize: circleSize,
        circleBorderSize: circleBorderSize
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
        favoriteColor: 'none',
        mouseDownColor: 'none',
        circleSize: '20',
        circleBorderSize: '5'
    }, function(items) {
        document.getElementById('color').value = items.favoriteColor;
        document.getElementById('mouseDownColor').value = items.mouseDownColor;
        document.getElementById('circle_size').value = items.circleSize;
        document.getElementById('circle_border_size').value = items.circleBorderSize;
    });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);
