var appPackage = 'desktop/package.js';
var mobileRegex = new RegExp(/Android|webOS|iPhone|iPad|iPod|BlackBerry/i);
if(mobileRegex.test(navigator.platform) || mobileRegex.test(navigator.userAgent)){
    appPackage = 'mobile/package.js';
}

enyo.depends(
    'utils/package.js',
    'common/package.js',
    appPackage
);