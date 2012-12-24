/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, undef:true, unused:true, curly:true, browser:true, devel:true, indent:4, maxerr:50, white:false */
/*global $ */
$(function() {
    "use strict";

    var $domainInput = $('#domain-input');
    var $domainRow = $('#domain-row');

    $('#send-email').click(function() {
        var domain = $domainInput.val();
        $domainRow.removeClass('error');

        if (domain.trim().length === 0) {
            $domainRow.addClass('error');
        } else {
            window.open("mailto:coocoocookies.extension@gmail.com?subject=CooCooCookies%20Website%20Report&body=Domain:%20" + domain);
            window.close();
        }

        return false;
    });
});
