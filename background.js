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

// a list of generic subdomains to strip from hosts
var genericSubdomains = [ "www.", "www1." ];
var cookieEntries = {};

var xhr = new XMLHttpRequest();

xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
        cookieEntries = JSON.parse(xhr.responseText);
        addListeners();
    }
};

xhr.open("GET", chrome.extension.getURL("/entries.json"), false);

try {
    xhr.send();
} catch(e) {
    console.error("Unable to load entries.json");
}

// populate the url filter array of hosts from the cookie elements
// to ensure unneeded onCompleted events are not fired
// for the hosts we are not monitoring
function createUrlFilter(triggerType) {
    var urlFilter = [];

    for (var host in cookieEntries) {
        var cookieEntry = cookieEntries[host];
        var trigger = typeof cookieEntry.trigger !== "undefined" ? cookieEntry.trigger : "ready";

        if (trigger == triggerType) {
            urlFilter.push({
                hostSuffix: host
            });
        }
    }

    return urlFilter;
}

// execute a script on the specified tab to simulate
// a click the first element found to be matching the given path
function clickElement(tabId, element) {
    chrome.tabs.executeScript(tabId, {
        allFrames: true,
        code: "" +
        "var matchingElements = Sizzle('" + element + "');" +
        "if (matchingElements.length > 0) {" +
        "   var element = matchingElements[0];" +
        "   element.click();" +
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
        "   var element = matchingElements[0];" +
        "   if (typeof element.parentNode !== 'undefined') {" +
        "       element.parentNode.removeChild(element);" +
        "   }" +
        "}"
    });
}

function handleEvent(details) {
    var uri = new Uri(details.url);
    var host = uri.host();

    // strip out the lits of generic subdomains from the host
    for (var i = 0; i < genericSubdomains.length; i++) {
        var subdomain = genericSubdomains[i];

        if (host.indexOf(subdomain) == 0) {
            host = host.substring(subdomain.length);
        }
    }

    // ensure the determined host exists in the entries array
    // perhaps the url passed the filter but the host determined
    // is incorrect, most likely due to a subdomain that hasn't
    // been stripped out
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
            file: "libs/sizzle.js"
        }, function() {
            if (action == "click") { // simulate a click on the element
                if (!delay) {
                    // immediately click the element as no delay has been specified
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
}

function addListeners() {
    chrome.webNavigation.onDOMContentLoaded.addListener(function(details) {
        handleEvent(details);
    }, {
        url: createUrlFilter("ready")
    });

    chrome.webNavigation.onCompleted.addListener(function(details) {
        handleEvent(details);
    }, {
        url: createUrlFilter("loaded")
    });
}
