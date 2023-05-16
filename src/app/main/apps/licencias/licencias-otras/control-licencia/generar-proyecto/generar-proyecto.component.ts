import {
    Component,
    OnInit,
    ViewEncapsulation,
    Inject,
    ViewChild,
} from '@angular/core';
import { mineduAnimations } from '@minedu/animations/animations';
import {
    MatDialogRef,
    MAT_DIALOG_DATA,
    MatDialog,
} from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { DataService } from 'app/core/data/data.service';
import { SharedService } from 'app/core/shared/shared.service';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import Swal from 'sweetalert2';
import { DocumentosSustentoComponent } from '../../../components/documentos-sustento/documentos-sustento.component';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DocumentoSustentoModel, LicenciaModel } from '../../../models/licencia.model';
import { ResultadoOperacionEnum } from '../../../../bandejas/actividades/gestion-pendientes/_utils/constants';
import { OrigenRegistroDSEnum, TipoResolucionEnum } from '../../../_utils/constants';
import { SecurityModel } from '../../../../../../core/model/security/security.model';

@Component({
    selector: 'minedu-generar-proyecto',
    templateUrl: './generar-proyecto.component.html',
    styleUrls: ['./generar-proyecto.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class GenerarProyectoComponent implements OnInit {
    form: FormGroup;
    licencia: LicenciaModel = null;
    dialogTitle = 'Generar proyecto de licencia';
    working = false;
    documentosSustento: DocumentoSustentoModel[] = [];
    comboLists = {
        listTipoResolucion: [],
        listTiposSustento: [],
        listTiposTipoFormato: []
    };
    idLicencia: 0;
    @ViewChild(DocumentosSustentoComponent)
    private documentosSustentoComponent: DocumentosSustentoComponent;
    generado: boolean;
    origenRegistro = OrigenRegistroDSEnum.GENERARACION_PROYECTO;
    currentSession: SecurityModel = new SecurityModel();

    constructor(
        public matDialogRef: MatDialogRef<GenerarProyectoComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private route: ActivatedRoute,
        private dataService: DataService,
        private dataShared: SharedService,
        private materialDialog: MatDialog,
        private formBuilder: FormBuilder
    ) { 
        this.currentSession = data.currentSession
    }

    ngOnInit(): void {
        this.working = true;
        this.buildForm();
        this.loadTipoResolucion();
        this.loadTiposFormato();
        this.loadTiposSustento();
        this.idLicencia = this.data.idLicencia;
        this.generado = this.data.generado;
        this.obtenerDatosLicencia(this.idLicencia);
    }

    buildForm(): void {
        this.form = this.formBuilder.group({
            idTipoResolucion: [null, Validators.required],
        });
    }

    handleCancel = () => {
        this.matDialogRef.close();
    }

    loadTiposSustento = () => {
        this.dataService
            .Licencias()
            .getTiposSustento(true)
            .pipe(
                catchError(() => of([])),
                finalize(() => { })
            )
            .subscribe((response: any) => {
                if (response && response.result) {
                    const data = response.data.map((x) => ({
                        ...x,
                        value: x.idCatalogoItem,
                        label: `${x.descripcionCatalogoItem}`,
                    }));
                    this.comboLists.listTiposSustento = data;
                }
            });
    }

    loadTiposFormato = () => {
        this.dataService
            .Licencias()
            .getTiposFormato(true)
            .pipe(
                catchError(() => of([])),
                finalize(() => { })
            )
            .subscribe((response: any) => {
                if (response && response.result) {
                    const data = response.data.map((x) => ({
                        ...x,
                        value: x.idCatalogoItem,
                        label: `${x.descripcionCatalogoItem}`,
                    }));
                    this.comboLists.listTiposTipoFormato = data;
                }
            });
    }


    loadTipoResolucion = () => {
        this.dataService
            .Licencias()
            .getTiposResolucion(true)
            .pipe(
                catchError(() => of([])),
                finalize(() => { })
            )
            .subscribe((response: any) => {
                if (response && response.result) {
                    const data = response.data.map((x) => ({
                        ...x,
                        value: x.idCatalogoItem,
                        label: `${x.descripcionCatalogoItem}`,
                        codigoCatalogoItem: x.codigoCatalogoItem,
                    }));
                    this.comboLists.listTipoResolucion = data;
                    // por defecto
                    this.comboLists.listTipoResolucion.forEach(element => {
                        if (element.codigoCatalogoItem === TipoResolucionEnum.RESOLUCION_DIRECTORAL) {
                            this.form.get('idTipoResolucion').setValue(element.value);
                        }
                    });
                }
            });
    }

    obtenerDatosLicencia = (idLicencia: number) => {
        this.dataService
            .Licencias()
            .getLicencia(idLicencia)
            .pipe(
                catchError(() => of([])),
                finalize(() => { this.working = false; })
            )
            .subscribe((response: any) => {
                if (response && response.result) {
                    this.licencia = response.data;
                    if (response.data.idTipoResolucion != null && response.data.idTipoResolucion != 0) {
                        // this.form.get('idTipoResolucion').setValue(response.data.idTipoResolucion);
                    }
                    this.documentosSustento = this.licencia.documentosSustento;
                    this.documentosSustentoComponent.actualizarLista(
                        this.documentosSustento
                    );
                }
            });
    }

    handleGenerar = () => {
        if (!this.form.valid) {
            this.dataService.Message().msgWarning('Debe seleccionar el tipo de resolución', () => { });
            return;
        }
        const idTipoResolucion = this.form.get('idTipoResolucion').value;
        const data = {
            idLicencia: this.idLicencia,
            idTipoResolucion: idTipoResolucion,
            documentosSustento: this.documentosSustento,
            usuarioRegistro: this.currentSession.numeroDocumento
        };

        Swal.fire({
            title: '',
            text: '¿Está seguro que desea generar el proyecto de resolución?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d84d2a',
            cancelButtonColor: '#333333',
            confirmButtonText: 'Sí',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.value) {
                this.dataService.Spinner().show("sp6");
                const resultMessage = 'Acción grabada se guardó exitosamente';
                this.dataService.Licencias().generarLicencia(data).pipe(
                    catchError((e) => of(e)),
                    finalize(() => {
                        this.dataService.Spinner().hide("sp6");
                        this.working = false;
                    })
                ).subscribe(response => {
                    if (response && response.result) {
                        this.matDialogRef.close({ grabado: true });
                        // this.dataService.Message().msgInfo(resultMessage, () => { });
                    } else if (response && response.statusCode === ResultadoOperacionEnum.NotFound) {
                        this.dataService.Message().msgWarning(response.messages[0], () => { });
                    } else if (response && response.statusCode === ResultadoOperacionEnum.UnprocessableEntity) {
                        this.dataService.Message().msgWarning(response.messages[0], () => { });
                    } else {
                        this.dataService.Message().msgError('Ocurrieron algunos problemas al guardar la información.', () => { this.working = false; });
                    }
                });

            }
        });
    }

    handleEnviar = () => {
        if (!this.form.valid) {
            this.dataService.Message().msgWarning('Debe seleccionar el tipo de resolución', () => { });
            return;
        }
        const idTipoResolucion = this.form.get('idTipoResolucion').value;
        const data = {
            idLicencia: this.idLicencia,
            idTipoResolucion: idTipoResolucion,
            documentosSustento: this.documentosSustento,
            usuarioRegistro: this.currentSession.numeroDocumento
        };

        Swal.fire({
            title: '',
            text: '¿Está seguro de que desea guardar la acción?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d84d2a',
            cancelButtonColor: '#333333',
            confirmButtonText: 'Sí',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.value) {
                this.dataService.Spinner().show("sp6");
                const resultMessage = 'Acción grabada se guardó exitosamente';
                this.dataService.Licencias().enviarAccionesGrabadas(data).pipe(
                    catchError((e) => of(e)),
                    finalize(() => {
                        this.dataService.Spinner().hide("sp6");
                        this.working = false;
                    })
                ).subscribe(response => {
                    if (response && response.result) {
                        this.matDialogRef.close({ grabado: true });
                        // this.dataService.Message().msgInfo(resultMessage, () => { });
                    } else if (response && response.statusCode === ResultadoOperacionEnum.NotFound) {
                        this.dataService.Message().msgWarning(response.messages[0], () => { });
                    } else if (response && response.statusCode === ResultadoOperacionEnum.UnprocessableEntity) {
                        this.dataService.Message().msgWarning(response.messages[0], () => { });
                    } else {
                        this.dataService.Message().msgError('Ocurrieron algunos problemas al guardar la información.', () => { this.working = false; });
                    }
                });
            }
        });
    }

}

