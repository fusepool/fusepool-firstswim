/**
* @class RightPanel
*/
enyo.kind(
/** @lends RightPanel.prototype */
{
    name: 'RightPanel',
    kind: enyo.Control,
    layoutKind: 'FittableRowsLayout',
    classes: 'rightPanel',

    published: {
        closeParentFunction: ''
    },

    create: function(){
        this.inherited(arguments);
        this.$.addButton.setDisabled(true);
        this.$.moveButton.setDisabled(true);
        this.$.removeButton.setDisabled(true);
    },

    components: [
        { kind: 'OpenedDocHeader' },
        { kind: 'enyo.Scroller', fit: true, touch: true, touchOverscroll: false, components: [
            {
                kind: 'OpenedDoc',
                name: 'openedDoc',
                classes: 'openedMobileDocument',
                documentTitleClass: 'documentTitle',
                noDataLabel: 'No data available',
                loaderClass: 'loader'
            }
        ]},
        { name: 'openedDocMobileToolbar', classes: 'openedDocMobileToolbar', components: [
            { kind: 'onyx.Button', classes: 'lightButton', name: 'backButton', content: 'Back', ontap: 'back' },
            { kind: 'onyx.Button', classes: 'lightButton', name: 'addButton', content: 'Add', ontap: 'addEntity' },
            { kind: 'onyx.Button', classes: 'lightButton', name: 'moveButton', content: 'Move', ontap: 'moveEntity' },
            { kind: 'onyx.Button', classes: 'lightButton', name: 'removeButton', content: 'Remove', ontap: 'removeEntity' }
        ]},
        {
            kind: 'AddEntityPopup',
            name: 'addEntityPopup',
            classes: 'addEntityMobilePopup',
            titleContent: 'Add entity: ',
            okButtonContent: 'OK',
            cancelButtonContent: 'Cancel'
        },
        {
            kind: 'RemoveEntityPopup',
            name: 'removeEntityPopup',
            classes: 'removeEntityMobilePopup',
            titleContent: 'Remove entity: ',
            okButtonContent: 'OK',
            cancelButtonContent: 'Cancel'
        },
        {
            kind: 'MoveEntityPopup',
            name: 'moveEntityPopup',
            classes: 'moveEntityMobilePopup',
            titleContent: 'Move entity: ',
            fromContent: 'From:',
            toContent: 'From:',
            okButtonContent: 'OK',
            cancelButtonContent: 'Cancel'
        }
    ],

    /**
     * This function shows the 'Back' button.
     */
    showBackButton: function(){
        this.$.backButton.show();
    },

    /**
     * This function hides the 'Back' button.
     */
    hideBackButton: function(){
        this.$.backButton.hide();
    },

    /**
     * This function is called when the user push the 'Back' button.
	 * It calls the parent's function, which closes this panel.
     */
    back: function(){
        this.owner[this.closeParentFunction]();
    },

    /**
     * This function calls the opened document's document opening
	 * function with the document's URI
     * @param {String} documentURI URI of the document
     */
    openDoc: function(documentURI){
        this.$.openedDoc.openDoc(documentURI);
    },

    /**
     * This functions hides the preview panel.
     */
    clean: function(){
        this.$.openedDoc.hide();
    },

    /**
     * This function returns the URI of the opened document.
     * @return {String} the document URI
     */
    getDocumentURI: function(){
        return this.$.openedDoc.getDocumentURI();
    },

    /**
     * This function is called when the user presses the 'Add' button.
	 * It shows the add entity popup with the selected text.
     */
    addEntity: function(){
//        this.$.addEntityPopup.addEntity(this.$.openedDoc.getSelectedText());
    },

    /**
     * This function is called when the user push the 'Move' button.
	 * It shows the move entity popup with the selected text.
     */
    moveEntity: function(){
//        this.$.moveEntityPopup.moveEntity(this.$.openedDoc.getSelectedText());
    },

    /**
     * This function is called when the user presses the 'Remove' button.
	 * It shows the remove entity popup with the selected text.
     */
    removeEntity: function(){
//        this.$.removeEntityPopup.removeEntity(this.$.openedDoc.getSelectedText());
    }

});