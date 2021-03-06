/**
* @class PreviewBox
*/
enyo.kind(
/** @lends PreviewBox.prototype */
{
    kind: enyo.Control,
    name: 'PreviewBox',

    published: {
        menu: null,
        previewBoxMainTitle: '',
        previewBoxMainTitleClass: ''
    },

    create: function(){
        this.inherited(arguments);
        this.createMenu();
        this.clean();
        this.$.previewBoxMainTitle.setContent(this.previewBoxMainTitle);
        this.$.previewBoxMainTitle.setClasses(this.previewBoxMainTitleClass);
    },

    /**
     * This function creates the entity menu, which is being displayed when the user
     * highlights a text in the preview document and right clicks.
	 * @method createMenu
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
			 * @method addEntity
             */
            addEntity: function(){
                this.hideMenu();
                this.$.addEntityPopup.addEntity(this.selectedText);
            },

            /**
             * This function is called when the user clicks on the 'Remove entity' menu
             * item. The 'removeEntityPopup' will be displayed with the selected text.
			 * @method removeEntity
             */
            removeEntity: function(){
                this.hideMenu();
                this.$.removeEntityPopup.removeEntity(this.selectedText);
            },

            /**
             * This function is called when the user clicks on the 'Move entity' menu
             * item. The 'moveEntityPopup' will be displayed with the selected text.
			 * @method moveEntity
             */
            moveEntity: function(){
                this.hideMenu();
                this.$.moveEntityPopup.moveEntity(this.selectedText);
            },

            /**
             * This function displays the entity menu at mouse position.
			 * @method showMenu
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
             * This function hides the entity menu.
			 * @method hideMenu
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
		{ name: 'previewBoxMainTitle' },
        {
            kind: 'OpenedDoc',
            name: 'openedDoc',
			searchWord: '',
            ondown: 'clickText',
            classes: 'openedDocument',
            documentContentClass: 'documentContent',
            noDataLabel: 'No data available',
            loaderClass: 'loader',
			openedDocScrollerClass: 'openedDocScroll'
        },
		{ name: 'previewToolbar', classes: 'previewToolbar', components: [
			{ tag: 'div', name: 'posRateButton', classes: 'positiveRateButton', ontap: 'positiveRate' },
			{ tag: 'div', name: 'negRateButton', classes: 'negativeRateButton', ontap: 'negativeRate' },
			{ tag: 'div', name: 'fullViewButton', classes: 'fullViewButton', ontap: 'fullView' }
		]},
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
	 * @method changeHeight
     * @param {Number} newHeight the document's new height
     */
    changeHeight: function(newHeight){
        this.$.openedDoc.changeHeight(newHeight);
    },

    /**
     * This function runs when the user clicks on the previewed document. If the
     * popup menu exists, the user clicked with right button, and the
     * selected text length's is sufficient the entity menu is getting displayed.
	 * If the user clicks with any other mouse button (and the menu exists),
	 * the entity menu will be hidden.
	 * @method clickText
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
     * This function runs when the user clicks the 'positive rate' button. It shows
     * the rating popup with true (positive) parameter.
	 * [This functionality is currently unused.]
	 * @method positiveRate
     */
    positiveRate: function(){
//        this.$.ratePopup.showPopup(true);
    },

    /**
     * This function runs when the user clicks the 'Negative rate' button. It shows
     * the rating popup with false (negative) parameter.
	 * [This functionality is currently unused.]
	 * @method negativeRate
     */
    negativeRate: function(){
//        this.$.ratePopup.showPopup(false);
    },

    /**
     * This function runs when the user clicks the 'Full view' button.
	 * @method fullView
     */
    fullView: function(){
        alert('Full view function is coming soon...');
    },

    /**
     * This function hides the positive and negative rate buttons and the full
     * view button.
	 * @method hideRateButtons
     */
    hideRateButtons: function(){
        this.$.posRateButton.hide();
        this.$.negRateButton.hide();
        this.$.fullViewButton.hide();
    },

    /**
     * This function shows the positive and negative rate buttons and the full
     * view button. 
	 * [This functionality is currently unused.]
	 * @method showRateButtons
     */
    showRateButtons: function(){
//        this.$.posRateButton.show();
//        this.$.negRateButton.show();
//        this.$.fullViewButton.show();
    },

    /**
     * This function calls 'openDoc' function of the opened document
	 * and displays the buttons.
	 * @method openDoc
     * @param {String} docURI URI of the document to be opened
     */
    openDoc: function(docURI){
        this.$.openedDoc.openDoc(docURI);
        this.$.openedDoc.show();
        this.showRateButtons();
    },

    /**
     * This function cleans the content of the opened document.
	 * @method clean
     */
    clean: function(){
		this.$.openedDoc.clearAll();
        this.hideRateButtons();
    },

    /**
     * This function returns the generated ID of the opened document panel.
     * @return {String} the id
	 * @method getOpenDocId
     */
    getOpenDocId: function(){
        return this.$.openedDoc.getId();
    },

    /**
     * This function returns the URI of the opened document.
	 * @method getDocumentURI
     * @return {String} document URI
     */
    getDocumentURI: function(){
        return this.$.openedDoc.getDocumentURI();
    }

});
