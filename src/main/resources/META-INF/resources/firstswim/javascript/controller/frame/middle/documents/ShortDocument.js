enyo.kind({
    name: 'ShortDocument',
    kind: enyo.Control,

    published: {
        url: '',
        shortContent: null,
        parentFunction: '',
        contentClass: '',
        openButtonClass: ''
    },

    components: [
        { onenter: 'openDoc', components: [
            { tag: 'div', name: 'content' }
        ]}
    ],

    openDoc: function(inSender, inEvent){
        this.owner[this.parentFunction](this.url, inEvent);
    },

    create: function(){
        this.inherited(arguments);
        this.$.content.setContent(this.shortContent);
    },

    rendered: function(){
        this.$.content.setClasses(this.contentClass);
    }

});