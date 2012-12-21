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

// the list of website containing cookie notifications
// each entry must have an element name as well as an
// optional action of click (default) or remove and an
// optional delay in milliseconds
var cookieEntries = {
	"bbc.co.uk": {
		element: "#bbccookies-continue-button"
	},
	"uk.yahoo.com": {
		element: "#default-p_30345150 .y-wshade-close-btn",
		delay: 250
	},
	"guardian.co.uk": {
		element: "#header .identity-noticebar .hide-bar"
	},
	"uk.msn.com": {
		element: "#popup1 .tcls"
	},
	"tesco.com": {
		element: "#cpAccept"
	},
	"hsbc.co.uk": {
		element: "#disclaimer_banner",
		action: "remove"
	},
	"rightmove.co.uk": {
		element: "#cookiemodalbar-button-text"
	},
	"barclays.co.uk": {
		element: ".header .otm",
		action: "remove"
	},
	"natwest.com": {
		element: "#EUDirectiveCookiePanel",
		action: "remove"
	},
	"johnlewis.com": {
		element: "#opNoNo"
	},
	"bt.com": {
		element: "#cookieActions .lastButton"
	},
	"moneysavingexpert.com": {
		element: "#alertBar #close"
	},
	"aol.co.uk": {
		element: "#ooCont .closeBtn"
	},
	"royalmail.com": {
		element: "#block-cookie_policy-0:parent",
		action: "remove"
	},
	"gov.uk": {
		element: "#global-cookie-message",
		action: "remove"
	},
	"channel4.com": {
		element: ".cookie-policy-alert .hide-alert"
	},
	"orange.co.uk": {
		element: ".cookieButtonClose"
	},
	"premierleague.com": {
		element: "#cookies-verify",
		action: "remove"
	},
	"nationwide.co.uk": {
		element: "#cnClose"
	},
	"tfl.gov.uk": {
		element: ".cookies-prompt-btn"
	},
	"yell.com": {
		element: ".cookie-notification .close"
	},
	"pirateparty.org.uk": {
		element: "#confirmCookiePolicy center a"
	},
	"huffingtonpost.co.uk": {
		element: "#usrConsent .closeBtn"
	},
	"uk.affiliatewindow.com": {
		element: "#eprivacy button"
	},
	"reed.co.uk": {
		element: "#topWrapper .notification",
		action: "remove"
	},
	"betfair.com": {
		element: ".footer-cookies-policy",
		action: "remove"
	},
	"statcounter.com": {
		element: "#cookie-info",
		action: "remove"
	},
	"mirror.co.uk": {
		element: "#cookieNotification",
		action: "remove"
	},
	"uk.ign.com": {
		element: "#policyNotice .close-btn a"
	},
	"1and1.co.uk": {
		element: "#cookies-close"
	}
};
