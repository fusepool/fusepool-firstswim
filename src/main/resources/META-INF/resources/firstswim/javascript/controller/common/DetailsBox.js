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
        this.hide();
    },

    components: [
        { name: 'detailsMainTitle' },
        { kind: 'enyo.Scroller', name: 'scroller', fit: true, touchOverscroll: false, components: [
            { name: 'detailsPanel', classes: 'detailsPanel' , components: [
                { tag: 'div', name: 'detailsTitle' } /*,
                { tag: 'div', name: 'country' },
                { tag: 'div', name: 'local' },
                { tag: 'div', name: 'street' } */
            ] }
        ]}
    ],

    /**
     * This function updates the content of the details
     * @param {String} title the title of the details
     * @param {Object} addressObject the address object
     */
    updateDetails: function(title, addressObject){
        this.scrollToTop();
        this.$.detailsTitle.setContent(title);
        if(!isEmpty(addressObject)){   
            this.$.country.setContent(this.getCountryCode(addressObject.country));
            this.$.local.setContent(addressObject.locality);
            this.$.street.setContent(addressObject.street);
        }
        this.show();
    },
	
	/**
     * This function updates the content of the details
	 * @param {Object} rdf rdf with the metadata of the entity
	 */
	displayDetails: function(rdf) {
        this.scrollToTop();
        $("#" + this.$.detailsPanel.getId()).append(uduvudu.process(rdf));
        this.show();
	},

    /**
     * This functions returns the country code from a URL
     * @param {String} countryURL the url
     * @returns {String} the country code
     */
    getCountryCode: function(countryURL){
        return countryURL.substring(countryURL.lastIndexOf('/')+1);
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