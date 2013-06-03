/**
* @class Bookmark
*/
enyo.kind(
/** @lends Bookmark.prototype */
{
    name: 'Bookmark',
    kind: enyo.Control,

    published: {
        url: '',
        title: '',
        parentTapFunction: '',
        parentPopupFunction: '',
        buttonClass: '',
        noBrowserSupportText: '',
        warningPopupClass: '',
        warningPopupContent: ''
    },

    /**
     * When this component is created this function set the button's and the
     * popup's properties.
     */
    create: function(){
        this.inherited(arguments);
        this.$.bookMarkButton.setClasses(this.buttonClass);
        this.$.warningPopup.setClasses(this.warningPopupClass);
    },

    components: [
        { tag: 'div', name: 'bookMarkButton', ontap: 'tapBookmarkButton' },
        { kind: onyx.Popup, name: 'warningPopup', allowHtml: true }
    ],

    /**
     * This function runs when the user push the bookmark button. If the
     * parentTapFunction is not empty, it calls the parent's function, otherwise
     * calls the own saveBookmark function.
     */
    tapBookmarkButton: function(){
        if(this.parentTapFunction !== ''){
            this.owner[this.parentTapFunction]();
        } else {
            this.saveBookmark(this.url, this.title);
        }
    },

    /**
     * This function save a bookmark with an URL and title if it is possible.
     * Otherwise show a warning popup with an opportunity to save the bookmark
     * manually. If any the parameters are empty, the function use the default
     * URL and title. If the URL doesn't start with the "http://" text, it concatenates
     * this text with the URL.
     * @param url the URL of the bookmark
     * @param title the title of the bookmark
     */
    saveBookmark: function(url, title){
        if(isEmpty(url)){
            url = window.location.href;
        }
        if(isEmpty(title)){
            title = document.title;
        }

        if(url.substr(0,7) !== 'http://'){
            url = 'http://' + url;
        }

        if (window.sidebar){ // firefox
            window.sidebar.addPanel(title, url, '');
        } else if(window.opera && window.print){ // opera
            var elem = document.createElement('a');
            elem.setAttribute('href', url);
            elem.setAttribute('title', title);
            elem.setAttribute('rel', 'sidebar');
            elem.click();
        } else if(document.all) { // ie
            window.external.AddFavorite(url, title);
        } else {
            var content = this.warningPopupContent + url;
            if(this.parentPopupFunction !== ''){
                this.owner[this.parentPopupFunction](content);
            } else {
                this.$.warningPopup.setContent(content);
                this.$.warningPopup.show();
            }
        }
    }

});