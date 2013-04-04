enyo.kind({
    tag: 'div',
    name: 'DictionaryEntity',
    classes: 'detailsDiv',

    published: {
        entityText: ''
    },

    components: [
        { kind: onyx.Checkbox, name: 'entityCheckbox' },
        { tag: 'span', classes: 'entityText', name: 'entityLabel', onmouseout: 'hideDetails', onmouseover: 'showDetails', ontap: 'changeCheckbox' },
        { kind: onyx.Popup, name: 'detailsPopup', classes: 'detailsPopup', components: [
            { tag: 'div', classes: 'detailsTitle', name: 'detailsTitle' },
            { kind: 'Image', name: 'detailsImage' },
            { tag: 'div', classes: 'detailsContent', name: 'detailsContent' }
        ]}
    ],
    
    hideDetails: function(){
        this.$.detailsPopup.hide();
    },

    showDetails: function(){
        var details = this.getFakeDetails();
        this.$.detailsTitle.setContent(details.title);
        this.$.detailsContent.setContent(details.content);
        this.$.detailsImage.setSrc(details.image);
        this.$.detailsPopup.show();
    },

    getFakeDetails: function(){
        detailsObj = {};
        detailsObj.title = this.entityText;
        detailsObj.content = 'Paris is the capital and largest city of France…';
        detailsObj.image = 'http://symbols.widgit.com/symbolworld/col/50/graphics/widgit%20rebus%2007/symbols%207b/eiffel%20tower.svg.sym';
        return detailsObj;
    },

    changeCheckbox: function(){
        var checkBox = this.$.entityCheckbox;
        checkBox.setValue(!checkBox.getValue());
    },

    create: function(){
        this.inherited(arguments);
        this.$.entityLabel.setContent(this.entityText);
    }
});