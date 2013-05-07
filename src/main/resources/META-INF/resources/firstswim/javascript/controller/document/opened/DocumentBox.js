enyo.kind({
    tag: 'div',
    name: 'DocumentBox',

    published: {
        // -- labels
        documentTitle: '',
        documentContent: '',
        noDataLabel: '',
        // -- classes
        documentTitleClass: '',
        documentContentClass: '',
        positiveRateClass: '',
        negativeRateClass: '',
        rateDivClass: ''
    },

    create: function(){
        this.inherited(arguments);

        // overwrite click listener
        if (document.addEventListener) {
            document.addEventListener('contextmenu', function(e) { e.preventDefault();}, false);
        } else {
            document.attachEvent('oncontextmenu', function() { window.event.returnValue = false; });
        }
        this.hide();
        this.scrollToTop();

        this.$.positiveRate.setClasses(this.positiveRateClass);
        this.$.negativeRate.setClasses(this.negativeRateClass);
        this.$.title.setClasses(this.documentTitleClass);
        this.$.content.setClasses(this.documentContentClass);
        this.$.rate.setClasses(this.rateDivClass);
    },

    components: [
        { kind: 'enyo.Scroller', name: 'scroller', fit: true, touch: true, touchOverscroll: false, components: [
            { tag: 'div', name: 'rate', components: [
                { tag: 'div', name: 'positiveRate', ontap: 'showPositive' },
                { tag: 'div', name: 'negativeRate', ontap: 'showNegative' }
            ]},
            { tag: 'div', name: 'title' },
            { tag: 'div', allowHtml: true, onmouseup: 'clickText', name: 'content' }
        ]}
    ],

    getSelectedText: function(){
        if (window.getSelection) {
            return window.getSelection();
        } else if (document.getSelection) {
            return document.getSelection();
        } else if (document.selection) {
            return document.selection.createRange().text;
        } else {
            return '';
        }
    },

    clickText: function(inSender, inEvent){
        var selectedText = jQuery.trim(this.getSelectedText()+'');
        if(textLengthBetween(selectedText, 1, 40)){
            this.owner.showMenu(inEvent, selectedText);
        } else {
            this.owner.hideMenu();
        }
    },

    showDoc: function(docObj){
        if(docObj.title !== '' || docObj.content !== ''){
            this.documentTitle = docObj.title;
            this.documentContent = docObj.content.replace(/\|/g,'<br/>');
            this.$.title.setContent(this.documentTitle);
            this.$.content.setContent(this.documentContent);
        } else {
            this.$.content.setContent(this.noDataLabel);
        }
        this.scrollToTop();
        this.show();
    },

    showPositive: function(){
        this.owner.showRatePopup(true);
    },

    showNegative: function(){
        this.owner.showRatePopup(false);
    },

    scrollToTop: function(){
        this.$.scroller.render();
        this.$.scroller.top = 0;
        this.$.scroller.setScrollTop(0);
        this.$.scroller.scrollTo(0,0);
    }

});