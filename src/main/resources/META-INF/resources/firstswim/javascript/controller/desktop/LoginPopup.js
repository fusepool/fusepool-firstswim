/**
* @class LoginPopup
*/
enyo.kind(
/** @lends LoginPopup.prototype */
{
    kind: enyo.Control,
    name: 'LoginPopup',
    classes: 'loginPopup',

    published: {
        realSignUp: false // change the field or real sign up query to server
    },

    create: function(){
        this.inherited(arguments);
        this.$.emailRow.hide();
        this.$.passwordConfirmRow.hide();
        this.$.loginBackBtn.hide();
        this.close();
    },
  
    components: [
        { name: 'popup', classes: 'loginPopupDiv', kind: onyx.Popup, onHide: 'close', components: [
            { tag: 'table', classes: 'loginTable', components: [
                { tag: 'tr', components: [
                    { tag: 'td', classes: 'loginTableLeftCol', content: 'Username: ' },
                    { tag: 'td', components: [{ name: 'usernameInput', kind: enyo.Input }]}
                ]},
                { tag: 'tr', name: 'emailRow', components: [
                    { tag: 'td', content: 'E-mail address: ' },
                    { tag: 'td', components: [{ name: 'email', kind: enyo.Input }]}
                ]},
                { tag: 'tr', components: [
                    { tag: 'td', content: 'Password: ' },
                    { tag: 'td', components: [{ name: 'passwordInput', type: 'password', kind: enyo.Input }]}
                ]},
                { tag: 'tr', name: 'passwordConfirmRow', components: [
                    { tag: 'td', content: 'Password confirm: ' },
                    { tag: 'td', components: [{ name: 'passwordConfirmInput', type: 'password', kind: enyo.Input }]}
                ]}
            ]},
            { tag: 'div', classes: 'loginButtons', components: [
                { content: 'Back', name: 'loginBackBtn', classes: 'loginBackBtn', ontap: 'back' },
                { content: 'Sign In', name: 'signInBtn', classes: 'signInBtn', ontap: 'signIn' },
                { content: 'Sign Up', classes: 'signUpBtn', ontap: 'signUp' }
            ]}
        ]},
        { name: 'closeButton', ontap: 'close', classes: 'loginCloseButton' }
    ],

    back: function(){
        this.$.loginBackBtn.hide();
        this.$.signInBtn.show();
        this.$.emailRow.hide();
        this.$.passwordConfirmRow.hide();
        this.realSignUp = false;
    },

    signIn: function(){
        alert('authenticate is coming soon...');
    },

    signUp: function(){
        if(this.realSignUp){
            alert('Real sign up coming soon...');
        } else {
            this.realSignUp = true;
            this.showRegisterFields();
        }
    },

    showRegisterFields: function(){
        this.$.loginBackBtn.show();
        this.$.signInBtn.hide();
        this.$.emailRow.show();
        this.$.passwordConfirmRow.show();
    },

    /**
     * This function shows all about the popups.
     */
    showLogin: function(){
        this.$.popup.show();
        this.$.closeButton.show();
        this.show();
    },

    /**
     * This function runs when the user click out of the popup or to the close
     * button. It hides all about the popup.
     */
    close: function(){
        this.hide();
        this.$.closeButton.hide();
    }    

});