enyo.kind({

    name: 'LeftHeader',
    kind: enyo.Control,
    classes: 'enyo-unselectable',

    published: {
        bookmarkFunction: '',
        popupBookmarkFunction: ''
    },

    components: [
        { name: 'logoImage', classes: 'logoImage' },
        { content: 'Fusepool Platform', classes: 'logoText' },
        {
            name: 'bookmark',
            kind: 'Bookmark',
            buttonClass: 'bookmarkButton',
            parentTapFunction: 'createBookmark',
            parentPopupFunction: 'popupBookmark',
            warningPopupClass: 'bookmarkPopup',
            warningPopupContent: '<br/>Your browser doesn\'t support add bookmark via Javascript.<br/><br/>Please insert manually this URL:<br/><br/>'
        }
    ],

    createBookmark: function(){
        this.owner[this.bookmarkFunction]();
    },

    saveBookmark: function(url, title){
        this.$.bookmark.saveBookmark(url, title);
    },

    popupBookmark: function(message){
        this.owner[this.popupBookmarkFunction](message);
    }

});