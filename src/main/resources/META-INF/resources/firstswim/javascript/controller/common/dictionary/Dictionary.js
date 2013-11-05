/**
* @class Dictionary
*/
enyo.kind(
/** @lends Dictionary.prototype */
{
    name: 'Dictionary',
    kind: enyo.Control,

    published: {
        nameClass: '',
        dictionaryName: '',
        entityList: null,
        searchFunction: '',
        showDetailsFunction: '',
        entityCheckboxClass: '',
        checkedEntities: []
    },

    components: [
        { tag: 'div', name: 'nameDiv' },
        { tag: 'div', name: 'list' },
        { classes: 'clear' }
    ],

    /**
     * The create function set the css classes, the contents and create an entity
     * list into the dictonary.
     */
    create: function(){
        this.inherited(arguments);
        this.$.nameDiv.setClasses(this.nameClass);
        this.$.nameDiv.setContent(this.dictionaryName);

        var countOfElements = 0;
        for(var i=0;i<this.entityList.length;++i){
            if(!this.isCheckedEntity(this.entityList[i])){
                countOfElements++;
                this.$.list.createComponent({
                    kind: 'DictionaryEntity',
                    mainClass: 'detailsDiv',
                    addressURL: CONSTANTS.ADDRESS_URL,
                    entityTextClass: 'entityText enyo-unselectable',
                    entityCheckboxClass: this.entityCheckboxClass,
                    detailsURL: CONSTANTS.DETAILS_URL,
                    entityId: this.entityList[i].id,
                    entityText: this.entityList[i].text,
                    typeFacet: this.entityList[i].typeFacet,
                    entityCount: this.entityList[i].count,
                    parentFunction: 'updateEntities',
                    showDetailsFunction: 'updateDetails',
                    checked: false
                });
            }
        }
        if(countOfElements === 0){
            this.hide();
        }
    },

    getEntities: function(){
        return this.$.list;
    },

    /**
     * After the user over the mouse an entity, the program gets the details about
     * the chosen entity, and this function is called for update the details box
     * with the details title and an address object.
     * @param {String} title the title of the details
     * @param {Object} addressObject the address objects
     */
    updateDetails: function(title, addressObject){
        this.owner.owner[this.showDetailsFunction](title, addressObject);
    },

    /**
     * This function decide that an entity is checked or not (the checked
     * list contains the entity or not).
     * @param {String} entity the entity what the function check
     * @return {Boolean} true, if it is checked, false otherwise
     */
    isCheckedEntity: function(entity){
        for(var i=0;i<this.checkedEntities.length;i++){
            if(this.checkedEntities[i].id === entity.id || this.checkedEntities[i].text.toUpperCase() === entity.text.toUpperCase()){
                return true;
            }
        }
        return false;
    },

    /**
     * This function is called when the user checked/unchecked one entity.
     * It handles the unchecked entity list and call the parent filter function.
     * @param {Object} entity the chosen entity
     * @param {Boolean} checked the entity is checked or not
     */
    updateEntities: function(entity, checked){
        this.owner.owner[this.searchFunction](entity, checked);
    }

});