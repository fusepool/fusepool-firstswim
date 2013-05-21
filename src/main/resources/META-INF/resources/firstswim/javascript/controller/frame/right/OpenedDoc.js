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
        rateDivClass: '',
        loaderClass: ''
    },

    create: function(){
        this.inherited(arguments);
        this.$.loader.hide();

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
        this.$.loader.setClasses(this.loaderClass);
    },

    components: [
        { kind: 'enyo.Scroller', name: 'scroller', fit: true, touch: true, touchOverscroll: false, components: [
            { tag: 'div', name: 'rate', components: [
                { tag: 'div', name: 'positiveRate', ontap: 'showPositive' },
                { tag: 'div', name: 'negativeRate', ontap: 'showNegative' }
            ]},
            { name: 'loader' },
            { tag: 'div', name: 'title' },
            { tag: 'div', allowHtml: true, onmouseup: 'clickText', name: 'content' }
        ]}
    ],

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

    clickText: function(inSender, inEvent){
        var selectedText = this.getSelectedText();
        if(textLengthBetween(selectedText, 1, 50)){
            this.owner.showMenu(inEvent, selectedText);
        }
    },

    clearDoc: function(){
        this.documentTitle = '';
        this.documentContent = '';
        this.$.title.setContent('');
        this.$.content.setContent('');
        this.$.rate.hide();
        this.$.loader.show();
        this.show();
    },

    showDoc: function(docObj){
        if(docObj.title !== '' || docObj.content !== ''){
            this.documentTitle = docObj.title;
            this.documentContent = docObj.content.replace(/\|/g,'<br/>');
            this.$.title.setContent(this.documentTitle);
            this.$.content.setContent(this.documentContent);
            this.$.rate.show();
        } else {
            this.$.content.setContent(this.noDataLabel);
        }
        this.scrollToTop();
        this.$.loader.hide();
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