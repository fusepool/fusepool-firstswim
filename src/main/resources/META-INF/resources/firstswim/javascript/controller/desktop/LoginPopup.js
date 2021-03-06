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
                { tag: 'tr', classes: 'loginTableLeftCol', name: 'emailRow', components: [
                    { tag: 'td', content: 'E-mail address: ' },
                    { tag: 'td', components: [{ name: 'email', kind: enyo.Input }]}
                ]},
                { tag: 'tr', components: [
                    { tag: 'td', classes: 'loginTableLeftCol', content: 'Password: ' },
                    { tag: 'td', components: [{ name: 'passwordInput', type: 'password', kind: enyo.Input, onkeydown: 'onKeydown' }]}
                ]},
                { tag: 'tr', name: 'passwordConfirmRow', components: [
                    { tag: 'td', classes: 'loginTableLeftCol', content: 'Password confirm: ' },
                    { tag: 'td', components: [{ name: 'passwordConfirmInput', type: 'password', kind: enyo.Input }]}
                ]}
            ]},
            { tag: 'div', classes: 'currentUserLabel', name: 'currentUserLabel', allowHtml: true },
            { tag: 'div', classes: 'loginMessage', name: 'loginMessage' },
            { tag: 'div', classes: 'loginButtons', components: [
				{ kind: 'onyx.Button', content: 'Sign out', name: 'signOutBtn', classes: 'signOutBtn', ontap:"signOut"},
				{ kind: 'onyx.Button', content: 'Back', name: 'loginBackBtn', classes: 'loginBackBtn', ontap:"back"},
				{ kind: 'onyx.Button', content: 'Sign in', name: 'signInBtn', classes: 'signInBtn', ontap:"signIn"},
				{ kind: 'onyx.Button', content: 'Register', name: 'signUpBtn', classes: 'signUpBtn', ontap:"signUp"}
            ]}
        ]},
        { name: 'closeButton', ontap: 'close', classes: 'loginCloseButton' }
    ],
	
	/**
	 * This function initializes the login panel based on the cookie values.
	 * @method initLogin
	 */
    initLogin: function(){
		if(readCookie('currentUser') == 'anonymous') {
			this.$.emailRow.hide();
			this.$.passwordConfirmRow.hide();
			this.$.signOutBtn.hide();
			this.hideCurrentUser();
		}
		else {
			this.$.signInBtn.hide();
			this.$.signUpBtn.hide();
			this.$.loginTable.hide();
			this.showCurrentUser('Signed in as <b>'+readCookie('currentUser')+'</b>.');
			this.owner.$.loginButton.removeClass('loggedOut');
			this.owner.$.loginButton.addClass('loggedIn');
		}
		this.hideLoginMessage();
		this.$.loginBackBtn.hide();
        this.close();
	},
	
	/**
	 * This function is called when the user clicks on 'Sign out'.
	 * It hides and shows the proper panels and sets the cookie value.
	 * @method signOut
	 */
	signOut: function(){
		createCookie('currentUser', 'anonymous', 30);	
		this.hideCurrentUser();
		
		this.$.loginTable.show();
		this.$.signInBtn.show();
		this.$.signUpBtn.show();
		
		this.$.emailRow.hide();
		this.$.passwordConfirmRow.hide();
		this.$.signOutBtn.hide();
		this.$.loginBackBtn.hide();
		
		this.owner.$.loginButton.removeClass('loggedIn');
		this.owner.$.loginButton.addClass('loggedOut');
	},
	
    /**
     * This function is called when the tap the 'Back' button on the registration
     * popup hide the registration's components and shows the login's componens.
	 * @method back
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
     * This function runs when the user clicks on 'Sign In'. It starts
	 * a request to the server and based on the response, it either
	 * calls the 'signInFailed' or the 'signInSucceed' function.
	 * @method signIn
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
			main.signInFailed(inSender.xhrResponse.body);
		}));				
		request.response(this, function(inSender, inResponse) {
			main.signInSucceed(name, main);
		});
    },
	
    /**
     * This function runs after a successful login. It creates the proper
	 * cookie and sets the login panel to logged in state.
	 * @method signInSucceed
     */
	signInSucceed: function(userName){
		createCookie('currentUser',userName,30);
		this.$.loginStatus;
		this.showCurrentUser('Signed in as <b>'+userName+'</b>.');
		this.hideLoginMessage();
		
		this.$.loginTable.hide();
		this.$.signInBtn.hide();
		this.$.signUpBtn.hide();
		
		this.$.signOutBtn.show();
		
		this.owner.$.loginButton.removeClass('loggedOut');
		this.owner.$.loginButton.addClass('loggedIn');
		
		getUserLabels(userName);
    },
	
    /**
     * This function runs after an unsuccessful login. It shows an error message.
	 * @method signInFailed
     */
	signInFailed: function(errorMessage){
		this.showLoginMessage(errorMessage);
    },
	
    /**
     * This function called when the tap the "Sign Up" button. If the registration
     * panel is active, the ajax request will be sent in the future, otherwise
     * it shows the registration's fields.
	 * @method signUp
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
	
    /**
     * This function runs after an unsuccessful registration.
	 * It shows an error message.
	 * @method registrationFailed
     */
	registrationFailed: function(errorMessage) {
		this.showLoginMessage(errorMessage);
	},
	
    /**
     * This function runs after a successful registration.
	 * It switches back the panel to login state and informs
	 * the user about the successful registration.
	 * @method registrationSucceed
     */
	registrationSucceed: function() {
		this.back();
		this.showLoginMessage('Successful registration. Now you can sign in.');
	},
	
    /**
     * This function validates the entered data in the fields
	 * of the registration panel.
	 * @method validateFields
     */
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
	
    /**
     * This function clears and hides the 'currentUserLabel' panel.
	 * @method hideCurrentUser
     */
	hideCurrentUser: function() {
		this.$.currentUserLabel.hide();
		this.$.currentUserLabel.setContent('');
	},
	
    /**
     * This function displays a text in the 'currentUserLabel' panel
	 * (either a username or a message about being logged out).
	 * @method showCurrentUser
     */
	showCurrentUser: function(userStatus) {
		this.$.currentUserLabel.show();
		this.$.currentUserLabel.setContent(userStatus);
	},
	
    /**
     * This function hides the current message in the panel.
	 * @method hideLoginMessage
     */
	hideLoginMessage: function() {
		this.$.loginMessage.hide();
		this.$.loginMessage.setContent('');
	},
	
    /**
     * This function shows a message.
	 * @method showLoginMessage
     */
	showLoginMessage: function(message) {
		this.$.loginMessage.show();
		this.$.loginMessage.setContent(message);
	},
	
    /**
     * This function calls the 'signIn' function when the user
	 * presses Enter in the login panel.
	 * @method onKeydown
     */
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
	 * @method showRegisterFields
     */
    showRegisterFields: function(){
        this.$.loginBackBtn.show();
        this.$.signInBtn.hide();
        this.$.emailRow.show();
        this.$.passwordConfirmRow.show();
    },

    /**
     * This function shows the login panel.
	 * @method showLogin
     */
    showLogin: function(){
        this.$.popup.show();
        this.$.closeButton.show();
        this.show();
    },

    /**
     * This function runs when the user clicks out of the popup or to the close
     * button. It hides the whole popup.
	 * @method close
     */
    close: function(){
		this.hideLoginMessage();
        this.hide();
        this.$.closeButton.hide();
    }    

});
