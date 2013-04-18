enyo.kind({

    kind: onyx.Popup,
    name: 'RemoveEntityPopup',
    classes: 'removeEntityPopup',
    components: [
        { tag: 'div', name: 'removeEntityContent', classes: 'removeEntityContent', components: [
            { tag: 'span', classes: 'removeEntityTitle', content: 'Remove entity: ' },
            { tag: 'span', name: 'removeEntityWord' }
        ]},
        { tag: 'select', classes: 'dictionarySelect', components: [
            { tag: 'option', content: 'Person' },
            { tag: 'option', content: 'Location' },
            { tag: 'option', content: 'Organization' },
            { tag: 'option', content: 'LTE' }
        ]},
        { kind: onyx.Button, classes: 'okRemoveEntityButton', content: 'OK', ontap: 'okRemoveEntity' },
        { kind: onyx.Button, content: 'Cancel', ontap: 'cancelRemoveEntity' }
    ],

    removeEntity: function(clickTop, clickLeft, selectedText){
        this.applyStyle('top', clickTop - 130 + 'px');
        this.applyStyle('left', clickLeft - 120 + 'px');
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