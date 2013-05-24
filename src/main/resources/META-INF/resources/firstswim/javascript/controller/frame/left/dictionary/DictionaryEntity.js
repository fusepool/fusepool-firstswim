enyo.kind({
    tag: 'div',
    name: 'DictionaryEntity',

    published: {
        entityText: '',
        entityTextClass: '',
        detailsURL: '',
        parentFunction: '',
        unchecked: false,
        showDetailsFunction: ''
    },

    create: function(){
        this.inherited(arguments);
        this.$.entityCheckbox.setValue(!this.unchecked);
        this.$.entityLabel.setContent(this.entityText);
        this.$.entityLabel.setClasses(this.entityTextClass);
    },

    components: [
        { kind: onyx.Checkbox, name: 'entityCheckbox', onchange: 'cbChange' },
        { tag: 'span', name: 'entityLabel', onmouseover: 'getDetails', ontap: 'tapEntity' }
    ],

    getDetails: function(){
        var request = new enyo.Ajax({
            method: 'GET',
            url: this.detailsURL,
            handleAs: 'text',
            headers: { Accept: 'application/rdf+xml' }
        });
        request.go({
            id : 'http://dbpedia.org/resource/' + replaceAll(this.entityText, ' ', '_')
        });
        request.response(this, function(inSender, inResponse) {
            this.processDetailsResponse(inResponse);
        });
    },

    processDetailsResponse: function(rdfResponse){
        // Delete bad type rows
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
        this.owner.owner[this.showDetailsFunction](details);
    },

    clearDetails: function(){
        var details = { content: '', title: '', image: '' };
        this.owner.owner[this.showDetailsFunction](details);
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
        title = this.deleteSpeechMarks(title);
        return title;
    },

    getContent: function(rdf){
        var content = '';
        rdf.where('?s <http://www.w3.org/2000/01/rdf-schema#comment> ?o').each(function(){
            content = this.o.value;
        });
        content = this.deleteSpeechMarks(content);
        return content;
    },

    /**
     * Delete speech marks (") form the first and last character of text
     * @param text the text what the function check
     */
    deleteSpeechMarks: function(text){
        var result = text;
        if(result.charAt(0) === '"'){
            result = result.substr(1);
        }
        if(result.charAt(result.length-1) === '"'){
            result = result.substr(0, result.length-1);
        }
        return result;
    },

    cbChange: function(inSender){
        var cbValue = inSender.getValue();
        this.filterEntity(cbValue);
    },

    tapEntity: function(){
        var cbValue = this.changeCheckbox();
        this.filterEntity(cbValue);
    },

    filterEntity: function(cbValue){
        this.owner.owner[this.parentFunction](this.entityText, cbValue);
    },

    changeCheckbox: function(){
        var checkBox = this.$.entityCheckbox;
        var newValue = !checkBox.getValue();
        checkBox.setValue(newValue);
        return newValue;
    }

});