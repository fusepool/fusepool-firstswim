enyo.kind({
    name: 'Dictionary',
    kind: enyo.Control,

    published: {
        nameClass: '',
        dictionaryName: '',
        entityList: null,
        searchWord: '',
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
                entityTextClass: 'entityText',
                detailsPopupClass: 'detailsPopup',
                detailsTitleClass: 'detailsTitle',
                detailsContentClass: 'detailsContent',
                detailsURL: 'http://platform.fusepool.info/entityhub/site/dbpedia/entity',
                entityText: this.entityList[i],
                parentFunction: 'updateEntities',
                unchecked: unchecked
            });
        }
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
        this.filter();
    },

    filter: function(){
        var url = this.createRequestURL();
        var request = new enyo.Ajax({
            method: 'GET',
            url: url,
            handleAs: 'text',
            headers: { Accept: 'application/rdf+xml' }
        });
        request.go();
        request.response(this, function(inSender, inResponse) {
            this.entityFilter(inResponse);
        });
    },

    entityFilter: function(data){
        this.owner.owner.entityFilter(data);
    },

    createRequestURL: function(){
        var url = 'http://platform.fusepool.info/ecs/?search=' + this.searchWord;
        for(var i=0;i<this.uncheckedEntities.length;i++){
            url += '&subject=http://dbpedia.org/resource/' + this.uncheckedEntities[i];
        }
        url = replaceSpacesToUnderline(url);
        return url;
    },

    rendered: function(){
        this.$.nameDiv.setClasses(this.nameClass);
    }

});