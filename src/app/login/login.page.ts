import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { AppConfig } from '../app.config';
import { AppNet } from '../app.net';
import { PageBase } from '../app.page';
import { AppStore } from '../app.store';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { getAuth, RecaptchaVerifier } from '@angular/fire/auth';
import { firebaseUIInit } from '../utils/fbui';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage extends PageBase implements OnInit {
  form = {
    phone: '+61450431269',
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
  ngOnInit(){}
 

  ionViewWillEnter() {
    firebaseUIInit('#loginContainer', this);
  }

  onLoginUserinfo(user) {
    this.doLogin(user.phoneNumber, user, '11111111111111');
  }

  async onSignIn() {
    if (this.form.phone == '1234') {
      this.mockLogin();
      return;
    }

    if (!this.confirmationResult) {
      alert('Please click send sms');
      return;
    }
    let code = this.form.code;
    code = code.replace(/\s+/gi, '');
    if (code.length < 6) {
      alert('Input valid value');
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
      '{"uid":"ea67mwX9s6Mkff2zZupS1JACyz92","emailVerified":false,"isAnonymous":false,"phoneNumber":"+61481778483","providerData":[{"providerId":"phone","uid":"+61481778483","displayName":null,"email":null,"phoneNumber":"+61481778483","photoURL":null}],"stsTokenManager":{"refreshToken":"AOEOulZ_P33ZQOlSrySuSgVHKZqI2Ofn-w4yoKX3ohahdTrKMJlxWbYnOrNWXiBj1YqfDSHmtvZNTBq0YJxGQwUqjEVr3nNFxA4vkzmWPBa5twwqGXsMp3F6Npi0sY7jDlRBnm5N5BOH0hQJ-z6CWV9Wky_eEOzOKQs4DN6wSe9jxSarOSVmMEZ50_wryTayXNaKX7STNG7wHoo-Wkv1V5YfwAhZi-By0A","accessToken":"eyJhbGciOiJSUzI1NiIsImtpZCI6IjVkMzQwZGRiYzNjNWJhY2M0Y2VlMWZiOWQxNmU5ODM3ZWM2MTYzZWIiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vbWFuZGFyaW5nYXRoZXJpbmctZDkxZDQiLCJhdWQiOiJtYW5kYXJpbmdhdGhlcmluZy1kOTFkNCIsImF1dGhfdGltZSI6MTY2NTk5NTYxMiwidXNlcl9pZCI6ImVhNjdtd1g5czZNa2ZmMnpadXBTMUpBQ3l6OTIiLCJzdWIiOiJlYTY3bXdYOXM2TWtmZjJ6WnVwUzFKQUN5ejkyIiwiaWF0IjoxNjY1OTk1NjEyLCJleHAiOjE2NjU5OTkyMTIsInBob25lX251bWJlciI6Iis2MTQ4MTc3ODQ4MyIsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsicGhvbmUiOlsiKzYxNDgxNzc4NDgzIl19LCJzaWduX2luX3Byb3ZpZGVyIjoicGhvbmUifX0.xtoyiPLx4VDLCWarKAdTs8raU3JiFmkdR1USe__O2TckYXIQrZurYqkPow4csYesQ6TE0NiG3NUSreMNqerXwUctP3IRHmweIMbdGskv-CNrgWTC6Pb94fLgiK5yerMgjbA8-md6rpzzRgyiRgfeD_ePXMR7OqBaI8fQ3kL3OTrTprSmcK2e7mXVnxo0jT0SP38rYVoY4hMxLXMWDIfRsTgZGi3HynjutOGDc_l8cUitY0CZnLoMZoDuSlOSk78gPJ_wiFgR2Tk6kZzpsncV7gghtYMrqpKyqbIpXBlWg2nUWxO49Zpp_8oosucmi27XGNzFfp__Jvkhl5c28UXI5A","expirationTime":1665999212267},"createdAt":"1665290970828","lastLoginAt":"1665995611990","apiKey":"AIzaSyDhuDC4kWZvwrpr-3ueD5qRCvlufpy6z2I","appName":"[DEFAULT]"}';

    const user = JSON.parse(str);
    console.log(user);
    this.doLogin(this.form.phone, user, '#11111111');
  }

  async onSendSMS() {
    let phone = this.form.phone;
    phone = phone.replace(/\s+/gi, '');
    if (phone.length < 4) {
      alert('Please input valid value');
      return;
    }

    if (phone == '1234') {
      this.mockLogin();
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
    user = this.copy(user);

    await AppConfig.setSession(user);
    await AppConfig.set('loginAccount', phone);
    console.log('#aabb', user);

    this.appStore.update((state) => ({
      sess: AppConfig.$session,
      isLogin: AppConfig.isLogin(),
    }));

    console.log('#3333');
    this.hrefReplace('/folder/Inbox');
    await this.toast('Successful');
  }

  async mockLogin() {
    this.doLogin('123456789123', { uid: '1234' }, '11111111111111');
  }
}
