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
        lang: 'en',
		openedDocStore: null
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
    showDoc: function(){
        this.show();
        this.scrollToTop();
		
		if(readCookie('currentUser') != 'anonymous' ) {
			var main = this;
			var request = new enyo.Ajax({
				method: 'GET',
				url: CONSTANTS.GET_PREDICATES_URL+'?user=' + readCookie('currentUser') + '&document=' + this.documentURL + '&query=' + readCookie('lastSearch'),
				handleAs: 'text',
				headers: { Accept : 'application/json', 'Content-Type' : 'application/x-www-form-urlencoded' },
				published: { timeout: 60000 }
			});
			request.go();
			request.response(this, function(inSender, inResponse) {
			
				var predicates = JSON.parse(inResponse);
			
				main.$.predicateAnnotatorPanel.createComponent({
					kind: 'PredicateAnnotator',
					searchWord: main.searchWord,
					documentURL: main.documentURL,
					predicates: predicates
				});
				main.$.predicateAnnotatorPanel.render();
				main.filterGraph(predicates);
			});
		}
		else {
			this.showVisualization(this.openedDocStore);
			this.$.loader.hide();
		}
    },
	
	filterGraph: function(predicates) {
				
		this.clearVisualization();
        this.$.loader.show();
		
		var main = this;
		this.openedDocStore.graph(function(success, triples) {
			
			for(var i=0;i<predicates.length;i++) {
				if(!predicates[i].accepted) {
					triples.removeMatches(null, predicates[i].text, null);
				}
			}
			
			var tempStore = rdfstore.create();				
			tempStore.insert(triples, function() {
				main.showVisualization(tempStore);
				main.$.loader.hide();
			});
			
		});
	},
	
	clearVisualization: function() {
		$("#" + this.$.content.getId()).html('');
	},
	
	showVisualization: function(store) {
		$("#" + this.$.content.getId()).html('').append(uduvudu.process(store));
	},

    /**
     * This function clears the document content, shows the loader and sends an
     * open doc request to a URL.
     * @param {String} documentURL the request URL
     */
    openDoc: function(documentURL){
        this.clearAll();
        this.$.loader.show();
        this.documentURL = documentURL;

        var main = this;
		if(readCookie('viewType') == "entityList") {
			var url = CONSTANTS.ENTITY_DETAILS_URL + '?entityURI=' + documentURL;
		}
		else {
			var url = CONSTANTS.OPEN_DOC_URL + '?iri=' + documentURL;
		}
        this.openedDocStore = rdfstore.create();
        this.openedDocStore.load('remote', url, this.openedDocStore.rdf, function(success) {
			main.showDoc();
        });
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
