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
        },
        {
            name: 'bookmark',
            kind: 'Bookmark',
            buttonClass: 'bookmarkMobileButton',
            parentTapFunction: 'createBookmark',
            parentPopupFunction: 'popupBookmark',
            warningPopupClass: 'bookmarkPopup',
            warningPopupContent: '<br/>Your browser doesn\'t support add bookmark via Javascript.<br/><br/>Please insert manually this URL:<br/><br/>'
        },
        /*{ name: 'entitiesButton', classes: 'entitiesButton', content: 'Entities', ontap: 'entityShow' },*/
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
            { tag: 'div', name: 'documentsCount' },
            { kind: 'onyx.Button', classes: 'lightButton', name: 'entitiesButton', content: 'Entities', ontap: 'entityShow' }
        ]}		
    ],
	
	/**
	 * This function runs, when the user start a searching. It calls the document
	 * list's startSearching function
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
     * This functions calls the bookmark's save bookmark function
     * with an URL and a title
     * @param {String} url the new bookmark url
     * @param {String} title the new bookmark title
     */
    saveBookmark: function(url, title){
        this.$.bookmark.saveBookmark(url, title);
    },

    /**
     * This function calls the parent's function, which shows a warning message
     * about the bookmark in a new popup
     * @param {String} message the warning message
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
     * @param {String} searchWord the latest search word
     * @param {Array} uncheckedEntities the unchecked entities
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
     * This function calls the documents's addMoreDocuments function with the new documents.
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
     * This function calls the parent's openDoc funcion with the document URL
     * @param {String} documentURL url of the document what the user want to see
     */
    openDoc: function(documentURL){
        this.owner[this.openDocFunction](documentURL);
    },

    /**
     * This function update the searchbox's input text.
     * @param {String} inputText the new input text
     */
    updateInput: function(inputText){
        this.$.searchBox.updateInput(inputText);
    },

    /**
     * This function update the counts text with the new count value
     * @param {Number} count the count of documents
     */
    updateCounts: function(count){
        this.$.documentsCount.setContent(count);
    }

});