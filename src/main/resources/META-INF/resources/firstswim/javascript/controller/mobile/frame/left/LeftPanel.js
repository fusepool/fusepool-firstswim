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
        searchFunction: ''
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
                kind: 'DictionaryController',
                classes: 'dictionaryMobileList',
                entityCheckboxClass: 'dictionaryMobileCheckbox',
                scrollerClass: 'dictionaryListMobileScroll',
                searchFunction: 'search',
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
        this.$.dictionaries.updateLists(dictionaryObject);
    },

    /**
     * This function calls the details box update function with a new details object
     * @param {Object} detailsObject the new object
     */
    updateDetails: function(detailsObject){
        this.$.detailsBox.updateDetails(detailsObject);
    },

    /**
     * This function calls the parent's search function with searchword and the
     * checked entity list.
     * @param {String} searchWord the last search word
     * @param {String} checkedEntities the actual checked entities
     */
    search: function(searchWord, checkedEntities){
        this.owner[this.searchFunction](searchWord, checkedEntities);
    }

});