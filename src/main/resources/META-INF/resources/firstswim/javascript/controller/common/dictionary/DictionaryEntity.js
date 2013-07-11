/**
* @class DictionaryEntity
*/
enyo.kind(
/** @lends DictionaryEntity.prototype */
{
    tag: 'div',
    name: 'DictionaryEntity',

    published: {
        addressURL: '',
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
        request.go({ iri: this.entityId });
        request.response(this, function(inSender, inResponse) {
            this.processDetailsResponse(inResponse);
        });
    },

    /**
     * This functions runs when the details ajax response is arrived about the details.
     * It calls the getAddresses function for more information if the details has address.
     * @param {String} rdfResponse the ajax response about the details
     */
    processDetailsResponse: function(rdfResponse){
        var rdf = this.createRdfObjectFromText(rdfResponse);
        var title = this.getPropertyValue(rdf, 'http://www.w3.org/2000/01/rdf-schema#label');
        var addressID = this.getPropertyValue(rdf, 'http://schema.org/address');
        if(!isEmpty(addressID)){
            this.getAddresses(addressID, title);   
        } else {
            this.showDetails(title);
        }
    },

    /**
     * This function send an ajax request to get an entity's address.
     * @param {String} addressID id of the address
     * @param {String} title the title of the details
     */
    getAddresses: function(addressID, title){
        var request = new enyo.Ajax({
            method: 'GET',
            url: this.addressURL,
            handleAs: 'text',
            headers: { Accept: 'application/rdf+xml' }
        });
        request.go({ iri: addressID });
        request.response(this, function(inSender, inResponse) {
            this.processAddressResponse(inResponse, title);
        });
    },

    /**
     * This functions runs when the ajax response is arrived about the address.
     * It calls the parent's show function.
     * @param {String} response the response of the ajax request
     * @param {String} title the title of the details
     */
    processAddressResponse: function(response, title){
        var rdf = this.createRdfObjectFromText(response);
        var addressObject = {};
        addressObject.locality = this.getPropertyValue(rdf, 'http://schema.org/addressLocality');
        addressObject.street = this.getPropertyValue(rdf, 'http://schema.org/streetAddress');
        addressObject.country = this.getPropertyValue(rdf, 'http://schema.org/addressCountry');
        this.showDetails(title, addressObject);
    },

    showDetails: function(title, addressObject){
        this.owner.owner[this.showDetailsFunction](title, addressObject);
    },

    /**
     * This functions search a property's value in an rdf object.
     * @param {Object} rdf the rdf object
     * @param {String} propertyName the name of the property
     * @returns {String} the property's value
     */
    getPropertyValue: function(rdf, propertyName){
        var result = '';
        rdf.where('?s <' + propertyName + '> ?p').each(function(){
            result = this.p.value + '';
        });
        return result;
    },

    /**
     * This function create rdf object from a text.
     * @param {String} text the text of rdf
     * @returns {Object} the rdf object
     */
    createRdfObjectFromText: function(text){
        var parsedData = new DOMParser().parseFromString(text, 'text/xml' );
        var rdf = jQuery.rdf();
        rdf.load(parsedData, {});
        return rdf;
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