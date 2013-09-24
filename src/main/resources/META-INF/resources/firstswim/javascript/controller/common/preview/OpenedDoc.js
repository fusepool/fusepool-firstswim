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
        this.scrollToTop();
        this.$.loader.hide();
        this.renderPreviewTemplate(doc);
    },

    /**
     * This function render the preview document content with Handlebars template.
     * @param {String} doc the document
     */
    renderPreviewTemplate: function(doc){
        var templateScript = $("#preview-template").html(); 
        var template = Handlebars.compile(templateScript);
        $("#" + this.$.content.getId()).append(template(doc));
    },

    /**
     * This function clear the document content, shows the loader and send an
     * open doc request to a URL.
     * @param {String} documentURL the request URL
     */
    openDoc: function(documentURL){
        this.clearDoc();
        this.$.loader.show();
        this.documentURL = documentURL;

        var main = this;
        var url = CONSTANTS.OPEN_DOC_URL + '?iri=' + documentURL;
        var store = rdfstore.create();
        store.load('remote', url, function(success) {
            main.processOpenDocResponse(success, store);
        });
    },

    /**
     * This functions gets the details of a document and preprocess for direct 
     * use by the template. 
     * @param {Object} rdf the data as an rdf object
     */
    processDocDetails: function(rdf){
        console.log('Preview details coming soon with uduvudu.');
//        var rdfObj = rdf.databank.dump();
//        var docName = _.find(_.keys(rdfObj), function (item) {return ((item.search("/doc/patent/") > 0) || (item.search("/doc/pmc/") > 0));});
//        var doc = _.pick(rdfObj, docName);
//
//        var getName = /(#|\/)([^#\/]*)$/;
//        var docDetails = _.object(_.toArray(_.map(doc[docName], function (item,index) {
//            var arr = [];
//            regex = getName.exec(index);
//            if (regex) {arr[0] = regex[2];} else {arr[0] = index;};
//            arr[1] = _.map(item, function(subitem){return subitem.value;});
//            return arr;
//        })));
//
//        docDetails['documentURL'] = [docName];
//        return docDetails;
          return null;
    },

    /**
     * This function runs when the response of the open doc ajax event is arrived.
     * It processes the response data, delete the bad type rows, parse it and call
     * the document show function.
     * @param {Boolean} success the ajax query was success or not
     * @param {String} rdf the rdf object
     */
    processOpenDocResponse: function(success, rdf){
        var docDetails = this.processDocDetails(rdf); 
        var docText = this.getContent(rdf);
        if(docText === ''){
            docText = this.noDataLabel;
        } else {
            docText = replaceAll(docText, '\n', '<br />', false);
        }
        var title = this.getTitle(rdf);
        this.showDoc({content: docText, title: title, details: docDetails});
    },

    /**
     * This function search the content in the rdf object.
     * @param {Object} rdf the rdf object
     * @returns {String} content, might by empty
     */
    getContent: function(rdf){
        var content = '';
        var main = this;

        var query = 'SELECT * { ?s <http://purl.org/dc/terms/abstract> ?content1';
        query += '      OPTIONAL { ?s <http://rdfs.org/sioc/ns#content> ?content2 }';
        query += '}';
        rdf.execute(query, function(success, results) {
            if (success) {
                var row = results[0];
                if(!isEmpty(row.content1) && (row.content1.lang === main.lang || isEmpty(row.content1.lang))){
                    content = row.content1.value;
                } else {
                    content = row.content2.value;
                }
            }
        });
        return content;
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
            var row = results[0];
            if (success && (isEmpty(row.title.lang) || row.title.lang === main.lang)) {
                title = row.title.value;
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
