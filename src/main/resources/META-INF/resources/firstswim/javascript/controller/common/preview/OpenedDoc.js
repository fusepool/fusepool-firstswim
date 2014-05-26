/**
* @class OpenedDoc
*/
enyo.kind(
/** @lends OpenedDoc.prototype */
{
    tag: 'div',
    name: 'OpenedDoc',

    published: {
        documentURL: '',
        noDataLabel: '',
        documentContentClass: '',
        loaderClass: '',
        openedDocScrollerClass: '',
        lang: 'en'
    },

    /**
     * When this component is created, it overwrite the right click listener
     * because the desktop version contains a popup menu, and the program hides
     * the default popup menu. The content's and loader's property will be set.
     */
    create: function(){
        this.inherited(arguments);
        this.$.loader.hide();
        // Overwrite click listener
        if (document.addEventListener) {
            document.addEventListener('contextmenu', function(e) { e.preventDefault();}, false);
        } else {
            document.attachEvent('oncontextmenu', function() { window.event.returnValue = false; });
        }
        this.scrollToTop();
        this.$.content.setClasses(this.documentContentClass);
        this.$.loader.setClasses(this.loaderClass);
        this.$.scroller.setClasses(this.openedDocScrollerClass);
    },

    components: [
        { kind: 'enyo.Scroller', name: 'scroller', fit: true, touchOverscroll: false, components: [
            { name: 'loader' },
            { tag: 'div', name: 'content', allowHtml: true }
        ]}
    ],

    /**
     * This function is called when the window size is changing and it should
     * change the opened document's height.
     * @param {Number} newHeight the new height in pixels
     */
    changeHeight: function(newHeight){
        this.applyStyle('height', newHeight + 'px');
        this.$.content.applyStyle('height', newHeight + 'px');
    },

    /**
     * This function returns the selected text in the window.
     * @return {String} the trimmed selected text
     */
    getSelectedText: function(){
        var result = '';
        if (window.getSelection) {
            result = window.getSelection();
        } else if (document.getSelection) {
            result = document.getSelection();
        } else if (document.selection) {
            result = document.selection.createRange().text;
        }
        result = result + '';
        if(jQuery){
            result = jQuery.trim(result + '');
        }
        return result;
    },

    /**
     * This function clear the document's content.
     */
    clearDoc: function(){
        this.$.content.destroyClientControls();
        this.$.content.render();
    },

    /**
     * This function shows a document.
     * @param {String} doc the document
     */
    showDoc: function(doc){
        this.show();
        this.scrollToTop();
        this.$.loader.hide();
        this.renderPreviewTemplate(doc);
    },

    /**
     * This function renders the preview document content through the Uduvudu Library
     * @param {String} doc the document
     */
    renderPreviewTemplate: function(doc){
        $("#" + this.$.content.getId()).append(uduvudu.process(doc));
    },

    /**
     * This function clears the document content, shows the loader and sends an
     * open doc request to a URL.
     * @param {String} documentURI the request URL
     */
    openDoc: function(documentURI){
        this.clearDoc();
        this.$.loader.show();
        this.documentURI = documentURI;

        var main = this;
        var url = CONSTANTS.OPEN_DOC_URL + '?iri=' + documentURI;
        var store = rdfstore.create();
        store.load('remote', url, function(success) {
            main.processOpenDocResponse(success, store);
        });
    },

    /**
     * This function runs when the response of the open doc ajax event is arrived.
     * It processes the response data, delete the bad type rows, parse it and call
     * the document show function.
     * @param {Boolean} success the ajax query was success or not
     * @param {Object} rdf the rdf object
     */
    processOpenDocResponse: function(success, rdf){
        this.showDoc(rdf);
    },

    /**
     * This function search the title in the rdf object.
     * @param {Object} rdf the rdf object
     * @returns {String} title, might by empty
     */
    getTitle: function(rdf){
        var title = '';
        var main = this;

        var query = 'SELECT * { ?s <http://purl.org/dc/terms/title> ?title }';
        rdf.execute(query, function(success, results) {
			try {
				var row = results[0];
				if (success && (isEmpty(row.title.lang) || row.title.lang === main.lang)) {
					title = row.title.value;
				}
			}
			catch(e) {
				title = 'Title not found';
			}
        });
        return title;
    },

    /**
     * This function scrolls the scrollbar to the top.
     */
    scrollToTop: function(){
        this.$.scroller.render();
        this.$.scroller.top = 0;
        this.$.scroller.setScrollTop(0);
        this.$.scroller.scrollTo(0,0);
    }

});
