enyo.kind({
    tag: 'div',
    name: 'DocumentBox',

    published: {
        documentTitle: '',
        documentContent: ''
    },

    create: function(){
        this.inherited(arguments);
        // overwrite right click listener
        if (document.addEventListener) {
            document.addEventListener('contextmenu', function(e) { e.preventDefault();}, false);
        } else {
            document.attachEvent('oncontextmenu', function() { window.event.returnValue = false; });
        }
        this.hide();
        this.scrollToTop();
    },

    components: [
        { kind: 'enyo.Scroller', name: 'scroller', fit: true, touch: true, touchOverscroll: false, components: [
            { tag: 'div', classes: 'rateDiv', name: 'rate', components: [
                { tag: 'div', classes: 'positiveRate', name: 'positiveRate', ontap: 'showPositive' },
                { tag: 'div', classes: 'negativeRate', name: 'negativeRate', ontap: 'showNegative' }
            ]},
            { tag: 'div', name: 'title', classes: 'documentTitle' },
            { tag: 'div', onclick: 'clickText', name: 'content', classes: 'documentContent' }
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

    categoryKeyUp: function(inSender, inEvent){
        if(inEvent.keyCode === 13){
            this.sendRating();
        }
    },

    clickText: function(inSender, inEvent){
        this.owner.hideMenu();
        if(inEvent.which === 3){
            this.selectedText = this.getSelectedText() + '';
            this.owner.showMenu(inEvent, this.selectedText);
        }
    },

    showDoc: function(docObj){
        if(docObj.title !== '' && docObj.content !== ''){
            this.documentTitle = docObj.title;
            this.documentContent = docObj.content;
            this.$.title.setContent(this.documentTitle);
            this.$.content.setContent(this.documentContent);
        } else {
            this.$.content.setContent('No data available');
        }
        this.scrollToTop();
        this.show();
    },

    showPositive: function(){
        this.owner.showRatePopup(true, 'Rate to positive');
    },

    showNegative: function(){
        this.owner.showRatePopup(false, 'Rate to negative');
    },

    scrollToTop: function(){
        this.$.scroller.render();
        this.$.scroller.top = 0;
        this.$.scroller.setScrollTop(0);
        this.$.scroller.scrollTo(0,0);
    }

});