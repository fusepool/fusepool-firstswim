enyo.kind({

    kind: onyx.Popup,
    name: 'RemoveEntityPopup',

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
        { tag: 'div', name: 'removeEntityContent', components: [
            { tag: 'span', name: 'title' },
            { tag: 'span', name: 'removeEntityWord' }
        ]},
        { tag: 'select', name: 'dictionarySelect', components: [
            { tag: 'option', content: 'Person' },
            { tag: 'option', content: 'Location' },
            { tag: 'option', content: 'Organization' },
            { tag: 'option', content: 'LTE' }
        ]},
        { kind: onyx.Button, name: 'okButton', ontap: 'okRemoveEntity' },
        { kind: onyx.Button, name: 'cancelButton', ontap: 'cancelRemoveEntity' }
    ],

    removeEntity: function(selectedText){
        this.$.removeEntityWord.setContent(selectedText);
        this.show();
    },

    okRemoveEntity: function(){
        this.hide();
    },

    cancelRemoveEntity: function(){
        this.hide();
    }
});