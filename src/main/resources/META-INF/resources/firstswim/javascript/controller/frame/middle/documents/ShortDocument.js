enyo.kind({
    name: 'ShortDocument',
    kind: enyo.Control,

    published: {
        url: '',
        shortContent: null,
        openDocEvent: '',
        parentFunction: '',
        contentClass: '',
        openButtonClass: ''
    },

    components: [
        { name: 'shortDoc', components: [
            { tag: 'div', name: 'content' }
        ]}
    ],

    openDoc: function(inSender, inEvent){
        this.owner[this.parentFunction](this.url, inEvent);
    },

    create: function(){
        this.inherited(arguments);
        this.$.shortDoc[this.openDocEvent] = 'openDoc';
        this.$.content.setContent(this.shortContent);
    },

    rendered: function(){
        this.$.content.setClasses(this.contentClass);
    }

});