
function placeDefaultCookies() {
	if(isEmpty(readCookie('currentUser'))) { createCookie('currentUser', 'anonymous', 30); }
	if(isEmpty(readCookie('maxFacets'))) { createCookie('maxFacets', 10, 30); }
	if(isEmpty(readCookie('minClassifyDoc'))) { createCookie('minClassifyDoc', 10, 30); }
	if(isEmpty(readCookie('items'))) { createCookie('items', 10, 30); }
	if(isEmpty(readCookie('nodeLimit'))) { createCookie('nodeLimit', [1,5,3,3], 30); }
	if(isEmpty(readCookie('viewType'))) { createCookie('viewType', 'documentList', 30); }
	if(isEmpty(readCookie('labelPrediction'))) { createCookie('labelPrediction', 1, 30); }
	if(isEmpty(readCookie('userLabels'))) { createCookie('userLabels', [], 30); }
	if(isEmpty(readCookie('css'))) { createCookie('css', 'firstswim', 30); }
}	

// var BASE_URL = 'http://localhost:8080/';
// var BASE_URL = 'http://platform.fusepool.info/';
var BASE_URL = '/';

var CONSTANTS = {
    SEARCH_URL: BASE_URL + 'ecs/',
    ENTITY_SEARCH_URL: BASE_URL + 'firstswim/entitysearch/',
    ENTITY_DETAILS_URL: BASE_URL + 'firstswim/entitydetails/',
    DETAILS_URL: BASE_URL + 'ecs/meta',
    GET_PREDICATES_URL: BASE_URL + 'firstswim/getpredicates',
    CLASSIFY_URL: BASE_URL + 'kmxrdfproxy/ranking/',
    LANDSCAPE_URL: BASE_URL + 'kmxrdfproxy/landscape/',
    ANNOTATION_URL: BASE_URL + 'annostore/',
    GET_LABELS_URL: BASE_URL + 'firstswim/getlabels/',
    GET_USER_LABELS_URL: BASE_URL + 'firstswim/getuserlabels/',
    OPEN_DOC_URL: BASE_URL + 'ecs/meta',
    ADDRESS_URL: BASE_URL + 'ecs/meta',
	SELFREG_URL: BASE_URL + 'selfregistration/',
	CURRENTUSER_URL: BASE_URL + 'selfregistration/currentUser',
	SIGNIN_URL: BASE_URL + 'firstswim/authUser/',
    AUTOSUGGEST_URL: BASE_URL + 'solr/default/suggester/sbsuggest?df=id&wt=json',
    DETAILS_SUBJECT_URL: 'http://fusepool.info/id/',
    FUSEPOOL_MAIN_URL: 'http://www.fusepool.eu',

    // CLIPBOARD_COPY_PATH: '../../../../../META-INF/resources/firstswim/javascript/zeroclipboard/ZeroClipboard.swf', 
    // TEMPLATES_URL: '../../../../../META-INF/resources/firstswim/templates/templates.html',
    // VISUALIZER_URL: '../../../../../META-INF/resources/firstswim/templates/visualizer.html',
    // IMG_PATH: '../../../../../META-INF/resources/firstswim/images/',
    // STYLE_PATH: '../../../../../META-INF/resources/firstswim/styles/'
    CLIPBOARD_COPY_PATH: 'firstswim/javascript/zeroclipboard/ZeroClipboard.swf',
    TEMPLATES_URL: BASE_URL + 'firstswim/templates/templates.html',
    VISUALIZER_URL: BASE_URL + 'firstswim/templates/visualizer.html',
    IMG_PATH: BASE_URL + 'firstswim/images/',
    STYLE_PATH: BASE_URL + 'firstswim/styles/'
};

/**
 * This function queries the platform for the current, logged in user
 * and sets the currentUser cookie value.
 * @method setCurrentUser
 */
function setCurrentUser() {
	var request = new enyo.Ajax({
		method: 'GET',
		url: CONSTANTS.CURRENTUSER_URL,
		handleAs: 'text',
		headers: { Accept: 'text/plain', 'Content-Type' : 'text/turtle'},
		postBody: null,
		published: { timeout: 60000 }
	});
	request.go();
	request.response(this, function(inSender, inResponse) {
		createCookie('currentUser', inResponse, 30);
	});
}

/**
 * This function creates a cookie using the parameter values.
 * @method createCookie
 * @param {String} name name of the cookie
 * @param {String} value cookie value
 * @param {Number} days days until expiration
 */
function createCookie(name, value, days) {
	$.cookie(name, value, { expires: days });
}

/**
 * This function returns a cookie.
 * @method readCookie
 * @param {String} name name of the cookie
 * @return {String} cookie value
 */
function readCookie(name) {
    return $.cookie(name);
}

/**
 * This function deletes a cookie.
 * @method eraseCookie
 * @param {String} name name of the cookie
 */
function eraseCookie(name) {
    $.removeCookie(name);
}

