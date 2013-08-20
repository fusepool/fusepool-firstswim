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
     * @param {String} docText the document's content
     * @param {String} title the document's title
     */
    showDoc: function(doc){

        this.scrollToTop();
        this.$.loader.hide();
        this.renderPreviewTemplate(doc);
    },

    /**
     * This function render the preview document content with Handlebars template.
     * @param {String} title the title of the document
     * @param {String} content the content of the document
     */
    renderPreviewTemplate: function(doc){
        var templateScript = $("#preview-template").html(); 
        var template = Handlebars.compile(templateScript);
        console.debug(doc);
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
        var request = new enyo.Ajax({
            method: 'GET',
            url: CONSTANTS.OPEN_DOC_URL,
            handleAs: 'text',
            headers: { Accept: 'application/rdf+xml' }
        });
        request.go({ iri : documentURL });
        request.response(this, function(inSender, inResponse) {
            this.processOpenDocResponse(inResponse);
        });
    },

    /**
     * This function runs when the response of the open doc ajax event is arrived.
     * It processes the response data, delete the bad type rows, parse it and call
     * the document show function.
     * @param {String} data the response data
     */
    processOpenDocResponse: function(data){
        var rdf = this.createPreviewRdfObject(data);

        var rdfObj = rdf.databank.dump();
        //find patent name
        var docName = _.find(_.keys(rdfObj), function (item) {return ((item.search("/doc/patent/") > 0) || (item.search("/doc/pmc/") > 0));});
        var doc = _.pick(rdfObj, docName);

        var getName = /(#|\/)([^#\/]*)$/ 

        var docDetails = _.object(_.toArray(_.map(doc[docName], function (item,index) {
            var arr = [];
            regex = getName.exec(index);
            if (regex) {arr[0] = regex[2];} else {arr[0] = index;};
            arr[1] = _.map(item, function(subitem){return subitem.value});
            return arr;
        })));

        var docText = this.getContent(rdf);
        if(docText === ''){
            docText = this.noDataLabel;
        } else {
            docText = docText.replace(/\|/g,'<br/>');
        }
        var title = this.getTitle(rdf);
        this.showDoc({content: docText, title: title, details: docDetails});
    },

    /**
     * This function create rdf for preview document from the reponse data.
     * @param {String} data the response data
     */
    createPreviewRdfObject: function(data){
        // new lines to spaces
        var textArray = data.split('\n');
        var newText = '';
        for(var i=0;i<textArray.length;i++){
            var row = textArray[i];
            newText += replaceAllInTags(textArray[i], '"', '\'\'', '>', '<');
            if(row.indexOf('<') === -1 && row.indexOf('>') === -1 && row.indexOf('xmlns') === -1){
                newText += '|';
            } else {
                newText += ' ';
            }
        }
        newText = newText.substring(0, newText.length-1);
        var parsedData = new DOMParser().parseFromString(newText,'text/xml');
        var rdf = jQuery.rdf();
        rdf.load(parsedData, {});
        return rdf;
    },

    /**
     * This function search the content in the rdf object.
     * @param {Object} rdf the rdf object
     * @returns {String} content, might by empty
     */
    getContent: function(rdf){
        var content = '';
        var main = this;
        rdf.where('?s <http://purl.org/dc/terms/abstract> ?o').each(function(){
            if(this.o.lang === main.lang || isEmpty(this.o.lang)){
                content = deleteSpeechMarks(this.o.value + '');
            }
        });
        if(!isEmpty(content)){
            return content;
        }
        rdf.where('?s <http://rdfs.org/sioc/ns#content> ?o').each(function(){
            content = this.o.value + '';
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
        rdf.where('?s <http://purl.org/dc/terms/title> ?o').each(function(){
            if(this.o.lang === main.lang || isEmpty(this.o.lang)){
                title = deleteSpeechMarks(this.o.value + '');
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
