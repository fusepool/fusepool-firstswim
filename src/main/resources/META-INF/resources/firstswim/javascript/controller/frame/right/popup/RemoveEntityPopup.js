enyo.kind({

    kind: onyx.Popup,
    name: 'RemoveEntityPopup',

    published: {
        entityContentClass: '',
        titleClass: '',
        titleContent: '',
        selectClass: '',
        okButtonClass: '',
        okButtonContent: '',
        cancelButtonContent: ''
    },

    create: function(){
        this.inherited(arguments);
        this.$.removeEntityContent.setClasses(this.entityContentClass);
        this.$.title.setClasses(this.titleClass);
        this.$.title.setContent(this.titleContent);
        this.$.dictionarySelect.setClasses(this.selectClass);
        this.$.okButton.setClasses(this.okButtonClass);
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
        this.applyStyle('top', '-130px');
        this.applyStyle('left', '-120px');
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