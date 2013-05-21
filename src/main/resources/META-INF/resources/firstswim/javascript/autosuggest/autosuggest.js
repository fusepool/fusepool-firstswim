/**
 * AutoSuggest 1.6
 * Created by Adam Nagy, GeoX Kft.
 */

enyo.kind({
    name: 'AutoSuggest',
    kind: enyo.Control,
    classes: 'suggestMain',

    /** The input field and the suggest div components */
    components: [
        { kind: onyx.Input, name: 'backInputField' },
        { kind: onyx.Input, name: 'inputField', onkeydown: 'keyDown', onkeyup: 'keyUp', onblur: 'hideSuggest' },
        { kind: enyo.Control, name: 'suggestDiv' }
    ],

    /** The global variables */
    published: {
        backendRefresh: false,
        backendFormat: 'json',
        countElements: 0,
        currentElement: -1,
        data: null,
        backInputFieldClass: 'autoSuggest_back_input',
        inputFieldClass: 'autoSuggest_input',
        wordStartMatching: false,
        mobile: false,
        maxElements: 20,
        onEnterParentFunction: '',
        placeholder: '',
        rdfRowName: '',
        startCharacter: 1,
        suggestDivClass: 'autoSuggest_suggestDiv',
        tableName: null,
        url: '',
        useGlobalData: true,
        where: null
    },

    /**
     * Creating function which set the input and the suggest div css class
     * and hide the suggest div
     */
    create: function(){
        this.inherited(arguments);
        this.$.backInputField.setClasses(this.backInputFieldClass);
        this.$.inputField.setClasses(this.inputFieldClass);
        this.$.suggestDiv.setClasses(this.suggestDivClass);
        this.hideSuggest();
    },

    /** 
     * This function updates the input field's placeholer
     * @param placeHolderText the new placeholder
     */
    updatePlaceholder: function(placeHolderText){
        this.$.inputField.setPlaceholder(placeHolderText);
    },

    /**
     * This function put a new text to the input
     * @param newValue the new value
     */
    updateInputValue: function(newValue){
        this.$.inputField.setValue(newValue);
    },

    /**
     * This function send a request to the backend to get the suggest list
     * for the keyword. 
     */
    refreshFromBackend: function(){
        var postBody = this.generatePostBodyText();
        var format = this.generateRequestFormat();
        var headers = this.generateHeader();

        var request = new enyo.Ajax({
            method: 'POST',
            url: this.url,
            postBody: postBody,
            handleAs: format,
            headers: headers
        });
        request.response(this, function(inSender, inResponse) {
            this.processResponse(inResponse);
        });
        request.go();
    },

    /**
     * This function process the answer after the ajax request.
     * @param inResponse the reponse what is come from the backend
     */
    processResponse: function(inResponse){
        if(inResponse !== 'error'){
            if(this.format === 'rdf'){
                this.data = this.rdfToArray(inResponse);
                this.onTextChange();
            } else if(this.format === 'json'){
                this.data = inResponse;
                this.onTextChange();
            }
        } else {
            console.log('There\'s an error with ajax request');
        }
    },

    /**
     * This function parse an rdf text to an string array,
     * which contains the suggest elements
     * @param response the rdf response from the backend
     */
    rdfToArray: function(response){
        try {
            // Convert rdf text to rdf object
            var parsedData = new DOMParser().parseFromString(response, 'text/xml' );
            var rdf = jQuery.rdf();
            rdf.load(parsedData, {});

            // Create the sgguest list
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
            console.log('There\'s a problem with the rdf parsing. Please check jQuery and rdfquery importing and the rdfRowName variable\'s content');
            console.log(e);
            return [];
        }
    },

    /**
     * This function generate the post body text for the ajax request. The postBody
     * contains the input text and the number of max elements. The table name and
     * the where property is optional.
     */
    generatePostBodyText: function(){
        var inputText = this.$.inputField.getValue();
        var result = 'text=' + inputText + '&maxElem=' + this.maxElements;
        if(!this.isEmptyParam(this.tableName)){
            result += '&table=' + this.tableName;
        }
        if(!this.isEmptyParam(this.where)){
            result += '&where=' + JSON.stringify();
        }
        return result;
    },

    /**
     * Return the format for the request. The possible
     * formats: json and rdf. If the format variable
     * is not same any formats of these, the function return with json
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
     * Return the header for the request. It is important for rdf format
     * requests. The default is null.
     */
    generateHeader: function(){
        if(this.format === 'rdf'){
            return { Accept: 'application/rdf+xml' };
        }
        return null;
    },

    /** This function delete the input field's content and hide the suggest list */
    clearText: function(){
        this.$.inputField.setValue('');
        this.hideSuggest();
    },

    /** This function returns the input field's value */
    getText: function(){
        return this.$.inputField.getValue();
    },

    /** This function disable the input field */
    disableInput: function(){
        this.$.inputField.setDisabled(true);
    },

    /** This function enable the input field */
    enableInput: function(){
        this.$.inputField.setDisabled(false);
    },

    /**
     * This function return true, if the parameter is empty, false otherwise
     * @param parameter the text what the function check
     */
    isEmptyParam: function(parameter){
        if(typeof parameter === 'undefined' || parameter === null || parameter === ''){
            return true;
        }
        return false;
    },

    /**
     * This function runs when the user push button on the suggest list
     * @param inSender the suggest list
     * @param inEvent pushed button event
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
                this.hideSuggest();
                if(this.onEnterParentFunction !== ''){
                    this.owner[this.onEnterParentFunction]();
                }
                break;
            case 27: // escape
                this.hideSuggest();
                break;
        }
    },

    /**
     * This function runs when the user change the input field's content, and
     * control the autosuggest event
     * @param inSender the input field
     * @param inEvent the input change event which contains the pressed button
     */
    keyUp: function(inSender, inEvent){
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
     * the keyboard. The function step down up the suggest list, and
     * update the input field text to the selected item
     */
    moveUp: function(){
        var suggestDiv = this.$.suggestDiv;
        if(this.countElements > 0 && this.currentElement > 0){
            this.currentElement--;
            for(var i=0;i<this.countElements;++i){
                if(i === this.currentElement){
                    suggestDiv.children[i].addClass('over');
                    var elementText = suggestDiv.children[i].getContent();
                    this.$.inputField.setValue(elementText);
                } else {
                    suggestDiv.children[i].removeClass('over');
                }
            }
        }
    },

    /**
     * This function run, when the user push the 'down arrow' button on
     * the keyboard. The function step down on the suggest list, and
     * update the input field text to the selected item
     */
    moveDown: function(){
        var suggestDiv = this.$.suggestDiv;
        var inputField = this.$.inputField.hasNode();
        if(this.countElements > 0 && this.currentElement < this.countElements - 1){
            this.currentElement++;
            for(var i=0;i<this.countElements;++i){
                if(i === this.currentElement){
                    suggestDiv.children[i].addClass('over');
                    var elementText = suggestDiv.children[i].getContent();
                    inputField.value = elementText;
                } else {
                    suggestDiv.children[i].removeClass('over');
                }
            }
        }
    },

    /**
     * This function add a new item to the suggest list
     * @param element the new list item's content
     */
    addSuggestElement: function(element){
        this.createComponent({
            tag: 'div',
            container: this.$.suggestDiv,
            content: element,
            onmouseover: 'mouseOver',
            onmouseout: 'mouseOut',
            onmousedown: 'mouseDown'
        });
    },

    /**
     * The user move the mouse over a suggest element and this function 'select'
     * this element on the list
     * @param inSender the selected list element
     */
    mouseOver: function(inSender){
        inSender.addClass('over');
    },

    /**
     * The user move the mouse out a suggest element and this function 'unselect'
     * this element on the list
     * @param inSender the unselected list element
     */
    mouseOut: function(inSender){
        inSender.removeClass('over');
    },

    /**
     * This function update the input field and hide the suggest list when the
     * user click any item on the list
     * @param inSender the selected list element
     */
    mouseDown: function(inSender){
        this.$.inputField.setValue(inSender.getContent());
        this.hideSuggest();
    },

    /**
     * This function controls the filtering the data list, and create the
     * suggest list.
     */
    onTextChange: function(){
        var inputText = this.$.inputField.getValue();
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

            /** Mobile version complete the input text with the first element of
                the filtered list */
            if(this.mobile){
                this.completeBackInput(list[0]);
            } else {                
                this.countElements = list.length;
                for(var i=0;i<list.length;++i){
                    this.addSuggestElement(list[i]);
                }
                this.showSuggest();
            }

        } else {
            this.clearBackInput();
            this.hideSuggest();
        }
    },

    /**
     * This function clear the background input
     * (it is important on mobile devices).
     */
    clearBackInput: function(){
        this.$.backInputField.hasNode().value = '';
    },

    /**
     * In mobile devices there isn't suggest list, the application show the first
     * suggest in the background input. This function put the suggest word to the
     * background input with case sensitive.
     * @param word the word what the function puts
     */
    completeBackInput: function(word){
        var inputText = this.$.inputField.getValue();
        var length = inputText.length;
        var other = word.substring(length);
        this.$.backInputField.hasNode().value = inputText + other;
    },

    /**
     * This function check that which elements are matched to the input field's
     * content. It can use global data and own data. This function is used when
     * the there are no refreshing from backend.
     * @param inputText input field's content
     * @param list the created filtered list which is returned by the function
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
     * This function check that the longText contains the searchedText. If the
     * wordStartingMatching variable is true, the function check the beginning of
     * the word, and if it is false, the function check everywhere in the word.
     * @param longText the longText which may contains the searchedText
     * @param searchedText the searched text
     * @returns true, if the longText contains the searchedText, false otherwise
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

    /** This function hides the suggest list */
    hideSuggest: function(){
        this.$.suggestDiv.hide();
    },

    /** This function shows the suggest list */
    showSuggest: function(){
        var suggestDiv = this.$.suggestDiv;
        suggestDiv.render();
        suggestDiv.show();
    }

});