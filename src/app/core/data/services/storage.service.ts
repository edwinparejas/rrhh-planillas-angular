import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { LocalStorageService } from "@minedu/services/secure/local-storage.service";
import {
    KONG_AUTH_TOKEN,
    PASSPORT_USER_DATA,
    PASSPORT_TOKEN,
    PASSPORT_MENU_SELECTED,
    PASSPORT_ROL_SELECTED,
    PASSPORT_ACCIONES_USUARIO,
    PASSPORT_MENU,
    INSTANCIA_SELECTED,
} from "app/config/auth.config";
import { AuthTokenModel } from "app/core/model/security/auth-token.model";
import { PassportAccionModel } from "app/core/model/security/passport-accion.model";
import {
    PassportMenuModel,
    PassportMenuOperacionModel,
} from "app/core/model/security/passport-menu.model";
import { InstanciaModel, PassportRolModel } from "app/core/model/security/passport-rol.model";
import { PassportTokenModel } from "app/core/model/security/passport-token.model";
import { SecurityModel } from "app/core/model/security/security.model";
import { Session, User, UserDataModel } from "app/core/model/user-data.model";
import { environment } from "environments/environment";

@Injectable({
    providedIn: "root",
})

export class StorageService {
    private currentSession: Session = null;
    public passport: User = new User();

    constructor(
        private router: Router, 
                private localStorageService: LocalStorageService
    )  {
                this.currentSession = this.loadSessionData();

    }
    setCurrentSession(session: Session): void {
        this.currentSession = session;
        this.localStorageService.setItem(
            "currentUser",
            JSON.stringify(session)
        );
        this.passport = JSON.parse(
            this.localStorageService.getItem("currentUser")
        );
    }

    loadSessionData(): Session {
        var sessionStr = this.localStorageService.getItem("currentUser");
        this.passport = JSON.parse(
            this.localStorageService.getItem("currentUser")
        );
       
        return sessionStr ? <Session>JSON.parse(sessionStr) : null;
    }
    setCurrentUser(session: User): void {
        this.localStorageService.setItem("currentUser", JSON.stringify(session));
    }

    private removeCurrentUser(): void {
        this.localStorageService.removeItem("currentUser");
    }

    getCurrentUser(): User {
        const currentUser = this.localStorageService.getItem("currentUser");
        return currentUser ? <User>JSON.parse(currentUser) : null;
    }

    logout(): void {
        this.removeCurrentUser();
        this.router.navigate(["/login"]);
    }
    
    setInstanciaSelected(rol: InstanciaModel) {
        this.localStorageService.setItem(INSTANCIA_SELECTED, JSON.stringify(rol));
    }
    
    getInstanciaSelected(): InstanciaModel {
        let instancia = this.localStorageService.getItem(INSTANCIA_SELECTED);
        if (instancia) {
            const json = JSON.parse(instancia);
            const model = new InstanciaModel();
            return Object.assign(model, json);
        } else {
            return null;
        }
    }

    /*
   SECCION PARA PASSPORT
  */

    setAccessToken(token: any) {
        this.localStorageService.setItem(KONG_AUTH_TOKEN, JSON.stringify(token)); //kong_auth_token
    }

    setPassportUser(user: any) {
        this.localStorageService.setItem(PASSPORT_USER_DATA, JSON.stringify(user));
    }

    setPassportToken(token: any) {
        this.localStorageService.setItem(PASSPORT_TOKEN, token);
    }

    setPassportMenu(menu: any) {
        this.localStorageService.setItem(PASSPORT_MENU, JSON.stringify(menu));
    }

    setPassportMenuSelected(menu: any) {
        this.localStorageService.setItem(PASSPORT_MENU_SELECTED, JSON.stringify(menu));
    }

    setPassportRolSelected(rol: any) {
        this.localStorageService.setItem(PASSPORT_ROL_SELECTED, JSON.stringify(rol));
    }

    setPassportAcciones(acciones: any) {
        this.localStorageService.setItem(
            PASSPORT_ACCIONES_USUARIO,
            JSON.stringify(acciones)
        );
    }

    removeCredentials() {
        this.localStorageService.clear();
    }

