import { AbstractControl } from "@angular/forms";

export class CustomValidate {
  //private _regexPatterns = {
  //DNI: /^([0-9]{8})/i,
  //POSITIVE_NUMBERS: /^\+?(0|[1-9]\d*)/i,
  //PASAPORTE: /^([a-zA-Z0-9]{9,12})/i,
  //CARNET_EXTRANJERIA: /^([a-zA-Z0-9]{9,12})/i,
  //CODIGO_MODULAR: /^([0-9]{6,7})/i,
  //EMAIL: /^\s*$|^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  //URL: /(?:^|\s)((https?:\/\/)?(?:localhost|[\w-]+(?:\.[\w-]+)+)(:\d+)?(\/\S*)?)/,
  //}
  static correoElectronico = (control: AbstractControl) => {
    let regexPatterns = {
      EMAIL: /^\s*$|^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    }
    if (!(regexPatterns.EMAIL.test(control.value))) {
      return { email: true };
    }
    return null;
  }

}
