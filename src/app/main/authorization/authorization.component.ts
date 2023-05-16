import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { mineduAnimations } from '@minedu/animations/animations';
import { MineduConfigService } from '@minedu/services/config.service';
import { PASSPORT_PARAM_RETORNO } from 'app/config/auth.config';
import { DataService } from 'app/core/data/data.service';
import { PASSPORT_MESSAGE, KONG_MESSAGE } from 'app/core/model/messages-error';
import { SharedService } from 'app/core/shared/shared.service';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

@Component({
  selector: 'minedu-authorization',
  templateUrl: './authorization.component.html',
  styleUrls: ['./authorization.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations
})
export class AuthorizationComponent implements OnInit {

  constructor(
    private _servidorPublicoConfigService: MineduConfigService,
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
    private _dataService: DataService,
    private _sharedService: SharedService
  ) {
    this._servidorPublicoConfigService.config = {
      layout: {
        navbar: {
          hidden: true,
        },
        toolbar: {
          hidden: true,
        },
        footer: {
          hidden: true,
        },
        sidepanel: {
          hidden: true,
        },
      },
    };
    this.loadPassport();
  }

  ngOnInit(): void {
  }


  loadPassport() {
    // this._activatedRoute.queryParams.subscribe(params => {
    //     debugger;
    //   let token = params[PASSPORT_PARAM_RETORNO];
    //   if (token) {
    //     this._dataService.Storage().setPassportToken(token);
    //     this.systemAuthorize();
    //   } else {
    //     this.authorization();
    //   }
    // });
    this._dataService.Spinner().hide("sp6");
    this._router.navigate(["ayni", "personal"]);
  }

  authorization() {
    const experid = this._dataService.Storage().isTokenExpired();
    if (experid) {
      this._dataService.Storage().removeCredentials();
      this._dataService.Storage().passportUILogin();
    } else {
      this._dataService.Spinner().show("sp6");
      this.buscarUsuarioPassport();
    }
  }

  systemAuthorize() {
    this._dataService.Spinner().show("sp6");
    const token = this._dataService.Storage().getPassportToken();
    if (token) {
      if (!token.REDIRECT_URI) {
        this._dataService.Message().msgWarning(PASSPORT_MESSAGE.BAD_TOKEN, () => { this._dataService.Storage().passportUIPanel(); });
        return;
      }
      const code = (token.REDIRECT_URI).split("=")[1];
      const url = (token.REDIRECT_URI).split("?")[0];
      this._dataService.Kong().token(url, code).pipe(
        catchError(() => { this._dataService.SnackBar().msgError(KONG_MESSAGE.TOKEN, 'Cerrar'); return of(null) })
      ).subscribe(response => {
        if (response) {
          const expire = response.expires_in;
          response.expires_in = (Math.floor((new Date).getTime() / 1000)) + parseInt(response.expires_in);
          response.expires_in_before = (Math.floor((new Date).getTime() / 1000)) + (parseInt(expire) / 2);
          this._dataService.Storage().setAccessToken(response);
          this.buscarUsuarioPassport();
        } else {
          this._dataService.Spinner().hide("sp6");
          this._dataService.Message().msgWarning(PASSPORT_MESSAGE.BAD_REQUEST, () => { this._dataService.Storage().passportUILogin(); });
        }
      });
    } else {
      this._dataService.Spinner().hide("sp6");
      this._dataService.Message().msgWarning(PASSPORT_MESSAGE.BAD_REQUEST, () => { this._dataService.Storage().passportUILogin(); });
    }
  }


  buscarUsuarioPassport() {
    this._dataService.Passport().boot().pipe(
      catchError(() => of(null))
    ).subscribe((response: any) => {
      if (response) {
        this.loadUsuario(response.Token);
      } else {
        this._dataService.Spinner().hide("sp6");
        this._dataService.Message().msgWarning(PASSPORT_MESSAGE.UNAUTHORIZED, () => {
          this._dataService.Storage().passportUILogin();
        });
      }
    });
  }

  loadUsuario(token: any) {
    const param = this._dataService.Cifrado().PassportEncode(token, {});
    this._dataService.Passport().getInformacionUsuario(param).pipe(
      catchError(() => { this._dataService.SnackBar().msgError(PASSPORT_MESSAGE.BUSCAR_USUARIO, 'Cerrar'); return of(null) }),
      finalize(() => { })
    ).subscribe(response => {
      if (response && !response.HasErrors) {
        const data = response.Data[0];
        this._dataService.Storage().setPassportUser(data);
        this._sharedService.sendDataSharedMenu(true);
        const rol = this._dataService.Storage().getPassportRolSelected();
        // debugger;
        if (!rol) {
          this.getRoles(token);
        } else {
          this._dataService.Spinner().hide("sp6");
          this._router.navigate(["ayni", "personal"]);
        }
      } else {
        this._dataService.Spinner().hide("sp6");
        this._dataService.Message().msgWarning(PASSPORT_MESSAGE.UNAUTHORIZED,
          () => {
            this._dataService.Storage().removeCredentials();
            this._dataService.Storage().passportUILogin();
          });
      }
    });
  }

  private getRoles(token: any) {
    const data = this._dataService.Storage().getCodigoSistema();
    const param = this._dataService.Cifrado().PassportEncode(token, data);
    this._dataService
      .Passport()
      .getRolesUsuario(param)
      .pipe(
        catchError(() => {
          this._dataService
            .SnackBar()
            .msgError(
              PASSPORT_MESSAGE.BUSCAR_ROL_USUARIO,
              "Cerrar"
            );
          return of(null);
        }),
        finalize(() => { })
      )
      .subscribe((response: any) => {
        if (response && !response.HasErrors) {
          const roles = response.Data;
          if (roles) {
            const rolDefecto = roles.find((x) => x.POR_DEFECTO);
            this._dataService.Storage().setPassportRolSelected(rolDefecto);
            this.getPermisos(token);
          } else {
            this._dataService.Spinner().hide("sp6");
            this._dataService.Message().msgWarning(PASSPORT_MESSAGE.METHOD_UNAUTHORIZED, () => {
              this._dataService.Storage().passportUILogin();
            });
          }
        } else {
          this._dataService.Spinner().hide("sp6");
          this._dataService.Message().msgWarning(PASSPORT_MESSAGE.METHOD_UNAUTHORIZED, () => {
            this._dataService.Storage().passportUILogin();
          });
        }
      });
  }

  private getPermisos(token: any) {
    const data = this._dataService.Storage().getCodigoSistema();
    const param = this._dataService.Cifrado().PassportEncode(token, data);
    this._dataService
      .Passport()
      .getAccionesUsuario(param)
      .pipe(
        catchError(() => {
          this._dataService
            .SnackBar()
            .msgError(PASSPORT_MESSAGE.BUSCAR_ACCION, "Cerrar");
          return of(null);
        }),
        finalize(() => { this._dataService.Spinner().hide("sp6"); })
      )
      .subscribe((response: any) => {
        if (response && !response.HasErrors) {
          const acciones = response.Data;
          this._dataService.Storage().setPassportAcciones(acciones);
          this._router.navigate(["/ayni/personal"]);
        } else {
          this._dataService.Message().msgWarning(PASSPORT_MESSAGE.METHOD_UNAUTHORIZED, () => {
            this._dataService.Storage().passportUILogin();
          });
        }
      });
  }
}
