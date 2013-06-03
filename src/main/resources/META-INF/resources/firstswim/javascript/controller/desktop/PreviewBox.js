/**
* @class PreviewBox
*/
enyo.kind(
/** @lends PreviewBox.prototype */
{
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

    /**
     * This function creates the entity menu, which will be showed when the user
     * select a text in the preview document and after this click with the right
     * click.
     */
    createMenu: function(){
        /**
        * @class MenuController
        */
        enyo.kind(
        /** @lends MenuController.prototype */
        { 
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

            /**
             * This function is called when the user push the "Add entity" menu
             * item. The addEntityPopup will be showed with the selected text.
             */
            addEntity: function(){
                this.hideMenu();
                this.$.addEntityPopup.addEntity(this.selectedText);
            },

            /**
             * This function is called when the user push the "Remove entity" menu
             * item. The removeEntityPopup will be showed with the selected text.
             */
            removeEntity: function(){
                this.hideMenu();
                this.$.removeEntityPopup.removeEntity(this.selectedText);
            },

            /**
             * This function is called when the user push the "Move entity" menu
             * item. The moveEntityPopup will be showed with the selected text.
             */
            moveEntity: function(){
                this.hideMenu();
                this.$.moveEntityPopup.moveEntity(this.selectedText);
            },

            /**
             * This function show the entity menu to the mouse position.
             * @param {Object} inEvent the event which contains the position of the mouse
             * @param {String} selectedText the selected text what the user selected
             */
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

            /**
             * This function hide the entity menu.
             */
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
            ondown: 'clickText',
            classes: 'openedDocument',
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

    /**
     * This function changes the height of the opened document.
     * @param {Number} newHeight the document's new height
     */
    changeHeight: function(newHeight){
        this.$.openedDoc.changeHeight(newHeight);
    },

    /**
     * This function runs when the user click on the previewed document. If the
     * popup menu exists and the user clicked with right button, and the
     * selected text length's is good the entity menu will be showed. If the user
     * click with other button (and the menu exists) the entity menu will be hided.
     * @param {Object} inSender the previewed document
     * @param {Object} inEvent the event which contains information about the mouse
     */
    clickText: function(inSender, inEvent){
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

    /**
     * This function runs when the user push the "positive rate" button. It shows
     * the rate popup with true (positive) parameter.
     */
    positiveRate: function(){
        this.$.ratePopup.showPopup(true);
    },

    /**
     * This function runs when the user push the "negative rate" button. It shows
     * the rate popup with false (negative) parameter.
     */
    negativeRate: function(){
        this.$.ratePopup.showPopup(false);
    },

    /**
     * This function runs when the user push the "full view" button.
     */
    fullView: function(){
        alert('Full view function is coming soon...');
    },

    /**
     * This function hides the positive and negative rate buttons and the full
     * view button.
     */
    hideRateButtons: function(){
        this.$.posRateButton.hide();
        this.$.negRateButton.hide();
        this.$.fullViewButton.hide();
    },

    /**
     * This function shows the positive and negative rate buttons and the full
     * view button.
     */
    showRateButtons: function(){
        this.$.posRateButton.show();
        this.$.negRateButton.show();
        this.$.fullViewButton.show();
    },

    /**
     * This function call the opened doc's openDoc function and shows the buttons.
     * @param {Object} previewDoc the previewed document
     */
    openDoc: function(previewDoc){
        this.$.openedDoc.openDoc(previewDoc);
        this.$.openedDoc.show();
        this.showRateButtons();
    },

    /**
     * This function returns with the opened document id in the DOM.
     * @return {String} the id
     */
    getOpenDocId: function(){
        return this.$.openedDoc.getId();
    },

    /**
     * This function returns with opened document's document URL.
     * @return {String} the URL
     */
    getDocumentURL: function(){
        return this.$.openedDoc.getDocumentURL();
    }

});