/**
 * Check the data is empty
 * @param data
 * @returns true, if data is empty, false, if data is not empty
 */
function isEmpty(data){
    if(typeof data === 'undefined' || data === '' || data === null){
        return true;
    }
    return false;
}

/**
 * This function check a text and decide that the
 * text's length is between the minimum and maximum length
 * @param text the text, what the funtion checks
 * @param min minimum length
 * @param max maximum length
 * @returns {Boolean} true, if the text's length larger or equals the mimumum length
 * and shorter or equals the maximum length
 */
function textLengthBetween(text, min, max){
    if(isEmpty(text)){
        return false;
    }
    if(text.length >= min && text.length <= max){
        return true;
    }
    return false;
}

/**
 * This function search a parameter in GET parameters, and returns
 * an array with all values which is the parametes's value
 * For example URL contains x=1&x=2, then the result array will contain
 * the 1 and the 2
 * @param paramName the name of the get parameter
 * @returns the result array, if the parameter is not exist, an empty array
 */
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

/**
 * Replace all characters in a text, which matched another character
 * @param text what we check
 * @param from replacing text
 * @param to purpose text
 * @returns if the text is not empty, the replaced text with trim, else an empty text
 */
function replaceAll(text, from, to){
    if(!isEmpty(text)){
        var re = new RegExp(from, 'g');
        return decodeURIComponent(text.replace(re, to).trim());
    } else {
        return '';
    }
}