/*
 * CooCooCookies
 * https://github.com/xadet/CooCooCookies
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 *
 * Includes jsuri.js
 * https://code.google.com/p/jsuri/
 *
 * Copyright 2012 Jack Wakefield
 * Released under the MIT license
 */

// create an array of hosts from the cookie elements
// to ensure unneeded onCompleted events are not fired
// for the hosts we are not monitoring
var urlFilter = [];

for (var host in cookieEntries) {
	urlFilter.push({
		hostSuffix: host
	});
}

// execute a script on the specified tab to simulate
// a click the first element found to be matching the given path
function clickElement(tabId, element) {
	chrome.tabs.executeScript(tabId, {
		allFrames: true,
		code: "" +
		"var matchingElements = Sizzle('" + element + "');" +
		"if (matchingElements.length > 0) {" +
		"	var element = matchingElements[0];" +
		"	element.click();" +
		"}"
	});
}

// execute a script on the specified tab to remove
// the first element found to be matching the given path
function removeElement(tabId, element) {
	chrome.tabs.executeScript(tabId, {
		allFrames: true,
		code: "" +
		"var matchingElements = Sizzle('" + element + "');" +
		"if (matchingElements.length > 0) {" +
		"	var element = matchingElements[0];" +
		" 	if (typeof element.parentNode !== 'undefined') {" +
		"		element.parentNode.removeChild(element);" +
		" 	}" +
		"}"
	});
}

chrome.webNavigation.onCompleted.addListener(function(details) {
	var uri = new Uri(details.url);
	var host = uri.host();

	// strip out the www. subdomain if it's present
	// would be preferable to strip out any possible subdomain
	// but it's tricky to do
	if (host.indexOf("www.") == 0) {
		host = host.substring(4);
	}

	// ensure the determined host exists in the entries array
	// perhaps the url passed the filter but the host we determined
	// is incorrect, most likely due to a subdomain
	if (host in cookieEntries) {
		var tabId = details.tabId;

		var cookieEntry = cookieEntries[host];
		var element = cookieEntry.element;
		var action = typeof cookieEntry.action !== "undefined" ? cookieEntry.action : "click";
		var delay = typeof cookieEntry.delay !== "undefined" ? cookieEntry.delay : false;

		// inject the sizzle.js script into the page
		// once the script has loaded, determine which action
		// to take
		chrome.tabs.executeScript(tabId, {
			allFrames: true,
			file: "sizzle.js"
		}, function() {
			if (action == "click") { // simulate a click on the element
				if (!delay) {
					// immediately click the element no delay has been specified
					clickElement(tabId, element);
				} else {
					// click the element after the specified amount of milliseconds have passed
					setTimeout(function() {
						clickElement(tabId, element);
					}, delay);
				}
			} else if (action == "remove") { // remove the element from the parent
				if (!delay) {
					// immediately remove the element as no delay has been specified
					removeElement(tabId, element);
				} else {
					// remove the element after the specified amount of milliseconds have passed
					setTimeout(function() {
						removeElement(tabId, element);
					}, delay);
				}
			}
		});
	}
}, {
	url: urlFilter
});