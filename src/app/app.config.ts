import * as localforage from 'localforage';
import { AppStore } from './app.store';
import { AppUtil } from './app.util';

declare let globalBaseUrl: any;
declare let globalBaseUrl2: any;
declare let GlobalOpenCDN: any;

class AppConfigBase {
  /********** base var **********/
  public $debug = true;
  public $projectVersion = 101;
  public $projectVersionCode = '0.1.1';
  public $bundleId = 'com.calendar';
  public $useMao = true;
  public $tokenName = 'SSE';

  private $openCDN = (() => {
    try {
      return !!GlobalOpenCDN;
    } catch (_) {}
    return false;
  })();

  // ------------------

  private debugBaseUrl = '';
  private releaseBaseUrl = '';
  private fileBaseUrl = '';
  // private fileBaseUrl = '';

  private debugCDNUrl = 'https://xxx.com';
  private releaseCDNUrl = 'https://xxx.com';

  /********** base **********/

  private $allowOutAuthParam = false;
  private $sessKey = 'token'; // ['token'];
  private $tokenToHeader = 'Authorization'; // 'Authorization'
  private $sessUserID = 'uid';

  public $session: any;
  public $lang = 'en';
  private $sett: any;
  private $sessToken: any;
  private $gobackFuncs = [];
  private static $self: AppConfigBase;
  private $beforLeavePages = [];
  private $memStates: Map<string, any> = new Map();
  private appStore: AppStore = null;

  constructor() {}

  public static getInstance(): AppConfigBase {
    if (AppConfigBase.$self) {
      return AppConfigBase.$self;
    }
    this.$self = new AppConfigBase();
    return this.$self;
  }

  public async init() {
    if (!this.canStorage()) {
      return;
    }

    localforage.config({
      name: this.$bundleId,
      storeName: this.$bundleId + '_' + this.$projectVersionCode,
    });

    const isess = await this.get('session');
    if (isess) {
      this.$session = isess;
    }

    console.log('sess', this.$session);

    const lang = await this.get('lang');
    if (lang) {
      this.$lang = lang;
    }

    //AppStore.commit('setSession', {
    //  sess: this.$session,
    //  isLogin: this.isLogin(),
    //});
    //AppStore.commit('setLang', this.$lang);

    //AppStore.commit('setDebugTag', this.$debug ? true : false);
    //AppStore.commit('setIsMao', this.$useMao ? true : false);
  }

  /********** method **********/
  public projectVersion() {
    return this.$projectVersion;
  }

  public projectVersionCode() {
    return this.$projectVersionCode;
  }

  public getTokenToHeader() {
    return this.$tokenToHeader;
  }

  public getLang() {
    return this.$lang;
  }

  public setAppStore(a: AppStore) {
    this.appStore = a;
  }

  public appStoreUpdate(o) {
    if (this.appStore) {
      this.appStore.update((state) => o);
    }
  }

  public async setLang(l) {
    this.$lang = l;
    await this.set('lang', l);

    this.appStoreUpdate({ lang: this.$lang });
    return this.$lang;
  }

  public isDebug() {
    return this.$debug;
  }

  public getSession() {
    console.log('AppConfig.getSession');
    return this.$session;
  }

  public async setSession(s) {
    if (!this.canStorage()) {
      return;
    }

    if (s) {
      s[this.$sessUserID] = '' + s[this.$sessUserID];
    }

    const isess = await this.set('session', s);
    this.$session = isess;

    console.log('setSession', s, this.$session);

    this.appStoreUpdate({
      sess: this.$session,
      isLogin: this.isLogin(),
    });
  }

  public isLogin() {
    if (!this.$session) {
      return false;
    }
    if (!this.$session[this.$sessUserID]) {
      return false;
    }
    const id = this.$session[this.$sessUserID].toString();
    if (id != '0' && id != 'null' && id != 'false' && id.length > 0) {
      return true;
    }
    return false;
  }

