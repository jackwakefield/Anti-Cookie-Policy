/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, undef:true, unused:true, curly:true, browser:true, devel:true, indent:4, maxerr:50, white:false */
/*global chrome, Uri */
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
 * Includes json3.js
 * http://bestiejs.github.com/json3/
 *
 * Copyright 2013 Jack Wakefield
 * Released under the MIT license
 */
(function () {
    "use strict";

    // a list of generic subdomains to strip from hosts
    var genericSubdomains = [ "www.", "www1." ],
        cookieEntries = {},
        xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
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

    /**
     * Creates a  url filter of hosts from the cookie elements to ensure unneeded events are not
     * fired for the hosts not being monitored..
     * @param  {string triggerType The trigger type, either loaded or ready.
     * @return {array} The URL filter array.
     */
    function createUrlFilter(triggerType) {
        var urlFilter = [];

        for (var host in cookieEntries) {
            if (cookieEntries.hasOwnProperty(host)) {
                var cookieEntry = cookieEntries[host];
                var trigger = typeof cookieEntry.trigger !== "undefined" ? cookieEntry.trigger
                    : "ready";

                if (trigger === triggerType) {
                    urlFilter.push({
                        hostSuffix: host
                    });
                }
            }
        }

        return urlFilter;
    }

    /**
     * Executes a script on the specified tab to simulate a click the first element found to be
     * matching the given path.
     * @param {int} tabId The tab ID on which to execute the script.
     * @param {string} element The element path to execute the click even upon.
     */
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

    /**
     * Executes a script on the specified tab to remove the first element found to be matching the
     * given path.
     * @param {int} tabId The tab ID on which to execute the script.
     * @param {string} element The path of the element to remove.
     */
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

    /**
     * Executes the relevant on the specified element using the given options.
     * @param {int} tabId The tab ID on which to execute the event.
     * @param {string} element The element path on which to execute the event.
     * @param {string} action The action type, either click or remove.
     * @param {int} delay An optional delay in milliseconds.
     */
    function handleElement(tabId, element, action, delay) {
        var actionCallback = null;

        if (action === "click") { // simulate a click on the element
            actionCallback = clickElement;
        } else if (action === "remove") { // remove the element from the parent
            actionCallback = removeElement;
        }

        if (!delay) {
            actionCallback(tabId, element);
        } else {
            setTimeout(function() {
                actionCallback(tabId, element);
            }, delay);
        }
    }

    /**
     * Handles the given window event.
     * @param {object} details The event details.
     */
    function handleEvent(details) {
        var uri = new Uri(details.url);
        var host = uri.host();

        // strip out the lits of generic subdomains from the host
        for (var i = 0; i < genericSubdomains.length; i++) {
            var subdomain = genericSubdomains[i];

            if (host.indexOf(subdomain) === 0) {
                host = host.substring(subdomain.length);
            }
        }

        // ensure the determined host exists in the entries array
        // perhaps the url passed the filter but the host determined
        // is incorrect, most likely due to a subdomain that hasn't
        // been stripped out
        if (cookieEntries.hasOwnProperty(host)) {
            var tabId = details.tabId;
            var entry = cookieEntries[host];

            // inject the sizzle.js script into the page
            // once the script has loaded, determine which action
            // to take
            chrome.tabs.executeScript(tabId, {
                allFrames: true,
                file: "libs/sizzle.js"
            }, function() {
                // create the :visible Sizzle selector
                chrome.tabs.executeScript(tabId, {
                    allFrames: true,
                    code: "" +
                    "Sizzle.selectors.pseudos.visible =" +
                    "    Sizzle.selectors.createPseudo(function(selector) {" +
                    "    var matcher = Sizzle.compile(selector);" +
                    "    return function(elem) {" +
                    "        return elem.style.display != \"none\";" +
                    "    };" +
                    "});"
                });

                var cookieEntry;

                // add the entry to a new array if it isn't one
                if (!(entry instanceof Array)) {
                    cookieEntry = entry;
                    entry = [cookieEntry];
                }

                // loop through each cookie entry
                for (var index in entry) {
                    if (entry.hasOwnProperty(index)) {
                        cookieEntry = entry[index];

                        var element = cookieEntry.element;
                        var action = typeof cookieEntry.action !== "undefined" ?
                            cookieEntry.action : "click";
                        var delay = typeof cookieEntry.delay !== "undefined" ?
                            cookieEntry.delay : false;

                        handleElement(tabId, element, action, delay);
                    }
                }
            });
        }
    }

    /**
     * Add the listener callbacks for the required events.
     */
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
})();
