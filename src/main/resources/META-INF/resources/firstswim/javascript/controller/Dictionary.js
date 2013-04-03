enyo.kind({
    name: 'Dictionary',
    kind: enyo.Control,

    published: {
        dictionaryName: '',
        entityList: null
    },
    
    components: [
        { tag: 'div', name: 'nameDiv' },
        { tag: 'div', name: 'list' }
    ],

    create: function(){
        this.inherited(arguments);
        this.$.nameDiv.setContent(this.dictionaryName);
        for(var i=0;i<this.entityList.length;++i){       
            this.$.list.createComponent({
                kind: 'DictionaryEntity',
                entityText: this.entityList[i]
            });
        }
    }

});