  public getUid() {
    if (!this.$session) {
      return 0;
    }
    if (!this.$session[this.$sessUserID]) {
      return '';
    }
    return this.$session[this.$sessUserID];
  }

  // imageType: raw/org, fill, fit, resize, crop
  public formatCDN(url: string, imageType?, width?, height?) {
    if (!this.$openCDN) {
      return url;
    }

    const arr = url.split('?');
    // 只cdn图片
    if (
      arr[0].endsWith('.jpg') ||
      arr[0].endsWith('.png') ||
      arr[0].endsWith('.jpeg') ||
      arr[0].endsWith('.bmp')
    ) {
      imageType = imageType ? imageType : 'resize';
      width = width ? Math.ceil(width / 5.0) * 5 : 500;
      height = height ? Math.ceil(height / 5.0) * 5 : null;
      const params = {
        url: url,
        width: width,
        height: height,
        type: imageType,
      };
      if (this.$debug) {
        return AppUtil.updateUrl(this.debugCDNUrl + '/img', params);
      }
      return AppUtil.updateUrl(this.releaseCDNUrl + '/img', params);
    }
    return url;
  }

  public getBaseUrl(ignore?) {
    let gurl;
    try {
      gurl = globalBaseUrl;
    } catch (_) {}

    if (!ignore) {
      if (this.isDebug()) {
        return gurl ? gurl : this.debugBaseUrl;
      } else {
        return gurl ? gurl : this.releaseBaseUrl;
      }
    } else {
      return this.releaseBaseUrl;
    }
  }

  public getFileBaseUrl(uuid: string): string {
    if (
      this.fileBaseUrl.indexOf('http') >= 0 ||
      this.fileBaseUrl.indexOf('://') >= 0
    ) {
      return this.fileBaseUrl + uuid;
    }
    return this.getBaseUrl() + this.fileBaseUrl + uuid;
  }

  /********** 存储 *********** */
  public async remove(key, fn?) {
    if (!this.canStorage()) {
      if (fn) {
        fn(false);
      }
      return;
    }
    await localforage.removeItem(key);
    if (fn) {
      fn(true);
    }
  }

  public canStorage() {
    return !!localforage;
  }

  public async set(key, pval): Promise<any> {
    if (!this.canStorage()) {
      return new Promise<any>((resolve) => {
        resolve(null);
      });
    }
    return new Promise<any>((resolve) => {
      const now = parseInt('' + Math.floor(new Date().getTime() / 1000), 10);
      localforage
        .setItem(key, { __AUTO_TIME_TAG: now, val: pval })
        .then((data) => {
          if (data) {
            resolve(data.val);
          } else {
            resolve(null);
          }
        })
        .catch(() => {
          resolve(null);
        });
    });
  }

  public async get(key, def?): Promise<any> {
    if (!this.canStorage()) {
      return Promise.resolve(def ? def : null);
    }
    return new Promise<any>((resolve) => {
      localforage
        .getItem(key)
        .then((data: any) => {
          if (data) {
            resolve(data.val);
          } else {
            resolve(def ? def : null);
          }
        })
        .catch(() => {
          resolve(def ? def : null);
        });
    });
  }

  public async del(key): Promise<any> {
    if (!this.canStorage()) {
      return new Promise<any>((resolve) => {
        resolve(null);
      });
    }
    return new Promise<any>((resolve) => {
      localforage
        .removeItem(key)
        .then((data) => {
          resolve(null);
        })
        .catch(() => {
          resolve(null);
        });
    });
  }

  public clearAll() {
    if (localforage) {
      localforage.clear();
    }
    if (this.$sessToken) {
      this.$sessToken = null;
    }
    if (this.$session) {
      this.$session = null;
    }
  }

