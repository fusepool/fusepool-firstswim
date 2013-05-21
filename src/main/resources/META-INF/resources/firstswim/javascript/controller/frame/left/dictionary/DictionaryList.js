enyo.kind({
    name: 'DictionaryList',
    kind: enyo.Control,

    published: {
        dictionaryTitle: '',
        noContentLabel: '',
        entityFilterFunction: '',
        titleClass: '',
        searchWord: '',
        showDetailsFunction: '',
        uncheckedEntities: []
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
        this.uncheckedEntities = dictionaryObject.uncheckedEntities;
        if(isEmpty(this.uncheckedEntities)){
            this.uncheckedEntities = [];
        }
        var dictionaries = dictionaryObject.dictionaries;
        this.$.list.destroyClientControls();
        if(dictionaries.length > 0){
            for(var i=0;i<dictionaries.length;++i){
                this.$.list.createComponent({
                    kind: 'Dictionary',
                    nameClass: 'dictionaryName',
                    dictionaryName: dictionaries[i].name,
                    entityList: dictionaries[i].entities,
                    uncheckedEntities: this.uncheckedEntities,
                    showDetailsFunction: 'updateDetails'
                });
            }
            this.$.list.render();
            if(this.uncheckedEntities.length > 0){
                this.filter();
            }
        } else {
            this.$.list.setContent(this.noContentLabel);
            this.$.list.render();
        }
        this.$.title.show();
    },

    updateDetails: function(details){
        this.owner[this.showDetailsFunction](details);
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
        if(!isEmpty(this.searchWord)){
            var url = 'http://platform.fusepool.info/ecs/?search=' + this.searchWord;
            var entities = this.uncheckedEntities;
            for(var i=0;i<entities.length;i++){
                url += '&subject=http://dbpedia.org/resource/' + entities[i];
            }
            url = replaceAll(url, ' ', '_');
            return url;
        } else {
            return '';
        }
    },

    responseFilter: function(data){
        this.owner[this.entityFilterFunction](data);
    }    

});