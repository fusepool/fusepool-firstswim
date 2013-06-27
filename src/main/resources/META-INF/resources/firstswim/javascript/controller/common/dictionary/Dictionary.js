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
        showDetailsFunction: '',
        entityCheckboxClass: '',
        uncheckedEntities: []
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
        for(var i=0;i<this.entityList.length;++i){
            var unchecked = this.isUncheckedEntity(this.entityList[i]);
            this.$.list.createComponent({
                kind: 'DictionaryEntity',
                classes: 'detailsDiv',
                entityTextClass: 'entityText enyo-unselectable',
                entityCheckboxClass: this.entityCheckboxClass,
                detailsURL: 'http://platform.fusepool.info/entityhub/site/dbpedia/entity',
                entityText: this.entityList[i],
                parentFunction: 'updateEntities',
                showDetailsFunction: 'updateDetails',
                unchecked: unchecked
            });
        }
    },

    /**
     * After the user over the mouse an entity, the program gets the details about
     * the chosen entity, and this function is called for update the details box.
     * @param {Object} details the details object, which contains information about the entity
     */
    updateDetails: function(details){
        this.owner.owner[this.showDetailsFunction](details);
    },

    /**
     * This function decide that an entity is unchecked or not (the unchecked
     * list contains the entity or not).
     * @param {String} entity the checked entity
     * @return {Boolean} true, if it is unchecked, false otherwise
     */
    isUncheckedEntity: function(entity){
        if(this.uncheckedEntities.indexOf(entity) !== -1){
            return true;
        }
        return false;
    },

    /**
     * This function is called when the user checked/unchecked one entity.
     * It handles the unchecked entity list and call the parent filter function.
     * @param {String} entity the chosen entity
     * @param {Boolean} checked the entity is checked or not
     */
    updateEntities: function(entity, checked){
        if(checked){
            // Remove element
            var index = this.uncheckedEntities.indexOf(entity);
            this.uncheckedEntities.splice(index, 1);
        } else {
            // Add element
            this.uncheckedEntities.push(entity);
        }
        this.owner.owner.filter();
    }

});
