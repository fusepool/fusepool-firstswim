enyo.kind({

    kind: enyo.Control,
    name: 'PreviewBox',

    published: {
        menu: null
    },

    create: function(){
        this.inherited(arguments);
        this.createMenu();
        this.$.openedDoc.hide();
        this.hideRateButtons();
    },

    createMenu: function(){
        enyo.kind({ 
            kind: enyo.Control,
            name: 'MenuController',
            classes: 'entityMenu',
            
            published: {
                clickTop: null,
                clickLeft: null,
                selectedText: ''
            },

            components: [
                { kind: 'DynamicMenu', name: 'entityMenu',
                    menuItemClass: 'entityMenuItem', menuItems: [
                        { label: 'Add entity', functionName: 'addEntity' },
                        { label: 'Remove entity', functionName: 'removeEntity' },
                        { label: 'Move entity', functionName: 'moveEntity' }
                    ]
                },
                {
                    kind: 'AddEntityPopup',
                    name: 'addEntityPopup',
                    classes: 'addEntityPopup',
                    titleContent: 'Add entity: ',
                    okButtonContent: 'OK',
                    cancelButtonContent: 'Cancel'
                },
                {
                    kind: 'RemoveEntityPopup',
                    name: 'removeEntityPopup',
                    classes: 'removeEntityPopup',
                    titleContent: 'Remove entity: ',
                    okButtonContent: 'OK',
                    cancelButtonContent: 'Cancel'
                },
                {
                    kind: 'MoveEntityPopup',
                    name: 'moveEntityPopup',
                    classes: 'moveEntityPopup',
                    titleContent: 'Move entity: ',
                    fromContent: 'From:',
                    toContent: 'From:',
                    okButtonContent: 'OK',
                    cancelButtonContent: 'Cancel'
                }
            ],

            addEntity: function(){
                this.hideMenu();
                this.$.addEntityPopup.addEntity(this.selectedText);
            },

            removeEntity: function(){
                this.hideMenu();
                this.$.removeEntityPopup.removeEntity(this.selectedText);
            },

            moveEntity: function(){
                this.hideMenu();
                this.$.moveEntityPopup.moveEntity(this.selectedText);
            },

            showMenu: function(inEvent, selectedText){
                this.selectedText = selectedText;
                this.clickTop = inEvent.pageY;
                this.clickLeft = inEvent.pageX;

                // Menu's and window's width and height
                var jQMenu = jQuery('#' + this.$.entityMenu.getId());
                var jQDoc = jQuery(document);
                var menuWidth = jQMenu.width();
                var menuHeight = jQMenu.height();
                var windowWidth = jQDoc.width();
                var windowHeight = jQDoc.height();

                // Overflow on the right side
                var newX = this.clickLeft;
                if(windowWidth - this.clickLeft < menuWidth){
                    newX = this.clickLeft - menuWidth;
                }

                // Overflow on the bottom
                var newY = this.clickTop;
                if(windowHeight - this.clickTop < menuHeight){
                    newY = this.clickTop - menuHeight;
                }

                // Set the position and showing
                this.applyStyle('top', newY + 'px');
                this.applyStyle('left', newX + 'px');
                this.$.entityMenu.show();
            },

            hideMenu: function(){
                this.$.entityMenu.hide();
            }

        });
        this.menu = new MenuController();
        this.menu.renderInto(document.getElementById('menu'));
        this.menu.hideMenu();
    },

    components: [
        {
            kind: 'OpenedDoc',
            name: 'openedDoc',
            ondown: 'rightClickText',
            classes: 'openedDocument',
            tapParentFunction: 'rightClickText',
            documentTitleClass: 'documentTitle',
            documentContentClass: 'documentContent',
            noDataLabel: 'No data available',
            loaderClass: 'loader'
        },
        { tag: 'div', name: 'posRateButton', classes: 'positiveRateButton', ontap: 'positiveRate' },
        { tag: 'div', name: 'negRateButton', classes: 'negativeRateButton', ontap: 'negativeRate' },
        { tag: 'div', name: 'fullViewButton', classes: 'fullViewButton', ontap: 'fullView' },
        {
            kind: 'RatePopup',
            name: 'ratePopup',
            classes: 'ratePopup',
            positiveLabel: 'Rate to positive',
            negativeLabel: 'Rate to negative',
            placeholderText: 'Category name...',
            rateContentClass: 'rateContent',
            inputFrameClass: 'searchLabel',
            okButtonClass: 'okRateButton'
        }
    ],

    addEntity: function(){
        this.$.entityMenu.hide();
    },
                
    rightClickText: function(inSender, inEvent){
        if(!isEmpty(this.menu)){
            if(inEvent.which === 3){
                var selectedText = this.$.openedDoc.getSelectedText();
                if(textLengthBetween(selectedText, 1, 50)){
                    this.menu.showMenu(inEvent, selectedText);
                }
            } else {
                this.menu.hideMenu();
            }
        }
    },
    
    positiveRate: function(){
        this.$.ratePopup.showPopup(true);
    },

    negativeRate: function(){
        this.$.ratePopup.showPopup(false);
    },

    fullView: function(){
        alert('Full view function is coming soon...');
    },

    hideRateButtons: function(){
        this.$.posRateButton.hide();
        this.$.negRateButton.hide();
        this.$.fullViewButton.hide();
    },

    showRateButtons: function(){
        this.$.posRateButton.show();
        this.$.negRateButton.show();
        this.$.fullViewButton.show();
    },

    openDoc: function(previewDoc){
        this.$.openedDoc.openDoc(previewDoc);
        this.$.openedDoc.show();
        this.showRateButtons();
    },

    getOpenDocId: function(){
        return this.$.openedDoc.getId();
    }

});