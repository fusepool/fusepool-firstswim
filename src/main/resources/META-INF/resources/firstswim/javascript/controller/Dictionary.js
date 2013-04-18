enyo.kind({
    name: 'Dictionary',
    kind: enyo.Control,

    published: {
        nameClass: '',
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
                classes: 'detailsDiv',
                entityTextClass: 'entityText',
                detailsPopupClass: 'detailsPopup',
                detailsTitleClass: 'detailsTitle',
                detailsContentClass: 'detailsContent',
                detailsURL: 'http://platform.fusepool.info/entityhub/site/dbpedia/entity',
                entityText: this.entityList[i]
            });
        }
    },

    rendered: function(){
        this.$.nameDiv.setClasses(this.nameClass);
    }

});