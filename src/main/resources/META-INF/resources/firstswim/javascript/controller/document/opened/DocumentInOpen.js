enyo.kind({
    name: 'DocumentInOpen',
    kind: enyo.Control,
    classes: 'documentInOpen',

    published: {
        documentId: '',
        clickTop: null,
        clickLeft: null,
        documentBoxClass: '',
        selectedText: ''
    },

    create: function(){
        this.inherited(arguments);
        this.hideMenu();
    },

    components: [
        {
            kind: 'DocumentBox',
            name: 'documentBox',
            classes: 'openedDocument',
            positiveRateClass: 'positiveRate',
            negativeRateClass: 'negativeRate',
            documentTitleClass: 'documentTitle',
            documentContentClass: 'documentContent',
            noDataLabel: 'noDataLabel',
            rateDivClass: 'rateDiv'
        },
        {
            kind: 'RatePopup',
            name: 'ratePopup',
            classes: 'ratePopup',
            positiveLabel: 'Rate to positive',
            negativeLabel: 'Rate to negative'
        },
        { kind: 'EntityMenu', name: 'entityMenu' },
        { kind: 'AddEntityPopup', name: 'addEntityPopup' },
        { kind: 'RemoveEntityPopup', name: 'removeEntityPopup' },
        { kind: 'MoveEntityPopup', name: 'moveEntityPopup' }
    ],

    addEntity: function(){
        this.$.addEntityPopup.addEntity(this.clickTop, this.clickLeft, this.selectedText);
    },

    removeEntity: function(){
        this.$.removeEntityPopup.removeEntity(this.clickTop, this.clickLeft, this.selectedText);
    },

    moveEntity: function(){
        this.$.moveEntityPopup.moveEntity(this.clickTop, this.clickLeft, this.selectedText);
    },

    showMenu: function(inEvent, selectedText){
        this.selectedText = selectedText;
        var textLength = selectedText.length;
        if(textLength > 0 && textLength < 20){
            this.clickTop = inEvent.layerY - this.$.documentBox.$.scroller.getScrollTop();
            this.clickLeft = inEvent.layerX;
            this.$.entityMenu.applyStyle('top', this.clickTop + 'px');
            this.$.entityMenu.applyStyle('left', this.clickLeft + 'px');
            this.$.entityMenu.show();
        }
    },

    hideMenu: function(){
        this.$.entityMenu.hide();
    },

    showRatePopup: function(isPositive, content){
        this.$.ratePopup.showPopup(isPositive, content);
    },

    openDoc: function(documentId){
        this.documentId = documentId;
        var docObj = this.getFakeDocument();
        this.$.documentBox.showDoc(docObj);
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