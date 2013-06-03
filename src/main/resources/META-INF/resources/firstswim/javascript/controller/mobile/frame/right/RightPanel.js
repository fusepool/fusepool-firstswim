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
        { kind: 'onyx.Toolbar', components: [
            { kind: 'onyx.Button', name: 'backButton', content: 'Back', ontap: 'back' },
            { kind: 'onyx.Button', name: 'addButton', content: 'Add', ontap: 'addEntity' },
            { kind: 'onyx.Button', name: 'moveButton', content: 'Move', ontap: 'moveEntity' },
            { kind: 'onyx.Button', name: 'removeButton', content: 'Remove', ontap: 'removeEntity' }
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
     * This function shows the "Back" button.
     */
    showBackButton: function(){
        this.$.backButton.show();
    },

    /**
     * This function hides the "Back" button.
     */
    hideBackButton: function(){
        this.$.backButton.hide();
    },

    /**
     * This function is called when the user push the "Back" button. It calls
     * the parent's function, which close this panel
     */
    back: function(){
        this.owner[this.closeParentFunction]();
    },

    /**
     * This function call the opened document's document opening function with
     * the document's URL
     * @param documentURL the URL of the document
     */
    openDoc: function(documentURL){
        this.$.openedDoc.openDoc(documentURL);
    },

    /**
     * This function returns the opened doc's document URL
     * @returns the document URL
     */
    getDocumentURL: function(){
        return this.$.openedDoc.getDocumentURL();
    },

    /**
     * This function is called when user push the "Add" button. It shows the
     * add entity popup with the selected text.
     */
    addEntity: function(){
        this.$.addEntityPopup.addEntity(this.$.openedDoc.getSelectedText());
    },

    /**
     * This function is called when user push the "Move" button. It shows the
     * move entity popup with the selected text.
     */
    moveEntity: function(){
        this.$.moveEntityPopup.moveEntity(this.$.openedDoc.getSelectedText());
    },

    /**
     * This function is called when user push the "Remove" button. It shows the
     * remove entity popup with the selected text.
     */
    removeEntity: function(){
        this.$.removeEntityPopup.removeEntity(this.$.openedDoc.getSelectedText());
    }

});