/**
* @class DocumentList
*/
enyo.kind(
/** @lends DocumentList.prototype */
{
    name: 'DocumentList',
    kind: enyo.Control,

    published: {
        offset: 0,
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
        this.$.moreButton.hide();
    },

    components: [
        { tag: 'div', name: 'title' },
        { tag: 'div', name: 'documentsCount' },
        { kind: 'enyo.Scroller', name: 'scroller', fit: true, touchOverscroll: false, components: [
            { tag: 'div', name: 'list' },
            { name: 'loader' },
            { kind: onyx.Button, name: 'moreButton', content: 'More', ontap: 'moreBtnPress' }
        ]}
    ],

    onScroll: function(inSender, inEvent){
        console.log(inSender.scrollTop);
        console.log(inEvent);
    },

    moreBtnPress: function(){
        this.offset += 10;
        this.owner[this.moreDocumentsFunction](this.offset);
        this.$.loader.show();
        this.$.moreButton.hide();
    },
    /**
     * This function runs, when the user start a searching. It clears the list
     * and shows the loader.
     */
    startSearching: function(){
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
     */
    updateList: function(documents){
        this.documents = documents;
        this.$.list.destroyClientControls();
        if(documents.length > 0){
            for(var i=0;i<documents.length;++i){
                this.createComponent({
                    kind: 'ShortDocument',
                    classes: 'shortDocumentContainer',
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
        } else {
            this.$.list.setContent(this.noDataLabel);
            this.$.loader.hide();
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
        this.documents.push(documents);
        for(var i=0;i<documents.length;++i){
            this.createComponent({
                kind: 'ShortDocument',
                classes: 'shortDocumentContainer',
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
     * This functions scroll to the top.
     */
    scrollToTop: function(){
        this.$.scroller.top = 0;
        this.$.scroller.setScrollTop(0);
        this.$.scroller.scrollTo(0,0);
        this.render();
    }

});