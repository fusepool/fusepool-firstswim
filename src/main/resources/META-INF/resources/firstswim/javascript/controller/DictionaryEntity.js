enyo.kind({
    tag: 'div',
    name: 'DictionaryEntity',

    published: {
        entityText: ''
    },

    components: [
        { kind: onyx.Checkbox, name: 'entityCheckbox' },
        { tag: 'span', style: 'cursor: pointer;', name: 'entityLabel', ontap: 'changeCheckbox' }
    ],

    changeCheckbox: function(){
        var checkBox = this.$.entityCheckbox;
        checkBox.setValue(!checkBox.getValue());
    },

    create: function(){
        this.inherited(arguments);
        this.$.entityLabel.setContent(this.entityText);
    }
});