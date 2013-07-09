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
        scrollerClass: '',
        noContentLabel: '',
        searchFunction: '',
        entityCheckboxClass: '',
        titleClass: '',
        searchWord: '',
        showDetailsFunction: '',
        checkedEntities: []
    },

    /**
     * When the component is created the program set the title's properties and
     * hides it.
     */
    create: function(){
        this.inherited(arguments);
        this.$.scroller.setClasses(this.scrollerClass);
        this.$.title.setContent(this.dictionaryTitle);
        this.$.title.setClasses(this.titleClass);
        this.$.checkedDiv.hide();
    },
    
    components: [
        { tag: 'div', name: 'title' },
        { kind: 'enyo.Scroller', name: 'scroller', fit: true, touchOverscroll: false, components: [
                { name: 'dictionaryListPanel', classes: 'dictionaryListPanel', components: [
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
     * This function update the dictionary list from a dictionary object. This
     * object contains a searchword, a dictionary array and the unchecked entites
     * from the past.
     * @param {Object} dictionaryObject the dictionary object
     */
    updateLists: function(dictionaryObject){
        this.searchWord = dictionaryObject.searchWord;
        this.checkedEntities = dictionaryObject.checkedEntities;

        this.updateCheckedDictionaries();
        this.updateDictionaryList(dictionaryObject.dictionaries);
    },

    /**
     * This function is called by a "child" dictionary, because the user would like
     * to see a details of an entity. This function call the parent's function,
     * which show the details.
     * @param {Object} details the details object
     */
    updateDetails: function(details){
        this.owner[this.showDetailsFunction](details);
    },

    /**
     * This function calls the parent's search function with searchword and the
     * checked entity list.
     * @param {String} entity the last checked/unchecked entity
     * @param {String} checked the entity was checked or unchecked
     */
    filter: function(entity, checked){
        if(checked){
            this.checkedEntities.push(entity);
        } else {
            var index = this.checkedEntities.indexOf(entity);
            this.checkedEntities.splice(index, 1);
        }
        this.owner[this.searchFunction](this.searchWord, this.checkedEntities);
    },

    /**
     * This function update the checked entity list
     */
    updateCheckedDictionaries: function(){
        this.$.checkedList.destroyClientControls();
        for(var i=0; i<this.checkedEntities.length; i++){
            this.$.checkedList.createComponent({
                kind: 'DictionaryEntity',
                classes: 'detailsDiv',
                entityTextClass: 'entityText enyo-unselectable',
                entityCheckboxClass: this.entityCheckboxClass,
                detailsURL: CONSTANTS.DETAILS_URL,
                entityText: this.checkedEntities[i],
                parentFunction: 'filter',
                showDetailsFunction: 'updateDetails',
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
     * This function update the dictionary list
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
                    showDetailsFunction: 'updateDetails'
                });
            }
            this.$.list.render();
        } else {
            this.$.list.setContent(this.noContentLabel);
            this.$.list.render();
        }
    }

});