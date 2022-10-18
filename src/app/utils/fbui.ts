import firebase from 'firebase/compat/app';
import * as firebaseui from 'firebaseui';

let oberserve: any = null;

function getUiConfig() {
  return {
    callbacks: {
      // Called when the user has been successfully signed in.
      signInSuccessWithAuthResult: function (authResult, redirectUrl) {
        if (authResult.user) {
          handleSignedInUser(authResult.user);
        }
        if (authResult.additionalUserInfo) {
          document.getElementById('is-new-user').textContent = authResult
            .additionalUserInfo.isNewUser
            ? 'New User'
            : 'Existing User';
        }
        // Do not redirect.
        return false;
      },
    },
    // Opens IDP Providers sign-in flow in a popup.
    signInFlow: 'popup',
    signInOptions: [
      {
        provider: firebase.auth.PhoneAuthProvider.PROVIDER_ID,
        recaptchaParameters: {
          size: 'invisible',
        },
      },
    ],
    // Terms of service url.
    tosUrl: 'https://www.google.com',
    // Privacy policy url.
    privacyPolicyUrl: 'https://www.google.com',
    credentialHelper: firebaseui.auth.CredentialHelper.NONE,
  };
}

// Initialize the FirebaseUI Widget using Firebase.
const ui = new firebaseui.auth.AuthUI(firebase.auth());
ui.disableAutoSignIn();

/**
 * Displays the UI for a signed in user.
 * @param {!firebase.User} user
 */
export const handleSignedInUser = (user) => {
  console.log('login', JSON.stringify(user));
  if(user && oberserve && oberserve.onLoginUserinfo) {
    oberserve.onLoginUserinfo(user);
  }
  /// .........
};

/**
 * Displays the UI for a signed out user.
 */
export const handleSignedOutUser = () => {
  // console.log('logout');
  // ...
};

// Listen to change in auth state so it displays the correct UI for when
// the user is signed in or not.
firebase.auth().onAuthStateChanged((user) => {
  // document.getElementById('loading').style.display = 'none';
  // document.getElementById('loaded').style.display = 'block';
  user ? handleSignedInUser(user) : handleSignedOutUser();
});


/**
 * Handles when the user changes the reCAPTCHA, email signInMethod or email
 * disableSignUp config.
 */
function handleConfigChange() {
  console.log('config change...');
  ui.reset();
  ui.start('#firebaseui-container', getUiConfig());
}

/**
 * Initializes the app.
 */
export const firebaseUIInit =  (container: string, ob: any) => {
  ui.start(container, getUiConfig());
  oberserve = ob;
};

