/*
	Main QuickByte button
	Switches to tabbed view from splashscreen
	and calls upon yelpAPI.js to get some restaurants
*/

function clearInputErrors() {
	$("input").removeClass("error");
	$("span.error-msg").hide();
}

function showInputErrors($inputWrapper, errorMsg) {
	$inputWrapper.find("input").addClass("error");
	$inputWrapper.find("span.error-msg").html(errorMsg).show();
}
