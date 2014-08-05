/**
 * Autosuggest component.
 * Created by Adam Nagy, GeoX Kft.
 * 
 * @class AutoSuggest
 * @version 1.9.1
 * @author �d�m Nagy
*/
enyo.kind(
/** @lends AutoSuggest.prototype */
{
    name: 'AutoSuggest',
    kind: enyo.Control,
    classes: 'suggestMain',

    /** The input field and the suggest div components */
    components: [
        { kind: onyx.Input, name: 'backInputField' },
        { kind: onyx.Input, name: 'inputField', onkeydown: 'keyDown', onkeyup: 'keyUp', onblur: 'onBlurInput' },
        { kind: enyo.Control, name: 'suggestDiv' }
    ],

    /** The global variables */
    published: {
        backendRefresh: false, // Refreshing from back-end or from the local/global list
        backInputFieldClass: 'autoSuggest_back_input',
        countElements: 0, // Count of suggested elements
        currentElement: -1, // The current element which is selected in the suggestion list
        data: null, // The local data which contains the actual suggestion list
        finishFilling: false, // It shows that the user stops the filling or not
        format: 'json', // Format of the back-end refreshing ( json or rdf )
        inputFieldClass: 'autoSuggest_input',
        jsonProperty: '', // The property name which contains the suggestion list in the response
        maxElements: 20,
        maxElemParamName: '', // The name of the max element's parameter
        onEnterParentFunction: '', // Parent function which runs when the user push the enter
        placeholder: '',
        postWordInURL: false, // Post the search word in the end of the URL (or in the body)
        rdfRowName: '', // Name of the rdf row in the result
        startCharacter: 1, // The autosuggest runs from this character
        suggestDivClass: 'autoSuggest_suggestDiv',
        tableName: null, // Table name, which contains the suggest words
        url: '', // URL for back-end refreshing
        useGlobalData: true, 
        wordStartMatching: false,
        wordParamName: 'text', // The name of the search text's parameter
        where: null // JSON object which contains a table's columns and values
    },

    /**
     * Creating function which sets the input and the suggester div css class
     * and hides the suggest div.
	 * @method create
     */
    create: function(){
        this.inherited(arguments);
        this.$.backInputField.setClasses(this.backInputFieldClass);
        this.$.inputField.setClasses(this.inputFieldClass);
        this.$.suggestDiv.setClasses(this.suggestDivClass);
        this.hideSuggest();
    },

    /**
     * This functions runs after rendering.
	 * @method rendered
     */
    rendered: function(){
        this.inherited(arguments);
        this.updateBackInput();
        this.$.inputField.focus();
    },

    /**
     * This function update the back input field after the rendering. If the user
     * focus on the back input, the program set the focus to the front input.
     * It requires jQuery.
	 * @method updateBackInput
     */
    updateBackInput: function(){
        if(jQuery){
            var backInput = jQuery('#' + this.$.backInputField.getId());
            backInput.attr('readonly', 'true');
            var frontInput = jQuery('#' + this.$.inputField.getId());
            backInput.focus(function(){
                frontInput.focus();
            });
        }
    },

    /** 
     * This function updates the input field's placeholder.
	 * @method updatePlaceholder
     * @param {String} placeHolderText the new placeholder
     */
    updatePlaceholder: function(placeHolderText){
        this.$.inputField.setPlaceholder(placeHolderText);
    },

    /**
     * This function put a new text to the input.
	 * @method updateInputValue
     * @param {String} newValue the new value
     */
    updateInputValue: function(newValue){
        if(this.$.inputField.getValue() !== newValue){
            this.$.inputField.setValue(newValue);            
        }
    },

    /**
     * This function sends a request to the back-end to get the suggestion list
     * for the keyword. 
	 * @method refreshFromBackend
     */
    refreshFromBackend: function(){
        var postBody = this.generatePostBodyText();
        var format = this.generateRequestFormat();
        var headers = this.generateHeader();

        var request = new enyo.Ajax({
            method: 'POST',
            url: this.url,
            handleAs: format,
            headers: headers
        });
        if(!this.postWordInURL){
            request.postBody = postBody;
        } else {
            request.url += '&' + postBody;
        }
        request.response(this, function(inSender, inResponse) {
            this.processResponse(inResponse);
        });
        request.go();
    },

    /**
     * This function processes the response after the ajax request.
	 * @method processResponse
     * @param {String} inResponse the response what is come from the back-end
     */
    processResponse: function(inResponse){
        if(inResponse !== 'error' && !this.finishFilling){
            if(this.format === 'rdf'){
                this.data = this.rdfToArray(inResponse);
                this.onTextChange();
            } else if(this.format === 'json'){
                if(!this.isEmptyParam(this.jsonProperty)){
                    var object = inResponse[this.jsonProperty];
                    this.data = [];
                    if(!this.isEmptyParam(object)){
                        for (var key in object) {
                            this.data.push(key);
                        }                        
                    }
                } else {
                    this.data = inResponse;
                }
                this.onTextChange();
            }
        } else {
            console.log('Autosuggest: There\'s an error with ajax request');
        }
    },

    /**
     * This function parses an rdf text to a string array,
     * which contains the suggested elements.
	 * @method rdfToArray
     * @param {String} response the rdf response from the back-end
     */
    rdfToArray: function(response){
        try {
            // Convert rdf text to rdf object
            var parsedData = new DOMParser().parseFromString(response, 'text/xml' );
            var rdf = jQuery.rdf();
            rdf.load(parsedData, {});

            // Creating the suggestion list
            var suggestList = [];
            var whereText = '?s ' + this.rdfRowName + ' ?o';
            rdf.where(whereText).each(function(){
                var elem = this.o.value + '';
                elem = elem.substr(1, elem.length-2);
                if(suggestList.indexOf(elem) === -1){
                    suggestList.push(elem);
                }
            });
            return suggestList;
        } catch(e){
            console.log('Autosuggest: There\'s a problem with the rdf parsing. Please check jQuery and rdfquery importing and the rdfRowName variable\'s content');
            console.log(e);
            return [];
        }
    },

    /**
     * This function generates the post body text for the ajax request. The postBody
     * contains the input text and the number of max elements. The table name and
     * the 'where' property is optional.
	 * @method generatePostBodyText
     * @return {String} the generated post body text
     */
    generatePostBodyText: function(){
        var inputText = this.$.inputField.getValue();
        var result = this.wordParamName + '=' + inputText;
        if(!this.isEmptyParam(this.maxElemParamName)){
            result += '&' + this.maxElemParamName + '=' + this.maxElements;
        }
        if(!this.isEmptyParam(this.tableName)){
            result += '&table=' + this.tableName;
        }
        if(!this.isEmptyParam(this.where)){
            result += '&where=' + JSON.stringify();
        }
        return jQuery.trim(result); // <-- is should be removed
//        return result;
    },

    /**
     * This function returns the format for the request. The possible
     * formats are 'json' and 'rdf'. Otherwise it returns 'json'.
	 * @method generateRequestFormat
     * @return {String} the request format
     */
    generateRequestFormat: function(){
        if(this.format === 'json'){
            return 'json';
        }
        if(this.format === 'rdf'){
            return 'text';
        }
        return 'json';
    },

    /**
     * This function returns the header for the request.
	 * It is important for rdf formatted requests. The default is null.
	 * @method generateHeader
     * @return {Object} header object
     */
    generateHeader: function(){
        if(this.format === 'rdf'){
            return { Accept: 'application/rdf+xml' };
        }
        return null;
    },

    /**
	 * This function deletes the content from the input field and
	 * hides the suggestion list.
	 * @method clearText
	 */
    clearText: function(){
        this.$.inputField.setValue('');
        this.hideSuggest();
    },

    /**
     * This function returns the input field's value.
	 * @method getText
     * @return {String} the input field's value
     */
    getText: function(){
        return this.$.inputField.getValue();
    },

    /**
	 * This function disables the input field.
	 * @method disableInput
	 */
    disableInput: function(){
        this.$.inputField.setDisabled(true);
    },

    /**
	 * This function enables the input field.
	 * @method enableInput
	 */
    enableInput: function(){
        this.$.inputField.setDisabled(false);
    },

    /**
     * This function returns true if the parameter is empty, false otherwise.
	 * @method isEmptyParam
     * @param {Object} parameter the text what the function check
     * @return {Boolean} true if the parameter is empty, false otherwise
     */
    isEmptyParam: function(parameter){
        if(typeof parameter === 'undefined' || parameter === null || parameter === ''){
            return true;
        }
        return false;
    },

    /**
     * This function runs when the user presses a key while 
	 * the suggestion list is active. The used keys are
	 * up, down, Enter and ESC.
	 * @method keyDown
     * @param {Object} inSender the suggestion list
     * @param {Object} inEvent pushed button event
     */
    keyDown: function(inSender, inEvent){
        switch(inEvent.keyCode){
            case 38: // up arrow
                this.moveUp();
                break;
            case 40: //down arrow
                this.moveDown();
                break;
            case 13: // enter
                this.finishFilling = true;
                this.hideSuggest();
                if(this.onEnterParentFunction !== ''){
                    this.owner[this.onEnterParentFunction]();
                }
                break;
            case 27: // escape
                this.finishFilling = true;
                this.hideSuggest();
                break;
        }
    },

    /**
     * This function runs when the user changes the input field's content, and
     * controls the autosuggest event.
	 * @method keyUp
     * @param {Object} inSender the input field
     * @param {Object} inEvent the input change event which contains the pressed button
     */
    keyUp: function(inSender, inEvent){
        this.finishFilling = false;
        var keyCode = inEvent.keyCode;
        if (keyCode < 32 && keyCode !== 8 || keyCode >= 33 && keyCode < 46 || keyCode >= 112 && keyCode <= 123){
            // Arrows, Page up, Page down, F1-F12, Home, End, Insert -- Nothing to do
        } else {
            var inputText = this.$.inputField.getValue();
            if(this.backendRefresh && inputText.length >= this.startCharacter){
                this.refreshFromBackend();
            } else {
                this.onTextChange();
            }
        }
    },

    /**
     * This function run, when the user push the 'up arrow' button on
     * the keyboard. The function step down up the suggestion list, and
     * update the input field text to the selected item.
	 * @method moveUp
     */
    moveUp: function(){
        var suggestDiv = this.$.suggestDiv;
        if(this.countElements > 0 && this.currentElement > 0){
            this.currentElement--;
            for(var i=0;i<this.countElements;++i){
                if(i === this.currentElement){
                    suggestDiv.children[i].addClass('over');
                    var elementText = suggestDiv.children[i].clearContent;
                    this.$.inputField.setValue(elementText);
                    this.$.backInputField.setValue(elementText);
                } else {
                    suggestDiv.children[i].removeClass('over');
                }
            }
        }
    },

    /**
     * This function run, when the user push the 'down arrow' button on
     * the keyboard. The function step down on the suggestion list, and
     * update the input field text to the selected item.
	 * @method moveDown
     */
    moveDown: function(){
        var suggestDiv = this.$.suggestDiv;
        if(this.countElements > 0 && this.currentElement < this.countElements - 1){
            this.currentElement++;
            for(var i=0;i<this.countElements;++i){
                if(i === this.currentElement){
                    suggestDiv.children[i].addClass('over');
                    var elementText = suggestDiv.children[i].clearContent;
                    this.$.inputField.setValue(elementText);
                    this.$.backInputField.setValue(elementText);
                } else {
                    suggestDiv.children[i].removeClass('over');
                }
            }
        }
    },

    /**
     * This function adds a new item to the suggestion list. The item contains the input
     * text, and these characters will be bold in the user interface.
	 * @method addSuggestElement
     * @param {String} element the new list item's content
     * @param {String} inputText the content of the input field
     */
    addSuggestElement: function(element, inputText){
        var startBoldIndex = element.indexOf(inputText.toLowerCase());
        var endBoldIndex = inputText.length;

        var begin = element.substr(0, startBoldIndex);
        var bolded = '<b>' + element.substr(startBoldIndex, endBoldIndex) + '</b>';
        var end = element.substr(endBoldIndex);
        var content = begin + bolded + end;

        this.createComponent({
            tag: 'div',
            container: this.$.suggestDiv,
            allowHtml: true,
            content: content,
            clearContent: element,
            onmouseover: 'mouseOver',
            onmouseout: 'mouseOut',
            onmousedown: 'mouseDown'
        });
    },

    /**
     * This function runs when the user moves the mouse over a suggested element.
	 * It selects the related element in the list.
	 * @method mouseOver
     * @param {Object} inSender the selected list element
     */
    mouseOver: function(inSender){
        inSender.addClass('over');
    },

    /**
     * This function runs when the user moves the mouse out of a suggested element.
	 * It deselects the related element in the list.
	 * @method mouseOut
     * @param {Object} inSender the unselected list element
     */
    mouseOut: function(inSender){
        inSender.removeClass('over');
    },

    /**
     * This function updates the input field and hides the suggestion list
	 * when the user clicks on an item.
	 * @method mouseDown
     * @param {Object} inSender the selected list element
     */
    mouseDown: function(inSender){
        this.$.inputField.setValue(inSender.clearContent);
        this.$.backInputField.setValue(inSender.clearContent);
        this.hideSuggest();
    },

    /**
     * This function controls the filtering of the data list and creates the
     * suggestion list.
	 * @method onTextChange
     */
    onTextChange: function(){
//        var inputText = this.$.inputField.getValue();
        var inputText = jQuery.trim(this.$.inputField.getValue()); // <-- is should be removed
        var suggestDiv = this.$.suggestDiv;
        this.currentElement = -1;
        suggestDiv.destroyClientControls();

        if(inputText.length !== 0 && inputText.length >= this.startCharacter){
            var list = [];
            if(this.backendRefresh){
                list = this.data;
            } else {
                this.getMatches(inputText, list);
            }

            if(!list.length){
                this.clearBackInput();
                this.hideSuggest();
                return;
            }

            this.completeBackInput(list[0]);
            this.countElements = list.length;
            for(var i=0;i<list.length;++i){
                this.addSuggestElement(list[i], inputText);
            }
            this.showSuggest();

        } else {
            this.countElements = 0;
            this.clearBackInput();
            this.hideSuggest();
        }
    },

    /**
     * This function clears the second input in the background.
	 * @method clearBackInput
     */
    clearBackInput: function(){
        this.$.backInputField.hasNode().value = '';
    },

    /**
     * This function puts the suggested word into the background input so it
	 * looks like the suggester continues the term that the user started to type.
	 * It handles case-differences between the suggested term and the term that
	 * the user entered.
	 * @method completeBackInput
     * @param {String} word the word what the function puts
     */
    completeBackInput: function(word){
        var inputText = this.$.inputField.getValue();
        var length = inputText.length;
        var other = word.substring(length);
        this.$.backInputField.hasNode().value = inputText + other;
    },

    /**
     * This function checks that which elements are matched to the input field's
     * content. It can use both global data and own data. This function is used when
     * the there are no refreshing from back-end.
	 * @method getMatches
     * @param {String} inputText input field's content
     * @param {Array} list the created filtered list which is returned by the function
     */
    getMatches: function(inputText, list){
        var counter = 0;
        // Global data list
        if(this.useGlobalData && !this.backendRefresh){
            for(var i=0;i<suggestData.length;++i){
                if(this.containsText(suggestData[i], inputText)){
                    list.push(suggestData[i]);
                    counter++;
                }
                if(counter === (this.maxElements-1)){
                    break;
                }
            }
        // Own data list
        } else {
            for(var i=0;i<this.data.length;++i){
                if(this.containsText(this.data[i], inputText)){
                    list.push(this.data[i]);
                    counter++;
                }
                if(counter === (this.maxElements-1)){
                    break;
                }
            }
        }
    },

	/**
	 * This function checks whether the first parameter contains the second. If the
	 * 'wordStartingMatching' variable is true, the function checks the beginning of
	 * the word, everywhere in the word otherwise.
	 * @method containsText
	 * @param {String} longText the longText which may contains the searchedText
	 * @param {String} searchedText the searched text
	 * @return {Boolean} true, if the longText contains the searchedText, false otherwise
	 */
    containsText: function(longText, searchedText){
        // The text starts with the word
        if(this.wordStartMatching && longText.toLowerCase().indexOf(searchedText.toLowerCase()) === 0){
            return true;
        }
        // Text contains the word
        if(!this.wordStartMatching && longText.toLowerCase().indexOf(searchedText.toLowerCase()) !== -1){
            return true;
        }
        return false;
    },

	/**
	 * This function runs, when the user leaves the input field.
	 * It hides the suggestion list and clears the input field in
	 * the background too.
	 * @method onBlurInput
     */
    onBlurInput: function(){
        this.finishFilling = true;
        this.clearBackInput();
        this.hideSuggest();
    },

    /**
	 * This function hides the suggestion list.
	 * @method hideSuggest
	 */
    hideSuggest: function(){
        this.$.suggestDiv.hide();
    },

    /**
	 * This function shows the suggestion list.
	 * @method showSuggest
	 */
    showSuggest: function(){
        var suggestDiv = this.$.suggestDiv;
        suggestDiv.render();
        suggestDiv.show();
    }

});