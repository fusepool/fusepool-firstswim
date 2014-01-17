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
        minClassifyDoc: GLOBAL.items, // process button showing number
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
     * When the component is created the program sets the title's properties and
     * hides it.
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
        { kind: 'enyo.Scroller', name: 'scroller', fit: true, touchOverscroll: false, components: [
            { tag: 'div', name: 'list' },
            { name: 'loader' },
            { kind: onyx.Button, name: 'moreButton', content: 'More', ontap: 'moreBtnPress' }
        ]}
    ],

    /**
     * This function runs when the user activate/unactivate the ratings bar.
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
     * This funtion runs when the user pushes the 'Process' button.
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
     * This function send the classify ajax request to the server with an classify object.
     * @param {Object} classifyObject the classify object
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
     * This function runs after the the classify query.
     * @param {Boolean} success the classify request was success or not
     * @param {Object} classifyResponse the response of the classify request
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
     * This function runs when the user push the 'More' button. It shows the loader, hides the 'More' button and
     * send and ajax request with the new offset value.
     */
    moreBtnPress: function(){
        this.offset += GLOBAL.items;
        this.owner[this.moreDocumentsFunction](this.offset);
        this.$.loader.show();
        this.$.moreButton.hide();
    },
	
    /**
     * This function runs, when the user start a searching. It clears the list
     * and shows the loader.
     */
    startLoading: function(){
        this.$.list.setContent('');
        this.$.list.destroyClientControls();
        this.$.list.render();
        this.$.loader.show();
        this.$.moreButton.hide();
        this.$.activateSliders.hide();
    },

    /**
     * This function update the document list from a documents object. This
     * object contains the short documents.
     * @param {Array} documents the document list object
     * @param {String} searchWord the search word
     * @param {Array} checkedEntities the checked facets and type facets
     */
    updateList: function(documents, searchWord, checkedEntities){
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
                    shortDocumentClass: 'shortDocument',
                    contentClass: 'shortDocumentContent',
                    openDocEvent: this.openDocEvent,
                    openButtonClass: 'openDocButton',
                    container: this.$.list,
                    url: documents[i].url,
                    title: documents[i].title,
                    shortContent: documents[i].shortContent,
                    /**
                     * Adding the document type in the enyo component.
                     */
                    type: documents[i].type,
                    parentFunction: 'openDoc',
                    labelIds: [],
                    labelTexts: [],
					predictedLabelIds: ['asd','asdf'],
					predictedLabelTexts: ['asd','asdf'],
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
			if(documents.length<GLOBAL.items) {
				this.$.moreButton.hide();
			}
			else {
				this.$.moreButton.show();
			}
        } else {
            this.showMessage(this.noDataLabel);
            this.$.loader.hide();
            this.$.activateSliders.hide();
            this.$.list.render();
        }
        this.$.title.show();
        this.scrollToTop();
    },

    /**
     * This functions shows a message in the document list box
     * @param {String} message the message what we want to show
     */
    showMessage: function(message){
        this.$.list.destroyClientControls();
        this.$.list.setContent(message);
    },

    /**
     * This function updates the counts text
     */
    updateCounts: function(){
        this.$.documentsCount.setContent('('+this.documentsCount+')');
    },

    /**
     * This function add more documents to the existing document list.
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
                shortDocumentClass: 'shortDocument',
                contentClass: 'shortDocumentContent',
                openDocEvent: this.openDocEvent,
                openButtonClass: 'openDocButton',
                container: this.$.list,
                url: documents[i].url,
                title: documents[i].title,
                shortContent: documents[i].shortContent,
                /**
                 * Adding the document type in the enyo component.
                 */
                type: documents[i].type,
                parentFunction: 'openDoc',
                labelIds: [],
                labelTexts: [],
				predictedLabelIds: [],
				predictedLabelTexts: [],
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
		if(documents.length>0 && documents.length%GLOBAL.items==0) {
			this.$.moreButton.show();
		}
		else {
			this.$.moreButton.hide();
		}
    },

    /**
     * This function is called when the user would like to open a document to
     * preview. It calls a parent function, which can call the preview box to
     * open a document.
     * @param {String} url the request URL of the preview opening
     * @param {Object} inEvent the user mouse event (it is important in the desktop version)
     */
    openDoc: function(url, type, inEvent){
        this.owner[this.openDocFunction](url, type, inEvent);
        this.sendDocListAnnotation(url,type,'true');
    },
	
    /**
     * This function prepares an annotation about the activities related to the
	 * document list: which documents the user got back using what search query;
	 * whether the user clicked on the documents. Then calls a parent function 
	 * which actually sends the request to the server.
     * @param {String} docURI the URI of the document
     * @param {Number} click is it only displayed or clicked
     */
	sendDocListAnnotation: function(docURI,docType,click) {
		console.log("DocumentAnnotation: " +this.searchWord+ ", " + docURI +  ", " + docType + " clicked: " + click);
		var src = docType;
		var annoURI = 'http://fusepool.info/annostore/reranking/'+getRandomId();
		var annoBodyURI = 'http://fusepool.info/annostore/reranking/body/'+getRandomId();
		var currentDate = new Date().toISOString();
		var userURI =  'http://fusepool.info/users/anonymous';
		
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
                                
                                
//		var annotationString =	'@prefix xsd: <http://www.w3.org/2011/XMLSchema#> . ' + 
//                                        '@prefix oa: <http://www.w3.org/ns/oa#> . ' + 								
//                                        '@prefix fpanno: <http://fusepool.eu/ontologies/annostore#> . ' + 
//
//                                        'fpanno:datasource a oa:SpecificResource . ' +
//                                        'fpanno:patent a fpanno:datasource . ' +
//                                        'fpanno:pubmed a fpanno:datasource . ' +
//                                        'fpanno:rerankingAnnotation a oa:Annotation . ' + 
//
//                                        '<'+annoURI+'> a fpanno:rerankingAnnotation ; ' +
//                                        'oa:hasTarget fpanno:'+src+' ; ' +
//                                        'oa:hasBody <'+annoBodyURI+'> ; ' +
//                                        'oa:annotatedAt "'+currentDate+'" ; ' +
//                                        'oa:annotatedBy <'+userURI+'> . ' +
//
//                                        '<'+annoBodyURI+'> a ' +
//                                        'fpanno:rerankingBody ; ' +
//                                        'fpanno:hasQuery "'+this.searchWord+'" ; ' +
//                                        'fpanno:wasClicked "'+click+'"^^xsd:boolean ; ' + 
//                                        'fpanno:withPatentBoost 0.00 ; ' +
//                                        'fpanno:withPubmedBoost 0.00 . ';

		sendAnnotation(annotationString);
		// console.log(annotationString);
	},

    /**
     * This function updates the checkedNumber text with the offset and the checkedNumbers.
     */
    updateCheckedNumber: function(){
        this.$.checkedNumbers.setContent(this.checkedDocs + '/' + this.minClassifyDoc);
    },

    /**
     * This functions scroll to the top.
     */
    scrollToTop: function(){
        this.$.scroller.top = 0;
        this.$.scroller.setScrollTop(0);
        this.$.scroller.scrollTo(0,0);
        this.render();
    },

    /**
     * This function increses the number of checked documents and updates the
     * checked number text.
     */
    addCheck: function(){
        this.checkedDocs++;
        this.updateCheckedNumber();
        this.showOrHideProcessButton();
    },

    /**
     * This function decreases the number of checked documents and updates the
     * checked number text.
     */
    removeCheck: function(){
        this.checkedDocs--;
        this.updateCheckedNumber();
        this.showOrHideProcessButton();
    },

    /**
     * This functions decides that we should show the process button or not (by the checkedDocs value)
     * and shows or hides it
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
