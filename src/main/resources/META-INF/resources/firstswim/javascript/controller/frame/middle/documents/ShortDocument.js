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
        { onenter: 'overMouse', components: [
            { tag: 'div', name: 'content' },
//            { tag: 'div', name: 'openButton', ontap: 'openDoc' }
        ]}
    ],

    overMouse: function(){
        this.openDoc();
    },

    openDoc: function(){
        this.owner[this.parentFunction](this.url);
    },

    create: function(){
        this.inherited(arguments);
        this.$.content.setContent(this.shortContent);
    },

    rendered: function(){
        this.$.content.setClasses(this.contentClass);
//        this.$.openButton.setClasses(this.openButtonClass);
    }

});