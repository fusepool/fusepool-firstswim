/**
* @class DetailsBox
*/
enyo.kind(
/** @lends DetailsBox.prototype */
{

    name: 'DetailsBox',
    kind: enyo.Control,

    published: {
        scrollerClass: '',
        titleClass: '',
		detailsMainTitle: '',
		mainTitleClass: '',
        imageClass: '',
        contentClass: '',
        touchScroll: true
    },

    /**
     * When this component is created it sets the scroller's, the title's,
     * the image's and the content's properties.
     */
    create: function(){
        this.inherited(arguments);
        this.$.scroller.setClasses(this.scrollerClass);
        this.$.detailsMainTitle.setContent(this.detailsMainTitle);
        this.$.detailsMainTitle.setClasses(this.mainTitleClass);
        this.$.detailsTitle.setClasses(this.titleClass);
        this.$.detailsImage.setClasses(this.imageClass);
        this.$.detailsContent.setClasses(this.contentClass);
    },

    components: [
		{ name: 'detailsMainTitle' },
        { kind: 'enyo.Scroller', name: 'scroller', fit: true, touchOverscroll: false, components: [
			{ name: 'detailsPanel', classes: 'detailsPanel', components: [
				{ tag: 'div', name: 'detailsTitle' },
				{ kind: enyo.Image, name: 'detailsImage' },
				{ tag: 'div', name: 'detailsContent' }
			]}
        ]}
    ],

    /**
     * This function update the details box from a details object.
     * @param {Object} detailsObject the object which conatins a title, a content and an image
     */
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

    /**
     * This function scrolls the scrollbar to the top.
     */
    scrollToTop: function(){
        this.$.scroller.render();
        this.$.scroller.top = 0;
        this.$.scroller.setScrollTop(0);
        this.$.scroller.scrollTo(0,0);
    }

});