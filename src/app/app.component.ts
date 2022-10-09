import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LoadingController, NavController } from '@ionic/angular';
import {
  getFirestore,
  getDocs,
  collection,
  doc,
  getDoc,
  query,
  where,
} from '@firebase/firestore';
import { AppStore } from './app.store';
import { PageBase } from './app.page';
import { AppConfig } from './app.config';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { getAuth, RecaptchaVerifier } from '@angular/fire/auth';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent extends PageBase {
  public appLoginPages = [
    { title: 'Start learn', url: '/theme', icon: 'flower-outline' },
  ];
  public appNoLoginPages: any[] = [
        { title: 'Sign in', url: '/login', icon: 'log-in-outline' },
    { title: 'Register', url: '/register', icon: 'person-add-outline' },
  ];

  drapdownList = this.appNoLoginPages;
  
  constructor(
    protected appStore: AppStore,
    private router: Router,
    private activeRoute: ActivatedRoute,
    protected loadingCtrl: LoadingController,
    protected navCtrl: NavController,
    public route: ActivatedRoute,
    public auth: AngularFireAuth
  ) {
    super(appStore, navCtrl, route);
  }

  ngOnInit() {
    this.getMenu();

    // init global state
    this.appStore.update((state) => ({
      sess: AppConfig.$session,
      isLogin: AppConfig.isLogin(),
      lang: AppConfig.$lang,
      debug: AppConfig.isDebug(),
    }));
  }

  async getMenu() {}

  public appPages = this.appNoLoginPages;
  //
  onStoreChanged() {
    // console.log('on store changed');
    if (this.$isLogin) {
      this.drapdownList = this.appLoginPages;
    } else {
      this.drapdownList = this.appNoLoginPages;
    }
  }

  onLogin() {
    const auth = getAuth();
    const recaptchaVerifier = new RecaptchaVerifier(
      'recaptcha-container',
      {
        size: 'invisible',
        callback: (response) => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
          console.log('登录结果response:', response);
        },
      },
      auth
    );
    console.log(recaptchaVerifier);
    // 0481667345

    this.auth
      .signInWithPhoneNumber('+61450431269', recaptchaVerifier)
      .then(function (confirmationResult) {
        var verificationCode = window.prompt(
          'Please enter the verification ' +
            'code that was sent to your mobile device.'
        );
        return confirmationResult.confirm(verificationCode);
      })
      .catch(function (error) {
        // Handle Errors here.
      });
  }

  onLogout() {
    this.auth.signOut();
    this.appStore.update((state) => ({
      sess: null,
      isLogin: false,
    }));
    AppConfig.setSession(null);
    console.log(this.$sess);
  }
}
