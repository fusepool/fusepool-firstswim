enyo.kind({
    name: 'DictionaryList',
    kind: enyo.Control,
    classes: 'dictionaryList',

    published: {
        dictionaries: null
    },

    create: function(){
        this.inherited(arguments);
        this.$.title.hide();
    },
    
    components: [
        { tag: 'div', name: 'title', classes: 'dictionariesMainTitle', content: 'Dictionaries' },
        { tag: 'div', name: 'list' }
    ],

    updateList: function(dictionaries){
        this.dictionaries = dictionaries;
        if(dictionaries.length > 0){
            this.$.list.destroyClientControls();
            for(var i=0;i<dictionaries.length;++i){
                this.$.list.createComponent({
                    kind: 'Dictionary',
                    dictionaryName: dictionaries[i].name,
                    entityList: dictionaries[i].entities
                });
            }
            this.$.list.render();
        } else {
            this.$.title.setContent('No data available');
        }
        this.$.title.show();
    }

});