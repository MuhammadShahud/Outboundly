const button = document.querySelector('.large-button');
button.addEventListener('click', requestPermission);

function requestPermission() {
	chrome.permissions.request({
		origins: ['*://*.linkedin.com/*']
	}, function (granted) {
		// The callback argument will be true if the user granted the permissions.
		if (granted) {
			alert('Permission granted');
			console.log("Permission granted");
		} else {
			alert('Permission denied');
			console.log("Permission not granted");
		}
	});
}