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
                url: 'http://platform.fusepool.info/solr/default/suggester/sbsuggest?df=id&wt=json',
                wordParamName: 'q',
                wordStartMatching: true
            },
            { name: 'searchIcon', tag: 'div' }
        ]},
        { name: 'searchButton', kind: onyx.Button, ontap: 'search' }
    ],

    /**
     * This function update the input's text.
     * @param inputText the new input text
     */
    updateInput: function(inputText){
        this.$.searchInput.updateInputValue(inputText);
    },

    /**
     * This function hide the input's suggest list, clear the backend input.
     * It call the parent's search function.
     */
    search: function(){
        this.$.searchInput.clearBackInput();
        this.$.searchInput.hideSuggest();
        this.owner[this.parentSeachFunction](this.$.searchInput.getText());
    }

});