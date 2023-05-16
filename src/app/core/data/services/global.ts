import { Injectable } from "@angular/core";
import { FormGroup } from "@angular/forms";

@Injectable({
    providedIn: 'root',
  })
export class GlobalUtil {
    constructor() {}

    formatParameter(object: any, pagination: boolean = false): string {
        var encodedString = '';
        for (var prop in object) {
          if (object.hasOwnProperty(prop)) {
            if (encodedString.length > 0) encodedString += '&';
    
            if (!pagination)
              encodedString += encodeURI(prop + '=' + (object[prop] ?? ''));
            else if (['field', 'order', 'page', 'size'].includes(prop))
              encodedString += encodeURI(prop + '=' + (object[prop] ?? ''));
            else
              encodedString += encodeURI(
                'value.' + prop + '=' + (object[prop] ?? '')
              );
          }
        }
        return encodedString;
      }
}