  public async getWithTimeoutStrict(key, timeoutSecond, def?): Promise<any> {
    if (!this.canStorage()) {
      return new Promise<any>((resolve) => {
        resolve({
          isTimeout: true,
          data: def ? def : null,
        });
      });
    }
    return new Promise<any>((resolve) => {
      localforage
        .getItem(key)
        .then((data: any) => {
          const now = parseInt(
            '' + Math.floor(new Date().getTime() / 1000),
            10
          );
          if (
            !data ||
            !data.__AUTO_TIME_TAG ||
            data.__AUTO_TIME_TAG > now ||
            now - data.__AUTO_TIME_TAG > timeoutSecond
          ) {
            resolve({
              isTimeout: true,
              data: def ? def : null,
            });
            return;
          }
          resolve({
            isTimeout: false,
            data: data.val,
          });
        })
        .catch(() => {
          resolve({
            isTimeout: true,
            data: def ? def : null,
          });
        });
    });
  }

  public async getWithTimeout(key, timeoutSecond, def?): Promise<any> {
    const val = await this.getWithTimeoutStrict(key, timeoutSecond, def);
    return Promise.resolve(val.data);
  }

  public async setSessToken(pkg) {
    if (!this.canStorage()) {
      return;
    }
    if (!pkg) {
      await this.del('SESS_TOKEN');
      this.$sessToken = null;
      return;
    }
    let tk = null;
    for (const k of Object.keys(pkg)) {
      if (k === this.$sessKey) {
        tk = {
          key: k,
          value: pkg[k],
        };
      }
      if (tk) {
        break;
      }
    }
    if (!tk && pkg.data) {
      for (const k of Object.keys(pkg.data)) {
        if (k === this.$sessKey) {
          tk = {
            key: k,
            value: pkg.data[k],
          };
        }
        if (tk) {
          break;
        }
      }
    }
    if (tk) {
      console.log('setSessToken', tk);
      await this.set('SESS_TOKEN', tk);
      this.$sessToken = tk;
    }
  }

  public async getSessToken(): Promise<any> {
    if (this.$allowOutAuthParam) {
      return null;
    }
    if (this.$sessToken && this.$sessToken.key === this.$sessKey) {
      return Promise.resolve(this.$sessToken);
    }
    const tk = await this.get('SESS_TOKEN');
    if (!tk) {
      return Promise.resolve(null);
    }
    if (tk.key === this.$sessKey) {
      this.$sessToken = tk;
      return Promise.resolve(tk);
    }
    return Promise.resolve(null);
  }

  public gobackFuncPop() {
    const obj = this.$gobackFuncs.pop();
    if (!obj) {
      return null;
    }
    return obj.fn;
  }

  public gobackFuncClear(key) {
    const items = [];
    for (const item of this.$gobackFuncs) {
      if (item.key !== key) {
        items.push(item);
      }
    }
    this.$gobackFuncs = items;
  }

  public getUrl() {
    if (this.$debug) {
      return this.debugBaseUrl;
    } else {
      return this.releaseBaseUrl;
    }
  }

  public addOnLeavePage(p) {
    this.$beforLeavePages.push(p);
  }

  public async clearOnLeavePage() {
    for (const val of this.$beforLeavePages) {
      if (val && val.viewDidLeave) {
        const r = await val.viewDidLeave();
        if (!r) {
          return false;
        }
      }
    }
    this.$beforLeavePages = [];
    return true;
  }

  public setMemState(me: any, type, v) {
    let key = type;
    if (me && me.$route && me.$route.fullPath) {
      key += '&&' + me.$route.fullPath.split('?')[0];
    }
    this.$memStates.set(key, v);
  }

  public getMemState(me: any, type, def) {
    let key = type;
    if (me && me.$route && me.$route.fullPath) {
      key += '&&' + me.$route.fullPath.split('?')[0];
    }
    if (this.$memStates.has(key)) {
      return this.$memStates.get(key);
    }
    return def;
  }
}

export const AppConfig = AppConfigBase.getInstance();
