enyo.kind({

    name: 'DetailsBox',
    kind: enyo.Control,

    published: {
        scrollerClass: '',
        titleClass: '',
        imageClass: '',
        contentClass: ''
    },

    create: function(){
        this.inherited(arguments);
        this.$.scroller.setClasses(this.scrollerClass);
        this.$.detailsTitle.setClasses(this.titleClass);
        this.$.detailsImage.setClasses(this.imageClass);
        this.$.detailsContent.setClasses(this.contentClass);
    },

    components: [
        { kind: 'enyo.Scroller', name: 'scroller', fit: true, touch: true, touchOverscroll: false, components: [
            { tag: 'div', name: 'detailsTitle' },
            { kind: enyo.Image, name: 'detailsImage' },
            { tag: 'div', name: 'detailsContent' }
        ]}
    ],

    updateDetails: function(detailsObject){
        this.scrollToTop();
        this.$.detailsTitle.setContent(detailsObject.title);
        var image = detailsObject.image;
        if(isEmpty(image)){
            this.$.detailsImage.hide();
        } else {
            this.$.detailsImage.setSrc(image);
            this.$.detailsImage.show();
        }
        this.$.detailsContent.setContent(detailsObject.content);
    },

    scrollToTop: function(){
        this.$.scroller.render();
        this.$.scroller.top = 0;
        this.$.scroller.setScrollTop(0);
        this.$.scroller.scrollTo(0,0);
    }

});