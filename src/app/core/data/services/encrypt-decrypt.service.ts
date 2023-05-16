import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class EncryptDecryptService {
  constructor() { }

  PassportEncode(key, message) {       
    return {
      key: key,
      data: this.EncodeData(JSON.stringify(message), key)
    };
  }

  PassportDecode(message) {
    return JSON.parse(this.DecodeData(message.DataModel));
  }
  
  isJSON(e) {
    e = "string" != typeof e ? JSON.stringify(e) : e;
    try {
      e = JSON.parse(e);
    } catch (r) {
      return !1;
    }
    return "object" == typeof e && null !== e ? !0 : !1;
  }
  
  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash += Math.pow(str.charCodeAt(i) * 31, str.length - i);
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
  }
  private EncodeData(e, r) {
    if (null === e) return null;
    if (void 0 === e) return void 0;
    if ("" === e.replace(/^\s+|\s+$/gm, "")) return e;
    var t = CryptoJS.enc.Utf8.parse(r),
        n = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(e), t, {
            keySize: 16,
            iv: t,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        }),
        o = n.toString();
    return encodeURIComponent(o);
  }
  
  private DecodeData(d) {
  
      var llaves = this.Reverse(d);
      let e = d.replace(llaves.Separetor + llaves.Key1, "");
      let r = llaves.Key2;
  
  
      if (null === e) return null;
      if (void 0 === e) return void 0;
      if ("" === e.replace(/^\s+|\s+$/gm, "")) return e;
      var t = CryptoJS.enc.Utf8.parse(r);
      e = decodeURIComponent(e);
      var n = CryptoJS.AES.decrypt(e, t, {
          keySize: 16,
          iv: t,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7
      }),
          o = n.toString(CryptoJS.enc.Utf8).replace(/\\/g, "");
      o = o.replace('"{', '{').replace('}"', '}');
  
      return o;
  }
  
  private Reverse(r): any {
  
      let e = ["xZxS%jqm", "nr%Ft1Jr", "60Vc%UNh", "6e9hv9%M", "K%NZThUV", "JT%WG5aU", "hn8q%xb4", "QO1%qim9", "EjuRBck%", "eX1%P2Gd"];
      let a = {
          a: 0,
          B: 1,
          X: 2,
          D: 3,
          e: 4,
          '%': 5,
          g: 6,
          H: 7,
          i: 8,
          Z: 9
      };
      let s = {
          separetor: "",
          pos: -1
      };
  
      for (let o = 0, t = e.length; t > o; o++) {
          var p = e[o];
          if (s.pos = r.lastIndexOf(p), s.pos > 1) {
              s.separetor = p;
              break
          }
      }
  
      let n = r.substr(s.pos + s.separetor.length, 16);
      let v = Array.from(n);
      let f = [];
  
      for (let u = 0, g = v.length; g > u; u++) {
          f.push(a[v[u].toString()]);
      }
  
      var h = f.join("");
      return {
          Separetor: s.separetor,
          Key1: n,
          Key2: h
      };
  }
}
