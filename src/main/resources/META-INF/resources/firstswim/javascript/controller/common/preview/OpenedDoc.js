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
        loaderClass: ''
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
    },

    components: [
        { kind: 'enyo.Scroller', name: 'scroller', fit: true, touch: true, touchOverscroll: false, components: [
            { name: 'loader' },
            { tag: 'div', name: 'content', allowHtml: true }
        ]}
    ],

    /**
     * This function is called when the window size is changing and it should
     * change the opened document's height.
     * @param newHeight the new height in pixels
     */
    changeHeight: function(newHeight){
        this.applyStyle('height', newHeight + 'px');
        this.$.content.applyStyle('height', newHeight + 'px');
    },

    /**
     * This function returns the trimmed selected text in the window.
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
        this.documentContent = '';
        this.$.content.setContent('');
    },

    /**
     * This function shows a document.
     * @param docText the document's content
     */
    showDoc: function(docText){
        if(docText !== ''){
            var documentContent = docText.replace(/\|/g,'<br/>');
            this.$.content.setContent(documentContent);
        } else {
            this.$.content.setContent(this.noDataLabel);
        }
        this.scrollToTop();
        this.$.loader.hide();
    },

    /**
     * This function clear the document content, shows the loader and send an
     * open doc request to a URL.
     * @param documentURL the request URL
     */
    openDoc: function(documentURL){
        this.clearDoc();
        this.$.loader.show();
        this.documentURL = documentURL;
        var request = new enyo.Ajax({
            method: 'GET',
            url: documentURL + '.meta',
            handleAs: 'text',
            headers: { Accept: 'application/rdf+xml' }
        });
        request.go();
        request.response(this, function(inSender, inResponse) {
            this.processOpenDocResponse(inResponse);
        });
    },

    /**
     * This function runs when the response of the open doc ajax event is arrived.
     * It processes the response data, delete the bad type rows, parse it and call
     * the document show function.
     * @param data the response data
     */
    processOpenDocResponse: function(data){
        // Delete bad type rows, and replace new lines to spaces
        var textArray = data.split('\n');
        var newText = '';
        for(var i=0;i<textArray.length;i++){
            var row = textArray[i];
            if(row.indexOf('http://www.w3.org/2001/XMLSchema#base64Binary') === -1){
                newText += textArray[i];
                if(row.indexOf('<') === -1 && row.indexOf('>') === -1 && row.indexOf('xmlns') === -1){
                    newText += '|';
                } else {
                    newText += ' ';
                }
            }
        }
        newText = newText.substring(0, newText.length-1);

        var parsedData = new DOMParser().parseFromString(newText,'text/xml');
        this.rdf = jQuery.rdf();
        this.rdf.load(parsedData, {});

        var docText = '';
        this.rdf.where('?s <http://rdfs.org/sioc/ns#content> ?o').each(function(){
            docText = this.o.value;
        });
        if(docText === ''){
            docText = this.noDataLabel;
        }
        this.showDoc(docText);
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