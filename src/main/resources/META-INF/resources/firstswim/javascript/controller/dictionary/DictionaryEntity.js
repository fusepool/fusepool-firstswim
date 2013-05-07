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
            { kind: 'Image', name: 'detailsImage', classes: 'detailsImage' },
            { tag: 'div', name: 'detailsContent' }
        ]}
    ],
    
    hideDetails: function(){
        this.$.detailsPopup.hide();
        this.detailsVisible = false;
    },

    getDetails: function(){
        this.detailsVisible = true;
        var request = new enyo.Ajax({
            method: 'GET',
            url: this.detailsURL,
            headers: { Accept: 'application/rdf+xml' }
        });
        request.go({
            id : 'http://dbpedia.org/resource/' + this.entityText,
        });
        request.response(this, function(inSender, inResponse) {
            this.processDetailsResponse(inResponse);
        });
    },

    processDetailsResponse: function(rdfResponse){
        // delete bad type rows
        var textArray = rdfResponse.split('\n');
        var newText = '';
        for(var i=0;i<textArray.length;i++){
            if(textArray[i].indexOf('http://www.w3.org/2001/XMLSchema#long') === -1){
                newText += textArray[i] + '\n';
            }
        }
        // Convert rdf text to rdf object
        var parsedData = new DOMParser().parseFromString(newText, 'text/xml' );
        var rdf = jQuery.rdf();
        rdf.load(parsedData, {});

        var content = this.getContent(rdf);
        var title = this.getTitle(rdf);
        var image = this.getImage(rdf);

        var details = { content: content, title: title, image: image };
        this.showDetails(details);
    },

    getImage: function(rdf){
        var pictures = [];
        rdf.where('?s <http://xmlns.com/foaf/0.1/depiction> ?o').each(function(){
            pictures.push(this.o.value + '');
        });
        // If there are a small version of the picture, we return with that
        if(pictures.length > 0){
            for(var i=0;i<pictures.length;i++){
                if(pictures[i].indexOf('thumb') !== -1){
                    return pictures[i];
                }
            }            
            return pictures[0];
        }
        return '';
    },

    getTitle: function(rdf){
        var title = '';
        rdf.where('?s <http://www.w3.org/2000/01/rdf-schema#label> ?o').each(function(){
            if(this.o.lang === 'en'){
                title = this.o.value;
            }
        });
        return title;
    },

    getContent: function(rdf){
        var content = '';
        rdf.where('?s <http://www.w3.org/2000/01/rdf-schema#comment> ?o').each(function(){
            content = this.o.value;
        });
        return content;
    },

    showDetails: function(details){
        this.$.detailsTitle.setContent(details.title);
        this.$.detailsContent.setContent(details.content);
        this.$.detailsImage.setSrc(details.image);
        if(this.detailsVisible){
            this.$.detailsPopup.show();
        }
    },

    changeCheckbox: function(){
        var checkBox = this.$.entityCheckbox;
        checkBox.setValue(!checkBox.getValue());
    }
});