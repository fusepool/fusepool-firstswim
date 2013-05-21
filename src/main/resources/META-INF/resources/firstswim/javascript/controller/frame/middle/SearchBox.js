enyo.kind({
    name: 'SearchBox',
    kind: enyo.Control,
    tag: 'div',
    classes: 'searchBox',

    published: {
        placeholder: '',
        inputFrameClass: '',
        inputClass: '',
        searchIconClass: '',
        buttonVisible: true,
        buttonContent: '',
        buttonClass: '',
        searchOnEveryCharacter: false,
        parentSeachFunction: ''
    },

    components: [
        { name: 'inputDecorator', kind: 'onyx.InputDecorator', components: [
            { name: 'searchInput', kind: 'AutoSuggest',
                backendRefresh: true,
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
        this.$.searchInput.setValue(inputText);
    },

    search: function(){
        this.owner[this.parentSeachFunction](this.$.searchInput.getText());
    },

    rendered: function(){
        this.$.searchInput.updatePlaceholder(this.placeholder);
        this.$.inputDecorator.setClasses(this.inputFrameClass);
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