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
		this.initLogin();
    },
  
    components: [
        { name: 'popup', classes: 'loginPopupDiv', kind: onyx.Popup, onHide: 'close', components: [
            { tag: 'table', name: 'loginTable', classes: 'loginTable', components: [
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
                    { tag: 'td', components: [{ name: 'passwordInput', type: 'password', kind: enyo.Input, onkeydown: 'onKeydown' }]}
                ]},
                { tag: 'tr', name: 'passwordConfirmRow', components: [
                    { tag: 'td', content: 'Password confirm: ' },
                    { tag: 'td', components: [{ name: 'passwordConfirmInput', type: 'password', kind: enyo.Input }]}
                ]}
            ]},
            { tag: 'div', classes: 'currentUserLabel', name: 'currentUserLabel' },
            { tag: 'div', classes: 'loginMessage', name: 'loginMessage' },
            { tag: 'div', classes: 'loginButtons', components: [
                { content: 'Sign out', name: 'signOutBtn', classes: 'signOutBtn', ontap: 'signOut' },
                { content: 'Back', name: 'loginBackBtn', classes: 'loginBackBtn', ontap: 'back' },
                { content: 'Sign In', name: 'signInBtn', classes: 'signInBtn', ontap: 'signIn' },
                { content: 'Sign Up', name: 'signUpBtn', classes: 'signUpBtn', ontap: 'signUp' }
            ]}
        ]},
        { name: 'closeButton', ontap: 'close', classes: 'loginCloseButton' }
    ],

    initLogin: function(){
		if(GLOBAL.currentUser=='anonymous') {
			this.$.emailRow.hide();
			this.$.passwordConfirmRow.hide();
			this.$.signOutBtn.hide();
			this.hideCurrentUser();
		}
		else {
			this.$.signInBtn.hide();
			this.$.signUpBtn.hide();
			this.$.loginTable.hide();
			this.showCurrentUser('Signed in as '+GLOBAL.currentUser+'.');
		}
		this.hideLoginMessage();
		this.$.loginBackBtn.hide();
        this.close();
	},
	
	signOut: function(){
		GLOBAL.currentUser = 'anonymous';		
		this.hideCurrentUser();
		
		this.$.loginTable.show();
		this.$.signInBtn.show();
		this.$.signUpBtn.show();
		
		this.$.emailRow.hide();
		this.$.passwordConfirmRow.hide();
		this.$.signOutBtn.hide();
		this.$.loginBackBtn.hide();
	},
	
    /**
     * This function is called when the tap the "Back" button on the registration
     * popup hide the registration's components and shows the login's componens.
     */
    back: function(){
        this.$.loginBackBtn.hide();
        this.$.signInBtn.show();
        this.$.emailRow.hide();
        this.$.passwordConfirmRow.hide();
        this.realSignUp = false;
		this.hideLoginMessage();
    },

    /**
     * This funtion runs when the user push the "Sign In" button.
     */
    signIn: function(){
		this.hideLoginMessage();
		var main = this;
		var name = this.$.usernameInput.getValue();
		var pw = this.$.passwordInput.getValue();
		var sendOBJ = { userName: name, password: pw };
		var request = new enyo.Ajax({
			method: 'POST',
			url: CONSTANTS.SIGNIN_URL,
			headers: { Accept: 'text/plain', 'Content-Type' : 'application/x-www-form-urlencoded'},
			handleAs: 'text',
			postBody: sendOBJ,
			published: { timeout: 60000 }
		});
		request.go();
		request.error(enyo.bind(this, function(inSender, inResponse) {
			main.registrationFailed(inSender.xhrResponse.body);
		}));				
		request.response(this, function(inSender, inResponse) {
			main.signInSucceed(name, main);
		});
    },
	
	signInSucceed: function(userName){
		GLOBAL.currentUser = userName;
		this.$.loginStatus;
		this.showCurrentUser('Signed in as '+userName+'.');
		this.hideLoginMessage();
		
		this.$.loginTable.hide();
		this.$.signInBtn.hide();
		this.$.signUpBtn.hide();
		
		this.$.signOutBtn.show();
		
		getUserLabels(userName);
    },
	
	signInFailed: function(errorMessage){
		this.showLoginMessage(errorMessage);
    },
	
    /**
     * This function called when the tap the "Sign Up" button. If the registration
     * panel is active, the ajax request will be sent in the future, otherwise
     * it shows the registration's fields.
     */
    signUp: function(){
		this.hideLoginMessage();
        if(this.realSignUp){
            if(true) {
				if(this.validateFields()) {	
					var main = this;				
					var sendOBJ = { userName: this.$.usernameInput.getValue(), password: this.$.passwordInput.getValue(), email: this.$.email.getValue() };
					var request = new enyo.Ajax({
						method: 'POST',
						url: CONSTANTS.SELFREG_URL,
						headers: { Accept: 'text/plain', 'Content-Type' : 'application/x-www-form-urlencoded'},
						postBody: sendOBJ,
						published: { timeout: 60000 }
					});
					request.go();
					request.error(enyo.bind(this, function(inSender, inResponse) {
						var errorMessage = 'Registration failed.';
						var token = /\<pre\>(.*)\<\/pre\>/g;
						var regExpResult = token.exec(inSender.xhrResponse.body);
						if(!isEmpty(regExpResult)) {
							errorMessage = RegExp.$1;
						}
						main.registrationFailed(errorMessage);
					}));				
					request.response(this, function(inSender, inResponse) {
						main.registrationSucceed(true, inResponse);
					});
				}
			}
        } else {
            this.realSignUp = true;
            this.showRegisterFields();
        }
    },
	
	registrationFailed: function(errorMessage) {
		this.showLoginMessage(errorMessage);
	},
	
	registrationSucceed: function() {
		this.back();
		this.showLoginMessage('Successful registration. Now you can sign in.');
	},
	
	validateFields: function() {
		var valid = true;
		
		var token = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
				
		if(	!token.test(this.$.email.getValue()) ||
			isEmpty(this.$.usernameInput.getValue()) ||	
			isEmpty(this.$.passwordInput.getValue()) ||
			isEmpty(this.$.passwordConfirmInput.getValue()) ||	
			this.$.passwordInput.getValue() != this.$.passwordConfirmInput.getValue() 
			) {
			valid = false;
			this.showLoginMessage('Invalid data. Try again.');
		}
		
		return valid;
	},
	
	hideCurrentUser: function() {
		this.$.currentUserLabel.hide();
		this.$.currentUserLabel.setContent('');
	},
	
	showCurrentUser: function(userStatus) {
		this.$.currentUserLabel.show();
		this.$.currentUserLabel.setContent(userStatus);
	},
	
	hideLoginMessage: function() {
		this.$.loginMessage.hide();
		this.$.loginMessage.setContent('');
	},
	
	showLoginMessage: function(message) {
		this.$.loginMessage.show();
		this.$.loginMessage.setContent(message);
	},
	
	onKeydown: function(inSender, inEvent) {
		if(!this.realSignUp) {
			switch(inEvent.keyCode) {
				case 13:	// Enter
					this.signIn();
					break;
			}
		}
	},

    /**
     * This function shows all fields of the registration.
     */
    showRegisterFields: function(){
        this.$.loginBackBtn.show();
        this.$.signInBtn.hide();
        this.$.emailRow.show();
        this.$.passwordConfirmRow.show();
    },

    /**
     * This function shows the whole popup.
     */
    showLogin: function(){
        this.$.popup.show();
        this.$.closeButton.show();
        this.show();
    },

    /**
     * This function runs when the user clicks out of the popup or to the close
     * button. It hides the whole popup.
     */
    close: function(){
		this.hideLoginMessage();
        this.hide();
        this.$.closeButton.hide();
    }    

});