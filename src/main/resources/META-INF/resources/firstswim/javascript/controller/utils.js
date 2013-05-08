/**
 * Check the data is empty
 * @param data
 * @returns true, if data is empty, false, if data is not empty
 */
function isEmpty(data){
    if(typeof data == 'undefined' || data == '' || data == null){
        return true;
    }
    return false;
}


function textLengthBetween(text, min, max){
    if(isEmpty(text)){
        return false;
    }
    if(text.length >= min && text.length <= max){
        return true;
    }
    return false;
}

function GetURLParameter(paramName){
    var result = [];
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++){
        var paramNameeterName = sURLVariables[i].split('=');
        if (paramNameeterName[0] === paramName){
            result.push(decodeURIComponent(paramNameeterName[1]));
        }
    }
    return result;
}

function replaceSpacesToUnderline(text){
    return text.replace(/ /g,'_');
}