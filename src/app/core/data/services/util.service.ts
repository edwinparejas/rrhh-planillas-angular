import { Injectable } from "@angular/core";
import Swal from "sweetalert2";


//deprecated
@Injectable({
    providedIn: "root",
})
export class UtilService {
    constructor() { }

    msgSuccess(text: string, callBack?: any) {
        Swal.fire({
            //title: title,
            icon: "success",
            html: text,
            allowOutsideClick: false,
            allowEscapeKey: false,
            confirmButtonText: "Aceptar",
        }).then((resultado) => {
            if (callBack) callBack();
        });
    }

    msgWarning(text: string, callBack?: any) {
        Swal.fire({
            //title: title,
            icon: "warning",
            html: text,
            allowOutsideClick: false,
            allowEscapeKey: false,
            confirmButtonColor: "#f8bb86",
            confirmButtonText: "Aceptar",
        }).then((resultado) => {
            if (callBack) callBack();
        });
    }

    msgConfirm(text: string, callBackOk?: any, callBackError?: any) {
        Swal.fire({
            html: text,
            icon: "question",
            allowOutsideClick: false,
            allowEscapeKey: false,
            showCancelButton: true,
            cancelButtonColor: "#b5b3b3",
            cancelButtonText: "Cancelar",
            confirmButtonText: "Aceptar",
            reverseButtons: true,
        }).then((resultado) => {
            if (resultado.value) {
                if (callBackOk) callBackOk();
            } else if (callBackError) callBackError();
        });
    }

    msgConfirmTextButton(text: string, callBackOk?: any, callBackError?: any,confirmButtonText:string="Aceptar",cancelButtonText:string="Cancelar") {
        Swal.fire({
            html: text,
            icon: "question",
            allowOutsideClick: false,
            allowEscapeKey: false,
            showCancelButton: true,
            cancelButtonColor: "#b5b3b3",
            cancelButtonText: cancelButtonText,
            confirmButtonText: confirmButtonText,
            reverseButtons: true,
        }).then((resultado) => {
            if (resultado.value) {
                if (callBackOk) callBackOk();
            } else if (callBackError) callBackError();
        });
    }

    msgSend(text: string, callBackOk?: any, callBackError?: any) {
        Swal.fire({
            html: text,
            icon: "question",
            allowOutsideClick: false,
            allowEscapeKey: false,
            showCancelButton: true,
            cancelButtonColor: "#b5b3b3",
            cancelButtonText: "Cancelar",
            confirmButtonText: "Enviar",
            reverseButtons: true,
        }).then((resultado) => {
            if (resultado.value) {
                if (callBackOk) callBackOk();
            } else if (callBackError) callBackError();
        });
    }

    msgError(text: string, callBack?: any): boolean {
        Swal.fire({
            // title: 'Error',
            icon: "error",
            html: text,
            allowOutsideClick: false,
            allowEscapeKey: false,
            showCancelButton: true,
            showConfirmButton: false,
            cancelButtonColor: "#d33",
            cancelButtonText: "Aceptar",
        }).then((value) => {
            if (callBack) callBack();
        });
        return false;
    }

    msgAutoCloseSuccess(text: string, timer: number, callBack?: any) {
        Swal.fire({
            icon: 'success',
            html: text,
            timer: timer,
            allowOutsideClick: false,
            allowEscapeKey: false,
            confirmButtonText: 'Aceptar'
        }).then((result) => {
            if (result.dismiss === Swal.DismissReason.timer) {
                if (callBack) callBack();
            } else {
                if (callBack) callBack();
            }

        });
    }
}
