enyo.kind({
    name: 'ShortDocument',
    kind: enyo.Control,
    style: 'position: relative',

    published: {
        documentId: '',
        shortContent: null
    },
    
    components: [
        { tag: 'div', classes: 'shortDocument', name: 'content' },
        { tag: 'div', classes: 'openDocButton', ontap: 'openDoc' }
    ],

    openDoc: function(){
        console.log('open doc: ' + this.documentId);
    },

    create: function(){
        this.inherited(arguments);
        this.$.content.setContent(this.shortContent);
    }

});