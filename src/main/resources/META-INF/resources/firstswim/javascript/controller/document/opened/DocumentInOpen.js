enyo.kind({
    name: 'DocumentInOpen',
    kind: enyo.Control,
    classes: 'documentInOpen',

    published: {
        documentId: '',
        documentTitle: '',
        documentContent: '',
        pozitiveRate: null,
        clickTop: null,
        clickLeft: null,
        selectedText: ''
    },

    create: function(){
        this.inherited(arguments);
        this.$.documentBox.hide();
        this.scrollToTop();
        this.hideMenu();

        // overwrite right click listener
        if (document.addEventListener) {
            document.addEventListener('contextmenu', function(e) { e.preventDefault();}, false);
        } else {
            document.attachEvent('oncontextmenu', function() { window.event.returnValue = false; });
        }
    },

    components: [
        { tag: 'div', classes: 'openedDocument', name: 'documentBox', components: [
            { kind: 'enyo.Scroller', name: 'scroller', fit: true, touch: true, touchOverscroll: false, components: [
                { tag: 'div', classes: 'rateDiv', name: 'rate', components: [
                    { tag: 'div', classes: 'positiveRate', ontap: 'showPositive' },
                    { tag: 'div', classes: 'negativeRate', ontap: 'showNegative' }
                ]},
                { tag: 'div', classes: 'documentTitle', name: 'title' },
                { tag: 'div', classes: 'documentContent', onclick: 'clickText', name: 'content' }
            ]}
        ]},
        { kind: onyx.Popup, name: 'ratePopup', classes: 'ratePopup', components: [
            { tag: 'div', name: 'rateContent', classes: 'rateContent' },
            { kind: 'onyx.InputDecorator', classes: 'searchLabel', components: [
                { kind: onyx.Input, name: 'categoryInput', placeholder: 'Category name...', onkeyup: 'categoryKeyUp' }
            ]},
            { kind: onyx.Button, classes: 'okRateButton', content: 'OK', ontap: 'sendRating' }
        ]},
        { tag: 'div', name: 'entityMenu', classes: 'entityMenu', components: [
            { tag: 'div', classes: 'entityMenuItem', content: 'Add entity', ontap: 'addEntity' },
            { tag: 'div', classes: 'entityMenuItem', content: 'Remove entity', ontap: 'removeEntity' },
            { tag: 'div', classes: 'entityMenuItem', content: 'Move entity', ontap: 'moveEntity' }
        ]},
        { kind: onyx.Popup, name: 'addEntityPopup', classes: 'addEntityPopup', components: [
            { tag: 'div', name: 'addEntityContent', classes: 'addEntityContent', components: [
                { tag: 'span', classes: 'addEntityTitle', content: 'Add entity: ' },
                { tag: 'span', name: 'addEntityWord' }
            ]},
            { tag: 'select', classes: 'dictionarySelect', components: [
                { tag: 'option', content: 'Person' },
                { tag: 'option', content: 'Location' },
                { tag: 'option', content: 'Organization' },
                { tag: 'option', content: 'LTE' }
            ]},
            { kind: onyx.Button, classes: 'okAddEntityButton', content: 'OK', ontap: 'okAddEntity' },
            { kind: onyx.Button, content: 'Cancel', ontap: 'cancelAddEntity' }
        ]},
        { kind: onyx.Popup, name: 'removeEntityPopup', classes: 'removeEntityPopup', components: [
            { tag: 'div', name: 'removeEntityContent', classes: 'removeEntityContent', components: [
                { tag: 'span', classes: 'removeEntityTitle', content: 'Remove entity: ' },
                { tag: 'span', name: 'removeEntityWord' }
            ]},
            { tag: 'select', classes: 'dictionarySelect', components: [
                { tag: 'option', content: 'Person' },
                { tag: 'option', content: 'Location' },
                { tag: 'option', content: 'Organization' },
                { tag: 'option', content: 'LTE' }
            ]},
            { kind: onyx.Button, classes: 'okRemoveEntityButton', content: 'OK', ontap: 'okRemoveEntity' },
            { kind: onyx.Button, content: 'Cancel', ontap: 'cancelRemoveEntity' }
        ]},
        { kind: onyx.Popup, name: 'moveEntityPopup', classes: 'moveEntityPopup', components: [
            { tag: 'div', name: 'moveEntityContent', classes: 'moveEntityContent', components: [
                { tag: 'span', classes: 'moveEntityTitle', content: 'Move entity: ' },
                { tag: 'span', name: 'moveEntityWord' }
            ]},
            { tag: 'div', content: 'From:', classes: 'fromToText' },
            { tag: 'select', classes: 'dictionarySelect', components: [
                { tag: 'option', content: 'Person' },
                { tag: 'option', content: 'Location' },
                { tag: 'option', content: 'Organization' },
                { tag: 'option', content: 'LTE' }
            ]},
            { tag: 'div', content: 'To:', classes: 'fromToText' },
            { tag: 'select', classes: 'dictionarySelect', components: [
                { tag: 'option', content: 'Person' },
                { tag: 'option', content: 'Location' },
                { tag: 'option', content: 'Organization' },
                { tag: 'option', content: 'LTE' }
            ]},
            { kind: onyx.Button, classes: 'okMoveEntityButton', content: 'OK', ontap: 'okMoveEntity' },
            { kind: onyx.Button, content: 'Cancel', ontap: 'cancelMoveEntity' }
        ]}
    ],

    addEntity: function(){
        this.hideMenu();
        this.$.addEntityPopup.applyStyle('top', this.clickTop - 130 + 'px');
        this.$.addEntityPopup.applyStyle('left', this.clickLeft - 120 + 'px');
        this.$.addEntityWord.setContent(this.selectedText);
        this.$.addEntityPopup.show();
    },

    removeEntity: function(){
        this.hideMenu();
        this.$.removeEntityPopup.applyStyle('top', this.clickTop - 130 + 'px');
        this.$.removeEntityPopup.applyStyle('left', this.clickLeft - 120 + 'px');
        this.$.removeEntityWord.setContent(this.selectedText);
        this.$.removeEntityPopup.show();
    },

    moveEntity: function(){
        this.hideMenu();
        this.$.moveEntityPopup.applyStyle('top', this.clickTop - 215 + 'px');
        this.$.moveEntityPopup.applyStyle('left', this.clickLeft - 120 + 'px');
        this.$.moveEntityWord.setContent(this.selectedText);
        this.$.moveEntityPopup.show();
    },

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

    okAddEntity: function(){
        this.$.addEntityPopup.hide();
    },

    cancelAddEntity: function(){
        this.$.addEntityPopup.hide();
    },

    okRemoveEntity: function(){
        this.$.removeEntityPopup.hide();
    },

    cancelRemoveEntity: function(){
        this.$.removeEntityPopup.hide();
    },

    okMoveEntity: function(){
        this.$.moveEntityPopup.hide();
    },

    cancelMoveEntity: function(){
        this.$.moveEntityPopup.hide();
    },

    clickText: function(inSender, inEvent){
        this.hideMenu();
        if(inEvent.which === 3){
            this.selectedText = this.getSelectedText() + '';
            this.showMenu(inEvent);
        }
    },

    showMenu: function(inEvent){
        var textLength = this.selectedText.length;
        if(textLength > 0 && textLength < 20){
            this.clickTop = inEvent.layerY - this.$.scroller.getScrollTop();
            this.clickLeft = inEvent.layerX;
            this.$.entityMenu.applyStyle('top', this.clickTop + 'px');
            this.$.entityMenu.applyStyle('left', this.clickLeft + 'px');
            this.$.entityMenu.show();
        }
    },

    hideMenu: function(){
        this.$.entityMenu.hide();
    },

    categoryKeyUp: function(inSender, inEvent){
        if(inEvent.keyCode === 13){
            this.sendRating();
        }
    },

    sendRating: function(){
        // TODO: send a request about rating
        this.$.categoryInput.setValue('');
        this.$.ratePopup.hide();
    },

    showPositive: function(){
        this.pozitiveRate = true;
        this.$.rateContent.setContent('Rate to positive');
        this.showRatePopup();
    },

    showNegative: function(){
        this.pozitiveRate = false;
        this.$.rateContent.setContent('Rate to negative');
        this.showRatePopup();
    },

    showRatePopup: function(){
        this.$.ratePopup.show();
    },

    openDoc: function(documentId){
        this.documentId = documentId;
        var docObj = this.getFakeDocument();
        this.showDoc(docObj);
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
        this.$.documentBox.show();
    },

    scrollToTop: function(){
        this.$.scroller.render();
        this.$.scroller.top = 0;
        this.$.scroller.setScrollTop(0);
        this.$.scroller.scrollTo(0,0);
    },

    getFakeDocument: function(){
        var docObj = {};
        if(this.documentId === 'AAAAAA1'){
            docObj.title = 'Star Wars Episode III';
            docObj.content = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam rutrum malesuada leo quis mollis. Duis sollicitudin purus rhoncus magna tempor et volutpat eros pulvinar. Phasellus id velit eget sem pretium luctus et eget urna. Fusce ac lorem a diam consequat ullamcorper. Ut vehicula odio in tellus interdum eu dapibus risus pretium. Sed convallis orci eu orci vehicula non fermentum enim dictum. Etiam non dolor nec neque mattis interdum vel sed mi. Integer ipsum ante, tincidunt non hendrerit eget, iaculis eu dui. Fusce quis elit est, et cursus velit. Vivamus eget leo at libero blandit tristique. Donec eleifend malesuada magna, in porttitor sem pellentesque vitae. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec elementum leo id neque porttitor vel scelerisque orci volutpat. In hac habitasse platea dictumst. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Praesent vel dolor volutpat augue dictum feugiat sed sed urna. Ut malesuada augue id turpis commodo porttitor. Nullam turpis dolor, mollis at tincidunt eget, faucibus suscipit nibh. Nulla et mauris odio. Sed leo ligula, malesuada at hendrerit id, pharetra vitae justo. In eu mi odio. In posuere, neque sed feugiat auctor, urna est vestibulum diam, a aliquet lorem tortor facilisis dui. Integer sollicitudin, nisl eget bibendum facilisis, elit leo congue lectus, at bibendum nulla orci nec lectus. Proin feugiat, nibh non condimentum consectetur, urna velit mollis odio, vel lacinia quam lorem nec urna. Etiam at arcu ipsum, et vehicula lorem. Suspendisse ac augue vitae tortor gravida iaculis sit amet in erat. Suspendisse potenti. Nullam a nisl nec mi vehicula condimentum eu sed mauris. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Cras ut ligula tortor, ac venenatis massa. Nam vehicula, magna quis vestibulum imperdiet, felis felis vulputate felis, aliquam hendrerit erat nulla et nunc. Phasellus hendrerit dictum massa ac bibendum. Pellentesque ut purus ut lorem aliquet sodales. Etiam ipsum odio, elementum at tempor ultricies, rhoncus eu neque.';            
        } else {
            docObj.title = 'Other document';
            docObj.content = 'Fusce ac lorem a diam consequat ullamcorper. Ut vehicula odio in tellus interdum eu dapibus risus pretium. Sed convallis orci eu orci vehicula non fermentum enim dictum. Etiam non dolor nec neque mattis interdum vel sed mi. Integer ipsum ante, tincidunt non hendrerit eget, iaculis eu dui. Fusce quis elit est, et cursus velit. Vivamus eget leo at libero blandit tristique. Donec eleifend malesuada magna, in porttitor sem pellentesque vitae. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec elementum leo id neque porttitor vel scelerisque orci volutpat. In hac habitasse platea dictumst. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Praesent vel dolor volutpat augue dictum feugiat sed sed urna. Ut malesuada augue id turpis commodo porttitor. Nullam turpis dolor, mollis at tincidunt eget, faucibus suscipit nibh. Nulla et mauris odio. Sed leo ligula, malesuada at hendrerit id, pharetra vitae justo. In eu mi odio. In posuere, neque sed feugiat auctor, urna est vestibulum diam, a aliquet lorem tortor facilisis dui. Integer sollicitudin, nisl eget bibendum facilisis, elit leo congue lectus, at bibendum nulla orci nec lectus. Proin feugiat, nibh non condimentum consectetur, urna velit mollis odio, vel lacinia quam lorem nec urna. Etiam at arcu ipsum, et vehicula lorem. Suspendisse ac augue vitae tortor gravida iaculis sit amet in erat. Suspendisse potenti. Nullam a nisl nec mi vehicula condimentum eu sed mauris. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Cras ut ligula tortor, ac venenatis massa. Nam vehicula, magna quis vestibulum imperdiet, felis felis vulputate felis, aliquam hendrerit erat nulla et nunc. Phasellus hendrerit dictum massa ac bibendum. Pellentesque ut purus ut lorem aliquet sodales. Etiam ipsum odio, elementum at tempor ultricies, rhoncus eu neque.';
        }
        return docObj;
    }

});