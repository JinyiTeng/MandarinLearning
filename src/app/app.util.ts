import { AppConfig } from './app.config';
import jsSHA from 'jssha';

export class Passwordstrength {
  length = 0;
  spaceCharCount = 0; // space
  numberCharCount = 0; // number[0-9]
  upperCharCount = 0; // upper char
  lowerCharCount = 0; // lower char
  specialCharCount = 0; // special char
  notAsciiCharCount = 0; // not ascii char
}

export class AppUtil {
  public static MAX_INT = 2147483647;

  public static msg($alert, msg) {
    alert(msg);
  }
  public static str(...args) {
    const strs = [];
    for (const i of Object.keys(args)) {
      strs.push(JSON.stringify(args[i]));
    }
    return strs.join('\n');
  }

  public static pushJoinArr(org, key: string, tag = ',') {
    if (!org) {
      return key;
    }
    if (!key) {
      return org;
    }
    const arr = org.split(tag);
    const res = [];
    let have = false;
    for (const item of arr) {
      if (item.length > 0) {
        if (item !== key) {
          res.push(item);
        } else {
          have = true;
        }
      }
    }
    if (!have) {
      res.push(key);
    }
    return res.join(tag);
  }

  public static removeJoinArr(org, key: string, tag = ',') {
    if (!org || !key) {
      return org;
    }
    const arr = org.split(tag);
    const res = [];
    for (const item of arr) {
      if (item.length > 0 && item !== key) {
        res.push(item);
      }
    }
    return res.join(tag);
  }

  public static toSha256(str) {
    const shaObj = new jsSHA('SHA-256', 'TEXT');
    shaObj.update(str);
    return shaObj.getHash('HEX');
  }

  /****** 对象转数组 *******/
  public static objectToArray(obj) {
    const result = [];
    if (!obj || typeof obj !== 'object') {
      return result;
    }

    let j = 0;
    for (const i of Object.keys(obj)) {
      result[j] = obj[i];
      j++;
    }
    return result;
  }

  public static filterEmpty(arr) {
    const res = [];
    if (!arr) {
      return res;
    }
    for (const key of Object.keys(arr)) {
      if (arr[key]) {
        res.push(arr[key]);
      }
    }
    return res;
  }

