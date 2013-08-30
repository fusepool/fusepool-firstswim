var GLOBAL= {
    maxFacets: 100,
    items: 20
};

var BASE_URL = 'http://beta.fusepool.com/';
var CONSTANTS = {
    SEARCH_URL: BASE_URL + 'ecs/',
    DETAILS_URL: BASE_URL + 'ecs/meta',
    CLASSIFY_URL: BASE_URL + 'kmxrdfproxy/ranking/',
    OPEN_DOC_URL: BASE_URL + 'ecs/meta',
    ADDRESS_URL: BASE_URL + 'ecs/meta',
    AUTOSUGGEST_URL: BASE_URL + 'solr/default/suggester/sbsuggest?df=id&wt=json',
    DETAILS_SUBJECT_URL: 'http://fusepool.info/id/',
    FUSEPOOL_MAIN_URL: 'http://www.fusepool.com',
    TEMPLATES_URL: BASE_URL + 'firstswim/templates/templates.html'
//    TEMPLATES_URL: '../../../../../META-INF/resources/firstswim/templates/templates.html'
};

/**
 * Check the data is empty
 * @param {Object} data the data what the function checks
 * @return {Boolean} true, if data is empty, false, if data is not empty
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
 * @param {String} text the text, what the funtion checks
 * @param {Number} min minimum length
 * @param {Number} max maximum length
 * @return {Boolean} true, if the text's length larger or equals the mimumum length
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
 * @param {String} paramName the name of the get parameter
 * @return {Array} the result array, if the parameter is not exist, an empty array
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
 * @param {String} text what the function checks
 * @param {String} from replacing text
 * @param {String} to purpose text
 * @param {Boolean} decodeURI decode URI or not
 * @return {String} if the text is not empty, the replaced text with trim, else an empty text
 */
function replaceAll(text, from, to, decodeURI){
    if(!isEmpty(text)){
        var re = new RegExp(from, 'g');
        var replacedText = text.replace(re, to).trim();
        if(!isEmpty(decodeURI) && decodeURI){
            return decodeURIComponent(replacedText);
        }
        return replacedText;
    } else {
        return '';
    }
}

/**
 * Replace all characters in a text, which matched another character and the position is
 * between in the startTag and endTag.
 * @param {String} text what the function checks
 * @param {String} fromText replacing text
 * @param {String} toText purpose text
 * @param {String} startTag the start character of the replacing
 * @param {String} endTag the end character of replacing
 * @return {String} if the text is not empty, the replaced text with trim, else an empty text
 */
function replaceAllInTags(text, fromText, toText, startTag, endTag){
    var resultText = '';
    if(!isEmpty(text)){
        var startIndex;
        if(!isEmpty(startTag)){
            startIndex = text.indexOf(startTag);
        } else {
            startIndex = 0;
        }
        var endIndex;
        if(!isEmpty(endTag)){
            endIndex = text.lastIndexOf(endTag);
        } else {
            endIndex = text.length;
        }
        for(var i=0;i<text.length;i++){
            if(startIndex < i && i < endIndex && text[i] === fromText){
                resultText += toText;
            } else {
                resultText += text[i];
            }
        }
        return resultText;
    } else {
        return '';
    }
}

/**
 * Delete speech marks (") form the first and last character of text
 * @param {String} text the text what the function check
 * @return {String} the string without " characters
 */
function deleteSpeechMarks(text){
    var result = text;
    if(result.charAt(0) === '"'){
        result = result.substr(1);
    }
    if(result.charAt(result.length-1) === '"'){
        result = result.substr(0, result.length-1);
    }
    return result;
}

/**
 * Stub which helps debugging of code in console.
 */

var _log = console.log;
console.log = function () {
    this._last = [].slice.call(arguments);
    _log.apply(console, arguments);
};

console.last = function() {
    return this._last;
};
