enyo.kind({
    name: 'Bookmark',
    kind: enyo.Control,
    components: [
        { tag: 'div', classes: 'bookmarkButton', ontap: 'saveBookmark' }
    ],

    saveBookmark: function(){
        console.log('save bookmark');
    }
});