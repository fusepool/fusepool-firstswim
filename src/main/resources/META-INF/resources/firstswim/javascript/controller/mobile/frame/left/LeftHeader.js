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
        { content: 'Fusepool Platform', classes: 'logoText' }
    ]

});