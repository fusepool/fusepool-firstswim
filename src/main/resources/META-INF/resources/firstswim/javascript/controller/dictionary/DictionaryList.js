enyo.kind({
    name: 'DictionaryList',
    kind: enyo.Control,

    published: {
        dictionaries: null,
        dictionaryTitle: '',
        noContentLabel: '',
        titleClass: ''
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

    updateList: function(dictionaries){
        this.dictionaries = dictionaries;
        this.$.list.destroyClientControls();
        if(dictionaries.length > 0){
            for(var i=0;i<dictionaries.length;++i){
                this.$.list.createComponent({
                    kind: 'Dictionary',
                    nameClass: 'dictionaryName',
                    searchWord: dictionaries[i].searchWord,
                    dictionaryName: dictionaries[i].name,
                    entityList: dictionaries[i].entities,
                    uncheckedEntities: dictionaries[i].uncheckedEntities
                });
            }
            this.$.list.render();
        } else {
            this.$.list.setContent(this.noContentLabel);
            this.$.list.render();
        }
        this.$.title.show();
    },

    entityFilter: function(data){
        this.owner.entityFilter(data);
    }

});