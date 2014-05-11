
var GLOBAL= {
	currentUser: 'anonymous',
	maxFacets: 10,
	items: 10,
	nodeLimit: [1,5,3],
	viewType: 'documentList',
	labelPrediction: true,
	userLabels: []
};

// var BASE_URL = 'http://localhost:8080/'; /* lokal, sajaton futo fp peldannyal */
// var BASE_URL = 'http://beta.fusepool.com/'; /* lokal, betas fp peldannyal */
var BASE_URL = '/'; /* commithoz */

var CONSTANTS = {
    SEARCH_URL: BASE_URL + 'ecs/',
    ENTITY_SEARCH_URL: BASE_URL + 'firstswim/entitysearch/',
    DETAILS_URL: BASE_URL + 'ecs/meta',
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
    // IMG_PATH: '../../../../../META-INF/resources/firstswim/images/'
    CLIPBOARD_COPY_PATH: 'firstswim/javascript/zeroclipboard/ZeroClipboard.swf',
    TEMPLATES_URL: BASE_URL + 'firstswim/templates/templates.html',
    VISUALIZER_URL: BASE_URL + 'firstswim/templates/visualizer.html',
    IMG_PATH: BASE_URL + 'firstswim/images/'
};

/**
* This function queries the platform for the current, logged in user
* and sets the currentUser GLOBAL variable
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
		GLOBAL.currentUser = inResponse;
	});
}

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
 * @param {String} text the text, what the function checks
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
        var parameterName = sURLVariables[i].split('=');
        if (parameterName[0] === paramName){
            result.push(decodeURIComponent(parameterName[1]));
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
 * This functions search a property's value in an rdf object with rdfstore.
 * @param {Object} rdf the rdf object
 * @param {String} propertyName the name of the property
 * @returns {String} the property's value
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
 * @param {Object} rdf the rdf object
 * @param {String} subject URI of the subject
 * @param {Array} exclude array of properties to exclude
 * @returns {String} the value of a found property 
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
 * This function gets an rdf object, an existing subject and returns
 * with all the available properties it has in the rdf object.
 * @param {Object} rdf the rdf object
 * @param {String} subject URI of the subject
 * @returns {Array} the value of a found property 
 */
function getRDFProperties(rdf, subject) {
	var props = [];
	var query = 'SELECT * { <'+subject+'> ?p ?o }';
	rdf.execute(query, function(success, results) {
		if (success && results.length > 0) {
			for(var i=0;i<results.length;i++) {
				props.push(results[i].p.value);
			}
		}
	});
	return props;
}

/**
 * This function puts an annotation to the annostore
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
 * @param {String} str the string
 * @param {Number} val cutting length
 */
function cutStr(str,val) {
	if(str.length>val) {
		str = str.substring(0,val);
		var lastSpace = str.lastIndexOf(" ");
		if (lastSpace > 0){
			str = str.substring(0,lastSpace+1);	
		}
		str = str+'…';
	}
	return str;
}

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
		GLOBAL.userLabels = obj.userLabels;
	});
}

