export class AuthTokenModel {

    refresh_token: string;
    token_type: string;
    access_token: string;
    expires_in: number;
    expires_in_before: number;
    sessionId: string;
    key: string;
    
    constructor() {
    }
}