import { AppUtil } from './app.util';
import { AppConfig } from './app.config';
import axios, { AxiosRequestConfig } from 'axios';
// import axios from 'axios';

const TokenHeadName = AppConfig.$tokenName ? AppConfig.$tokenName : 'Bearer';

export class AppNet {
  public static configSystemData: any;

  public static onUploadProgress = (e: ProgressEvent) => {
    console.log('upload: ' + (((e.loaded / e.total) * 100) | 0) + '%');
  };

  public static log(hideLog, ...args) {
    if (hideLog) {
      return;
    }
    console.log(' NET ', ...args);
  }

  public static blog(hideLog, bgcolor, ...args) {
    if (hideLog) {
      return;
    }
    const args0 = args.length > 0 ? args[0] : '';
    args = args.length > 0 ? args.slice(1) : [];
    console.log('%c ' + args0 + ' ', 'background-color:' + bgcolor + ';color:#fff;', ...args);
  }

  public static err(hideLog, e) {
    if (hideLog) {
      return;
    }
    if (e && e.message) {
      this.log(false, 'err:', e.message);
    } else {
      this.log(false, 'err:', e);
    }
  }

  public static berr(hideLog, e) {
    if (hideLog) {
      return;
    }
    if (e && e.message) {
      this.blog(false, 'err:', e.message);
    } else {
      this.blog(false, 'err:', e);
    }
  }

  public static randBgColode() {
    return (
      '#' +
      Math.random()
        .toString(16)
        .substr(2, 6)
        .toUpperCase()
    );
  }

  // http request
  private static async _request(imethod, url: string, pra, hideLog?, onProgress?: (progressEvent: any) => void, mustKey?: string): Promise<any> {
    imethod = ('' + imethod).toUpperCase();

    const header: any = {};
    const skey = AppUtil.makeKey(imethod, url, pra);
    let progressFunc: (progressEvent: any) => void = null;
    let isBlob = false;
    if (imethod === 'BLOB') {
      isBlob = true;
      imethod = 'GET';
    }
    let newPra = {};
    if (imethod === 'UPLOAD') {
      newPra = pra;
    } else if(pra) {
      for (const key of Object.keys(pra)) {
        if (pra[key] !== '' && pra[key] !== null) {
          newPra[key] = pra[key];
        }
      }
    }
    if (!isBlob) {
      const sessToken = await AppConfig.getSessToken();
      if (!pra || typeof pra !== 'object') {
        pra = {};
      }
      if (!pra._lang) {
        // pra._lang = AppConfig.getLang();
      }

      const tokenToHeader = AppConfig.getTokenToHeader();
      if (!pra._noToken && sessToken) {
        if (tokenToHeader) {
          if (tokenToHeader === 'Authorization') {
            header[tokenToHeader] = TokenHeadName + ' ' + sessToken.value;
          }
        } else {
          pra[sessToken.key] = sessToken.value;
        }
      }

      // pra._pv = AppConfig.projectVersion();
      // pra._rnd = Math.random().toString();

      if (imethod === 'UPLOAD') {
        imethod = 'POST';
        header['Content-Type'] = 'multipart/form-data';
        progressFunc = onProgress ? onProgress : this.onUploadProgress;
      } else {
        const filterPra = {};
        for (const k of Object.keys(pra)) {
          filterPra['' + k] = pra[k];
        }
        pra = filterPra;
      }
    }
    const rurl = AppUtil.getUrl(url);
    const opts: AxiosRequestConfig = {
      url: rurl,
      method: imethod,
      headers: header,
      withCredentials: isBlob ? false : true,
      responseType: isBlob ? 'blob' : null,
      params: imethod === 'GET' || imethod === 'DELETE' ? newPra : null,
      data: imethod === 'GET' || imethod === 'DELETE' ? null : newPra,
      onUploadProgress: progressFunc,
    };
    // console.log('opts', opts);

    const bgcolor = this.randBgColode();
    this.blog(hideLog, bgcolor, imethod, rurl, newPra);
    return new Promise<any>((resolve, reject) => {
      axios
        .request(opts)
        .then(async (resp) => {
          const data = resp.data;
          if (!data) {
            this.blog(hideLog, bgcolor, 'RESP', isBlob ? 'Blob(Size: 0)' : 'null');
            resolve(null);
            return;
          }
          this.blog(hideLog, bgcolor, 'RESP', data);
          if (isBlob) {
            resolve(data);
            return;
          }

          try {
            if (data.code === 'success') {
              if (!mustKey || (typeof data[mustKey] !== 'undefined' && data[mustKey])) {
                await AppConfig.set(skey, data);
              } else {
                await AppConfig.remove(skey);
              }
            } else if (data.code === 'nologin') {
              await AppConfig.setSession(null);
            } else {
              await AppConfig.remove(skey);
            }
            resolve(data);
          } catch (e) {
            this.err(hideLog, e);
            reject(e);
          }
        })
        .catch(async (httpError: any) => {
          this.err(hideLog, httpError);

          let icode = '400';
          let imessage;
          let idata;
          if (httpError && httpError.response) {
            icode = '' + httpError.response.status;
            imessage = httpError.response.statusText;
            idata = httpError.response.data;
          }

          if (!imessage) {
            imessage = '' + httpError;
          }

          resolve({
            code: icode,
            msg: '网络错误: ' + imessage.replace('Error: ', ''),
            data: idata,
          });
        });
    });
  }

