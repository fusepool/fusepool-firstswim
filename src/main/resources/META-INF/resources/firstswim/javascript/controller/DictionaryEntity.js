enyo.kind({
    tag: 'div',
    name: 'DictionaryEntity',
    classes: 'detailsDiv',

    published: {
        entityText: ''
    },

    components: [
        { kind: onyx.Checkbox, name: 'entityCheckbox' },
        { tag: 'span', classes: 'entityText', name: 'entityLabel', onmouseout: 'hideDetails', onmouseover: 'getDetails', ontap: 'changeCheckbox' },
        { kind: onyx.Popup, name: 'detailsPopup', classes: 'detailsPopup', components: [
            { tag: 'div', classes: 'detailsTitle', name: 'detailsTitle' },
            { kind: 'Image', name: 'detailsImage' },
            { tag: 'div', classes: 'detailsContent', name: 'detailsContent' }
        ]}
    ],
    
    hideDetails: function(){
        this.$.detailsPopup.hide();
    },

    getDetails: function(){
        var url = 'http://platform.fusepool.info/entityhub/site/dbpedia/entity';
        var request = new enyo.Ajax({
            method: 'GET',
            url: url
        });
        request.go({
            id : 'http://dbpedia.org/resource/Paris',
            header_Accept : 'application/rdf%2bxml'
        });
        request.response(this, function(inSender, inResponse) {
            this.showDetails(inResponse.representation);
        });
    },

    showDetails: function(data){
        var details = this.getDetailsObject(data);
        console.log(details);
        this.$.detailsTitle.setContent(details.title);
        this.$.detailsContent.setContent(details.content);
        this.$.detailsImage.setSrc(details.image);
        this.$.detailsPopup.show();
    },

    getDetailsObject: function(data){
        detailsObj = {};
        detailsObj.title = data['http://www.w3.org/2000/01/rdf-schema#label'][2].value;
        detailsObj.content = data['http://www.w3.org/2000/01/rdf-schema#comment'][0].value;
        detailsObj.image = data['http://xmlns.com/foaf/0.1/depiction'][0].value;
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