import { Injectable } from '@angular/core';
import Swal from "sweetalert2";

@Injectable({
    providedIn: 'root'
})
export class MessageService {

    constructor() { }

    msgInfo(text: string, callBack?: any) {
        Swal.fire({
            icon: 'info',
            html: text,
            allowOutsideClick: false,
            allowEscapeKey: false,
            confirmButtonText: "Aceptar"
        }).then((resultado) => {
            if (callBack) callBack();
        });
    }

    msgAutoInfo(text: string, timer: number, callBack?: any) {
        Swal.fire({
            icon: "info",
            html: text.toUpperCase(),
            timer: timer,
            showConfirmButton: false,
            onClose: callBack(),
        }).then((result) => {
            if (result.dismiss === Swal.DismissReason.timer) {
                if (callBack) callBack();
            }
        });
    }

    msgSuccess(text: string, callBack?: any) {
        Swal.fire({
            icon: "success",
            html: text,
            allowOutsideClick: false,
            allowEscapeKey: false,
            confirmButtonText: "Aceptar",
        }).then((resultado) => {
            if (callBack) callBack();
        });
    }

    msgAutoSuccess(text: string, timer: number, callBack?: any) {
        Swal.fire({
            // position: 'top-end',
            icon: 'success',
            html: text,
            timer: timer,
            showConfirmButton: false,
            onClose: callBack()
        }).then((result) => {
            if (result.dismiss === Swal.DismissReason.timer) {
                if (callBack) callBack();
            }
        });
    }

    msgAutoCloseSuccess(text: string, timer: number, callBack?: any) {
        Swal.fire({
            icon: 'success',
            html: text,
            timer: timer,
            allowOutsideClick: false,
            allowEscapeKey: false,
            confirmButtonText: "Aceptar"
        }).then((result) => {
            if (result.dismiss === Swal.DismissReason.timer) {
                if (callBack) callBack();
            } else {
                if (callBack) callBack();
            }
        });
    }

    msgWarning(text: string, callBack?: any) {
        Swal.fire({
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

    msgAutoWarning(text: string, timer: number,  callBack?: any) {
        Swal.fire({
            icon: "warning",
            html: text,
            timer: timer,
            showConfirmButton: false,
            onClose: callBack()
        }).then((result) => {
            if (result.dismiss === Swal.DismissReason.timer) {
                if (callBack) callBack();
            }
        });
    }

    async msgConfirm(text: string, callBackOk?: any, callBackError?: any) {
        await Swal.fire({
            icon: "question",
            html: text,
            allowOutsideClick: false,
            allowEscapeKey: false,
            showCancelButton: true,
            cancelButtonColor: "#b5b3b3",
            cancelButtonText: "NO",
            confirmButtonText: "SI",
            reverseButtons: false,
        }).then((resultado) => {
            if (resultado.value) {
                if (callBackOk) callBackOk();
            } else if (callBackError) callBackError();
        });
    }

    msgSend(text: string, callBackOk?: any, callBackError?: any) {
        Swal.fire({
            icon: "question",
            html: text,
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

    msgAutoCloseWarning(text: string, timer: number, callBack?: any) {
        Swal.fire({
            icon: 'warning',
            html: text,
            timer: timer,
            allowOutsideClick: false,
            allowEscapeKey: false,
            confirmButtonColor: "#f8bb86",
            confirmButtonText: "Aceptar",
        }).then((result) => {
            if (result.dismiss === Swal.DismissReason.timer) {
                if (callBack) callBack();
            } else {
                if (callBack) callBack();
            }

        });
    }
    msgInterceptorError(text: string, timer: number, callBack?: any) {
        Swal.fire({
            position: 'top-end',
            icon: 'error',
            html: text,
            timer: timer,
            showConfirmButton: false,
            onClose: callBack()
        }).then((result) => {
            if (result.dismiss === Swal.DismissReason.timer) {
                if (callBack) callBack();
            }
        });
    }
    msgAutoCloseWarningNoButton(text: string, timer: number, callBack?: any) {
        Swal.fire({
            icon: 'warning',
            html: text,
            timer: timer,
            allowOutsideClick: true,
            allowEscapeKey: true,
            confirmButtonColor: "#f8bb86",
            confirmButtonText: "Aceptar",
            showCancelButton: false,
            showConfirmButton: false 
        }).then((result) => {
            if (result.dismiss === Swal.DismissReason.timer) {
                if (callBack) callBack();
            } else {
                if (callBack) callBack();
            }

        });
    }
    msgAutoCloseSuccessNoButton(text: string, timer: number, callBack?: any) {
        Swal.fire({
            icon: 'success',
            html: text,
            timer: timer,
            allowOutsideClick: true,
            allowEscapeKey: true,
            confirmButtonText: "Aceptar",
            showCancelButton: false,
            showConfirmButton: false 
        }).then((result) => {
            if (result.dismiss === Swal.DismissReason.timer) {
                if (callBack) callBack();
            } else {
                if (callBack) callBack();
            }
        });
    }
}
