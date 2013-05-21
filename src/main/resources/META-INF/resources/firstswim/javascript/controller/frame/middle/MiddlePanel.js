enyo.kind({

    name: 'MiddlePanel',
    kind: enyo.Control,
    layoutKind: 'FittableRowsLayout',
    style: 'background-color: white; width: 500px;',
    classes: 'enyo-unselectable',

    published: {
        mainSearchFunction: '',
        openDocFunction: ''
    },

    components: [
        {
            kind: 'SearchBox',
            name: 'searchBox',
            placeholder: 'Search in documents',
            mobile: true,
            buttonClass: 'searchButton',
            buttonContent: 'OK',
            searchIconClass: 'searchImage',
            parentSeachFunction: 'updateUI'
        },
        { name: 'entitiesButton', classes: 'entitiesButton', content: 'Entities', ontap: 'entityShow' },
        { kind: 'enyo.Scroller', fit: true, touch: true, touchOverscroll: false, components: [
            {
                kind: 'DocumentList',
                name: 'documents',
                openDocFunction: 'openDoc',
                classes: 'documentMobileList',
                titleClass: 'documentsMainTitle',
                titleContent: 'Documents',
                noDataLabel: 'No data available'
            }
        ]}
    ],

    showEntitiesButton: function(){
        this.$.entitiesButton.show();
    },

    hideEntitiesButton: function(){
        this.$.entitiesButton.hide();
    },

    entityShow: function(){
        this.owner.entityShow();
    },

    updateUI: function(searchWord, uncheckedEntities){
        this.owner[this.mainSearchFunction](searchWord, uncheckedEntities);
    },

    updateDocuments: function(documents){
        this.$.documents.updateList(documents);
    },

    openDoc: function(document){
        this.owner[this.openDocFunction](document);
    },

    updateInput: function(inputText){
        this.$.searchBox.updateInput(inputText);
    }

});