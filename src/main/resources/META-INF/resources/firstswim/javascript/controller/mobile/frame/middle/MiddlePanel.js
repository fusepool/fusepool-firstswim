/**
* @class MiddlePanel
*/
enyo.kind(
/** @lends MiddlePanel.prototype */
{
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
 
    /**
     * This function calls the parent's create bookmark function.
     */
    createBookmark: function(){
        this.owner[this.bookmarkFunction]();
    },

    /**
     * This functions calls the bookmark's save bookmark function
     * with an URL and a title
     * @param url the new bookmark url
     * @param title the new bookmark title
     */
    saveBookmark: function(url, title){
        this.$.bookmark.saveBookmark(url, title);
    },

    /**
     * This function calls the parent's function, which shows a warning message
     * about the bookmark in a new popup
     * @param message the warning message
     */
    popupBookmark: function(message){
        this.owner[this.popupBookmarkFunction](message);
    },

    /**
     * This function shows the entities button, which navigates to the entity
     * list panel.
     */
    showEntitiesButton: function(){
        this.$.entitiesButton.show();
    },

    /**
     * This function hides the entites button.
     */
    hideEntitiesButton: function(){
        this.$.entitiesButton.hide();
    },

    /**
     * This function calls the parent's entity show function.
     */
    entityShow: function(){
        this.owner.entityShow();
    },

    /**
     * This function calls the parent's user interface update function.
     * @param searchWord the latest search word
     * @param uncheckedEntities the unchecked entities
     */
    updateUI: function(searchWord, uncheckedEntities){
        this.owner[this.mainSearchFunction](searchWord, uncheckedEntities);
    },

    /**
     * This function calls the document list's update function.
     * @param documents the new list of documents
     */
    updateDocuments: function(documents){
        this.$.documents.updateList(documents);
    },

    /**
     * This function calls the parent's openDoc funcion with the document URL
     * @param documentURL url of the document what the user want to see
     */
    openDoc: function(documentURL){
        this.owner[this.openDocFunction](documentURL);
    },

    /**
     * This function update the searchbox's input text.
     * @param inputText the new input text
     */
    updateInput: function(inputText){
        this.$.searchBox.updateInput(inputText);
    }

});