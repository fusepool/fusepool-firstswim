enyo.kind({
    name: 'DictionaryList',
    kind: enyo.Control,

    published: {
        dictionaryTitle: '',
        noContentLabel: '',
        titleClass: '',
        searchWord: ''
    },

    create: function(){
        this.inherited(arguments);
        this.$.title.setContent(this.dictionaryTitle);
        this.$.title.hide();
    },

    rendered: function(){
        this.$.title.setClasses(this.titleClass);
    },
    
    components: [
        { tag: 'div', name: 'title' },
        { tag: 'div', name: 'list' }
    ],

    updateList: function(dictionaryObject){
        this.searchWord = dictionaryObject.searchWord;
        var dictionaries = dictionaryObject.dictionaries;
        this.$.list.destroyClientControls();
        if(dictionaries.length > 0){
            for(var i=0;i<dictionaries.length;++i){
                this.$.list.createComponent({
                    kind: 'Dictionary',
                    nameClass: 'dictionaryName',
                    dictionaryName: dictionaries[i].name,
                    entityList: dictionaries[i].entities,
                    uncheckedEntities: dictionaries[i].uncheckedEntities
                });
            }
            this.$.list.render();
            if(this.uncheckedEntitiesExist(dictionaries)){
                this.filter();
            }
        } else {
            this.$.list.setContent(this.noContentLabel);
            this.$.list.render();
        }
        this.$.title.show();
    },

    uncheckedEntitiesExist: function(dictionaries){
        for(var i=0;i<dictionaries.length;i++){
            var entities = dictionaries[i].uncheckedEntities;
            if(!isEmpty(entities) && entities.length > 0){
                return true;
            }
        }
        return false;
    },

    filter: function(){
        var url = this.createFilterRequestURL();
        var request = new enyo.Ajax({
            method: 'GET',
            url: url,
            handleAs: 'text',
            headers: { Accept: 'application/rdf+xml' }
        });
        request.go();
        request.response(this, function(inSender, inResponse) {
            this.responseFilter(inResponse);
        });
    },

    createFilterRequestURL: function(){
        var url = 'http://platform.fusepool.info/ecs/?search=' + this.searchWord;
        var dictionaries = this.$.list.children;
        for(var i=0;i<dictionaries.length;i++){
            var entities = dictionaries[i].uncheckedEntities;
            for(var j=0;j<entities.length;j++){
                url += '&subject=http://dbpedia.org/resource/' + entities[j];
            }
        }
        url = replaceSpacesToUnderline(url);
        return url;
    },

    responseFilter: function(data){
        this.owner.entityFilter(data);
    }    

});