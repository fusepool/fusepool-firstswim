enyo.kind({
    name: 'DocumentList',
    kind: enyo.Control,
    classes: 'documentList',

    published: {
        documents: null
    },

    create: function(){
        this.inherited(arguments);
        this.$.title.hide();
    },
    
    components: [
        { tag: 'div', name: 'title', classes: 'documentsMainTitle', content: 'Documents' },
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
                    documentId: documents[i].id,
                    shortContent: documents[i].shortContent,
                    parentFunction: 'openDoc'
                });
            }
            this.$.list.render();
        } else {
            this.$.title.setContent('No data available');
        }
        this.$.title.show();
    },

    openDoc: function(documentId){
        this.owner.openDoc(documentId);
    }

});