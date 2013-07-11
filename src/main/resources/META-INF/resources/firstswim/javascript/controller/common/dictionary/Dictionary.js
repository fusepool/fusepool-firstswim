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
            var checked = this.isCheckedEntity(this.entityList[i]);
            if(!checked){          
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
            if(this.checkedEntities[i].text === entity.text){
                return true;
            }
        }
        return false;
    },

    /**
     * This function is called when the user checked/unchecked one entity.
     * It handles the unchecked entity list and call the parent filter function.
     * @param {String} entityId id of the chosen entity
     * @param {String} entityText text of the chosen entity
     * @param {Boolean} checked the entity is checked or not
     */
    updateEntities: function(entityId, entityText, checked){
        this.owner.owner[this.searchFunction](entityId, entityText, checked);
    }

});
