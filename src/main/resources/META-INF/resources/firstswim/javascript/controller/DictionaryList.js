enyo.kind({
    name: 'DictionaryList',
    kind: enyo.Control,

    published: {
        dictionaries: null
    },
    
    components: [
        { tag: 'div', content: 'Dictionaries' },
        { tag: 'div', name: 'list' }
    ],

    updateList: function(dictionaries){
        this.dictionaries = dictionaries;
        this.$.list.destroyClientControls();
        for(var i=0;i<dictionaries.length;++i){
            this.$.list.createComponent({
                kind: 'Dictionary',
                dictionaryName: dictionaries[i].name,
                entityList: dictionaries[i].entities
            });
        }
        this.$.list.render();
    }

});