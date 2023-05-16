import { Injectable } from "@angular/core";
import {
    HttpInterceptor,
    HttpRequest,
    HttpHandler,
    HttpEvent,
} from "@angular/common/http";
import { Observable, of } from "rxjs";
import { PassportTokenModel } from "app/core/model/security/passport-token.model";
import { AuthTokenModel } from "app/core/model/security/auth-token.model";
import { DataService } from "app/core/data/data.service";
import { environment } from "environments/environment";
import { catchError, finalize } from "rxjs/operators";
import { PASSPORT_MESSAGE } from "app/core/model/messages-error";

@Injectable({
    providedIn: "root",
})
export class TokenInterceptorService implements HttpInterceptor {
    private token: AuthTokenModel;
    private passport: PassportTokenModel;

    constructor(private dataService: DataService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        debugger;
        const { url, method, headers, body } = request;
        switch (true) {
            case url.startsWith(environment.passportPrefix):
                return this.passportAuthorizate(request, next);

            // case url.startsWith(environment.reniecPrefix):
            //     return this.kongAuthorizate(request, next);
            // case url.startsWith(environment.documentosPrefix):
            //     return this.kongAuthorizateMultiPart(request, next);
            // case url.startsWith(environment.comunesPrefix):
            //     return this.kongAuthorizate(request, next);

            // case url.startsWith(environment.asistenciaPrefix):
            //     return this.kongAuthorizate(request, next);
            // case url.startsWith(environment.licenciasPrefix):
            //     return this.kongAuthorizate(request, next);
            // case url.startsWith(environment.configuracionPrefix):
            //     return this.kongAuthorizateMultiPart(request, next);
            // case url.startsWith(environment.alertasPrefix):
            //     return this.kongAuthorizate(request, next);
            // case url.startsWith(environment.actividadesPrefix):
            //     return this.kongAuthorizate(request, next);
            // case url.startsWith(environment.accionesPrefix):
            //     return this.kongAuthorizate(request, next);
            // case url.startsWith(environment.solicitudesPrefix):
            //     return this.kongAuthorizate(request, next);
            // case url.startsWith(environment.sancionesPrefix):
            //     return this.kongAuthorizate(request, next);
            // case url.startsWith(environment.contratacionesPrefix):
            //     return this.kongAuthorizate(request, next);
            // case url.startsWith(environment.plazaPrefix):
            //     return this.kongAuthorizate(request, next);
            // case url.startsWith(environment.historialPrefix):
            //     return this.kongAuthorizate(request, next);
            // case url.startsWith(environment.cargaMasivaPrefix):
            //     return this.kongAuthorizateMultiPart(request, next);
            // case url.startsWith(environment.ascensoPrefix):
            //     return this.kongAuthorizate(request, next);
            // case url.startsWith(environment.rotacionPrefix):
            //     return this.kongAuthorizate(request, next);
            // case url.startsWith(environment.resolucionPrefix):
            //     return this.kongAuthorizate(request, next);
            default:
                // request = request.clone({
                //     setHeaders: { 'Content-Type': 'application/json' }
                // });
                this.token = this.dataService.Storage().getAccessToken();
                if (this.token)
                    request = this.addToken(request, this.token.access_token);
                return next.handle(request);
        }
    }

    passportAuthorizate = (request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> => {
        const { url, method, headers, body } = request;
        this.passport = this.dataService.Storage().getPassportToken();

        switch (true) {
            case url.endsWith("/Boot") && method === "POST":
                request = request.clone({
                    setHeaders: {
                        "Content-Type": "application/json; charset=utf-8",
                    },
                });
                return next.handle(request);
            default:
                request = request.clone({
                    setHeaders: {
                        "Content-Type": "application/json; charset=utf-8",
                    },
                });
                request = this.addToken(request, this.passport.TOKEN_JWT);
                return next.handle(request);
        }
    };

    kongAuthorizate = (request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> => {
        this.token = this.dataService.Storage().getAccessToken();
        request = request.clone({
            setHeaders: {
                // "Content-Type": "application/json",
                Authorization: `Bearer ${this.token.access_token}`,
            },
        });
        return next.handle(request);
    };

    private addToken(request: HttpRequest<any>, token: string) {
        return request.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
    };
    
    private refreshToken(refresh_token: any, sessionId: any) {
        // this.isConsulting = true;
        this.dataService.Kong().refreshToken(refresh_token, sessionId).pipe(
            catchError(() => { return of(null) }),
            finalize(() => { })
        ).subscribe(response => {
            if (response) {
                const expire = response.expires_in;
                response.expires_in = (Math.floor((new Date).getTime() / 1000)) + parseInt(response.expires_in);
                response.expires_in_before = (Math.floor((new Date).getTime() / 1000)) + (parseInt(expire) / 2);
                this.dataService.Storage().setAccessToken(response);
            } else {
                this.dataService.Message().msgAutoCloseWarning(PASSPORT_MESSAGE.SESION_END, 4000, () => {
                    this.dataService.Storage().passportUILogin();
                });
            }
        });
    }
}
