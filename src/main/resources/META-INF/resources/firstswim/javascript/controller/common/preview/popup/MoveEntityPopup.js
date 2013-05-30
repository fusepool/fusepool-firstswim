enyo.kind({

    kind: onyx.Popup,
    name: 'MoveEntityPopup',

    published: {
        titleContent: '',
        fromContent: '',
        toContent: '',
        okButtonClass: '',
        okButtonContent: '',
        cancelButtonContent: ''
    },

    create: function(){
        this.inherited(arguments);
        this.$.title.setContent(this.titleContent);
        this.$.from.setContent(this.fromContent);
        this.$.to.setContent(this.toContent);
        this.$.okButton.setContent(this.okButtonContent);
        this.$.cancelButton.setContent(this.cancelButtonContent);
    },

    components: [
        { tag: 'div', name: 'moveEntityContent', components: [
            { tag: 'span', name: 'title' },
            { tag: 'span', name: 'moveEntityWord' }
        ]},
        { tag: 'div', name: 'from' },
        { tag: 'select', name: 'fromSelect', components: [
            { tag: 'option', content: 'Person' },
            { tag: 'option', content: 'Location' },
            { tag: 'option', content: 'Organization' },
            { tag: 'option', content: 'LTE' }
        ]},
        { tag: 'div', name: 'to' },
        { tag: 'select', name: 'toSelect', components: [
            { tag: 'option', content: 'Person' },
            { tag: 'option', content: 'Location' },
            { tag: 'option', content: 'Organization' },
            { tag: 'option', content: 'LTE' }
        ]},
        { kind: onyx.Button, name: 'okButton', ontap: 'okMoveEntity' },
        { kind: onyx.Button, name: 'cancelButton', ontap: 'cancelMoveEntity' }
    ],

    moveEntity: function(selectedText){
        this.$.moveEntityWord.setContent(selectedText);
        this.show();  
    },

    okMoveEntity: function(){
        this.hide();
    },

    cancelMoveEntity: function(){
        this.hide();
    }
});