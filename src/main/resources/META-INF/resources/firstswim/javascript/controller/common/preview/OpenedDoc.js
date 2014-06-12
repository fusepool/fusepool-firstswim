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
            { tag: 'div', name: 'content', allowHtml: true },
            { tag: 'div', name: 'predicateAnnotatorPanel', allowHtml: true }
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
     * This function clears the document's content.
     */
    clearAll: function(){
		this.$.content.setContent('');
        this.$.content.destroyClientControls();
        this.$.content.render();
		this.$.predicateAnnotatorPanel.setContent('');
        this.$.predicateAnnotatorPanel.destroyClientControls();
        this.$.predicateAnnotatorPanel.render();
    },

    /**
     * This function shows a document.
     * @param {String} rdf the document
     */
    showDoc: function(rdf){
        this.show();
        this.scrollToTop();
        this.$.loader.hide();
		this.createPredicateAnnotator(rdf);
        this.renderPreviewTemplate(rdf);
    },
	
	createPredicateAnnotator: function(rdf) {
		var props = [];
		var query = 'SELECT ?p { ?s ?p ?o }';
		var main = this;
		rdf.execute(query, function(success, results) {
			if (success && results.length > 0) {
				for(var i=0;i<results.length;i++) {
					if($.inArray(results[i].p.value, props)==-1) {
						props.push(results[i].p.value);
					}
				}
				main.$.predicateAnnotatorPanel.createComponent({
                    kind: 'PredicateAnnotator',
                    searchWord: main.searchWord,
					documentURL: main.documentURL,
					predicates: props
                });
				main.$.predicateAnnotatorPanel.render();
			}
		});
    },

    /**
     * This function renders the preview document content through the Uduvudu Library
     * @param {String} rdf the document
     */
    renderPreviewTemplate: function(rdf){
        $("#" + this.$.content.getId()).append(uduvudu.process(rdf));
    },

    /**
     * This function clears the document content, shows the loader and sends an
     * open doc request to a URL.
     * @param {String} documentURI the request URL
     */
    openDoc: function(documentURI){
        this.clearAll();
        this.$.loader.show();
        this.documentURI = documentURI;

        var main = this;
		if(GLOBAL.viewType == "entityList") {
			var url = CONSTANTS.ENTITY_DETAILS_URL + '?entityURI=' + documentURI;
		}
		else {
			var url = CONSTANTS.OPEN_DOC_URL + '?iri=' + documentURI;
		}
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
