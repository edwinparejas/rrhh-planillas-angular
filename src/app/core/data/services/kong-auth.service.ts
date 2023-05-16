import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { KongAuthRestangularService } from './resources/kong-auth-restangular.service';

@Injectable({
    providedIn: 'root'
})
export class KongAuthService {

    constructor(private restangular: KongAuthRestangularService) {
    }

    authorize(userId: string) {
        let queryParam: HttpParams = new HttpParams()
            .set('userId', userId);
        return this.restangular.one("ayni", "authorize").post({}, queryParam);
    }

    token(redirectUri: string, code: string) {
        let queryParam: HttpParams = new HttpParams()
            .set('redirectUri', redirectUri)
            .set('code', code);
        return this.restangular.one("ayni", "requestToken").post({}, queryParam);
    }

    refreshToken(refreshToken: string, pSessionId: string) {
        let queryParam: HttpParams = new HttpParams()
            .set('refreshToken', refreshToken)
            .set('sessionId', pSessionId);
        return this.restangular.one("ayni", "refreshToken").post({}, queryParam);
    }

}
