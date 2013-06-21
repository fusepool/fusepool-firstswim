/**
* @class LeftPanel
*/
enyo.kind(
/** @lends LeftPanel.prototype */
{
    
    name: 'LeftPanel',
    kind: enyo.Control,
    layoutKind: 'FittableRowsLayout',
    classes: 'enyo-unselectable',

    published: {
        entityFilterFunction: ''
    },
    
    components: [
      /*  {
            kind: 'LeftHeader',
            name: 'leftHeader',
            classes: 'leftHeader'
        },*/
        { tag: 'div', components: [
            { name: 'docsButton', classes: 'docsButton', content: 'Documents', ontap: 'searchShow' }
        ]},
     /*   { kind: 'enyo.Scroller', classes: 'dictionaryListMobileScroller', fit: true, touchOverscroll: false, components: [*/
            {
                kind: 'DictionaryList',
                classes: 'dictionaryMobileList',
				entityCheckboxClass: 'dictionaryMobileCheckbox',
				scrollerClass: 'dictionaryListMobileScroll',
                entityFilterFunction: 'entityFilter',
                name: 'dictionaries',
                /*dictionaryTitle: 'Dictionaries',*//*LL*/
                noContentLabel: 'No data available',
                titleClass: 'dictionariesMainTitle',
                showDetailsFunction: 'updateDetails'
            }
    /*    ]}*/,
        {
            kind: 'DetailsBox',
            name: 'detailsBox',
            classes: 'detailsMobileBox enyo-unselectable',
            scrollerClass: 'detailsMobileScroll',
            titleClass: 'detailsMobileTitle',
            imageClass: 'detailsMobileImage',
            contentClass: 'detailsMobileContent'
        }
    ],

    /**
     * This functions returns with the unchecked entities of the dictionaries.
     * @return {Array} the unchecked entities
     */
    getUncheckedEntities: function(){
        return this.$.dictionaries.getUncheckedEntities();  
    },

    /**
     * This function shows the "Documents" button in the mobile version.
     */
    showDocsButton: function(){
        this.$.docsButton.show();
    },

    /**
     * This function hides the "Documents" button in the mobile version.
     */
    hideDocsButton: function(){
        this.$.docsButton.hide();
    },

    /**
     * This function is called when the user push the "Documents" button. It calls
     * the parent function which slide the documents panel.
     */
    searchShow: function(){
        this.owner.searchShow();
    },

    /**
     * This function update the dictionary list from a dictionary object.
     * @param {Object} dictionaryObject the new dictionary list object
     */
    updateDictionaries: function(dictionaryObject){
        this.$.dictionaries.updateList(dictionaryObject);
    },

    /**
     * This function calls the details box update function with a new details object
     * @param {Object} detailsObject the new object
     */
    updateDetails: function(detailsObject){
        this.$.detailsBox.updateDetails(detailsObject);
    },

    /**
     * This function runs when the user check/uncheck an entity on the left side.
     * It calls the parent's function which update the document list.
     * @param {String} searchResponse the new search response
     */
    entityFilter: function(searchResponse){
        this.owner[this.entityFilterFunction](searchResponse);
    }

});