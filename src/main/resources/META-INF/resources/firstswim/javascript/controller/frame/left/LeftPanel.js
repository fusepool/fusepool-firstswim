enyo.kind({
    
    name: 'LeftPanel',
    kind: enyo.Control,
    layoutKind: 'FittableRowsLayout',
    classes: 'enyo-unselectable',

    published: {
        entityFilterFunction: '',
        bookmarkFunction: '',
        popupBookmarkFunction: ''
    },
    
    components: [
        {
            kind: 'LeftHeader',
            name: 'leftHeader',
            classes: 'leftHeader',
            bookmarkFunction: 'createBookmark',
            popupBookmarkFunction: 'popupBookmark'
        },
        { tag: 'div', components: [
            { name: 'docsButton', classes: 'docsButton', content: 'Documents', ontap: 'searchShow' }
        ]},
        { kind: 'DetailsBox', name: 'detailsBox', classes: 'detailsMobileBox enyo-unselectable' },
        { kind: 'enyo.Scroller', fit: true, touch: true, touchOverscroll: false, components: [
            {
                kind: 'DictionaryList',
                classes: 'dictionaryList',
                entityFilterFunction: 'entityFilter',
                name: 'dictionaries',
                dictionaryTitle: 'Dictionaries',
                noContentLabel: 'No data available',
                titleClass: 'dictionariesMainTitle',
                showDetailsFunction: 'updateDetails'
            }
        ]}
    ],

    showDocsButton: function(){
        this.$.docsButton.show();
    },

    hideDocsButton: function(){
        this.$.docsButton.hide();
    },

    searchShow: function(){
        this.owner.searchShow();
    },

    createBookmark: function(){
        this.owner[this.bookmarkFunction]();
    },

    saveBookmark: function(url, title){
        this.$.leftHeader.saveBookmark(url, title);
    },

    popupBookmark: function(message){
        this.owner[this.popupBookmarkFunction](message);
    },

    updateDictionaries: function(dictionaryObject){
        this.$.dictionaries.updateList(dictionaryObject);
    },

    updateDetails: function(detailsObject){
        this.$.detailsBox.updateDetails(detailsObject);
    },

    entityFilter: function(searchResponse){
        this.owner[this.entityFilterFunction](searchResponse);
    }

});