enyo.kind({
    tag: 'div',
    name: 'OpenedDoc',

    published: {
        documentURL: '',
        noDataLabel: '',
        documentTitleClass: '',
        documentContentClass: '',
        loaderClass: ''
    },

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

    /** This function returns the trimmed selected text in the window */
    getSelectedText: function(){
        var result = '';
        if (window.getSelection) {
            result = window.getSelection();
        } else if (document.getSelection) {
            result = document.getSelection();
        } else if (document.selection) {
            result = document.selection.createRange().text;
        }
        return jQuery.trim(result + '');
    },

    clearDoc: function(){
        this.documentContent = '';
        this.$.content.setContent('');
    },

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
        this.showDoc(docText);
    },

    scrollToTop: function(){
        this.$.scroller.render();
        this.$.scroller.top = 0;
        this.$.scroller.setScrollTop(0);
        this.$.scroller.scrollTo(0,0);
    }

});