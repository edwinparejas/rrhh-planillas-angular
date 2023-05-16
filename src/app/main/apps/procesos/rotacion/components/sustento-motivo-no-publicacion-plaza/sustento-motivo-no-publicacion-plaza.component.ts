import { SelectionModel } from '@angular/cdk/collections';
import { DatePipe } from '@angular/common';
import { Component, Inject, OnInit, QueryList, ViewChildren, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { TablaAccionesPassport } from 'app/core/model/action-types';
import { PASSPORT_MESSAGE } from 'app/core/model/messages-error';
import { DocumentViewerComponent } from 'app/main/apps/components/document-viewer/document-viewer.component';
import { SingleFileInputComponent } from 'app/main/apps/components/single-file-input/single-file-input.component';
import { isArray } from 'lodash';
import { BehaviorSubject, forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { TablaMetodosRotacion } from '../../_utils/constants';
import { InformacionDocumentoSustentoComponent } from '../informacion-documento-sustento/informacion-documento-sustento.component';

@Component({
    selector: 'minedu-sustento-motivo-no-publicacion-plaza',
    templateUrl: './sustento-motivo-no-publicacion-plaza.component.html',
    styleUrls: ['./sustento-motivo-no-publicacion-plaza.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class SustentoMotivoNoPublicacionPlazaComponent implements OnInit {

    form: FormGroup;
    formDocumento: FormGroup;

    @ViewChildren(SingleFileInputComponent)
    fileComponent: QueryList<SingleFileInputComponent>;

    working = false;
    styleraised = false;
    workingDocumento = false;
    obligatorioFechaEmision = true;

    cantidadRegistros = 0;

    nowDate = new Date();

    combo = {
        tiposDocumentoSustento: [],
        tiposFormatoSustento: [],
        motivosNoPublicacion: []
    };

    plaza = {
        plazasRotacionDetalle: [],
        idDesarrolloProceso: null,
        idAlcanceProceso: null,
        idPlazaRotacion: null,
        prepublicadas: true,
        seleccionadoTodos: null
    };

    displayedColumns: string[] = [
        'index',
        'tipoDocumentoSustento',
        'numeroDocumentoSustento',
        'tipoFormatoSustento',
        'numeroFolios',
        'fechaEmision',
        'opciones'
    ];
    private _loadingChange = new BehaviorSubject<boolean>(false);
    loading = this._loadingChange.asObservable();
    dataSource: MatTableDataSource<any>;
    selection = new SelectionModel<any>(false, []);
    sustentos: any[] = [];

    dialogRef: any;

    constructor(
        public matDialogRef: MatDialogRef<SustentoMotivoNoPublicacionPlazaComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        public datepipe: DatePipe,
        private materialDialog: MatDialog,
        private formBuilder: FormBuilder,
        private dataService: DataService) {

    }

    ngOnInit(): void {
        this.buildForm();
        console.log()
    }


    buildForm() {
        this.formDocumento = this.formBuilder.group({
            idTipoFormatoSustento: [null, Validators.required],
            idTipoDocumentoSustento: [null, Validators.required],
            numeroDocumentoSustento: [null, Validators.required],
            numeroFolios: [null, Validators.compose([Validators.required, Validators.pattern(/^[0-9]\d*$/), Validators.maxLength(3)])],
            sumilla: [null],
            documentoAdjuntoSustento: [null, Validators.required],
            entidadEmisora: [null],
            fechaEmision: [null, Validators.required],
            usuarioCreacion: [null],
        });


        this.form = this.formBuilder.group({
            idMotivoNoPublicacion: [null, Validators.required],
            detalle: [null, Validators.required]
        });

        this.dataSource = new MatTableDataSource([]);
        this.initialize();
    }

    initialize() {
        this.plaza = this.data;
        console.log('this.plaza', this.plaza);
        this.cantidadRegistros = this.plaza.plazasRotacionDetalle.length;

        setTimeout(() => {
            this.getCombosModal();
        }, 0);
    }

    adjunto(pIdDocumento) {
        if (pIdDocumento) {
            this.formDocumento.patchValue({ documentoAdjuntoSustento: pIdDocumento[0] });
        }
    }


    private getCombosModal = () => {
        this.dataService.Spinner().show('sp6');

        forkJoin(
            [
                this.dataService.Rotacion().getComboMotivosNoPublicacion(),
                this.dataService.Rotacion().getComboTiposDocumentoSustento(),
                this.dataService.Rotacion().getComboTiposDocumentoFormato()
            ]
        ).pipe(
            catchError((e) => { return  this.configCatch(e);        }),
            finalize(() => {
                this.dataService.Spinner().hide('sp6');
            })
        ).subscribe(response => {
            if (response && response.length === 0) {
                this.dataService.Message().msgWarning('ERROR AL CARGAR LA INFORMACIÓN DE LOS CAMPOS SELECCIONABLES.', () => {
                });
                return;
            }

            const motivosNoPublicacion = response[0];
            if (motivosNoPublicacion) {
                this.combo.motivosNoPublicacion = motivosNoPublicacion;
            }

            const tiposDocumentoSustento = response[1];
            if (tiposDocumentoSustento) {
                this.combo.tiposDocumentoSustento = tiposDocumentoSustento;
            }
            const tiposFormatoSustento = response[2];
            if (tiposDocumentoSustento) {
                this.combo.tiposFormatoSustento = tiposFormatoSustento;
            }
        });
    };

    handleAgregar() {
        if (!this.formDocumento.valid) {
            this.dataService.Message().msgWarning('INGRESE LOS CAMPOS OBLIGATORIOS DE LA SECCIÓN DOCUMENTOS DE SUSTENTO.', () => {
            });
            return;
        }

        this.workingDocumento = true;
        const form = this.formDocumento.value;
        const datosUsuario = this.dataService.Storage().getInformacionUsuario();

        const documentoSustento = this.combo.tiposDocumentoSustento.find(d => d.idCatalogoItem === form.idTipoDocumentoSustento);
        const formatoSustento = this.combo.tiposFormatoSustento.find(d => d.idCatalogoItem === form.idTipoFormatoSustento);
        form.tipoDocumentoSustento = documentoSustento.descripcionCatalogoItem;
        form.tipoFormatoSustento = formatoSustento.descripcionCatalogoItem;
        form.usuarioCreacion = datosUsuario.numeroDocumento;
        this.sustentos.push(form);
        this.dataSource = new MatTableDataSource(this.sustentos);
        this.workingDocumento = false;
        this.limpiarDocumento();
        this.fileComponent.forEach(c => c.eliminarDocumento());
    }


    handleInformacion(row) {
        this.dialogRef = this.materialDialog.open(InformacionDocumentoSustentoComponent, {
            panelClass: 'documento-sustento-informacion',
            disableClose: true,
            data: { documento: row }
        });

        this.dialogRef.afterClosed()
            .subscribe((response: any) => {
                if (!response) {
                    return;
                }
            });
    }

    handleEliminar(row, index) {
        this.dataService.Message().msgConfirm('¿ESTÁ SEGURO DE ELIMINAR EL DOCUMENTO DE SUSTENTO?', () => {
            this.sustentos.splice(index, 1);
            this.dataSource = new MatTableDataSource(this.sustentos);
        }, () => {
        });
    }

    limpiarDocumento() {
        this.formDocumento.reset();
        //this.form.get('detalle').reset();
    };

    handleVerAdjunto(row) {
        if (!row.documentoAdjuntoSustento) {
            this.dataService.Message().msgWarning('EL REGISTRO NO TIENE DOCUMENTO DE SUSTENTO ADJUNTADO.', () => {
            });
            return;
        }

        this.handlePreview(row.documentoAdjuntoSustento, "");
    }

    handlePreview(file: any, nombreAdjuntoSustento: string) {
        this.dialogRef = this.materialDialog.open(DocumentViewerComponent, {
            panelClass: 'modal-viewer-form-dialog',
            disableClose: true,
            data: {
                modal: {
                    icon: 'remove_red_eye',
                    title: 'Documento de sustento',
                    file: file,
                    fileName: nombreAdjuntoSustento
                }
            }
        });

        this.dialogRef.afterClosed()
            .subscribe((response: any) => {
                if (!response) {
                    return;
                }
            });
    }

    handleGuardar() {
        const form = this.form.value;
        if (this.sustentos.length <= 0) {
            this.dataService.Message().msgWarning('Ingrese al menos un registro de documentos de sustento.', () => {
            });
            return;
        }

        if (!form.idMotivoNoPublicacion) {
            this.dataService.Message().msgWarning('Ingrese los campos obligatorios para continuar.', () => {
            });
            return;
        }
        this.obtenerClavePublica(TablaAccionesPassport.Agregar, true, TablaMetodosRotacion.REGISTRAR_SUSTENTO_NO_PUBLICACION);
    }

    private registrarMotivoNoPublicacion() {
        this.dataService.Spinner().hide('sp6');
        const form = this.form.value;

        const usuarioCreacion = this.dataService.Storage().getInformacionUsuario().numeroDocumento;
        console.log('PLAZA', this.plaza);
        let documento = new FormData();
        documento.append('idMotivoNoPublicacion', form.idMotivoNoPublicacion);
        documento.append('detalleMotivoNoPublicacion', form.detalle);
        documento.append('idDesarrolloProceso', this.plaza.idDesarrolloProceso);
        documento.append('seleccionadoTodos', this.plaza.seleccionadoTodos);        
        documento.append('idPlazaRotacion', this.plaza.idPlazaRotacion);
        documento.append('usuarioCreacion', usuarioCreacion);


        for (var i = 0; i < this.sustentos.length; i++) {
            var fechaEmision = this.datepipe.transform(this.sustentos[i].fechaEmision, 'dd/MM/yyyy');
            documento.append('documentosSustento[' + i + '].idTipoFormatoSustento', this.sustentos[i].idTipoFormatoSustento);
            documento.append('documentosSustento[' + i + '].idTipoDocumentoSustento', this.sustentos[i].idTipoDocumentoSustento);
            documento.append('documentosSustento[' + i + '].numeroDocumentoSustento', this.sustentos[i].numeroDocumentoSustento);
            documento.append('documentosSustento[' + i + '].numeroFolios', this.sustentos[i].numeroFolios);
            documento.append('documentosSustento[' + i + '].sumilla', this.sustentos[i].sumilla);
            documento.append('documentosSustento[' + i + '].documentoAdjuntoSustento', this.sustentos[i].documentoAdjuntoSustento);
            documento.append('documentosSustento[' + i + '].entidadEmisora', this.sustentos[i].entidadEmisora);
            documento.append('documentosSustento[' + i + '].fechaEmision', fechaEmision);
        }

        for (var i = 0; i < this.plaza.plazasRotacionDetalle.length; i++) {
            documento.append('plazasRotacionDetalle[]', this.plaza.plazasRotacionDetalle[i]);
        }

        this.dataService.Message().msgConfirm('<b>¿ESTA SEGURO QUE DESEA OBSERVAR LAS PLAZAS?</b>.', () => {
            this.working = true;
            this.dataService.Spinner().show('sp6');
            if (this.plaza.prepublicadas) {
                this.handleEnviarPrepublicadas(documento);
            } else {
                this.handleEnviarConvocadas(documento);
            }
        }, () => {
        });
    }

    private handleEnviarPrepublicadas = (data) => {
        this.dataService
            .Rotacion()
            .enviarPlazasPrepublicadasToObservadas(data)
            .pipe(
                catchError((e) => { return  this.configCatch(e);        }),
                finalize(() => { this.dataService.Spinner().hide('sp6'); this.working = false; })
            ).subscribe((response: any) => {
                if (response) {
                    this.dataService.Message().msgAutoCloseSuccessNoButton('OPERACIÓN REALIZADA DE FORMA EXITOSA.', 3000, () => {
                        this.handleCancelar({ reload: true });
                    });
                } else {
                    this.dataService.Message().msgWarning('ERROR INESPERADO EN EL SERVIDOR. INTÉNTELO EN UNOS SEGUNDOS, SI EL ERROR PERSISTE COMUNÍQUESE CON EL ADMINISTRADOR DEL SISTEMA.', () => { });
                }
            });
    }

    private handleEnviarConvocadas = (data) => {
        this.dataService
            .Rotacion()
            .enviarPlazasConvocadasToObservadas(data)
            .pipe(
                catchError((e) => { return  this.configCatch(e);        }),
                finalize(() => { this.dataService.Spinner().hide('sp6'); })
            ).subscribe((response: any) => {
                if (response) {
                    this.dataService.Message().msgAutoCloseSuccessNoButton('OPERACIÓN REALIZADA DE FORMA EXITOSA.', 3000, () => {
                        this.handleCancelar({ reload: true });
                    });
                } else {
                    this.dataService.Message().msgWarning('Error al enviar las plazas convocadas a observadas', () => { });
                }
            });
    }


    handleCancelar(data?: any) {
        this.matDialogRef.close(data);
    }

    obtenerClavePublica(operacion: TablaAccionesPassport, requiredLogin: boolean, method: TablaMetodosRotacion, param?: any) {
        this.dataService.Spinner().show('sp6');
        this.dataService.Passport().boot().pipe(
            catchError((e) => { return  this.configCatch(e);        }),
        ).subscribe((response: any) => {
            if (response) {
                const { IsSecure, Token } = response;
                this.confirmarOperacion(Token, operacion, requiredLogin, method, param);
            } else {
                this.dataService.Spinner().hide('sp6');
                this.working = false;
                this.workingDocumento = false;
                if (!requiredLogin) {
                    this.dataService.Message().msgWarning(PASSPORT_MESSAGE.PERMISO_NOT_FOUND, () => {
                    });
                } else {
                    this.dataService.Message().msgInfo(PASSPORT_MESSAGE.BUTTON_UNAUTHORIZED, () => {
                        this.dataService.Storage().passportUILogin();
                    });
                }
                return;
            }
        });
    }

    confirmarOperacion(token: any, operacion: TablaAccionesPassport, requiredLogin: boolean, method: TablaMetodosRotacion, parametro?: any) {
        const parametroPermiso = this.dataService.Storage().getParamAccion(operacion);
        if (!parametroPermiso) {
            this.dataService.Spinner().hide('sp6');
            this.working = false;
            this.workingDocumento = false;
            this.dataService.Message().msgWarning(PASSPORT_MESSAGE.PERMISO_NOT_FOUND, () => {
            });
            return;
        }
        const param = this.dataService.Cifrado().PassportEncode(token, parametroPermiso);
        this.dataService.Passport().getAutorizacion(param).pipe(
            catchError((e) => { return  this.configCatch(e);        }),
            finalize(() => {
            })
        ).subscribe(response => {
            if (response && !response.HasErrors) {
                const data = response.Data[0];
                if (data.ESTA_AUTORIZADO) {
                    switch (method) {
                        case TablaMetodosRotacion.CONSULTAS_SUSTENTO_NO_PUBLICACION: {
                            this.getCombosModal();
                            break;
                        }
                        case TablaMetodosRotacion.REGISTRAR_SUSTENTO_NO_PUBLICACION: {
                            this.registrarMotivoNoPublicacion();
                            break;
                        }
                    }
                } else {
                    this.dataService.Spinner().hide('sp6');
                    this.working = false;
                    this.workingDocumento = false;
                    if (!requiredLogin) {
                        this.dataService.Message().msgWarning(PASSPORT_MESSAGE.PERMISO_NOT_FOUND, () => {
                        });
                    } else {
                        this.dataService.Message().msgInfo(PASSPORT_MESSAGE.BUTTON_UNAUTHORIZED, () => {
                            this.dataService.Storage().passportUILogin();
                        });
                    }
                    return;
                }
            } else {
                this.working = false;
                this.workingDocumento = false;
                this.dataService.Spinner().hide('sp6');
                this.dataService.Message().msgInfo(PASSPORT_MESSAGE.BUTTON_UNAUTHORIZED, () => {
                    this.dataService.Storage().passportUILogin();
                });
            }
        });
    }
    configCatch(e: any) { 
        if (e && e.status === 400 && isArray(e.messages)) {
          this.dataService.Util().msgWarning(e.messages[0], () => { });
        } else if(isArray(e.messages)) {
                if((e.messages[0]).indexOf("HUBO UN PROBLEMA AL PROCESAR LA SOLICITUD")!=-1)
                    this.dataService.Util().msgError(e.messages[0], () => { }); 
                else
                    this.dataService.Util().msgWarning(e.messages[0], () => { }); 
                    
        }else{
            this.dataService.Util().msgError('Error recuperando datos del servidor, por favor intente dentro de unos segundos, gracias.', () => { });
        }
        this.dataService.Spinner().hide("sp6");
        return of(e) 
      }
}

