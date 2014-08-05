/**
 * Firstswim mobile &amp; desktop application - to making it easy to browse data stored in the Fusepool platform.
 * @module Firstswim
 * @author Ádám Nagy
 * @author Luca Szabó
 */

var appPackage = 'desktop/package.js';
var mobileRegex = new RegExp(/Android|webOS|hpwOS|iPhone|iPad|iPod|BlackBerry/i);
if(mobileRegex.test(navigator.platform) || mobileRegex.test(navigator.userAgent)){
    appPackage = 'mobile/package.js';
}

enyo.depends(
    'utils/package.js',
    'common/package.js',
    appPackage
);