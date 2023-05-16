import { Component, OnInit, ViewChild, Inject, ViewEncapsulation } from '@angular/core';
import { DocumentosSustentoComponent } from '../../../components/documentos-sustento/documentos-sustento.component';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { DataService } from 'app/core/data/data.service';
import { SharedService } from 'app/core/shared/shared.service';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import Swal from 'sweetalert2';
import { mineduAnimations } from '@minedu/animations/animations';
import { timeStamp } from 'console';
import { ThrowStmt } from '@angular/compiler';
import { DocumentoSustentoModel, LicenciaModel, FamiliarServidorPublico } from '../../../models/licencia.model';
import { MotivoAccionEnum, OrigenEliminacionEnum } from '../../../_utils/constants';
import { saveAs } from 'file-saver';
import { SecurityModel } from '../../../../../../core/model/security/security.model';

@Component({
    selector: 'minedu-informacion-licencia-otra',
    templateUrl: './informacion-licencia-otra.component.html',
    styleUrls: ['./informacion-licencia-otra.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class InformacionLicenciaOtraComponent implements OnInit {

    licencia: LicenciaModel = null;
    dialogTitle = 'Información de licencia';
    working = false;
    documentosSustento: DocumentoSustentoModel[] = [];
    idLicencia: 0;
    @ViewChild(DocumentosSustentoComponent)
    private documentosSustentoComponent: DocumentosSustentoComponent;
    eliminado: boolean;
    panelDatosFamiliarVisible = false;
    panelFamiliarTitle = 'Datos de hijo';
    datosHijoVisible = false;
    esCampoVisible = false;
    familiar = new FamiliarServidorPublico();
    currentSession: SecurityModel = new SecurityModel();

    constructor(
        public matDialogRef: MatDialogRef<InformacionLicenciaOtraComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private route: ActivatedRoute,
        private dataService: DataService,
        private dataShared: SharedService,
        private materialDialog: MatDialog) {
        if (data.eliminado === true) {
            this.dialogTitle = 'Eliminar Licencia';            
        }
        this.currentSession = data.currentSession;
    }

    ngOnInit(): void {
        this.working = true;
        this.idLicencia = this.data.idLicencia;
        this.eliminado = this.data.eliminado;
        this.obtenerDatosLicencia(this.idLicencia);        
    }

    handleCancel = () => {
        this.matDialogRef.close();
    }


    obtenerDatosLicencia = (idLicencia: number) => {
        this.dataService
            .Licencias()
            .getLicencia(idLicencia)
            .pipe(
                catchError(() => of([])),
                finalize(() => {
                    this.working = false;
                })
            )
            .subscribe((response: any) => {
                if (response && response.result) {
                    this.licencia = response.data;
                    this.documentosSustento = this.licencia.documentosSustento;
                    this.documentosSustentoComponent.actualizarLista(this.documentosSustento);
                    this.configurarPanel(this.licencia);
                }
            });
    }

    handleDelete = (row) => {
        Swal.fire({
            title: '',
            text: '¿Está seguro de que desea eliminar la información?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d84d2a',
            cancelButtonColor: '#333333',
            confirmButtonText: 'Sí',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.value) {
                this.dataService.Licencias()
                    .deleteLicencia(this.idLicencia, OrigenEliminacionEnum.REGISTRADO, this.currentSession.numeroDocumento)
                    .subscribe(
                        (rest) => {
                            this.matDialogRef.close({ grabado: true });
                        },
                        (error) => {
                            // this.mensajeService.mostrarMensajeError(error);
                        }
                    );
            }
        });
    }

    configurarPanel = (row: LicenciaModel) => {
        this.panelDatosFamiliarVisible = false;
        this.esCampoVisible = false;
        const codigoMotivoAccion = this.licencia.codigoMotivoAccion;

        switch (codigoMotivoAccion) {
            case MotivoAccionEnum.POR_ADOPCION:
                this.panelDatosFamiliarVisible = true;
                this.panelFamiliarTitle = 'Datos del hijo';
                this.datosHijoVisible = true;
                break;
            case MotivoAccionEnum.POR_FALLECIMIENTO_DE_PADRES_CONYUGE_E_HIJOS:
                this.panelDatosFamiliarVisible = true;
                this.panelFamiliarTitle = 'Datos del familiar';
                this.datosHijoVisible = false;
                break;
            case MotivoAccionEnum.POR_ENFERMEDAD_GRAVE_TERMINAL_O_POR_ACCIDENTE_GRAVE:
                this.panelDatosFamiliarVisible = true;
                this.datosHijoVisible = false;
                this.esCampoVisible = true;
                this.panelFamiliarTitle = 'Datos del familiar';
                break;
            default:
                break;
        }

        if (row.licenciaAdopcion != null) {
            this.familiar.idFamiliarServidorPublico = row.licenciaAdopcion.idFamiliarServidorPublico;
            this.familiar.idPersona = row.licenciaAdopcion.idPersona;
            // this.familiar.nombreCompleto = row.licenciaAdopcion.nombreCompleto;
            this.familiar.primerApellido = row.licenciaAdopcion.primerApellido;
            this.familiar.segundoApellido = row.licenciaAdopcion.segundoApellido;
            this.familiar.nombres = row.licenciaAdopcion.nombres;
            this.familiar.idTipoDocumentoIdentidad = row.licenciaAdopcion.idTipoDocumentoIdentidad;
            this.familiar.numeroDocumentoIdentidad = row.licenciaAdopcion.numeroDocumentoIdentidad;
            this.familiar.numeroDocumentoIdentidadCompleto = row.licenciaAdopcion.numeroDocumentoIdentidadCompleto;
            this.familiar.fechaNacimiento = row.licenciaAdopcion.fechaNacimiento;
            this.familiar.edad = row.licenciaAdopcion.edad;
            this.familiar.descripcionParentesco = row.licenciaAdopcion.descripcionParentesco;

        }

        if (row.licenciaFallecimiento != null) {
            this.familiar.idFamiliarServidorPublico = row.licenciaFallecimiento.idFamiliarServidorPublico;
            this.familiar.idPersona = row.licenciaFallecimiento.idPersona;
            // this.familiar.nombreCompleto = row.licenciaAdopcion.nombreCompleto;
            this.familiar.primerApellido = row.licenciaFallecimiento.primerApellido;
            this.familiar.segundoApellido = row.licenciaFallecimiento.segundoApellido;
            this.familiar.nombres = row.licenciaFallecimiento.nombres;
            this.familiar.idTipoDocumentoIdentidad = row.licenciaFallecimiento.idTipoDocumentoIdentidad;
            this.familiar.numeroDocumentoIdentidad = row.licenciaFallecimiento.numeroDocumentoIdentidad;
            this.familiar.numeroDocumentoIdentidadCompleto = row.licenciaFallecimiento.numeroDocumentoIdentidadCompleto;
            this.familiar.fechaNacimiento = row.licenciaFallecimiento.fechaNacimiento;
            this.familiar.edad = row.licenciaFallecimiento.edad;
            //  this.familiar.descripcionLugarDesceso = row.licenciaFallecimiento.descripcionLugarDesceso;
            this.familiar.descripcionParentesco = row.licenciaFallecimiento.descripcionParentesco;
        }

    }

    descargarResolucion = () => {
        const data = this.licencia;
        if (data.codigoResolucion === null ||
            data.codigoResolucion === '') {
            this.dataService.Message().msgWarning('La licencia no tiene resolución adjunto.', () => { });
            return;
        }

        this.dataService.Spinner().show("sp6");
        this.dataService.Documento().descargar(data.codigoDocumentoResolucion)
            .pipe(
                catchError((e) => of(null)),
                finalize(() => this.dataService.Spinner().hide("sp6"))
            ).subscribe(response => {
                if (response) {
                    saveAs(response, "resolucion.pdf");
                } else {
                    this.dataService.Message().msgWarning('No se pudo descargar la resolución adjunta', () => { });
                }
            });
    }

}
