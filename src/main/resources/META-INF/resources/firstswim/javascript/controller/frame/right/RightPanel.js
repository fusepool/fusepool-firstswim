enyo.kind({

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
                documentContentClass: 'documentContent',
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

    showBackButton: function(){
        this.$.backButton.show();
    },

    hideBackButton: function(){
        this.$.backButton.hide();
    },

    back: function(){
        this.owner[this.closeParentFunction]();
    },

    openDoc: function(document){
        this.$.openedDoc.openDoc(document);
    },

    getDocumentURL: function(){
        return this.$.openedDoc.getDocumentURL();
    },

    addEntity: function(){
        this.$.addEntityPopup.addEntity(this.$.openedDoc.getSelectedText());
    },

    moveEntity: function(){
        this.$.moveEntityPopup.moveEntity(this.$.openedDoc.getSelectedText());
    },

    removeEntity: function(){
        this.$.removeEntityPopup.removeEntity(this.$.openedDoc.getSelectedText());
    }

});