/**
 * Checks whether the data is empty or not.
 * @method isEmpty
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
 * This function formats the given string and clears the html tags
 * that could cause trouble on the GUI. It is using jquery-clean jQuery plug-in.
 * @method removeTags
 * @param {String} string to be cleaned
 * @return {String} clean string
*/
function removeTags(str) {
	var tagWhiteList = ["b", "big", "i", "small", "tt", "abbr", "acronym", "cite", "code", "dfn", "em", "kbd", "strong", "samp", "var", "bdo", "br", "q", "span", "sub", "sup", "label"];
	return $.htmlClean(str, {format: true, allowedTags: tagWhiteList });
}

/**
 * This function checks whether the length of a given text is between
 * a minimum and a maximum value.
 * @method textLengthBetween
 * @param {String} text the text to checks
 * @param {Number} min minimum length
 * @param {Number} max maximum length
 * @return {Boolean} true, if the text's length is greater or equals the minimum length
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
 * This function gets a parameter name and returns an array that contain every
 * value that can be found in the GET variables under this parameter name.
 * For example when the URL contains x=1&x=2, the result array will be [1,2].
 * @method GetURLParameter
 * @param {String} paramName the name of the GET parameter
 * @return {Array} the result array (empty if the parameter does not exist)
 */
function GetURLParameter(paramName){
    var result = [];
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++){
        var parameterName = sURLVariables[i].split('=');
        if (parameterName[0] === paramName){
            result.push(decodeURIComponent(parameterName[1]));
        }
    }
    return result;
}

/**
 * This function replaces every occurences of a string with another string.
 * @method replaceAll
 * @param {String} text text that the function checks
 * @param {String} from text to be replaced
 * @param {String} to text to replace with
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
 * This function replaces every occurences of a string with another string 
 * between 'startTag' and 'endTag'.
 * @method replaceAllInTags
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
 * Delete speech marks (") from the first and last character of a text.
 * @method deleteSpeechMarks
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
 * This functions returns a property's value from an rdf object using RDFStore.
 * @method getRDFPropertyValue
 * @param {Object} rdf the rdf object
 * @param {String} propertyName the name of the property
 * @return {String} the property's value
 */
function getRDFPropertyValue(rdf, propertyName){
    var result = '';
    var query = 'SELECT * { ?s <' + propertyName + '> ?o }';
    rdf.execute(query, function(success, results) {
        if (success && results.length > 0) {
            result = results[0].o.value;
        }
    });
    return result;
}

/**
 * This function gets an rdf object, an existing subject and an exclude array 
 * and gives back a value from a random property that has been found in the rdf
 * connected to the given subject and does not exist in the exclude array.
 * @method getAPropertyValue
 * @param {Object} rdf the rdf object
 * @param {String} subject URI of the subject
 * @param {Array} exclude array of properties to exclude
 * @return {String} the value of a found property 
 */
function getAPropertyValue(rdf, subject, exclude) {
	var prop = '';
	var query = 'SELECT * { <'+subject+'> ?p ?o }';
	rdf.execute(query, function(success, results) {
		if (success && results.length > 0) {
			for(var i=0;i < results.length;i++) {
				if($.inArray(results[i].p.value, exclude)==-1) {
					prop = results[i].o.value;
					break;
				}
			}
		}
	});
	return prop;
}

/**
 * This function places an annotation in the Annostore.
 * @method sendAnnotation
 * @param {String} annotationString body of the annotation
 */
function sendAnnotation(annotationString) {
	
	var request = new enyo.Ajax({
		method: 'POST',
		url: CONSTANTS.ANNOTATION_URL,
		handleAs: 'text',
		headers: { Accept : 'application/rdf+xml', 'Content-Type' : 'text/turtle'},
		postBody: annotationString,
		published: { timeout: 60000 }
	});
	request.go();
	request.error(this, function(){
		// console.log("error");
	});
	request.response(this, function(inSender, inResponse) {
		// console.log("success: "+inResponse);
	});
}

/**
 * This function cuts the given string at the given length
 * if the string is longer than this length, adds an ellipsis 
 * character to the end, then returns the new string.
 * @method cutStr
 * @param {String} str the string
 * @param {Number} val cutting length
 */
function cutStr(str, val) {
	if(str.length > val) {
		str = str.substring(0,val);
		var lastSpace = str.lastIndexOf(" ");
		if (lastSpace > 0){
			str = str.substring(0,lastSpace+1);	
		}
		str = str+'…';
	}
	return str;
}

/**
 * This function queries the server for the user's own labels
 * and places them in a cookie.
 * @method getUserLabels
 * @param {String} userName username
 */
function getUserLabels(userName) {
	var request = new enyo.Ajax({
		method: 'GET',
		url: CONSTANTS.GET_USER_LABELS_URL+'?user='+userName,
		handleAs: 'text',
		headers: { Accept : 'application/json', 'Content-Type' : 'application/x-www-form-urlencoded' },
		published: { timeout: 60000 }
	});
	request.go();	
	request.response(this, function(inSender, inResponse) {
		var obj = JSON.parse(inResponse);
		createCookie('userLabels', obj.userLabels, 30);
	});
}

