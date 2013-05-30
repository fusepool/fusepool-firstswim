enyo.kind({
    
    name: 'LeftPanel',
    kind: enyo.Control,
    layoutKind: 'FittableRowsLayout',
    classes: 'enyo-unselectable',

    published: {
        entityFilterFunction: ''
    },
    
    components: [
        {
            kind: 'LeftHeader',
            name: 'leftHeader',
            classes: 'leftHeader'
        },
        { tag: 'div', components: [
            { name: 'docsButton', classes: 'docsButton', content: 'Documents', ontap: 'searchShow' }
        ]},
        {
            kind: 'DetailsBox',
            name: 'detailsBox',
            classes: 'detailsMobileBox enyo-unselectable',
            scrollerClass: 'detailsMobileScroll',
            titleClass: 'detailsMobileTitle',
            imageClass: 'detailsMobileImage',
            contentClass: 'detailsMobileContent'
        },
        { kind: 'enyo.Scroller', fit: true, touch: true, touchOverscroll: false, components: [
            {
                kind: 'DictionaryList',
                classes: 'dictionaryList',
                entityFilterFunction: 'entityFilter',
                name: 'dictionaries',
                dictionaryTitle: 'Dictionaries',
                noContentLabel: 'No data available',
                titleClass: 'dictionariesMainTitle',
                showDetailsFunction: 'updateDetails'
            }
        ]}
    ],

    getUncheckedEntities: function(){
        return this.$.dictionaries.getUncheckedEntities();  
    },

    showDocsButton: function(){
        this.$.docsButton.show();
    },

    hideDocsButton: function(){
        this.$.docsButton.hide();
    },

    searchShow: function(){
        this.owner.searchShow();
    },

    updateDictionaries: function(dictionaryObject){
        this.$.dictionaries.updateList(dictionaryObject);
    },

    updateDetails: function(detailsObject){
        this.$.detailsBox.updateDetails(detailsObject);
    },

    entityFilter: function(searchResponse){
        this.owner[this.entityFilterFunction](searchResponse);
    }

});