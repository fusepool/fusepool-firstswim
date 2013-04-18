enyo.kind({

    kind: onyx.Popup,
    name: 'MoveEntityPopup',

    published: {
        entityContentClass: '',
        titleClass: '',
        titleContent: '',
        fromContent: '',
        fromClass: '',
        fromSelectClass: '',
        toContent: '',
        toClass: '',
        toSelectClass: '',
        okButtonClass: '',
        okButtonContent: '',
        cancelButtonContent: ''
    },

    create: function(){
        this.inherited(arguments);
        this.$.moveEntityContent.setClasses(this.entityContentClass);
        this.$.title.setClasses(this.titleClass);
        this.$.title.setContent(this.titleContent);
        
        this.$.from.setContent(this.fromContent);
        this.$.from.setClasses(this.fromClass);
        this.$.fromSelect.setClasses(this.fromSelectClass);
        
        this.$.to.setContent(this.toContent);
        this.$.to.setClasses(this.toClass);
        this.$.toSelect.setClasses(this.toSelectClass);

        this.$.okButton.setClasses(this.okButtonClass);
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

    moveEntity: function(clickTop, clickLeft, selectedText){
        this.applyStyle('top', clickTop - 215 + 'px');
        this.applyStyle('left', clickLeft - 120 + 'px');
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