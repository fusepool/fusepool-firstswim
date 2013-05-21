enyo.kind({
    name: 'Dictionary',
    kind: enyo.Control,

    published: {
        nameClass: '',
        dictionaryName: '',
        entityList: null,
        showDetailsFunction: '',
        uncheckedEntities: []
    },

    components: [
        { tag: 'div', name: 'nameDiv' },
        { tag: 'div', name: 'list' }
    ],

    create: function(){
        this.inherited(arguments);
        this.$.nameDiv.setContent(this.dictionaryName);
        for(var i=0;i<this.entityList.length;++i){
            var unchecked = this.isUncheckedEntity(this.entityList[i]);
            this.$.list.createComponent({
                kind: 'DictionaryEntity',
                classes: 'detailsDiv',
                entityTextClass: 'entityText enyo-unselectable',
                detailsURL: 'http://platform.fusepool.info/entityhub/site/dbpedia/entity',
                entityText: this.entityList[i],
                parentFunction: 'updateEntities',
                showDetailsFunction: 'updateDetails',
                unchecked: unchecked
            });
        }
    },

    updateDetails: function(details){
        this.owner.owner[this.showDetailsFunction](details);
    },

    isUncheckedEntity: function(entity){
        if(this.uncheckedEntities.indexOf(entity) !== -1){
            return true;
        }
        return false;
    },

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
    },

    rendered: function(){
        this.$.nameDiv.setClasses(this.nameClass);
    }

});