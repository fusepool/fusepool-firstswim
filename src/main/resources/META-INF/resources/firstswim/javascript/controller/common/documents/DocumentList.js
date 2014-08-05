/**
* @class DocumentList
*/
enyo.kind(
/** @lends DocumentList.prototype */
{
    name: 'DocumentList',
    kind: enyo.Control,

    published: {
        activeClassify: false,
        offset: 0,
        searchWord: '',
        checkedDocs: 0,
        minClassifyDoc: readCookie('minClassifyDoc'),  // process button showing number
        documents: null,
        scrollerClass: '',
        titleClass: '',
        documentsCountClass: '',
        titleContent: '',
        classifyFinishFunction: '',
        noDataLabel: '',
        openDocFunction: '',
        openDocEvent: 'ontap',
        moreButtonClass: '',
        moreDocumentsFunction: '',
		documentsCount: 0
    },

    /**
     * When the component is created, the program sets the title's properties and
     * hides it.
	 * @method create
     */
    create: function(){
        this.inherited(arguments);
        this.$.loader.hide();
        this.$.title.setContent(this.titleContent);
        this.$.title.setClasses(this.titleClass);
        this.$.documentsCount.setClasses(this.documentsCountClass);
        this.$.loader.setClasses(this.loaderClass);
        this.$.scroller.setClasses(this.scrollerClass);
        this.$.moreButton.setClasses(this.moreButtonClass);
        this.$.activateSliders.hide();
        this.$.labelPredictionSettings.hide();
        this.$.processButton.hide();
        this.$.checkedNumbers.hide();
        this.$.moreButton.hide();
    },

    components: [
        { tag: 'div', name: 'title' },
        { tag: 'div', name: 'documentsCount' },
        { tag: 'div', name: 'activateSliders', classes: 'activateSliders', components: [
            { tag: 'div', classes: 'sliderText', content: 'Classify:' },
            { kind: enyo.Checkbox, name: 'activateCB', ontap: 'activateChecking' },
            { tag: 'div', name: 'checkedNumbers', classes: 'checkedNumbers' },
            { kind: onyx.Button, name: 'processButton', classes: 'processClassifyButton', content: 'Process', ontap: 'processClassify' }
        ]},
        { tag: 'div', name: 'labelPredictionSettings', classes: 'activateSliders', components: [
            { tag: 'div', classes: 'sliderText', content: 'Label prediction:' },
            { kind: enyo.Checkbox, name: 'labelPredictionToggle', ontap: 'toggleLabelPrediction', checked: true }
        ]},
        { kind: 'enyo.Scroller', name: 'scroller', fit: true, touchOverscroll: false, components: [
            { tag: 'div', name: 'list' },
            { name: 'loader' },
            { kind: onyx.Button, name: 'moreButton', content: 'More', ontap: 'moreBtnPress' }
        ]}
    ],

	/**
     * This function runs when the user activates/deactivates label prediction.
	 * It sets the proper cookie value and calls the label prediction toggle
	 * function of every 'shortDocument' children kinds.
	 * @method toggleLabelPrediction
     * @param {Object} inSender the activator checkbox
	*/
    toggleLabelPrediction: function(inSender){
		createCookie('labelPrediction', !inSender.checked, 30); //this is weird
        var shortDocuments = this.$.list.children;
        for(var i=0;i<shortDocuments.length;i++){
            shortDocuments[i].togglePredictedLabelLists(readCookie('labelPrediction'));
        }
    },
	
    /**
     * This function runs when the user activates/deactivates the rating bar.
	 * @method activateChecking
     * @param {Object} inSender the activator checkbox
     */
    activateChecking: function(inSender){
        var checked = !inSender.checked;
        if(checked){
            this.activeClassify = true;
            this.$.checkedNumbers.show();
        } else {
            this.activeClassify = false;
            this.$.checkedNumbers.hide();
        }
        var shortDocuments = this.$.list.children;
        for(var i=0;i<shortDocuments.length;i++){
            shortDocuments[i].updateRatings(checked);
        }
        this.showOrHideProcessButton();
    },

    /**
     * This function runs when the user clicks the 'Process' button.
	 * It collects the sufficient information (checked facets,
	 * search word and ratings) and calls the function which actually 
	 * sends a classify request using this classify object.
	 * @method processClassify
     */
    processClassify: function(){
        var classifyObject = {};

        // Set the content store properties
        classifyObject.contentStoreUri = CONSTANTS.SEARCH_URL;
        classifyObject.contentStoreViewUri = CONSTANTS.SEARCH_URL;

        // Set the search properties
        classifyObject.searchs = [];
        classifyObject.searchs.push(this.searchWord);

        // Set the checked facets and type facets
        classifyObject.type = [];
        classifyObject.subject = [];
        for(var i=0;i<this.checkedEntities.length;i++){
            if(this.checkedEntities[i].typeFacet){
                classifyObject.type.push(this.checkedEntities[i].id);
            } else {
                classifyObject.subject.push(this.checkedEntities[i].id);
            }
        }

        // Set the positive and negative documents
        classifyObject.labels = {};
        var shortDocuments = this.$.list.children;
        for(var i=0;i<shortDocuments.length;i++){
            if(shortDocuments[i].getSlideValue() !== 1){
                var url = shortDocuments[i].getUrl();
                var label = shortDocuments[i].getSlideValue() === 2 ? 'Positive' : 'Negative';
                classifyObject.labels[url] = label;
            }
        }
        this.activeClassify = false;
        this.$.checkedNumbers.hide();
        this.$.activateCB.setValue(false);
        this.startLoading();
        this.sendClassifyRequest(classifyObject);
    },

    /**
     * This function sends an ajax request to the server for classification
	 * using a classify object.
	 * @method sendClassifyRequest
     * @param {Object} classifyObject the classify object containing every sufficient information
     */
    sendClassifyRequest: function(classifyObject){
        var sendJSON = JSON.stringify(classifyObject);
        var request = new enyo.Ajax({
            method: 'POST',
            url: CONSTANTS.CLASSIFY_URL,
            handleAs: 'text',
            headers: { Accept: 'text/turtle', 'Content-Type' : 'application/json'},
            postBody: sendJSON,
            published: { timeout: 60000 }
        });
        request.go();
        request.error(this, function(){
            this.processClassifyResponse(false, null);
        });
        request.response(this, function(inSender, inResponse) {
            this.processClassifyResponse(true, inResponse);
        });
    },

    /**
     * This function runs when the classifying request returned a response.
	 * It calls the classify response processor function of the parent kind.
	 * @method processClassifyResponse
     * @param {Boolean} success success status of the classification request
     * @param {Object} classifyResponse the response of the classification request
     */
    processClassifyResponse: function(success, classifyResponse){
        this.$.loader.hide();
        var main = this;
        if(success){
            var store = rdfstore.create();
            store.load('text/turtle', classifyResponse, function(success, results){
                if(success){
                    main.owner[main.classifyFinishFunction](store, main.searchWord);
                } else {
                    main.showMessage('There was a problem with the data parsing!');
                }
            });
        } else {
            this.showMessage('There was an error in the classify request!');
        }
    },

    /**
     * This function runs when the user clicks the 'More' button.
	 * It shows the loader, hides the 'More' button and sends and ajax
	 * request with the new offset value.
	 * @method moreBtnPress
     */
    moreBtnPress: function(){
		this.offset += readCookie('items');
		this.owner[this.moreDocumentsFunction](this.offset);
		this.$.loader.show();
		this.$.moreButton.hide();
    },
	
    /**
     * This function runs when the user fires a search. It clears the list
     * and shows the loader.
	 * @method startLoading
     */
    startLoading: function(){
        this.$.list.setContent('');
        this.$.list.destroyClientControls();
        this.$.list.render();
        this.$.loader.show();
        this.$.moreButton.hide();
        this.$.activateSliders.hide();
        this.$.labelPredictionSettings.hide();
    },

    /**
     * This function updates the document list using a document object. This
     * object contains the short documents.
	 * @method updateList
     * @param {Array} documents the document list object
     * @param {String} searchWord the search word
     * @param {Array} checkedEntities checked facets and type facets
     */
    updateList: function(documents, searchWord, checkedEntities){
		createCookie('lastSearch',searchWord,30);
        this.checkedEntities = checkedEntities;
        this.searchWord = searchWord;
        this.offset = 0;
        this.checkedDocs = 0;
        this.updateCheckedNumber();
        this.showOrHideProcessButton();
		
        this.documents = documents;
        this.$.list.destroyClientControls();
        if(documents.length > 0){
            for(var i=0;i<documents.length;++i){
                this.createComponent({
                    kind: 'ShortDocument',
                    classes: 'shortDocumentContainer',
                    addCheckFunction: 'addCheck',
                    removeCheckFunction: 'removeCheck',
                    showSlidebar: this.activeClassify,
                    titleClass: 'shortDocumentTitle',
                    shortDocumentClass: (readCookie('viewType') == 'entityList' ? 'personItem' : 'shortDocument'),
                    contentClass: 'shortDocumentContent',
                    openDocEvent: this.openDocEvent,
                    openButtonClass: 'openDocButton',
                    container: this.$.list,
                    url: documents[i].url,
                    title: documents[i].title,
                    shortContent: cutStr(removeTags(documents[i].shortContent),350),
                    type: documents[i].type,
                    parentFunction: 'openDoc',
                    labelListClass: 'labelList',
                    moreLabelsPanelClass: 'moreLabelsPanel',
                    moreLabelInputClass: 'moreLabelInput',
                    moreLabelInputDecClass: 'moreLabelInputDec',
                    addLabelButtonClass: 'addLabelButton',
                    hideAddingPanelButtonClass: 'hideAddingPanelButton',
                    searchWord: this.searchWord
                });
               this.sendDocListAnnotation(documents[i].url,documents[i].type,'false');
            }
            this.$.loader.hide();
            this.$.list.render();
            this.$.activateSliders.show();
			if(readCookie('viewType') != 'entityList') {
				this.$.labelPredictionSettings.show();
				this.$.moreButton.show();
			}
			else {
				this.$.activateSliders.hide();
			}
        } else {
            this.showMessage(this.noDataLabel);
            this.$.loader.hide();
            this.$.activateSliders.hide();
            this.$.labelPredictionSettings.hide();
            this.$.list.render();
        }
        this.$.title.show();
        this.scrollToTop();
    },

    /**
     * This function shows a message in the document list box.
	 * @method showMessage
     * @param {String} message the message what we want to show
     */
    showMessage: function(message){
        this.$.list.destroyClientControls();
		this.$.list.createComponent({ content: message,	classes: 'docListMessageLabel'});
    },

    /**
     * This function updates the document counter.
	 * @method updateCounts
     */
    updateCounts: function(){
        this.$.documentsCount.setContent('('+this.documentsCount+')');
    },

    /**
     * This function adds more documents to the existing document list.
	 * @method addMoreDocuments
     * @param {Array} documents the new item of documents
     */
    addMoreDocuments: function(documents){
        this.updateCheckedNumber();
        this.documents.push(documents);
		
		for(var i=0;i<documents.length;++i){
            this.createComponent({
                kind: 'ShortDocument',
                classes: 'shortDocumentContainer',
                addCheckFunction: 'addCheck',
                removeCheckFunction: 'removeCheck',
                showSlidebar: this.activeClassify,
                titleClass: 'shortDocumentTitle',
                shortDocumentClass: (readCookie('viewType') == 'entityList' ? 'personItem' : 'shortDocument'),
                contentClass: 'shortDocumentContent',
                openDocEvent: this.openDocEvent,
                openButtonClass: 'openDocButton',
                container: this.$.list,
                url: documents[i].url,
                title: documents[i].title,
                shortContent: cutStr(removeTags(documents[i].shortContent),350),
                type: documents[i].type,
                parentFunction: 'openDoc',
                labelListClass: 'labelList',
                moreLabelsPanelClass: 'moreLabelsPanel',
                moreLabelInputClass: 'moreLabelInput',
                moreLabelInputDecClass: 'moreLabelInputDec',
                addLabelButtonClass: 'addLabelButton',
                hideAddingPanelButtonClass: 'hideAddingPanelButton',
                searchWord: this.searchWord
            });
            this.sendDocListAnnotation(documents[i].url, documents[i].type, 'false');
        }
        this.$.loader.hide();
        this.$.list.render();
		this.$.moreButton.show();
    },

    /**
     * This function is called when the user opens a document to preview.
     * It calls a parent function, which calls the preview box to open it.
	 * @method openDoc
     * @param {String} url the URL of the document
     * @param {Object} inEvent the mouse event (important in the desktop version)
     */
    openDoc: function(url, type, inEvent){
        this.owner[this.openDocFunction](url, inEvent);
        this.sendDocListAnnotation(url, type, 'true');
    },
	
    /**
     * This function prepares an annotation about the activities related to the
	 * document list: which documents the user got using which search query;
	 * whether the user clicked on the documents. It also calls a parent function 
	 * which actually sends the request to the server.
	 * @method sendDocListAnnotation
     * @param {String} docURI the URI of the document
     * @param {Number} click is it only displayed or clicked
     */
	sendDocListAnnotation: function(docURI, docType, click) {
		// console.log("DocumentAnnotation: " +this.searchWord+ ", " + docURI +  ", " + docType + " clicked: " + click);
		var src = docType;
		var currentDate = new Date().toISOString();
		var userURI =  'http://fusepool.info/users/'+readCookie('currentUser');
		
		var annotationString = '@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> . ' +
								'@prefix xsd: <http://www.w3.org/2011/XMLSchema#> . ' +
								'@prefix cnt: <http://www.w3.org/2011/content#> . ' +
								'@prefix oa: <http://www.w3.org/ns/oa#> . ' +
								'@prefix fpanno: <http://fusepool.eu/ontologies/annostore#> . ' +
								'' +
								'_:1 a fpanno:RerankingAnnotation , oa:Annotation ; ' +
								'	oa:hasBody _:2 ; ' +
								'	oa:hasTarget _:3 ; ' +
								'	oa:annotatedAt "'+currentDate+'" ; ' +
								'	oa:annotatedBy <'+userURI+'> . ' +
								'' +	
								'_:2 a fpanno:RerankingBody ; ' +
								'	fpanno:hasQuery "'+this.searchWord+'" ; ' +
								'	fpanno:wasClicked "'+click+'"^^xsd:boolean ; ' +
								'	fpanno:withPatentBoost 0.78 ; ' +
								'	fpanno:withPubmedBoost 0.54 . ' +
								'' +
								'_:3 a <'+docType+'> . ';

		sendAnnotation(annotationString);
	},

    /**
     * This function updates the 'checkedNumber' text with the offset
	 * and the checked numbers.
	 * @method updateCheckedNumber
     */
    updateCheckedNumber: function(){
        this.$.checkedNumbers.setContent(this.checkedDocs + '/' + this.minClassifyDoc);
    },

    /**
     * This function scrolls to the top of the document list.
	 * @method scrollToTop
     */
    scrollToTop: function(){
        this.$.scroller.top = 0;
        this.$.scroller.setScrollTop(0);
        this.$.scroller.scrollTo(0,0);
    },

    /**
     * This function increases the number of checked documents and updates the
     * checked number text.
	 * @method addCheck
     */
    addCheck: function(){
        this.checkedDocs++;
        this.updateCheckedNumber();
        this.showOrHideProcessButton();
    },

    /**
     * This function decreases the number of checked documents and updates the
     * checked number text.
	 * @method removeCheck
     */
    removeCheck: function(){
        this.checkedDocs--;
        this.updateCheckedNumber();
        this.showOrHideProcessButton();
    },

    /**
     * This function shows/hides the process button based on the
	 * current value of 'checkedDocs'.
	 * @method showOrHideProcessButton
     */
    showOrHideProcessButton: function(){
        if(this.activeClassify && this.checkedDocs >= this.minClassifyDoc){
            this.$.processButton.show();
        }
        if(!this.activeClassify || this.checkedDocs < this.minClassifyDoc){
            this.$.processButton.hide();
        }
    }

});
