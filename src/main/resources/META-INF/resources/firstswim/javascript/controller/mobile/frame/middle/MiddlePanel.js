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
        popupBookmarkFunction: 'popupBookmark',
        documentsCountClass: '',
        moreDocumentsFunction: ''
    },

    create: function(){
        this.inherited(arguments);
        this.$.documentsCount.setClasses(this.documentsCountClass);
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
        },/*
        {
            name: 'bookmark',
            kind: 'Bookmark',
            buttonClass: 'bookmarkMobileButton',
            parentTapFunction: 'createBookmark',
            parentPopupFunction: 'popupBookmark',
            warningPopupClass: 'bookmarkPopup',
            warningPopupContent: '<br/>Your browser doesn\'t support add bookmark via Javascript.<br/><br/>Please insert manually this URL:<br/><br/>'
        },
        { name: 'entitiesButton', classes: 'entitiesButton', content: 'Entities', ontap: 'entityShow' },*/
		{
			kind: 'DocumentList',
			name: 'documents',
			openDocFunction: 'openDoc',
			classes: 'documentMobileList',
			scrollerClass: 'documentListMobileScroll',
			titleClass: 'documentsMainTitle',
			loaderClass: 'loader',
			titleContent: 'DOCUMENTS',
			noDataLabel: 'No data available',
			moreButtonClass: 'moreButton',
			moreDocumentsFunction: 'moreDocuments'
		},
        { name: 'documentListMobileToolbar', classes: 'documentListMobileToolbar', components: [
            { kind: 'onyx.Button', classes: 'lightButton', name: 'entitiesButton', content: 'Entities', ontap: 'entityShow' },
            { tag: 'div', name: 'documentsCount' }
        ]}		
    ],
	
	/**
	 * This function runs when the user starts a search. It calls the document
	 * list's startSearching function.
	 */
	startSearching: function(){
		this.$.documents.startLoading();
	},

    /**
     * This function calls the parent's create bookmark function.
     */
    createBookmark: function(){
        this.owner[this.bookmarkFunction]();
    },

    /**
     * This function calls the bookmark's save bookmark function
     * with an URL and a title.
     * @param {String} url the new bookmark url
     * @param {String} title the new bookmark title
     */
    saveBookmark: function(url, title){
        this.$.bookmark.saveBookmark(url, title);
    },

    /**
     * This function calls the parent's function, which shows a
	 * message about the bookmark in a new popup.
     * @param {String} message the message
     */
    popupBookmark: function(message){
        this.owner[this.popupBookmarkFunction](message);
    },

    /**
     * This function shows the 'Entities' button that navigates
	 * to the entity list panel.
     */
    showEntitiesButton: function(){
        this.$.entitiesButton.show();
    },

    /**
     * This function hides the 'Entites' button.
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
     * @param {String} searchWord the latest search word
     * @param {Array} uncheckedEntities array of unchecked entities
     */
    updateUI: function(searchWord, uncheckedEntities){
        this.owner[this.mainSearchFunction](searchWord, uncheckedEntities);
    },

    /**
     * This function calls the document list's update function.
     * @param {Array} documents the new list of documents
     */
    updateDocuments: function(documents){
        this.$.documents.updateList(documents);
    },

    /**
     * This function calls the documents' addMoreDocuments
	 * function with the new documents.
     * @param {Array} documents the new list of documents
     */
    addMoreDocuments: function(documents){
        this.$.documents.addMoreDocuments(documents);
    },

    /**
     * This function calls the parent's moreDocuments function.
     * @param {Number} offset the offset of the documents
     */
    moreDocuments: function(offset){
        this.owner[this.moreDocumentsFunction](offset);
    },

    /**
     * This function calls the parent's openDoc function with the document URI.
     * @param {String} documentURI URI of the document to be opened
     */
    openDoc: function(documentURI){
        this.owner[this.openDocFunction](documentURI);
    },

    /**
     * This function updates the searchbox's input text.
     * @param {String} inputText the new input text
     */
    updateInput: function(inputText){
        this.$.searchBox.updateInput(inputText);
    },

    /**
     * This function updates the counter with a given value.
     * @param {Number} count count of documents
     */
    updateCounts: function(count){
        this.$.documentsCount.setContent('Documents: ' + count);
    }

});