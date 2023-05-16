import { SelectionModel } from "@angular/cdk/collections";
import { DatePipe } from "@angular/common";
import { Component, Inject, OnInit, QueryList, ViewChildren, ViewEncapsulation } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatTableDataSource } from "@angular/material/table";
import { mineduAnimations } from "@minedu/animations/animations";
import { DataService } from "app/core/data/data.service";
import { TablaAccionesPassport } from "app/core/model/action-types";
import { PASSPORT_MESSAGE } from "app/core/model/messages-error";
import { DocumentViewerComponent } from "app/main/apps/components/document-viewer/document-viewer.component";
import { SingleFileInputComponent } from "app/main/apps/components/single-file-input/single-file-input.component";
import { BehaviorSubject, forkJoin, of } from "rxjs";
import { catchError, finalize } from "rxjs/operators";
import { TablaMetodosReasignacion } from "../../../models/reasignacion.model";
import { InformacionDocumentoSustentoComponent} from "../../../components/informacion-documento-sustento/informacion-documento-sustento.component"
import { MENSAJES } from "../../../_utils/constants";

@Component({
    selector: "minedu-sustento-motivo-no-publicacion-plaza",
    templateUrl: "./sustento-motivo-no-publicacion-plaza.component.html",
    styleUrls: ["./sustento-motivo-no-publicacion-plaza.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
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
        motivosNoPublicacion: [],
    };

    plaza = {
        plazasReasignacionDetalle: [],
        idEtapaProceso: null,
        idPlazaReasignacion: null,
        isSeleccionadoTodos: false,
        plazasNoSeleccionadas: [],
        prepublicadas: true,
    };

    displayedColumns: string[] = [
        "index",
        "tipoDocumentoSustento",
        "numeroDocumentoSustento",
        "tipoFormatoSustento",
        "numeroFolios",
        "fechaEmision",
        "opciones",
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
        this.cantidadRegistros = this.plaza.plazasReasignacionDetalle.length;

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
                this.dataService.Reasignaciones().getComboMotivosNoPublicacion(),
                this.dataService.Reasignaciones().getComboTiposDocumentoSustento(),
                this.dataService.Reasignaciones().getComboTiposDocumentoFormato()
            ]
        ).pipe(
            catchError(() => {
                return of([]);
            }),
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

    // ************************************************************************************************
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
            this.dataService.Message().msgWarning('"INGRESE AL MENOS UN REGISTRO DE DOCUMENTOS DE SUSTENTO."', () => {
            });
            return;
        }

        if (!form.idMotivoNoPublicacion) {
            this.dataService.Message().msgWarning('"INGRESE LOS CAMPOS OBLIGATORIOS PARA CONTINUAR."', () => {
            });
            return;
        }
        this.obtenerClavePublica(TablaAccionesPassport.Agregar, true, TablaMetodosReasignacion.REGISTRAR_SUSTENTO_NO_PUBLICACION);
    }

    private registrarMotivoNoPublicacion() {
        this.dataService.Spinner().hide('sp6');
        const form = this.form.value;

        const usuarioCreacion = this.dataService.Storage().getInformacionUsuario().numeroDocumento;
        let documento = new FormData();
        documento.append('idMotivoNoPublicacion', form.idMotivoNoPublicacion);
        documento.append('detalleMotivoNoPublicacion', form.detalle);
        documento.append('idEtapaProceso', this.plaza.idEtapaProceso);
        documento.append('idPlazaReasignacion', this.plaza.idPlazaReasignacion);
        documento.append('isSeleccionadoTodos', this.plaza.isSeleccionadoTodos ? 'true': 'false');
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

        for (var i = 0; i < this.plaza.plazasReasignacionDetalle.length; i++) {
            documento.append('plazasReasignacionDetalle[]', this.plaza.plazasReasignacionDetalle[i]);
        }

        for (var i = 0; i < this.plaza.plazasNoSeleccionadas.length; i++) {
            documento.append('plazasNoSeleccionadas[]', this.plaza.plazasNoSeleccionadas[i]);
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
            .Reasignaciones()
            .enviarPlazasPrepublicadasToObservadas(data)
            .pipe(
                catchError((e) => of(null)),
                finalize(() => { this.dataService.Spinner().hide('sp6'); this.working = false; })
            ).subscribe((response: any) => {
                if (response) {
                    this.dataService.Message().msgAutoCloseSuccessNoButton(MENSAJES.MENSAJE_EXITO, MENSAJES.DURACION, () => {
                        this.handleCancelar({ reload: true });
                    });
                } else {
                    this.dataService.Message().msgWarning('"ERROR AL ENVIAR LAS PLAZAS PREPUBLICADAS A OBSERVADAS.', () => { });
                    this.handleCancelar({ });
                }
            });
    }

    private handleEnviarConvocadas = (data) => {
        this.dataService
            .Reasignaciones()
            .enviarPlazasConvocadasToObservadas(data)
            .pipe(
                catchError((e) => of(null)),
                finalize(() => { this.dataService.Spinner().hide('sp6'); })
            ).subscribe((response: any) => {
                if (response) {
                    this.dataService.Message().msgAutoCloseSuccessNoButton(MENSAJES.MENSAJE_EXITO, MENSAJES.DURACION, () => {
                        this.handleCancelar({ reload: true });
                    });
                } else {
                    this.dataService.Message().msgWarning('"ERROR AL ENVIAR LAS PLAZAS CONVOCADAS A OBSERVADAS."', () => { });
                    this.handleCancelar({ });
                }
            });
    }


    handleCancelar(data?: any) {
        this.matDialogRef.close(data);
    }

    obtenerClavePublica(operacion: TablaAccionesPassport, requiredLogin: boolean, method: TablaMetodosReasignacion, param?: any) {
        this.dataService.Spinner().show('sp6');
        this.dataService.Passport().boot().pipe(
            catchError(() => of(null))
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

    confirmarOperacion(token: any, operacion: TablaAccionesPassport, requiredLogin: boolean, method: TablaMetodosReasignacion, parametro?: any) {

        const parametroPermiso = this.dataService.Storage().getParamAccion(operacion);
        const param = this.dataService.Cifrado().PassportEncode(token, parametroPermiso);

        this.dataService.Passport().getAutorizacion(param).pipe(
            catchError(() => {
                return of(null);
            }),
            finalize(() => {
            })
        ).subscribe(response => {
            if (true) { 
                if (true) { 
                    switch (method) {
                        case TablaMetodosReasignacion.CONSULTAS_SUSTENTO_NO_PUBLICACION: {
                            this.getCombosModal();
                            break;
                        }
                        case TablaMetodosReasignacion.REGISTRAR_SUSTENTO_NO_PUBLICACION: {
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
}
