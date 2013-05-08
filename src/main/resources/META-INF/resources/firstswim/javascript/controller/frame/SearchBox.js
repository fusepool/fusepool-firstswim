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
            { name: 'searchInput', kind: 'onyx.Input', onkeyup: 'searchKeyUp' },
            { name: 'searchIcon', tag: 'div' }
        ]},
        { name: 'searchButton', kind: onyx.Button, ontap: 'search' }
    ],

    searchKeyUp: function(inSender, inEvent){
        if(this.searchOnEveryCharacter || inEvent.keyCode === 13){
            this.search();
        }
    },

    updateInput: function(inputText){
        this.$.searchInput.setValue(inputText);
    },

    search: function(){
        this.owner[this.parentSeachFunction](this.$.searchInput.hasNode().value);
    },

    rendered: function(){
        this.$.searchInput.setPlaceholder(this.placeholder);
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