  public static sleep(ms: number): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => resolve(), ms);
    });
  }

  public static getImagePath(path, basePath?, type?, defPath?, ignore?) {
    if (!path || path.length === 0) {
      if (defPath) {
        return defPath;
      }
      return 'assets/imgs/default_image.png';
    }
    if (
      path.indexOf('http://') === 0 ||
      path.indexOf('https://') === 0 ||
      path.indexOf('assets') === 0 ||
      path.indexOf('data:image') === 0
    ) {
      return path;
    }
    if (path.indexOf('//') === 0) {
      return 'http:' + path;
    }
    if (path.indexOf('://') === 0) {
      return 'http' + path;
    }
    if (path.indexOf('/') === 0) {
      return AppConfig.getBaseUrl(ignore) + path;
    }
    if (basePath && type) {
      return (
        AppConfig.getBaseUrl(ignore) +
        basePath +
        '?size=' +
        type +
        '&path=' +
        path
      );
    }
    return AppConfig.getBaseUrl(ignore) + '/' + path;
  }

  public static getUrl(path) {
    if (!path || path.length === 0) {
      return '';
    }
    const urlBase = AppConfig.getBaseUrl();
    if (
      path.indexOf('http://') === 0 ||
      path.indexOf('https://') === 0 ||
      path.indexOf(urlBase) === 0
    ) {
      return path;
    }
    return urlBase + path;
  }

  public static copy(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  public static deepCopy(p, cp) {
    const c = cp || {};
    for (const i of Object.keys(p)) {
      if (!p.hasOwnProperty(i)) {
        continue;
      }
      if (typeof p[i] === 'object') {
        c[i] = p[i].constructor === Array ? [] : {};
        this.deepCopy(p[i], c[i]);
      } else {
        c[i] = p[i];
      }
    }
    return c;
  }

  public static time(): number {
    const tm = new Date().getTime();
    return parseInt('' + Math.floor(tm / 1000), 10);
  }

  public static getTime(str): number {
    const tm = this.newDate(str).getTime();
    return parseInt('' + Math.floor(tm / 1000), 10);
  }

  public static makeKey(...args): string {
    const str = JSON.stringify(args);
    const shaObj = new jsSHA('SHA-1', 'TEXT');
    shaObj.update(str);
    return shaObj.getHash('HEX');
  }

  public static defValue(a, key, def) {
    if (!a || !a[key]) {
      return def;
    }
    return a[key];
  }

  public static getPercent(a, b, def) {
    if (typeof a === 'undefined' || typeof b === 'undefined') {
      if (typeof def === 'undefined') {
        return 0;
      } else {
        return def;
      }
    }
    let p = parseInt('' + (a / b) * 100, 10);
    if (p < 0) {
      p = 0;
    } else if (p > 100) {
      p = 100;
    }
    return p;
  }

  public static xstrMid(str, left, right, tag = '...') {
    if (!str || str.length < left + right) {
      return str;
    }
    return str.substr(0, left) + tag + str.substr(0 - right);
  }

  public static formatMoney(s, n) {
    if (n !== 0) {
      n = n > 0 && n <= 20 ? n : 2;
      s = parseFloat((s + '').replace(/[^\d\.-]/g, '')).toFixed(n) + '';
    } else {
      s = parseInt(s + '', 10) + '';
    }
    const sp = s.split('.');
    const l = s.split('.')[0].split('').reverse(),
      r = sp.length > 1 ? '.' + sp[1] : '';
    let t = '',
      i = 0;
    for (; i < l.length; i++) {
      t += l[i] + ((i + 1) % 3 === 0 && i + 1 !== l.length ? ',' : '');
    }
    return t.split('').reverse().join('') + r;
  }

  public static formatFixed(num, n) {
    const p = Math.pow(10, n);
    return (Math.floor(num * p) / p).toFixed(n);
  }

  public static formatFloat(v, nFixed2?) {
    const fx = nFixed2 ? nFixed2 : 2;
    if (!v) {
      return (0.0).toFixed(fx);
    }
    let vv = parseFloat(v);
    vv = Math.abs(vv);
    if (vv >= 10000.0) {
      if (vv >= 100000000.0) {
        if (vv >= 10000000000000.0) {
          return 'N';
        }
        return this.formatFixed(vv / 100000000.0, fx) + '亿';
      }
      return this.formatFixed(vv / 10000.0, fx) + '万';
    }
    return this.formatFixed(vv, fx);
  }

  public static formatBitSize(v, nFixed2?) {
    const fx = nFixed2 ? nFixed2 : 2;
    if (!v) {
      return (0.0).toFixed(fx);
    }
    let vv = parseFloat(v);
    vv = Math.abs(vv);
    if (vv >= 1024.0) {
      if (vv >= 1048576.0) {
        if (vv >= 1073741824.0) {
          if (vv >= 1099511627776.0) {
            return this.formatFixed(vv / 1099511627776.0, fx) + 'TB';
          }
          return this.formatFixed(vv / 1073741824.0, fx) + 'GB';
        }
        return this.formatFixed(vv / 1048576.0, fx) + 'MB';
      }
      return this.formatFixed(vv / 1024.0, fx) + 'KB';
    }
    return this.formatFixed(vv, fx) + 'B';
  }

  public static formatDistance(v, nFixed2?) {
    const fx = nFixed2 ? 0 : 2;
    if (!v) {
      return (0.0).toFixed(fx);
    }
    let vv = parseFloat(v);
    vv = Math.abs(vv);
    if (vv >= 1000.0) {
      return this.formatFixed(vv / 1000.0, 2) + 'km';
    }
    return this.formatFixed(vv, fx);
  }

  public static formatInt(v) {
    return this.formatFloat(v, true);
  }
  public static formatFloatbai(v) {
    return v * 100;
  }

  public static formatNumber(n) {
    n = isNaN(n) ? 0.0 : n;
    const b = parseInt(n, 10).toString();
    const len = b.length;
    if (len <= 3) {
      return b;
    }
    const r = len % 3;
    return r > 0
      ? b.slice(0, r) + ',' + b.slice(r, len).match(/\d{3}/g).join(',')
      : b.slice(r, len).match(/\d{3}/g).join(',');
  }

  public static timeAgo(str) {
    if (!str) {
      return '';
    }
    const langarr = [
      '前',
      '年',
      '月',
      '周',
      '日',
      '小时',
      '分钟',
      '秒',
      '刚刚',
    ];
    const tm = typeof str === 'string' ? this.newDate(str).getTime() : str;
    const differ = new Date().getTime() / 1000 - tm / 1000;
    return AppUtil.timeAgoBySecond(differ, langarr);
  }

  public static timeAgoBySecond(differ, langarr?) {
    langarr = langarr || [
      '以内',
      '年',
      '月',
      '周',
      '日',
      '小时',
      '分钟',
      '秒',
      '1分钟内',
    ];
    if (isNaN(differ)) {
      return '';
    }
    if (differ < 60) {
      return langarr[8];
    }
    const differY = Math.floor(differ / 365.0 / 86400.0);
    const differM = Math.floor(differ / 30.0 / 86400.0);
    const differW = Math.floor(differ / 7.0 / 86400.0);
    const differD = Math.floor(differ / 86400.0);
    const differH = Math.floor(differ / 3600.0);
    const differMin = Math.floor(differ / 60.0);
    const differS = Math.floor(differ);

    if (differY) {
      return differY + langarr[1] + langarr[0];
    } else if (differM) {
      return differM + langarr[2] + langarr[0];
    } else if (differW) {
      return differW + langarr[3] + langarr[0];
    } else if (differD) {
      return differD + langarr[4] + langarr[0];
    } else if (differH) {
      return differH + langarr[5] + langarr[0];
    } else if (differMin) {
      return differMin + langarr[6] + langarr[0];
    } else {
      return differS + langarr[7] + langarr[0];
    }
  }

  // 0000-00-00 00:00:00
  public static newDate(v) {
    // return;
    if (v instanceof Date) {
      return v;
    }
    if (!v) {
      return new Date();
    }
    v = v.replace(/\.[0-9]+/g, '');
    v = v.replace(/-/g, '/');
    return new Date(Date.parse(v));
  }

  // yyyy-MM-dd hh:mm:ss
  public static formatDate(date, fmt) {
    // author: meizz
    if (!date) {
      return '';
    }
    if (!fmt) {
      return '' + date;
    }
    if (typeof date !== 'object') {
      date = this.newDate(date);
    }
    const o = {
      'M+': date.getMonth() + 1, // 月份
      'd+': date.getDate(), // 日
      'h+': date.getHours(), // 小时
      'm+': date.getMinutes(), // 分
      's+': date.getSeconds(), // 秒
      'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
      S: date.getMilliseconds(), // 毫秒
    };
    if (/(y+)/.test(fmt)) {
      fmt = fmt.replace(
        RegExp.$1,
        (date.getFullYear() + '').substr(4 - RegExp.$1.length)
      );
    }
    for (const k of Object.keys(o)) {
      if (new RegExp('(' + k + ')').test(fmt)) {
        fmt = fmt.replace(
          RegExp.$1,
          RegExp.$1.length === 1
            ? o[k]
            : ('00' + o[k]).substr(('' + o[k]).length)
        );
      }
    }
    return fmt;
  }

  public static jsonParse(data) {
    try {
      return typeof data === 'string' ? JSON.parse(data) : data;
    } catch (e) {}
    return {};
  }

  public static unique(s, cb) {
    const arr = s
      .sort()
      .join(',,')
      .replace(/(,|^)([^,]+)(,,\2)+(,|$)/g, '$1$2$4')
      .replace(/,,+/g, ',')
      .replace(/,$/, '')
      .split(',');
    cb = cb || ((v) => v);

    for (const i of Object.keys(arr)) {
      arr[i] = cb(arr[i]);
    }
    return arr;
  }

  public static pagination(pageNo, pageSize, array) {
    const offset = (pageNo - 1) * pageSize;
    return offset + pageSize >= array.length
      ? array.slice(offset, array.length)
      : array.slice(offset, offset + pageSize);
  }

  public static isNumber(n, accurate?) {
    if (accurate) {
      return typeof n === 'number' && isFinite(n);
    } else {
      return !isNaN(parseFloat(n)) && isFinite(n);
    }
  }

  public static combineToBase(base, ...args) {
    if (!base || !args) {
      return base;
    }
    for (const key of Object.keys(base)) {
      for (const arg of args) {
        if (arg && arg[key]) {
          base[key] = arg[key];
        }
      }
    }
    return base;
  }

  public static arrayMerge(...args) {
    let k = 0;
    const res = [];
    for (const i of Object.keys(args)) {
      for (const j of Object.keys(args[i])) {
        if (this.isNumber(j)) {
          res[k++] = args[i][j];
        } else {
          res[j] = args[i][j];
        }
      }
    }
    return res;
  }

  public static arrayRemove(arr, ...args) {
    let hv = false;
    const res = [];
    for (const i of Object.keys(arr)) {
      hv = false;
      for (const j in Object.keys(args)) {
        if (i === args[j]) {
          hv = true;
          break;
        }
      }
      if (!hv) {
        res.push(arr[i]);
      }
    }
    return res;
  }

  public static inArray(v, arr) {
    if (typeof arr !== 'object' || typeof v === 'object' || !arr) {
      return false;
    }
    for (const i of Object.keys(arr)) {
      if ('' + arr[i] === '' + v) {
        return true;
      }
    }
    return false;
  }

  public static getNextPage(arr, psz) {
    if (!arr || !psz) {
      return 1;
    }
    return Math.floor(arr.length / psz) + 1;
  }

  public static combineMoreData(old, come, psz) {
    if (!come) {
      return old;
    }
    if (!old || !psz) {
      return come;
    }
    const remove = old.length - (this.getNextPage(old, psz) - 1) * psz;
    for (let i = 0; i < remove; i++) {
      old.pop();
    }
    for (const item of come) {
      old.push(item);
    }
    return old;
  }

  public static parseQueryString(url, onlyParams?): any {
    let str = url;
    const result = {};
    if (!onlyParams) {
      const argo = url.split('?');
      if (argo.length < 2) {
        return result;
      }
      str = argo[1];
    }
    const temp = str.split('&');
    for (const item of temp) {
      const temp2 = item.split('=');
      result[temp2[0]] = decodeURIComponent(temp2[1]);
    }
    return result;
  }

  public static buildQuery(params) {
    if (!params) {
      return '';
    }
    const buf = [];
    for (const key of Object.keys(params)) {
      if (!key || params[key] == null) {
        continue;
      }
      buf.push(key + '=' + encodeURIComponent(params[key]));
    }
    return buf.join('&');
  }

  // url = AppUtil.updateUrl(url, {export: 1, token: ...})
  public static updateUrl(url, params?) {
    if (!params) {
      return url;
    }
    const argo = url.split('?');
    if (argo.length < 2) {
      argo[1] = '';
    }

    const temp = argo[1].split('&');
    const p = {};
    for (const item of temp) {
      if (item == null) {
        continue;
      }
      const t = item.split('=');
      p[t[0]] = decodeURIComponent(t[1]);
    }
    for (const k of Object.keys(params)) {
      p[k] = params[k];
    }

    const query = this.buildQuery(p);
    if (!query) {
      return argo[0];
    }
    return argo[0] + '?' + query;
  }

  public static toMinute(sec, start): string {
    const s = sec - start;
    const vm = Math.floor(s / 3600);
    const vs = '' + Math.floor((s - vm * 3600) / 60);
    let r = '';
    r += ('' + vm).length === 1 ? '0' + vm : vm;
    r += ':' + (vs.length === 1 ? '0' + vs : vs);
    return r;
  }

  public static getPartTime(part) {
    let sec = 0;
    for (const item of part) {
      if (!!item && typeof item !== 'function' && item.length === 3) {
        sec += item[2] - item[1];
      }
    }
    const c = Math.ceil(sec / 60);
    const lbs = [];
    let x = 0;
    let tx = '';
    for (const item of part) {
      if (!!item && typeof item !== 'function' && item.length === 3) {
        let j = item[1] + x;
        let itx = '';
        let ifirst = true;
        for (; j < item[2]; j += 10800) {
          itx = this.toMinute(j, item[0]);
          if (ifirst) {
            lbs.pop();
            ifirst = false;
            if (tx.length > 0) {
              itx = tx + '/' + itx;
            }
          }
          lbs.push(itx);
        }
        x = j - item[2];
        if (x <= 0) {
          itx = this.toMinute(j, item[0]);
          lbs.push(itx);
        }
        tx = itx;
      }
    }

    return { count: c, labels: lbs };
  }

  public static ge(a) {
    return typeof a === 'string'
      ? document.getElementById
        ? document.getElementById(a)
        : null
      : a;
  }

  public static parseFloat(a) {
    const r = parseFloat(a);
    if (isNaN(r)) {
      return 0.0;
    }
    return r;
  }

  public static parseInt(a) {
    const r = parseInt(a, 10);
    if (isNaN(r)) {
      return 0;
    }
    return r;
  }

  /**************system ********/

  public static rad(d) {
    return (d * Math.PI) / 180.0; // 经纬度转换成三角函数中度分表形式。
  }

  public static calcDistance(lat1, lng1, lat2, lng2) {
    const radLat1 = this.rad(lat1);
    const radLat2 = this.rad(lat2);
    const a = radLat1 - radLat2;
    const b = this.rad(lng1) - this.rad(lng2);
    let s =
      2 *
      Math.asin(
        Math.sqrt(
          Math.pow(Math.sin(a / 2), 2) +
            Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)
        )
      );
    s = s * 6378.137; // EARTH_RADIUS;
    s = Math.round(s * 10000) / 10;
    return s;
  }

  public static account(sess) {
    if (typeof sess.username !== 'undefined' || sess.username.length > 0) {
      return sess.username;
    } else if (typeof sess.umobile !== 'undefined' || sess.umobile.length > 0) {
      return sess.umobile;
    } else if (typeof sess.uemail !== 'undefined' || sess.uemail.length > 0) {
      return sess.uemail;
    } else if (typeof sess.uopenid !== 'undefined' || sess.uopenid.length > 0) {
      return sess.uopenid;
    }
    return '';
  }

  public static isNum(str) {
    const newstr = str.replace(/[^0-9]/gi, '');
    return newstr;
  }

  public static objectToPairArray(obj) {
    if (!obj) {
      return [];
    }
    const t = [];
    for (const i of Object.keys(obj)) {
      t.push({
        key: i,
        value: obj[i],
      });
    }
    return t;
  }

  // remove html tag  <div><p>...
  public static stripTags(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText;
  }

  /**********************************
     filepathJoin($protect_split_tag, $path1, ...);
    首参数为true : 用于连接网络路径, 可保护$path1为 'http://', 'file:///abc'等路径协议的连续多斜杠
    首参数为false: 用于连接本地路径, 所有路径连续多斜杠都将被清理为单一

    如:
    filepath_join(true, $config['path'], 'a\\\\bc', '//dd/', '123.png');
    filepath_join(false, '//var/a', 'ab//\\c ', '123.png');
    **********************************/
  public static filepathJoin(...args) {
    if (args.length < 2) {
      return '';
    }
    const protect = !!args[0];
    let path1 = '';
    let path2 = '';
    let first = true;
    let skipPos = 0;
    for (const k of Object.keys(args)) {
      if (parseInt(k, 10) === 0) {
        continue;
      }
      let part = args[k].trim();
      if (part === '') {
        first = false;
        continue;
      }
      if (protect && first) {
        let pos = part.indexOf('//');
        if (pos >= 0 && part.length > 2) {
          // keep///, file path may be have ///
          if (part.length > pos + 3 && part[pos + 2] === '/') {
            pos++;
          }
          skipPos = pos + 2;
          path1 = part.substr(0, skipPos);
          part = part.substr(skipPos);
        }
        first = false;
      }
      path2 += '/' + part;
    }
    path2 = path2.replace(/[\/\\]+/g, '/');
    if (path1 === '') {
      return path2;
    }

    // path1有双斜杠时, path2首字符斜杠应该去掉
    if (path2 !== '' && path2[0] === '/') {
      path2 = path2.substr(1);
    }
    return path1 + path2;
  }

  public static selectFile(accept, fn, name = 'file') {
    const input = document.createElement('input');
    if (accept) {
      input.accept = accept;
    }
    input.type = 'file';
    input.name = name;
    input.click();

    input.onchange = async () => {
      fn(input.files[0]);
    };
  }

  public static filenameFromMime(mime) {
    if (
      !mime ||
      !mime['Content-Disposition'] ||
      mime['Content-Disposition'].length < 1
    ) {
      return '';
    }
    const col = '' + mime['Content-Disposition'][0];
    if (!col.toLowerCase().includes('filename=')) {
      return col;
    }
    const f = col.split('filename=')[1];
    return f.replace(/['"]+/gi, '');
  }

  public static toArray(v) {
    if (!v) {
      return [];
    }
    if (typeof v !== 'object') {
      return [v];
    }
    if (v instanceof Array) {
      return v;
    }
    const r = [];
    for (const k of Object.keys(v)) {
      r.push(v[k]);
    }
    return r;
  }

  public static joinTemplate(s: string, pages) {
    s = s.trim();
    const i = s.lastIndexOf('</div>');
    const p = pages.join('\n');
    if (i <= 0) {
      return s;
    }
    return s.substring(0, i) + p + '\n</div>';
  }

  public static searchTreeNode(treeNode, kw) {
    return searchTreeNode(treeNode, kw);
  }

  public static parseURL(url) {
    const a = document.createElement('a');
    a.href = url;
    return {
      protocol: a.protocol.replace(':', ''),
      host: a.hostname,
      port: a.port,
      path: a.pathname.replace(/^([^\/])/, '/$1'),
      hash: a.hash.replace('#', ''),
      params: (() => {
        const ret = {},
          seg = a.search.replace(/^\?/, '').split('&'),
          len = seg.length;
        for (let i = 0; i < len; i++) {
          if (!seg[i]) {
            continue;
          }
          const s = seg[i].split('=');
          ret[s[0]] = decodeURIComponent(s[1]);
        }
        return ret;
      })(),
    };
  }

  public static parseURLPath(url: string) {
    const c1 = url.split('//');
    if (c1.length > 0) {
      c1[0] = c1[1];
    }
    const c2 = c1[0].split('?');
    const s = c2[0].indexOf('/');
    if (s >= 0) {
      return c2[0].substring(s);
    }
    return '';
  }

  public static openUrl(url, target = '_blank') {
    const a = document.createElement('a');
    a.target = target;
    a.href = url;
    const e = document.createEvent('MouseEvents');
    e.initEvent('click', true, true);
    a.dispatchEvent(e);
  }

  public static toast(msg, tp?, duration?): Promise<any> {
    // ...

    console.log(msg);
    return Promise.resolve(null);
  }

  public static alert(msg, tp?): Promise<any> {
    // ...

    alert(msg);
    return Promise.resolve(null);
  }

  public static selectAllValues(
    e: HTMLElement,
    isSet = false,
    checked = false
  ): Array<any> {
    if (!e) {
      return [];
    }

    const inputs = e.getElementsByTagName('input');
    const res = [];
    for (let i = 0; i < inputs.length; i++) {
      const ei = inputs.item(i);
      if (isSet) {
        ei.checked = checked;
      }

      if (ei.type === 'checkbox' && ei.checked) {
        if (ei.value && ei.value !== 'on') {
          res.push(ei.value);
        }
      }
    }
    return res;
  }

  /*---------------分页-----------------*/
  public static getPaginationByData(data) {
    if (!data) {
      return null;
    }
    return this.getPagination(data.total, data.current_page, data.page_size);
  }
  public static getPagination(total, currentPage = 1, pageSize = 20) {
    if (!pageSize || pageSize < 1) {
      pageSize = 1;
    }
    if (!total || total < 0) {
      total = 0;
    }
    if (!currentPage || currentPage < 1) {
      currentPage = 1;
    }

    const pg = {
      currentPage: currentPage ? currentPage : 1,
      totalPage: Math.ceil(total / pageSize),
      start: 1,
      end: Math.ceil(total / pageSize),
      total: total,
      pageSize: pageSize,
      links: this.paginationArray(currentPage, Math.ceil(total / pageSize)),
      linkPrev: this.paginationNext(
        currentPage,
        Math.ceil(total / pageSize),
        '-'
      ),
      linkNext: this.paginationNext(
        currentPage,
        Math.ceil(total / pageSize),
        '+'
      ),
    };
    return pg;
  }
  public static paginationArray(i, max) {
    if (!i || !max) {
      return null;
    }
    const arr = [];
    if (i < 1) {
      i = 1;
    } else if (i > max) {
      i = max;
    }
    if (i + 2 <= max) {
      for (let index = i + 2; index > i - 3 && index > 0; index--) {
        arr.unshift(index);
      }
    } else if (i + 1 <= max) {
      for (let index = i + 1; index > i - 4 && index > 0; index--) {
        if (index <= max) {
          arr.unshift(index);
        }
      }
    } else if (i === max) {
      for (let index = i; index > i - 4 && index > 0; index--) {
        if (index <= max) {
          arr.unshift(index);
        }
      }
    }
    if (arr[0] > 2) {
      arr.unshift('.');
      arr.unshift(1);
    } else if (arr[0] > 1) {
      arr.unshift(1);
    }
    if (arr[arr.length - 1] < max && arr[arr.length - 1] === max - 1) {
      arr.push(max);
    } else if (arr[arr.length - 1] < max - 1) {
      arr.push('.');
      arr.push(max);
    }
    return arr;
  }
  public static paginationNext(i, totalPage, type) {
    if (type === '+') {
      if (i < totalPage) {
        i++;
      } else {
        i = totalPage;
      }
    } else {
      if (i > 1) {
        i--;
      } else {
        i = 1;
      }
    }
    return i;
  }

  // 随机一个高亮颜色 #888888 ~ #ffffff
  public static randLightColor() {
    let color = '';
    for (let i = 0; i < 3; i++) {
      const rand = (190 + Math.floor(Math.random() * 66)).toString(16);
      if (rand === '') {
        color += 'aa';
      } else if (rand.length === 1) {
        color += '0' + rand;
      } else {
        color += rand;
      }
    }
    return '#' + color;
  }

  // 将数据按剪映射到固定form
  public static mappingToForm(mp, obj) {
    if (mp == null || obj == null) {
      return mp;
    }
    for (const k of Object.keys(mp)) {
      for (const ki of Object.keys(obj)) {
        if (k === ki) {
          if (typeof mp[k] === 'string') {
            mp[k] = String(obj[ki]);
          } else if (typeof mp[k] === 'number') {
            mp[k] = Number(obj[ki]);
          } else if (typeof mp[k] === 'boolean') {
            mp[k] = Boolean(obj[ki]);
          } else {
            mp[k] = obj[ki];
          }
          break;
        }
      }
    }
    return mp;
  }

  // 根据html字符串创建元素
  public static createNode(htmlStr) {
    const div = document.createElement('div');
    div.innerHTML = htmlStr;
    return div.childNodes[0];
  }

  public static getCurrentWeekFirstDay(date) {
    const weekFirstDay = new Date(date - (date.getDay() - 1) * 86400000);
    let firstMonth = Number(weekFirstDay.getMonth()) + 1;

    if (firstMonth < 10) {
      (firstMonth as any) = '0' + firstMonth;
    }
    let weekFirstDays = weekFirstDay.getDate();
    if (weekFirstDays < 10) {
      (weekFirstDays as any) = '0' + weekFirstDays;
    }
    return weekFirstDay.getFullYear() + '-' + firstMonth + '-' + weekFirstDays;
  }

  public static getCurrentWeekLastDay(date) {
    const weekFirstDay = new Date(date - (date.getDay() - 1) * 86400000);
    const weekLastDay = new Date(
      ((weekFirstDay as any) / 1000 + 6 * 86400) * 1000
    );
    let lastMonth = Number(weekLastDay.getMonth()) + 1;
    if (lastMonth < 10) {
      (lastMonth as any) = '0' + lastMonth;
    }
    let weekLastDays = weekLastDay.getDate();
    if (weekLastDays < 10) {
      (weekLastDays as any) = '0' + weekLastDays;
    }
    return weekFirstDay.getFullYear() + '-' + lastMonth + '-' + weekLastDays;
  }
  public static getCurrentMonthFirstDay() {
    const date = new Date();
    date.setDate(1);
    let month = parseInt((date.getMonth() + 1) as any);
    let day = date.getDate();
    if (month < 10) {
      (month as any) = '0' + month;
    }
    if (day < 10) {
      (day as any) = '0' + day;
    }
    return date.getFullYear() + '-' + month + '-' + day;
  }
  public static getCurrentMonthLastDay() {
    const date = new Date();
    let currentMonth = date.getMonth();
    const nextMonth = ++currentMonth;
    const nextMonthFirstDay = new Date(date.getFullYear(), nextMonth, 1);
    const oneDay = 1000 * 60 * 60 * 24;
    const lastTime = new Date((nextMonthFirstDay as any) - oneDay);
    let month = parseInt((lastTime.getMonth() + 1) as any);
    let day = lastTime.getDate();
    if (month < 10) {
      (month as any) = '0' + month;
    }
    if (day < 10) {
      (day as any) = '0' + day;
    }
    return date.getFullYear() + '-' + month + '-' + day;
  }

  public static mao(v: string, isMao: boolean) {
    if (!v) {
      v = '';
    }
    if (v.includes('#')) {
      return v;
    }
    const pos = v.indexOf('://');
    if (pos <= 6 && pos >= 0) {
      return v;
    }

    if (isMao) {
      return '#' + v;
    }
    return v;
  }

  // 密码强度
  public static parsePasswordstrength(str: string): Passwordstrength {
    const p = new Passwordstrength();
    if (!str) {
      return p;
    }

    p.length = str.length;
    for (let i = 0; i < str.length; i++) {
      const c = str.charCodeAt(i);
      if (c < 0 || c > 127) {
        p.notAsciiCharCount++;
      }
      if (c >= 0 && c <= 32) {
        p.spaceCharCount++;
      }
      if (c >= 33 && c <= 47) {
        p.specialCharCount++;
      }
      if (c >= 48 && c <= 57) {
        p.numberCharCount++;
      }
      if (c >= 58 && c <= 64) {
        p.specialCharCount++;
      }
      if (c >= 65 && c <= 90) {
        p.upperCharCount++;
      }
      if (c >= 91 && c <= 96) {
        p.specialCharCount++;
      }
      if (c >= 97 && c <= 122) {
        p.lowerCharCount++;
      }
      if (c >= 123 && c <= 126) {
        p.specialCharCount++;
      }
      if (c === 127) {
        p.spaceCharCount++;
      }
    }

    return p;
  }

  // 密码强度
  public static checkasswordstrength(str: string): number {
    const p = AppUtil.parsePasswordstrength(str);
    const x1 = p.length > 8 ? true : false;
    const x2 = p.lowerCharCount > 0 && p.upperCharCount > 0 ? true : false;
    const x3 = p.numberCharCount > 0 ? true : false;
    const x4 = p.specialCharCount > 0 ? true : false;

    if (p.spaceCharCount > 0 || p.notAsciiCharCount > 0) {
      return 0;
    }

    if (p.length > 8) {
      if (x2 && x3 && x4) {
        return 8;
      } else if ((x2 && x3) || (x2 && x4) || (x3 && x4)) {
        return 7;
      } else {
        return 4;
      }
    } else if (p.length >= 6) {
      if (x2 && x3 && x4) {
        return 6;
      } else if ((x2 && x3) || (x2 && x4) || (x3 && x4)) {
        return 5;
      } else {
        return 3;
      }
    } else if (p.length >= 4) {
      if (x2 && x3 && x4) {
        return 2;
      }
    }
    return 1;
  }

  public static stopEvent(e) {
    // 阻止href直接跳转事件
    e = e || window.event; // 获取event对象
    if (e.preventDefault) {
      e.preventDefault();
    } else {
      e.returnValue = false;
    }
    if (e.stopPropagation) {
      e.stopPropagation();
    } else {
      e.cancelBubble = true;
    }
  }

  public static convertBase64UrlToBlob(urlData) {
    var arr = urlData.split(','),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  }

  public static randSort(arr) {
    var cloneArr = arr.concat();
    var len = cloneArr.length;
    for (var i = 0; i < len; i++) {
      var index = Math.floor(Math.random() * cloneArr.length);
      var temp = cloneArr[index];
      cloneArr[index] = cloneArr[i];
      cloneArr[i] = temp;
    }
    return cloneArr;
  }
}

const searchTreeNode = (node, kw) => {
  if (!kw || !node || node.name.includes(kw)) {
    return node;
  }
  // 有子节点
  if (node.children && node.children.length > 0) {
    const newChildren = [];
    for (const childNode of node.children) {
      const reNode = searchTreeNode(childNode, kw);
      if (reNode) {
        newChildren.push(reNode);
      }
    }

    // have child node matched
    if (newChildren && newChildren.length > 0) {
      node.children = newChildren;
      return node;
    }
  }
  return null;
};