    private getPassportMenu(): PassportMenuOperacionModel[] {
        let menus = this.localStorageService.getItem(PASSPORT_MENU);
        if (menus) {
            const jsons: any[] = JSON.parse(menus) || [];
            return jsons.map((item) => {
                const menu = new PassportMenuOperacionModel();
                return Object.assign(menu, item);
            });
        } else {
            return [];
        }
    }

    getAccessToken(): AuthTokenModel {
        let token = this.localStorageService.getItem(KONG_AUTH_TOKEN);
        if (token) {
            const decoded = JSON.parse(token);
            const auth = new AuthTokenModel();
            return Object.assign(auth, decoded);
        } else {
            return null;
        }
    }

    getPassportMenuSelected(): PassportMenuModel {
        let menu = this.localStorageService.getItem(PASSPORT_MENU_SELECTED);
        if (menu) {
            const decoded = JSON.parse(menu);
            const auth = new PassportMenuModel();
            return Object.assign(auth, decoded);
        } else {
            return null;
        }
    }

    getPassportRolSelected(): PassportRolModel {
        
        let rol = this.localStorageService.getItem(PASSPORT_ROL_SELECTED);
        if (rol) {
            const decoded = JSON.parse(rol);
            const obj = new PassportRolModel();
            return Object.assign(obj, decoded);
        } else {
            return null;
        }
    }

    getPassportUserData(): UserDataModel {
        let userData = this.localStorageService.getItem(PASSPORT_USER_DATA);
        if (userData) {
            const decoded = JSON.parse(userData);
            const auth = new UserDataModel();
            return Object.assign(auth, decoded);
        } else {
            return null;
        }
    }

    getPassportToken(): PassportTokenModel {
        let token = this.localStorageService.getItem(PASSPORT_TOKEN);
        if (token) {
            const decoded = JSON.parse(atob(token));
            const auth = new PassportTokenModel();
            return Object.assign(auth, decoded);
        } else {
            return null;
        }
    }

    private getPassportAciones(): PassportAccionModel[] {
        let acciones = this.localStorageService.getItem(PASSPORT_ACCIONES_USUARIO);
        if (acciones) {
            const decoded: any[] = JSON.parse(acciones) || [];
            return decoded.map((item) => {
                const accion = new PassportAccionModel();
                return Object.assign(accion, item);
            });
        } else {
            return [];
        }
    }

    isTokenExpired(): boolean {
        const token = this.getAccessToken();
        if (!token) return true;
        const expiry = token.expires_in;
        return Math.floor(new Date().getTime() / 1000) >= expiry;
    }

    isTokenExpiredBefore(): boolean {
        const token = this.getAccessToken();
        if (!token) return true;
        const expiry = token.expires_in_before;
        return (Math.floor((new Date).getTime() / 1000)) >= expiry;
    }


    isJwtTokenExpired(): boolean {
        const passport = this.getPassportToken();
        if (!passport) return true;
        const token = passport.TOKEN_JWT;
        const expiry = JSON.parse(atob(token.split(".")[1])).exp;
        return Math.floor(new Date().getTime() / 1000) >= expiry;
    }

    getPassportParam(): string {
        const config = environment.passportConfig;
        let data = JSON.stringify({
            CODIGO_SISTEMA: config.codigoSistema,
            URL_RETORNO: config.urlRetorno,
        });
        let param = btoa(data);
        return param;
    }

    getCodigoSistema() {
        const config = environment.passportConfig;
        let data = { CODIGO_SISTEMA: config.codigoSistema };
        return data;
    }

    passportUILogin() {
        const urlPassport = environment.passportConfig.urlSeguridadLogin;
        const param = this.getPassportParam();
        window.location.href = urlPassport + "?param=" + param;
    }

    passportUIPanel() {
        const urlPassport = environment.passportConfig.urlSeguridadPanel;
        let token = this.localStorageService.getItem(PASSPORT_TOKEN);
        this.removeCredentials();
        window.location.href = urlPassport + "?param=" + token;
    }



