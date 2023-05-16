import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { SecurityModel } from 'app/core/model/security/security.model';
import { ResultadoOperacionEnum } from 'app/core/model/types';
import { isArray } from 'lodash';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
//import { EstadoValidacionPlazaEnum } from '../../../../contratacion/_utils/constants';

@Component({
    selector: 'minedu-registrar-rechazo',
    templateUrl: './registrar-rechazo.component.html',
    styleUrls: ['./registrar-rechazo.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
 
export class RegistrarRechazoComponent implements OnInit {
    dialogTitle = 'Rechazar solicitud de aprobación';
    working = false;
    form: FormGroup;
    request: any = {};
    passport: any = {};
    fechaSolicitante:string;
    dniSolicitante:string;
    instanciaSolicitante:string;
    fechaAprobador:Date;
    dniAprobador:string;
    instanciaAprobador:string;
    idConsolidadoPlaza: number;
    idParametroInicial: number;
    securityModel:SecurityModel;
    constructor(public matDialogRef: MatDialogRef<RegistrarRechazoComponent>,
                private dataService: DataService,
                @Inject(MAT_DIALOG_DATA) private data: any,
                private formBuilder: FormBuilder) {
        this.request = data.request
    }

    ngOnInit(): void {
        this.securityModel=  this.dataService.Storage().getInformacionUsuario();
        console.log("this.data",this.data );
        this.instanciaSolicitante=this.data.instanciaSolicitante;
        this.fechaSolicitante=this.data.fechaSolicitante;
        this.dniSolicitante=this.data.dniSolicitante;
        this.idConsolidadoPlaza=this.data.idConsolidadoPlaza;
        this.idParametroInicial=this.data.idParametroInicial;

        let hoy=new Date();
        
        this.passport=this.dataService.Storage().getInformacionUsuario();
        this.instanciaAprobador=this.passport.nombreSede;
        this.fechaAprobador=hoy ;
        this.dniAprobador=this.passport.numeroDocumento;

        
        console.log("this.dataService.Storage().getInformacionUsuario()",this.dataService.Storage().getInformacionUsuario());

        this.buildForm();
    }

    handleCancel = () => {
        this.matDialogRef.close();
    }

    buildForm(): void {
        this.form = this.formBuilder.group({
            observaciones: [null, Validators.required]
        });
    }

    handleRechazarPlz = () => {
        const user = this.dataService.Storage().getPassportUserData();
        const rol = this.dataService.Storage().getPassportRolSelected();
        console.log("handleRechazarPlz");
        const detalle = this.form.get('observaciones').value;
        //this.request.estadoAprobacion = EstadoValidacionPlazaEnum.RECHAZADO;
        let param={
            idConsolidadoPlaza:this.idConsolidadoPlaza,
            idParametroInicial:this.idParametroInicial,
            detalleMotivoRechazo : detalle,
            usuarioModificacion:this.passport.numeroDocumento,
            numeroDocumento:this.securityModel.numeroDocumento,
            tipoNumeroDocumento:this.securityModel.tipoNumeroDocumento,
            solicitante:this.securityModel.nombreCompleto,
            primerApellidoAprobador:user.APELLIDO_PATERNO,
            segundoApellidoAprobador:user.APELLIDO_MATERNO,
            nombresAprobador:user.NOMBRES_USUARIO,
            codigoRol:rol.CODIGO_ROL,
            codigoCentroTrabajo:rol.CODIGO_SEDE
           
        };

        if (detalle === '' || detalle === null) {
            this.dataService.Message().msgError("INGRESE UNA DESCRIPCIÓN DEL MOTIVO DE RECHAZO.", () => { });
            return;
        }

        const resultMessage = '"LAS PLAZAS LISTADAS FUERON RECHAZADAS SATISFACTORIAMENTE."';
        this.dataService.Message().msgConfirm('¿ESTÁ SEGURO QUE DESEA RECHAZAR EL LISTADO DE LAS PLAZAS?', 
            () => {
                this.dataService.Spinner().show("sp6");
                this.dataService.CuadroHoras().rechazarConsolidadoPlaza(param).pipe(
                    catchError((e) => { return  this.configCatch(e);        }),
                    finalize(() => { })
                  ).subscribe(
                    (response) => {
                      if(response>0) 
                      this.dataService.Util().msgAutoCloseSuccess("OPERACIÓN REALIZADA DE FORMA EXITOSA",3000);
                      //this.obtenerConsolidadoPlaza();
                      this.dataService.Spinner().hide("sp6")
                      this.matDialogRef.close();
                    },
                    (error: HttpErrorResponse) => {
                      this.dataService.Util().msgError("OCURRIÓ UN ERROR AL REALIZAR ESTA OPERACIÓN.");
                    }
                  )
                
            }, (error) => { }
        );
    }
    private configCatch(e: any) { 

        if (e && (e.status === 400 || e.status === 500) && isArray(e.error.messages)) {
          this.dataService.Util().msgWarning(e.error.messages[0], () => { });
        } else {
          this.dataService.Util().msgError('Error recuperando datos del servidor, por favor intente dentro de unos segundos, gracias.', () => { });
        }
      
        this.dataService.Spinner().hide("sp6");
        return of(e) 
      
        }
}
