/**
* @class DictionaryEntity
*/
enyo.kind(
/** @lends DictionaryEntity.prototype */
{
    tag: 'div',
    name: 'DictionaryEntity',

    published: {
        entityId: '',
        entityText: '',
        mainClass: '',
        entityTextClass: '',
        entityCheckboxClass: '',
        detailsURL: '',
        parentFunction: '',
        checked: false,
        showDetailsFunction: '',
        detailsStart: false
    },

    create: function(){
        this.inherited(arguments);
        this.$.main.setClasses(this.mainClass);
        this.$.entityCheckbox.setValue(this.checked);
        this.$.entityCheckbox.setClasses(this.entityCheckboxClass);
        this.$.entityLabel.setContent(this.entityText);
        this.$.entityLabel.setClasses(this.entityTextClass);
    },

    components: [
        { tag: 'div', name: 'main', onenter: 'preDetails', onmouseout: 'stopDetails', components: [
            { kind: onyx.Checkbox, name: 'entityCheckbox', onchange: 'checkboxChange' },
            { tag: 'span', name: 'entityLabel', ontap: 'entityClick', onenter: 'preDetails', onmouseout: 'stopDetails' }
        ]}
    ],

    /**
     * This function is called when the user hover the mouse over an entity.
     * It waits for one second and if the user didn't leave the entity, it calls
     * the details function.
     */
    preDetails: function(){
        if(!this.detailsStart){
            this.detailsStart = true;
            var main = this;
            setTimeout(function(){
                if(main.detailsStart){
                    main.stopDetails();
                    main.getDetails();
                }
            }, 400);
        }
    },

    /**
     * It stopped the details if the user move out the mouse from the entity.
     */
    stopDetails: function(){
        this.detailsStart = false;
    },

    /**
     * This function send an ajax request to get an entity's details
     */
    getDetails: function(){
        var request = new enyo.Ajax({
            method: 'GET',
            url: this.detailsURL,
            handleAs: 'text',
            headers: { Accept: 'application/rdf+xml' }
        });
        request.go({
            iri: this.entityId
        });
        request.response(this, function(inSender, inResponse) {
            this.processDetailsResponse(inResponse);
        });
    },

    /**
     * This functions runs when the ajax response is arrived about the details.
     * It makes an rdf object, and call the details creator function.
     * @param {String} rdfResponse the ajax response about the details
     */
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
        this.createDetails(rdf);
    },

    /**
     * This function create details object from the rdf object, and call the
     * parent's details showing function.
     * @param {Object} rdf the rdf object which contains details informations
     */
    createDetails: function(rdf){
        var content = this.getContent(rdf);
        var title = this.getTitle(rdf);
        var image = this.getImage(rdf);

        var details = { content: content, title: title, image: image };
        this.owner.owner[this.showDetailsFunction](details);
    },

    /**
     * This function search the details's image in an rdf object.
     * @param {Object} rdf the rdf object
     * @return {String} the image's URL (if it's not exist, an empty text)
     */
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

    /**
     * This function search the details's title in an rdf object.
     * @param {Object} rdf the rdf object
     * @return {String} the title without speech marks (if it's not exist, an empty text)
     */
    getTitle: function(rdf){
        var title = '';
        rdf.where('?s <http://www.w3.org/2000/01/rdf-schema#label> ?o').each(function(){
            title = this.o.value + '';
        });
        return title;
    },

    /**
     * This function search the details's content in an rdf object.
     * @param {Object} rdf the rdf object
     * @return {String} the content without speech marks (if it's not exist, an empty text)
     */
    getContent: function(rdf){
        var content = '';
        rdf.where('?s <http://www.w3.org/2000/01/rdf-schema#comment> ?o').each(function(){
            content = this.o.value;
        });
        content = deleteSpeechMarks(content);
        return content;
    },

    /**
     * This function is called when the user check/uncheck the checkbox.
     * It calls the callParent function.
     * @param {Object} inSender the checkbox component
     */
    checkboxChange: function(inSender){
        var cbValue = inSender.getValue();
        this.callParent(cbValue);
    },

    /**
     * This function is called when the user click on an entity.
     */
    entityClick: function(){
        var cbValue = !this.$.entityCheckbox.getValue();
        this.callParent(cbValue);
    },

    /**
     * This function calls the parent's search function with the clicked entity
     * and the new checkbox value.
     * @param {Boolean} cbValue new checkbox value
     */
    callParent: function(cbValue){
        this.owner.owner[this.parentFunction](this.entityId, this.entityText, cbValue);
    }

});
