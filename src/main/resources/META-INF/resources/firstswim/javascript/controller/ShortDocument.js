enyo.kind({
    name: 'ShortDocument',
    kind: enyo.Control,

    published: {
        documentId: '',
        shortContent: null,
        parentFunction: '',
        contentClass: '',
        openButtonClass: ''
    },

    components: [
        { tag: 'div', name: 'content' },
        { tag: 'div', name: 'openButton', ontap: 'openDoc' }
    ],

    openDoc: function(){
        this.owner[this.parentFunction](this.documentId);
    },

    create: function(){
        this.inherited(arguments);
        this.$.content.setContent(this.shortContent);
    },

    rendered: function(){
        this.$.content.setClasses(this.contentClass);
        this.$.openButton.setClasses(this.openButtonClass);
    }

});