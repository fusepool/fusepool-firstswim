/**
* @class SearchBox
*/
enyo.kind(
/** @lends SearchBox.prototype */        
{
    name: 'SearchBox',
    kind: enyo.Control,
    tag: 'div',
    classes: 'searchBox',

    published: {
        placeholder: '',
        inputClass: '',
        searchIconClass: '',
        buttonVisible: true,
        buttonContent: '',
        buttonClass: '',
        searchOnEveryCharacter: false,
        parentSeachFunction: ''
    },

    /**
     * When this component is created this function set the button's,
     * the input's and the icon's properties.
	 * @method create
     */
    create: function(){
        this.inherited(arguments);
        this.$.searchInput.updatePlaceholder(this.placeholder);
        this.$.searchInput.setClasses(this.inputClass);
        this.$.searchIcon.setClasses(this.searchIconClass);
        if(this.buttonVisible){
            this.$.searchButton.setContent(this.buttonContent);
            this.$.searchButton.setClasses(this.buttonClass);
        } else {
            this.$.searchButton.destroy();
        }
    },

    components: [
        { name: 'decorator', classes: 'decorator', components: [
            { name: 'searchInput', kind: 'AutoSuggest',
                backendRefresh: true,
                jsonProperty: 'sbsuggester',
                onEnterParentFunction: 'search',
                postWordInURL: true,
                url: CONSTANTS.AUTOSUGGEST_URL,
                wordParamName: 'q',
                wordStartMatching: true
            },
            { name: 'searchIcon', tag: 'div', ontap: 'search' }
        ]},
        { name: 'searchButton', kind: onyx.Button, ontap: 'search' }
    ],

    /**
     * This function fires the updater function of the input field.
	 * @method updateInput
     * @param {String} inputText the new input text
     */
    updateInput: function(inputText){
        this.$.searchInput.updateInputValue(inputText);
    },

    /**
     * This function clears and hides the suggest list and fires the
     * search function of the parent.
	 * @method search
     */
    search: function(){
        this.$.searchInput.clearBackInput();
        this.$.searchInput.hideSuggest();
        this.owner[this.parentSeachFunction](this.$.searchInput.getText(), []);
    }

});