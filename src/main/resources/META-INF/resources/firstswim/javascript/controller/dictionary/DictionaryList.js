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
        if(dictionaries.length > 0){
            this.$.list.destroyClientControls();
            for(var i=0;i<dictionaries.length;++i){
                this.$.list.createComponent({
                    kind: 'Dictionary',
                    nameClass: 'dictionaryName',
                    dictionaryName: dictionaries[i].name,
                    entityList: dictionaries[i].entities
                });
            }
            this.$.list.render();
        } else {
            this.$.title.setContent(this.noContentLabel);
        }
        this.$.title.show();
    }

});