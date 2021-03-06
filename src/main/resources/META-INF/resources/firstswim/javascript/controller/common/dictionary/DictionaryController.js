/**
* @class DictionaryController
*/
enyo.kind(
/** @lends DictionaryController.prototype */
{
    name: 'DictionaryController',
    kind: enyo.Control,

    published: {
        dictionaryTitle: '',
        openClasses: '',
        closeClasses: '',
        openScrollerClass: '',
        closeScrollerClass: '',
        searchFunction: '',
        entityCheckboxClass: '',
        titleClass: '',
        searchWord: '',
        showDetailsFunction: '',
        checkedEntities: []
    },

    /**
     * When the component is created the program sets the title's properties and
     * hides it.
	 * @method create
     */
    create: function(){
        this.inherited(arguments);
        this.setClasses(this.openClasses);
        this.$.scroller.setClasses(this.openScrollerClass);
        this.$.title.setContent(this.dictionaryTitle);
        this.$.title.setClasses(this.titleClass);
        this.$.checkedDiv.hide();
    },
    
    components: [
        { tag: 'div', name: 'title' },
        { kind: 'enyo.Scroller', name: 'scroller', fit: true, touchOverscroll: false, components: [
            { name: 'dictionaryListPanel', classes: 'dictionaryListPanel', ontap: 'tapFacetList', components: [
                { tag: 'div', name: 'checkedDiv', components: [
                    { tag: 'div', name: 'checkedList' },
                    { classes: 'clear' },
                    { tag: 'div', name: 'separator', classes: 'entitySeparator' }
                ]},
                { classes: 'clear' },
                { tag: 'div', name: 'list' }
            ]}
        ]}
    ],
            
    /**
     * This function hides the facet popup.
	 * @method tapFacetList
     */
    tapFacetList: function(){
        // Hide checked facet popup
        var checkedFacets = this.$.checkedList.children;
        for(var i=0;i<checkedFacets.length;i++){
            checkedFacets[i].hideMenu();
        }

        // Hide facet popup
        var facets = this.$.list.children;
        for(var i=0;i<facets.length;i++){
            var entities = facets[i].getEntities().children;
            for(var j=0;j<entities.length;j++){
                entities[j].hideMenu();
            }
        }
    },

    /**
     * This function updates the dictionary list from a dictionary object. This
     * object contains a search word, a dictionary array and the previously unchecked
	 * entities.
	 * @method updateLists
     * @param {Object} dictionaryObject the dictionary object
     */
    updateLists: function(dictionaryObject){
        this.searchWord = dictionaryObject.searchWord;
        this.checkedEntities = dictionaryObject.checkedEntities;
		
        this.updateCheckedDictionaries();
        this.updateDictionaryList(dictionaryObject.dictionaries);
    },

    /**
	 * This function handles the actions that happen on mouseover event:
	 * it sets the proper css classes and calls the detail displayer function of
	 * the parent kind.
	 * [replaced with function 'displayDetails']
	 * @method updateDetails
     * @param {String} title the title of the details
     * @param {Object} addressObject the address object
     */
    updateDetails: function(title, addressObject){
        this.setClasses(this.closeClasses);
        this.$.scroller.setClasses(this.closeScrollerClass);
        this.owner[this.showDetailsFunction](title, addressObject);
    },

	/**
	 * This function handles the actions that happen on mouseover event:
	 * it sets the proper css classes and calls the detail displayer function of
	 * the parent kind.
	 * @method displayDetails
	 * @param {Object} rdf rdf with the metadata of the entity
	 */
    displayDetails: function(rdf){
        this.setClasses(this.closeClasses);
        this.$.scroller.setClasses(this.closeScrollerClass);
        this.owner[this.showDetailsFunction](rdf);
    },
	
    /**
     * This function calls the parent's search function with search word and the
     * checked entity list.
	 * @method filter
     * @param {String} entity the last checked/unchecked entity
     * @param {String} checked the entity was checked or unchecked
     */
    filter: function(entity, checked){
        if(checked){
            this.checkedEntities.push(entity);
        } else {
            var index = this.indexOfEntity(entity);
            if(index !== -1){
                this.checkedEntities.splice(index, 1);   
            }
        }
        this.owner[this.searchFunction](this.searchWord, this.checkedEntities);
    },

    /**
     * This function looks up an entity object in the list of checked entities and
     * returns the array index.
	 * @method indexOfEntity
     * @param {Object} entityObject the searched entity object
     * @return {Number} the array index if the list contains the entity, -1 otherwise
     */
    indexOfEntity: function(entityObject){
        for(var i=0;i<this.checkedEntities.length;i++){
            if(this.checkedEntities[i].id === entityObject.id || this.checkedEntities[i].text.toUpperCase() === entityObject.text.toUpperCase()){
                return i;
            }
        }
        return -1;
    },

    /**
     * This function updates the checked entity list.
	 * @method updateCheckedDictionaries
     */
    updateCheckedDictionaries: function(){
        this.$.checkedList.destroyClientControls();
        for(var i=0; i<this.checkedEntities.length; i++){
            this.$.checkedList.createComponent({
                kind: 'DictionaryEntity',
                mainClass: 'detailsDiv',
                addressURL: CONSTANTS.ADDRESS_URL,
                entityTextClass: 'entityText enyo-unselectable',
                entityCheckboxClass: this.entityCheckboxClass,
                detailsURL: CONSTANTS.DETAILS_URL,
                entityId: this.checkedEntities[i].id,
                entityText: this.checkedEntities[i].text,
                entityCount: this.checkedEntities[i].count,
                entityCountClass: 'entityCount enyo-unselectable',
                typeFacet: this.checkedEntities[i].typeFacet,
                parentFunction: 'filter',
                showDetailsFunction: 'displayDetails',
                checked: true
            });
        }
        if(this.checkedEntities.length > 0){
            this.$.checkedDiv.show();
        } else {
            this.$.checkedDiv.hide();
        }
        this.$.checkedList.render();
    },

    /**
     * This function updates the dictionary list.
	 * @method updateDictionaryList
     * @param {Array} dictionaries list of the new dictionaries
     */
    updateDictionaryList: function(dictionaries){
        this.$.list.destroyClientControls();
        if(dictionaries.length > 0){
            for(var i=0;i<dictionaries.length;++i){
                this.$.list.createComponent({
                    kind: 'Dictionary',
                    nameClass: 'dictionaryName',
                    entityCheckboxClass: this.entityCheckboxClass,
                    dictionaryName: dictionaries[i].name,
                    entityList: dictionaries[i].entities,
                    searchFunction: 'filter',
                    checkedEntities: this.checkedEntities,
					showDetailsFunction: 'displayDetails'
                });
            }
        }
        this.$.list.render();
    }

});