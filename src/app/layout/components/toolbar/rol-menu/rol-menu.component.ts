import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { DataService } from 'app/core/data/data.service';
import { PASSPORT_MESSAGE } from 'app/core/model/messages-error';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

@Component({
  selector: 'minedu-rol-menu',
  templateUrl: './rol-menu.component.html',
  styleUrls: ['./rol-menu.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class RolMenuComponent implements OnInit {


  items: any[] = [];
  selectedRolId: any = 0;
  selectedSedeId: any = 0;

  constructor(
    private _dataService: DataService,
    public matDialogRef: MatDialogRef<RolMenuComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private _router: Router
  ) { }

  ngOnInit(): void {
    setTimeout(() => {
      this._dataService.Spinner().show("sp6");
      this.getBoot();
    }, 0);
   
  }

  getBoot() {
    this._dataService.Passport().boot().pipe(
      catchError(() => of(null)),
      finalize(() => { })
    ).subscribe((response: any) => {
      if (response) {
        this.getRol(response.Token);
      } else {
        this.matDialogRef.close();
        this._dataService.Spinner().hide("sp6");
        this._dataService.Message().msgWarning(PASSPORT_MESSAGE.METHOD_UNAUTHORIZED, () => {
          this._dataService.Storage().passportUILogin();
        });
      }
    });
  }

  getRol(token: any) {
    const data = this._dataService.Storage().getCodigoSistema();
    const param = this._dataService.Cifrado().PassportEncode(token, data);
    this._dataService.Passport().getRolesUsuario(param).pipe(
      catchError(() => { this._dataService.SnackBar().msgError(PASSPORT_MESSAGE.BUSCAR_ROL_USUARIO, 'Cerrar'); return of(null) }),
      finalize(() => { this._dataService.Spinner().hide("sp6");})
    ).subscribe((response: any) => {
      if (response && !response.HasErrors) {
        const datos = response.Data;
        this.items = datos;
        const rol = this._dataService.Storage().getPassportRolSelected();
        if (rol) {
          this.setRol(rol, false);
        } else {
          this.setRol(this.items[0], false);
        }
      } else {
        this.matDialogRef.close();
        this._dataService.Message().msgWarning(PASSPORT_MESSAGE.METHOD_UNAUTHORIZED, () => {
          this._dataService.Storage().passportUILogin();
        });
      }
    });
  }

  setRol(item: any, close: boolean) {
    this.selectedRolId = item.ID_ROL;
    this.selectedSedeId = item.ID_SEDE;
    this._dataService.Storage().setPassportRolSelected(item);
    if (close) {
      this.matDialogRef.close();
     // this._router.navigate(["ayni","personal","inicio"]);
      this._router.navigate(["ayni"]);
    }
  }
}