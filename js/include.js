document.addEventListener('DOMContentLoaded', function () {
    // check if we're running via file://
    if (window.location.protocol === 'file:') {
        console.error('Cannot load components when running via file://. Please use a local server.');
        return;
    }
    includeHTML('header', 'components/header.html');
    includeHTML('footer', 'components/footer.html');
});

function includeHTML(elementId, filePath) {
    fetch(filePath)
        .then(response => response.text())
        .then(data => {
            document.getElementById(elementId).innerHTML = data;
        })
        .catch(error => console.error('Error loading ' + filePath, error));
}