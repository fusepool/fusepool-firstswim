enyo.kind({

    kind: onyx.Popup,
    name: 'AddEntityPopup',

    published: {
        titleContent: '',
        okButtonContent: '',
        cancelButtonContent: ''
    },

    create: function(){
        this.inherited(arguments);
        this.$.title.setContent(this.titleContent);
        this.$.okButton.setContent(this.okButtonContent);
        this.$.cancelButton.setContent(this.cancelButtonContent);
    },

    components: [
        { tag: 'div', name: 'addEntityContent', components: [
            { tag: 'span', name: 'title', classes: 'addEntityTitle' },
            { tag: 'span', name: 'addEntityWord' }
        ]},
        { tag: 'select', name: 'dictionarySelect', components: [
            { tag: 'option', content: 'Person' },
            { tag: 'option', content: 'Location' },
            { tag: 'option', content: 'Organization' },
            { tag: 'option', content: 'LTE' }
        ]},
        { kind: onyx.Button, name: 'okButton', ontap: 'okAddEntity' },
        { kind: onyx.Button, name: 'cancelButton', ontap: 'cancelAddEntity' }
    ],

    addEntity: function(selectedText){
        this.$.addEntityWord.setContent(selectedText);
        this.show();
    },

    okAddEntity: function(){
        this.hide();
    },

    cancelAddEntity: function(){
        this.hide();
    }
});