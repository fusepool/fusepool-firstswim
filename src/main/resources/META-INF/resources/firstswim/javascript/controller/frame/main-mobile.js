jQuery(document).ready(function () {

    function initialization(){
        enyo.kind({
            name: 'DocumentMobileApp',
            kind: enyo.Control,

            components: [
                { tag: 'div', content: 'This will be the mobile application. Coming soon.. :)' }
            ]

        });
    }

    try {
        initialization();
    } catch(e) {
        console.log(e);
    }

});