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
        noDataLabel: '',
        openDocFunction: '',
        openDocEvent: 'ontap',
        moreButtonClass: '',
        moreDocumentsFunction: ''
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
     * This funtions runs when the user oush the 'Process' button.
     */
    processClassify: function(){
        this.startLoading();
        var classifyObject = {};
        classifyObject.contentStoreUri = CONSTANTS.SEARCH_URL;
        classifyObject.contentStoreViewUri = CONSTANTS.SEARCH_URL;

        classifyObject.searchs = [];
        classifyObject.searchs.push(this.searchWord);

        classifyObject.labels = {};
        var shortDocuments = this.$.list.children;
        for(var i=0;i<shortDocuments.length;i++){
            if(shortDocuments[i].getSlideValue() !== 1){
                var url = shortDocuments[i].getUrl();
                var label = shortDocuments[i].getSlideValue() === 2 ? 'Positive' : 'Negative';
                classifyObject.labels[url] = label;
            }
        }
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
            headers: { Accept: 'application/rdf+xml', 'Content-Type' : 'application/json'},
            postBody: sendJSON,
            published: { timeout: 60000 }
        });
        request.go();
        request.response(this, function(inSender, inResponse) {
            this.processClassifyResponse(inResponse);
        });
    },

    /**
     * This function runs after the the classify query.
     * @param {Object} inResponse the response of the classify request
     */
    processClassifyResponse: function(inResponse){
        console.log(inResponse);
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
     * This function clears the list of the documents, hides the 'More' button and shows the loader.
     */
    startLoading: function(){
        this.$.list.setContent('');
        this.$.list.destroyClientControls();
        this.$.list.render();
        this.$.loader.show();
        this.$.moreButton.hide();
    },

    /**
     * This function update the document list from a documents object. This
     * object contains the short documents.
     * @param {Array} documents the document list object
     * @param {String} searchWord the search word
     */
    updateList: function(documents, searchWord){
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
                    showSlidebar: this.$.activateCB.getValue(),
                    titleClass: 'shortDocumentTitle',
                    contentClass: 'shortDocument',
                    openDocEvent: this.openDocEvent,
                    openButtonClass: 'openDocButton',
                    container: this.$.list,
                    url: documents[i].url,
                    title: documents[i].title,
                    shortContent: documents[i].shortContent,
                    parentFunction: 'openDoc'
                });
            }
            this.$.loader.hide();
            this.$.list.render();
            this.$.moreButton.show();
            this.$.activateSliders.show();
        } else {
            this.$.list.setContent(this.noDataLabel);
            this.$.loader.hide();
            this.$.activateSliders.hide();
            this.$.list.render();
        }
        this.$.title.show();
        this.scrollToTop();
    },

    /**
     * This function update the counts text with the new count value
     * @param {Number} count the count of documents
     */
    updateCounts: function(count){
        this.$.documentsCount.setContent(count);
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
                showSlidebar: this.$.activateCB.getValue(),
                titleClass: 'shortDocumentTitle',
                contentClass: 'shortDocument',
                openDocEvent: this.openDocEvent,
                openButtonClass: 'openDocButton',
                container: this.$.list,
                url: documents[i].url,
                title: documents[i].title,
                shortContent: documents[i].shortContent,
                parentFunction: 'openDoc'
            });
        }
        this.$.loader.hide();
        this.$.list.render();
        this.$.moreButton.show();
    },

    /**
     * This function is called when the user would like to open a document to
     * preview. It calls a parent function, which can call the preview box to
     * open a document.
     * @param {String} url the request URL of the preview opening
     * @param {Object} inEvent the user mouse event (it is important in the desktop version)
     */
    openDoc: function(url, inEvent){
        this.owner[this.openDocFunction](url, inEvent);
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
