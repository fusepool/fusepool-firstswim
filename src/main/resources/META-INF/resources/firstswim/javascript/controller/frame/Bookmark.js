enyo.kind({
    name: 'Bookmark',
    kind: enyo.Control,

    published: {
        url: '',
        title: '',
        useHttpPrefix: true,
        parentTapFunction: '',
        buttonClass: '',
        noBrowserSupportText: '',
        warningPopupClass: '',
        warningPopupContent: ''
    },

    components: [
        { tag: 'div', name: 'bookMarkButton', ontap: 'tapBookmarkButton' },
        { kind: onyx.Popup, name: 'warningPopup', allowHtml: true }
    ],

    tapBookmarkButton: function(){
        if(this.parentTapFunction !== ''){
            this.owner[this.parentTapFunction]();
        } else {
            this.saveBookmark(this.url, this.title);
        }
    },

    saveBookmark: function(url, title){
        if(isEmpty(url)){
            url = window.location.href;
        }
        if(isEmpty(title)){
            title = document.title;
        }

        if(this.useHttpPrefix && url.substr(0,7) !== 'http://'){
            url = 'http://' + url;
        }

        if (window.sidebar){ // firefox
            window.sidebar.addPanel(title, url, '');
        } else if(window.opera && window.print){ // opera
            var elem = document.createElement('a');
            elem.setAttribute('href',url);
            elem.setAttribute('title',title);
            elem.setAttribute('rel','sidebar');
            elem.click();
        } else if(document.all) { // ie
            window.external.AddFavorite(url, title);
        } else {
            var content = this.warningPopupContent + url;
            this.$.warningPopup.setContent(content);
            this.$.warningPopup.show();
        }
    },

    rendered: function(){
        this.$.bookMarkButton.setClasses(this.buttonClass);
        this.$.warningPopup.setClasses(this.warningPopupClass);
    }
});