enyo.kind({
    name: 'DocumentList',
    kind: enyo.Control,

    published: {
        documents: null,
        titleClass: '',
        titleContent: '',
        noDataLabel: ''
    },

    create: function(){
        this.inherited(arguments);
        this.$.title.setContent(this.titleContent);
        this.$.title.hide();
    },

    rendered: function(){
        this.$.title.setClasses(this.titleClass);
    },

    components: [
        { tag: 'div', name: 'title' },
        { tag: 'div', name: 'list' }
    ],

    updateList: function(documents){
        this.documents = documents;
        if(documents.length > 0){
            this.$.list.destroyClientControls();
            for(var i=0;i<documents.length;++i){
                this.createComponent({
                    kind: 'ShortDocument',
                    classes: 'shortDocumentContainer',
                    contentClass: 'shortDocument',
                    openButtonClass: 'openDocButton',
                    container: this.$.list,
                    url: documents[i].url,
                    shortContent: documents[i].shortContent,
                    parentFunction: 'openDoc'
                });
            }
            this.$.list.render();
        } else {
            this.$.title.setContent(this.noDataLabel);
        }
        this.$.title.show();
    },

    openDoc: function(url){
        this.owner.openDoc(url);
    }

});