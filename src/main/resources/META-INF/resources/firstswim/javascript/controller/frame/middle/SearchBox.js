enyo.kind({
    name: 'SearchBox',
    kind: enyo.Control,
    tag: 'div',
    classes: 'searchBox',

    published: {
        placeholder: '',
        inputClass: '',
        searchIconClass: '',
        mobile: false,
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
                wordStartMatching: true,
                format: 'rdf',
                onEnterParentFunction: 'search',
                rdfRowName: '<http://www.w3.org/2000/01/rdf-schema#label>',
                url: 'http://82.141.158.251/rdftest/rdf.php'
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
        this.$.searchInput.setMobile(this.mobile);
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