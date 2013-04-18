enyo.kind({

    kind: onyx.Popup,
    name: 'AddEntityPopup',

    published: {
        entityContentClass: '',
        titleContent: '',
        selectClass: '',
        okAddEntityButtonClass: '',
        okAddEntityButtonContent: '',
        cancelAddEntityButtonContent: ''
    },

    create: function(){
        this.inherited(arguments);
        this.$.addEntityContent.setClasses(this.entityContentClass);
        this.$.title.setContent(this.titleContent);
        this.$.dictionarySelect.setClasses(this.selectClass);
        this.$.okButton.setClasses(this.okAddEntityButtonClass);
        this.$.okButton.setContent(this.okAddEntityButtonContent);
        this.$.cancelButton.setContent(this.cancelAddEntityButtonContent);
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

    addEntity: function(clickTop, clickLeft, selectedText){
        this.applyStyle('top', clickTop - 130 + 'px');
        this.applyStyle('left', clickLeft - 120 + 'px');
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