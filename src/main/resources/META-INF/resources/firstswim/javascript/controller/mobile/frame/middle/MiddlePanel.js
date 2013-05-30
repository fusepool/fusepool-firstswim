enyo.kind({

    name: 'MiddlePanel',
    kind: enyo.Control,
    layoutKind: 'FittableRowsLayout',
    style: 'background-color: white; width: 500px;',
    classes: 'enyo-unselectable',

    published: {
        mainSearchFunction: '',
        openDocFunction: '',
        bookmarkFunction: 'createBookmark',
        popupBookmarkFunction: 'popupBookmark'
    },

    components: [
        {
            kind: 'SearchBox',
            name: 'searchBox',
            placeholder: 'Search in documents',
            buttonClass: 'searchButton',
            buttonContent: 'OK',
            searchIconClass: 'searchImage',
            parentSeachFunction: 'updateUI'
        },
        {
            name: 'bookmark',
            kind: 'Bookmark',
            buttonClass: 'bookmarkButton',
            parentTapFunction: 'createBookmark',
            parentPopupFunction: 'popupBookmark',
            warningPopupClass: 'bookmarkPopup',
            warningPopupContent: '<br/>Your browser doesn\'t support add bookmark via Javascript.<br/><br/>Please insert manually this URL:<br/><br/>'
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
 
    createBookmark: function(){
        this.owner[this.bookmarkFunction]();
    },

    saveBookmark: function(url, title){
        this.$.bookmark.saveBookmark(url, title);
    },

    popupBookmark: function(message){
        this.owner[this.popupBookmarkFunction](message);
    },

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