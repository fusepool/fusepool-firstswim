enyo.kind({
    kind: onyx.Popup,
    name: 'MoveEntityPopup',
    classes: 'moveEntityPopup',
    components: [
        { tag: 'div', name: 'moveEntityContent', classes: 'moveEntityContent', components: [
            { tag: 'span', classes: 'moveEntityTitle', content: 'Move entity: ' },
            { tag: 'span', name: 'moveEntityWord' }
        ]},
        { tag: 'div', content: 'From:', classes: 'fromToText' },
        { tag: 'select', classes: 'dictionarySelect', components: [
            { tag: 'option', content: 'Person' },
            { tag: 'option', content: 'Location' },
            { tag: 'option', content: 'Organization' },
            { tag: 'option', content: 'LTE' }
        ]},
        { tag: 'div', content: 'To:', classes: 'fromToText' },
        { tag: 'select', classes: 'dictionarySelect', components: [
            { tag: 'option', content: 'Person' },
            { tag: 'option', content: 'Location' },
            { tag: 'option', content: 'Organization' },
            { tag: 'option', content: 'LTE' }
        ]},
        { kind: onyx.Button, classes: 'okMoveEntityButton', content: 'OK', ontap: 'okMoveEntity' },
        { kind: onyx.Button, content: 'Cancel', ontap: 'cancelMoveEntity' }
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