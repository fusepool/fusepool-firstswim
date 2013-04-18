enyo.kind({
    name: 'Bookmark',
    kind: enyo.Control,
    published: {
        url: '',
        title: '',
        parentTapFunction: '',
        buttonClass: '',
        noBrowserSupportText: ''
    },

    components: [
        { tag: 'div', name: 'bookMarkButton', ontap: 'tapBookmarkButton' }
    ],

    tapBookmarkButton: function(){
        if(this.parentTapFunction !== ''){
            this.owner[this.parentTapFunction]();
        } else {
            this.saveBookmark(this.url, this.title);
        }
    },

    saveBookmark: function(url, title){
        if(!url || url === ''){
            url = window.location.href;
        }
        if(!title || title === ''){
            title = document.title;
        }

        if(url.substr(0,7) !== 'http://'){
            url = 'http://' + url;
        }

	if (window.sidebar) {
            window.sidebar.addPanel(title, url, '');
	} else if(window.external) {
            window.external.AddFavorite( url, title); }
	else {
            alert(this.noBrowserSupportText);
        }
    },

    rendered: function(){
        this.$.bookMarkButton.setClasses(this.buttonClass);
    }
});