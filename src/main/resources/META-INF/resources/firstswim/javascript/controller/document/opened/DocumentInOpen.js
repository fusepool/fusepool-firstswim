enyo.kind({
    name: 'DocumentInOpen',
    kind: enyo.Control,

    published: {
        documentId: '',
        clickTop: null,
        clickLeft: null,
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
            negativeLabel: 'Rate to negative',
            okButtonLabel: 'OK',
            placeholderText: 'Category name...',
            rateContentClass: 'rateContent',
            inputFrameClass: 'searchLabel',
            okButtonClass: 'okRateButton'
        },
        {
            kind: 'DynamicMenu',
            name: 'entityMenu',
            classes: 'entityMenu',
            menuItemClass: 'entityMenuItem',
            menuItems: [
                { label: 'Add entity', functionName: 'addEntity' },
                { label: 'Remove entity', functionName: 'removeEntity' },
                { label: 'Move entity', functionName: 'moveEntity' }
            ]
        },
        {
            kind: 'AddEntityPopup',
            name: 'addEntityPopup',
            classes: 'addEntityPopup',
            entityContentClass: 'addEntityContent',
            titleContent: 'Add entity: ',
            selectClass: 'dictionarySelect',
            okAddEntityButtonClass: 'okAddEntityButton',
            okAddEntityButtonContent: 'OK',
            cancelAddEntityButtonContent: 'Cancel'
        },
        {
            kind: 'RemoveEntityPopup',
            name: 'removeEntityPopup',
            classes: 'removeEntityPopup',
            entityContentClass: 'removeEntityContent',
            titleClass: 'removeEntityTitle',
            titleContent: 'Remove entity: ',
            selectClass: 'dictionarySelect',
            okButtonClass: 'okRemoveEntityButton',
            okButtonContent: 'OK',
            cancelButtonContent: 'Cancel'
        },
        {
            kind: 'MoveEntityPopup',
            name: 'moveEntityPopup',
            classes: 'moveEntityPopup',
            entityContentClass: 'moveEntityContent',
            titleClass: 'moveEntityTitle',
            titleContent: 'Move entity: ',
            fromContent: 'From:',
            fromClass: 'fromToText',
            fromSelectClass: 'dictionarySelect',
            toContent: 'From:',
            toClass: 'fromToText',
            toSelectClass: 'dictionarySelect',
            okButtonClass: 'okMoveEntityButton',
            okButtonContent: 'OK',
            cancelButtonContent: 'Cancel'
        }
    ],

    addEntity: function(){
        this.$.entityMenu.hide();
        this.$.addEntityPopup.addEntity(this.clickTop, this.clickLeft, this.selectedText);
    },

    removeEntity: function(){
        this.$.entityMenu.hide();
        this.$.removeEntityPopup.removeEntity(this.clickTop, this.clickLeft, this.selectedText);
    },

    moveEntity: function(){
        this.$.entityMenu.hide();
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