import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Query } from '@datorama/akita';
import { NavController } from '@ionic/angular';
import { alertController, toastController, menuController } from '@ionic/core';
import { AppConfig } from './app.config';
import { AppState, AppStore } from './app.store';
import { AppUtil } from './app.util';

export class PageBase extends Query<AppState> {
  $sess: any;
  $isLogin: boolean = false;

  params: ParamMap;

  constructor(
    protected appStore: AppStore,
    protected navCtrl: NavController,
    public route: ActivatedRoute
  ) {
    super(appStore);

    this.params = route.snapshot.queryParamMap;

    this.select(['sess', 'isLogin']).subscribe((state) => {
      this.$sess = state.sess;
      this.$isLogin = state.isLogin;

      this.onStoreChanged();
    });
  }

  onStoreChanged() {}

  num(v) {
    // tslint:disable-next-line: radix
    return parseFloat(
      (parseInt((parseFloat(v) * 100).toString()) / 100).toString()
    );
  }

  // yyyy-MM-dd hh:mm:ss
  date(v, fmt) {
    return AppUtil.formatDate(AppUtil.newDate(v), fmt);
  }

  xstr(v, left, right) {
    return AppUtil.xstrMid(v, left, right);
  }

  isWeiXin() {
    const chk = new RegExp('MicroMessenger', 'i');
    const ua = navigator.userAgent.toLowerCase();
    return chk.test(ua);
  }

  isNotWeiXin() {
    return !this.isWeiXin();
  }

  copy(obj) {
    if (!obj) {
      return obj;
    }
    if (typeof obj !== 'object') {
      return obj;
    }
    return JSON.parse(JSON.stringify(obj));
  }

  int(v) {
    if (!v) {
      return 0;
    }
    const r = parseInt(v, 10);
    return isNaN(r) ? 0 : r;
  }

  float(v) {
    if (!v) {
      return 0.0;
    }
    const r = parseFloat(v);
    return isNaN(r) ? 0 : r;
  }

  ntf(v) {
    return v.replace(/[\n]+/g, '\\n');
  }

  async alert(message, header = 'Notice') {
    const alert = await alertController.create({
      header: header,
      message: message,
      buttons: ['Confirm'],
    });

    await alert.present();
  }

  async confirm(message, okFn, header = 'Notice') {
    const alert = await alertController.create({
      header: header,
      message: message,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { text: 'Confirm', handler: okFn },
      ],
    });

    await alert.present();
  }

  async toast(message) {
    const toast = await toastController.create({
      message,
      duration: 2000,
    });
    await toast.present();
  }

  hrefTo(url, needLogin = false, params = null) {
    menuController.close();
    if (needLogin && !this.$isLogin) {
      this.navCtrl.navigateForward(['/login']);
      return;
    }
    this.navCtrl.navigateForward(url, { queryParams: params });
  }

  hrefReplace(url, needLogin = false, params = null) {
    menuController.close();
    if (needLogin && !this.$isLogin) {
      this.navCtrl.navigateForward(['/login']);
      return;
    }
    this.navCtrl.navigateBack(url, { queryParams: params });
  }

  strParams(params) {
    if (params === null) {
      return null;
    }
    for (const k of Object.keys(params)) {
      params[k] = '' + params[k];
    }
    return params;
  }

  getParam(key: string, def?) {
    if (!this.params || !this.params.get(key)) {
      return def;
    }
    return this.params.get(key);
  }

  file(path: any) {
    if (!path) {
      return '';
    }
    if (typeof path === 'object') {
      return path;
    }
    if (('' + path).indexOf('/') > -1) {
      return path;
    }
    return AppConfig.getFileBaseUrl(path);
  }

  urlPath(url: any) {
    return AppUtil.getUrl(url);
  }

  pg(pgn) {
    if (pgn && pgn.currentPage) {
      return pgn.currentPage;
    }
    return 1;
  }

  nextPg(pgn) {
    console.log(pgn);
    if (pgn && pgn.currentPage) {
      if (pgn.currentPage >= pgn.totalPage) {
        return -1;
      } else {
        return pgn.currentPage + 1;
      }
    }
    return 2;
  }

  json(v) {
    return JSON.stringify(v);
  }

  htmlContent(c: string) {
    const arr = c.split('\n');
    for (let i = 0; i < arr.length; i++) {
      arr[i] = arr[i].trim();
    }
    return '<p>' + arr.join('</p><p>') + '</p>';
  }
}