  public static async upload(url: string, params, hideLog?, onProgress?: (progressEvent: any) => void) {
    return this._request('UPLOAD', url, params, hideLog, onProgress);
  }

  public static async post(url: string, params, hideLog?) {
    const result = await AppConfig.getWithTimeoutStrict(AppUtil.makeKey(url, params), 0);
    if (result.isTimeout) {
      return this._request('POST', url, params, hideLog);
    }
    return new Promise<any>((resolve) => resolve(result.data));
  }

  public static async put(url: string, params, hideLog?) {
    const result = await AppConfig.getWithTimeoutStrict(AppUtil.makeKey(url, params), 0);
    if (result.isTimeout) {
      return this._request('PUT', url, params, hideLog);
    }
    return new Promise<any>((resolve) => resolve(result.data));
  }

  public static async get(url: string, params?, hideLog?, cacheTimeout?: number, mustKey?: string): Promise<any> {
    if (!cacheTimeout) {
      cacheTimeout = 0;
    }
    const result = await AppConfig.getWithTimeoutStrict(AppUtil.makeKey(url, params), cacheTimeout);
    if (result.isTimeout) {
      return this._request('GET', url, params, hideLog, null, mustKey);
    }
    return new Promise<any>((resolve) => resolve(result.data));
  }

  public static async delete(url: string, params, hideLog?, cacheTimeout?: number, mustKey?: string): Promise<any> {
    if (!cacheTimeout) {
      cacheTimeout = 0;
    }
    const result = await AppConfig.getWithTimeoutStrict(AppUtil.makeKey(url, params), cacheTimeout);
    if (result.isTimeout) {
      return this._request('DELETE', url, params, hideLog, null, mustKey);
    }
    return new Promise<any>((resolve) => resolve(result.data));
  }

  public static async blob(url: string, params?, hideLog?) {
    const result = await AppConfig.getWithTimeoutStrict(AppUtil.makeKey(url, params), 0);
    if (result.isTimeout) {
      return this._request('BLOB', url, params, hideLog);
    }
    return new Promise<any>((resolve) => resolve(result.data));
  }

  public static grabNetworkParams(cb) {
    AppConfig.getSessToken().then((sessToken) => {
      const params = {
        // _lang: AppConfig.getLang(),
        // _pv: AppConfig.projectVersion(),
        // _rnd: Math.random().toString(),
      };
      params[sessToken.key] = sessToken.value;

      cb(params);
    });
  }

  public static uploadFileByObject = async (url, efile: File, fn, inputName?) => {
    const a = new FormData();
    a.append('file', efile);

    const data = await AppNet.upload(url, a, null);
    if (data.code !== '200') {
      fn(data.code + ':' + data.msg, null);
    } else {
      if (data.data) {
        data.data.name = efile.name;
      }
      fn('', data.data);
    }
  };

  public static uploadFileByAcceptOld = (url, accept, fn, inputName?, checkFunc?) => {
    const input = document.createElement('input');
    if (accept) {
      input.accept = accept;
    }
    input.type = 'file';
    input.name = inputName ? inputName : 'file';
    input.click();
    input.onchange = async () => {
      if (checkFunc) {
        const icontinue = await checkFunc(input.files[0], input);
        if (!icontinue) {
          return false;
        }
      }
      await AppNet.uploadFileByObject(url, input.files[0], fn, inputName);
    };
  };
}
