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
        entityCount: 0,
        mainClass: '',
        entityTextClass: '',
        entityCheckboxClass: '',
        detailsURL: '',
        parentFunction: '',
        typeFacet: false,
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
        var main = this;
        var url = this.detailsURL + '?iri=' + this.entityId;
        var store = rdfstore.create();
        store.load('remote', url, function(success) {
            main.processDetailsResponse(success, store);
        });
    },

    /**
     * This functions runs when the details ajax response is arrived about the details.
     * It calls the getAddresses function for more information if the details has address.
     * @param {Boolean} success the search query was success or not
     * @param {Object} rdf the response rdf object
     */
    processDetailsResponse: function(success, rdf){
        var title = getRDFPropertyValue(rdf, 'http://www.w3.org/2000/01/rdf-schema#label');
        var addressID = getRDFPropertyValue(rdf, 'http://schema.org/address');
        if(!isEmpty(addressID)){
            this.getAddresses(addressID, title);   
        } else {
            this.showDetails(title, null);
        }
    },

    /**
     * This function send an ajax request to get an entity's address.
     * @param {String} addressID id of the address
     * @param {String} title the title of the details
     */
    getAddresses: function(addressID, title){
        var main = this;
        var url = this.addressURL + '?iri=' + addressID;
        var store = rdfstore.create();
        store.load('remote', url, function(success) {
            main.processAddressResponse(success, store, title);
        });
    },

    /**
     * This functions runs when the ajax response is arrived with the address.
     * It calls the 'show' function.
     * @param {Boolean} success the ajax query was success or not
     * @param {Object} rdf the response rdf object
     * @param {String} title the title of the details
     */
    processAddressResponse: function(success, rdf, title){
        var addressObject = {};
        addressObject.locality = getRDFPropertyValue(rdf, 'http://schema.org/addressLocality');
        addressObject.street = getRDFPropertyValue(rdf, 'http://schema.org/streetAddress');
        addressObject.country = getRDFPropertyValue(rdf, 'http://schema.org/addressCountry');
        this.showDetails(title, addressObject);
    },

    /**
     * This function calls the parent's function to show the new details in the
     * details box.
     * @param {String} title the title of the details
     * @param {Object} addressObject the address of the details
     */
    showDetails: function(title, addressObject){
        if(!isEmpty(this.owner)){
            this.owner.owner[this.showDetailsFunction](title, addressObject);
        }
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
        this.owner.owner[this.parentFunction]({id: this.entityId, text: this.entityText, typeFacet: this.typeFacet}, cbValue);
    }

});