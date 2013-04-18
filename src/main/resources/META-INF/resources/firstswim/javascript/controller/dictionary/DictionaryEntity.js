enyo.kind({
    tag: 'div',
    name: 'DictionaryEntity',

    published: {
        entityText: '',
        entityTextClass: '',
        detailsPopupClass: '',
        detailsTitleClass: '',
        detailsContentClass: '',
        detailsVisible: false,
        detailsURL: ''
    },

    create: function(){
        this.inherited(arguments);
        this.$.entityLabel.setContent(this.entityText);
        this.$.entityLabel.setClasses(this.entityTextClass);
        this.$.detailsPopup.setClasses(this.detailsPopupClass);
        this.$.detailsTitle.setClasses(this.detailsTitleClass);
        this.$.detailsContent.setClasses(this.detailsContentClass);
    },

    components: [
        { kind: onyx.Checkbox, name: 'entityCheckbox' },
        { tag: 'span', name: 'entityLabel', onmouseout: 'hideDetails', onmouseover: 'getDetails', ontap: 'changeCheckbox' },
        { kind: onyx.Popup, name: 'detailsPopup', components: [
            { tag: 'div', name: 'detailsTitle' },
            { kind: 'Image', name: 'detailsImage' },
            { tag: 'div', name: 'detailsContent' }
        ]}
    ],
    
    hideDetails: function(){
        this.$.detailsPopup.hide();
        this.detailsVisible = false;
    },

    getDetails: function(){
        this.detailsVisible = true;
        var url = this.detailsURL;
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
        this.$.detailsTitle.setContent(details.title);
        this.$.detailsContent.setContent(details.content);
        this.$.detailsImage.setSrc(details.image);
        if(this.detailsVisible){
            this.$.detailsPopup.show();
        }
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
    }
});