enyo.kind({
    kind: onyx.Popup,
    name: 'AddEntityPopup',
    classes: 'addEntityPopup',
    components: [
        { tag: 'div', name: 'addEntityContent', classes: 'addEntityContent', components: [
            { tag: 'span', classes: 'addEntityTitle', content: 'Add entity: ' },
            { tag: 'span', name: 'addEntityWord' }
        ]},
        { tag: 'select', classes: 'dictionarySelect', components: [
            { tag: 'option', content: 'Person' },
            { tag: 'option', content: 'Location' },
            { tag: 'option', content: 'Organization' },
            { tag: 'option', content: 'LTE' }
        ]},
        { kind: onyx.Button, classes: 'okAddEntityButton', content: 'OK', ontap: 'okAddEntity' },
        { kind: onyx.Button, content: 'Cancel', ontap: 'cancelAddEntity' }
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