    getMenuPassport(): PassportMenuOperacionModel[] {
        let passportMenus = [];
        const acciones = this.getPassportAciones();
        const rol = this.getPassportRolSelected();
        const menus = this.getPassportMenu();
        if (!rol) return [];

        acciones
            .filter((pred) => pred.ID_ROL === rol.ID_ROL)
            .map((item) =>
                menus
                    .filter((data) => data.ID_MENU === item.ID_MENU)
                    .map((menu) => passportMenus.push(menu))
            );

        return passportMenus
            .filter(
                (menu, i, arr) =>
                    arr.findIndex((t) => t.ID_MENU === menu.ID_MENU) === i
            )
            .map((item) => {
                const menu = new PassportMenuOperacionModel();
                return Object.assign(menu, item);
            });
    }

    getMenuPadrePassport(pIdMenuPadre: number): PassportMenuOperacionModel {
        const menus = this.getPassportMenu();
        return menus.find((pred) => pred.ID_MENU === pIdMenuPadre);
    }

    getMenuHijoPassport(pIdMenu: number): PassportMenuOperacionModel {
        const menus = this.getPassportMenu();
        return menus.find((pred) => pred.ID_MENU_PADRE === pIdMenu);
    }

    tienePermisoAccion(pIdAccion: number): boolean {
        if (pIdAccion <= 0) return false;
        const rol = this.getPassportRolSelected();
        const menu = this.getPassportMenuSelected();
        const acciones = this.getPassportAciones();
       
        const passportAccion = acciones.find(
            (pred) =>
                pred.ID_MENU === menu.id &&
                pred.ID_ROL === rol.ID_ROL &&
                pred.ID_PERMISO === pIdAccion
        );

        if (passportAccion) {
            return true;
        } else {
            return false;
        }
    }

    getParamAccion(pIdAccion: number): any {
        if (pIdAccion <= 0) return null;
        const config = environment.passportConfig;
        const rol = this.getPassportRolSelected();
        const menu = this.getPassportMenuSelected();
        const acciones = this.getPassportAciones();
        const passportAccion = acciones.find(
            (pred) =>
                pred.ID_MENU === menu.id &&
                pred.ID_ROL === rol.ID_ROL &&
                pred.ID_PERMISO === pIdAccion
        );
        if (passportAccion) {
            let data = {
                ID_ROL: passportAccion.ID_ROL,
                ID_MENU: passportAccion.ID_MENU,
                ID_PERMISO: passportAccion.ID_PERMISO,
                CODIGO_SISTEMA: config.codigoSistema,
            };
            return data;
        } else {
            return null;
        }
    }

    /* SECCION PARA OBTENER DATOS DE USUARIO Y ROL - SEDE */

    getInformacionUsuario(): SecurityModel {
        const usuario = this.getPassportUserData();
        const rol = this.getPassportRolSelected();
        let response = {
            idRol: rol.ID_ROL,
            idSede: rol.ID_SEDE,
            idTipoSede: rol.ID_TIPO_SEDE,
            anexoSede: rol.ANEXO_SEDE,
            codigoRol: rol.CODIGO_ROL,
            codigoSede: rol.CODIGO_SEDE,
            codigoTipoSede: rol.CODIGO_TIPO_SEDE,
            codigoLocalSede: rol.CODIGO_LOCAL_SEDE,
            codigoPadreSede: rol.CODIGO_PADRE_SEDE,
            descripcionTipoSede: rol.DESCRIPCION_TIPO_SEDE,
            nombreRol: rol.NOMBRE_ROL,
            nombreSede: rol.NOMBRE_SEDE,
            numeroDocumento: usuario.NUMERO_DOCUMENTO,
            tipoNumeroDocumento: usuario.TIPO_DOCUMENTO_ENUM,
            nombreCompleto:
                usuario.NOMBRES_USUARIO +
                " " +
                usuario.APELLIDO_PATERNO +
                " " +
                usuario.APELLIDO_MATERNO,
            nombreUsuario: usuario.NOMBRES_USUARIO,
            correoElectronico: usuario.CORREO_USUARIO,
            fechaNacimiento: usuario.FECHA_NACIMIENTO,
        };
        const auth = new SecurityModel();
        return Object.assign(auth, response);
    }
}
