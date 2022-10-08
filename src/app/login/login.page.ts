import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { AppConfig } from '../app.config';
import { AppNet } from '../app.net';
import { PageBase } from '../app.page';
import { AppStore } from '../app.store';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { getAuth, RecaptchaVerifier } from '@angular/fire/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage extends PageBase implements OnInit {
  form = {
    phone: '',
    code: '',
  };
  confirmationResult: any;

  constructor(
    protected appStore: AppStore,
    protected navCtrl: NavController,
    public route: ActivatedRoute,
    public auth: AngularFireAuth
  ) {
    super(appStore, navCtrl, route);
  }

  ngOnInit() {}

  async onSignIn() {
    if (!this.confirmationResult) {
      alert('Please click send sms');
      return;
    }
    let code = this.form.code;
    code = code.replace(/\s+/gi, '');
    if (code.length < 4) {
      alert('code input valid value');
      return;
    }

    try {
      const userCred = await this.confirmationResult.confirm(code);
      if (userCred == null) {
        this.confirmationResult = null;
        alert('sign in fail');
        return;
      }
      const userCredClone = this.copy(userCred);
      console.log('userCredClone', this.json(userCredClone));
      this.doLogin(
        this.form.phone,
        userCredClone.user,
        userCredClone.credential
      );
    } catch (e) {
      this.confirmationResult = null;
      alert(e.toString());
    }
  }

  async onTest() {
    const str =
      '{"operationType":"signIn","credential":null,"additionalUserInfo":{"isNewUser":true,"providerId":"phone","profile":{}},"user":{"uid":"t0IpJWKISzWN2N18WvI8iKX5mCP2","emailVerified":false,"isAnonymous":false,"phoneNumber":"+61450431269","providerData":[{"providerId":"phone","uid":"+61450431269","displayName":null,"email":null,"phoneNumber":"+61450431269","photoURL":null}],"stsTokenManager":{"refreshToken":"AOEOulbOo0poXWTeAO91NW9kCBWs1EjoBlv9LR1le0zyf8nfFEk5VwASLHaMzdxl4YkhiyI9j9lLx1msjw3uJ2saisElZVND3vsGIUPgsKZqxadKT2Yhv78AgribunXZkq14rcrWJSAgNLUiaRDaML5q-w5kAKqCU4j-_40HR1HySNw_ScPfqg8Klb6iZVUru5JkjbsK_zq_rSApejmBkuWchC-p5-7vdQ","accessToken":"eyJhbGciOiJSUzI1NiIsImtpZCI6IjJkMjNmMzc0MDI1ZWQzNTNmOTg0YjUxMWE3Y2NlNDlhMzFkMzFiZDIiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vbWFuZGFyaW5nYXRoZXJpbmctZDkxZDQiLCJhdWQiOiJtYW5kYXJpbmdhdGhlcmluZy1kOTFkNCIsImF1dGhfdGltZSI6MTY2MzU0ODkwMSwidXNlcl9pZCI6InQwSXBKV0tJU3pXTjJOMThXdkk4aUtYNW1DUDIiLCJzdWIiOiJ0MElwSldLSVN6V04yTjE4V3ZJOGlLWDVtQ1AyIiwiaWF0IjoxNjYzNTQ4OTAxLCJleHAiOjE2NjM1NTI1MDEsInBob25lX251bWJlciI6Iis2MTQ1MDQzMTI2OSIsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsicGhvbmUiOlsiKzYxNDUwNDMxMjY5Il19LCJzaWduX2luX3Byb3ZpZGVyIjoicGhvbmUifX0.HjB2vaqlumxAiCwTNnvjYvvzp7jsjidiybPehOrF_NnTcfE9irFjUyK4iH9TQi6UYgybY6tRQZm9b8dgAHuoxZtXlEKsh9wkdU_RKjZ4hs5k1WR5hS-qwYTP8GAZolVQzcQjESrz0RyABEYqOfbB8ZB4MiW_LSNqef27R2xQ_KMwtYaw1rTG1PcmS50Lqi95KblVRp6RP0eRGnVpZOSPch_zAnW0mGxHWlsRPs8bUBzZjGv-MrBx4bCGdinWD9iDif6p_sleci5xxEWYYjDoxDGb17pqvilGcw8SZMeEdIt341kRIB4DCuEc0dchHCbGes6y14I_jUfcel0gDA__AQ","expirationTime":1663552502684},"createdAt":"1663548901733","lastLoginAt":"1663548901733","apiKey":"AIzaSyDhuDC4kWZvwrpr-3ueD5qRCvlufpy6z2I","appName":"[DEFAULT]"}}';
    const userCred = JSON.parse(str);
    console.log(userCred);
    this.doLogin(this.form.phone, userCred.user, userCred.credential);
  }

  async onSendSMS() {
    let phone = this.form.phone;
    phone = phone.replace(/\s+/gi, '');
    if (phone.length < 4) {
      alert('Please input valid value');
      return;
    }

    const auth = getAuth();
    const recaptchaVerifier = new RecaptchaVerifier(
      'signInMessage',
      {
        size: 'invisible',
        callback: (response) => {
          console.log('sign in response:', this.json(response));
        },
      },
      auth
    );

    try {
      this.confirmationResult = await this.auth.signInWithPhoneNumber(
        phone,
        recaptchaVerifier
      );
    } catch (e) {
      this.confirmationResult = null;
      alert(e.toString());
    }
  }

  async doLogin(phone, user, credential) {
    if (credential) {
      await AppConfig.setSessToken({ token: credential.toString() });
    }
    await AppConfig.setSession(user);
    await AppConfig.set('loginAccount', phone);

    this.appStore.update((state) => ({
      sess: AppConfig.$session,
      isLogin: AppConfig.isLogin(),
    }));

    this.hrefReplace('/folder/Inbox');
    await this.toast('Successful');
  }
}
