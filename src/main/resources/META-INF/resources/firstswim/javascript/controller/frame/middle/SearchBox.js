enyo.kind({
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

    components: [
        { name: 'decorator', classes: 'decorator', components: [
            { name: 'searchInput', kind: 'AutoSuggest',
                backendRefresh: true,
                jsonProperty: 'sbsuggester',
                onEnterParentFunction: 'search',
                postWordInURL: true,
                url: 'http://platform.fusepool.info:8080/solr/default/suggester/sbsuggest?df=id&wt=json',
                wordParamName: 'q',
                wordStartMatching: true
            },
            { name: 'searchIcon', tag: 'div' }
        ]},
        { name: 'searchButton', kind: onyx.Button, ontap: 'search' }
    ],

    updateInput: function(inputText){
        this.$.searchInput.updateInputValue(inputText);
    },

    search: function(){
        this.$.searchInput.clearBackInput();
        this.owner[this.parentSeachFunction](this.$.searchInput.getText());
    },

    rendered: function(){
        this.$.searchInput.updatePlaceholder(this.placeholder);
        this.$.searchInput.setClasses(this.inputClass);
        this.$.searchIcon.setClasses(this.searchIconClass);
        if(this.buttonVisible){
            this.$.searchButton.setContent(this.buttonContent);
            this.$.searchButton.setClasses(this.buttonClass);
        } else {
            this.$.searchButton.destroy();
        }
    }

});