import { saveAs } from "file-saver";
import { environment } from 'environments/environment';
import { Component, OnInit, ViewEncapsulation, Inject, QueryList, ViewChildren } from "@angular/core";
import { mineduAnimations } from "@minedu/animations/animations";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { DataService } from "app/core/data/data.service";
import { BehaviorSubject, of } from "rxjs";
import { catchError, finalize } from "rxjs/operators";
import { CONFIGURACION_PROCESO_MESSAGE, DOCUMENTO_MESSAGE, SNACKBAR_BUTTON } from "app/core/model/messages-error";
import { SelectionModel } from "@angular/cdk/collections";
import { MatTableDataSource } from "@angular/material/table";
import { SingleFileInputComponent } from "app/main/apps/components/single-file-input/single-file-input.component";
import { CatalogoItemEnum, CodigoDocumentoContratacionEnum } from "../../_utils/constants";
import { ModalInformacionSustentoComponent } from "../modal-informacion-sustento/modal-informacion-sustento.component";
import { ISustentoMotivosObservacionViewModel } from "../../models/contratacion.model";
import { DocumentViewerComponent } from "app/main/apps/components/document-viewer/document-viewer.component";

@Component({
    selector: "minedu-modal-plaza-observada",
    templateUrl: "./modal-plaza-observada.component.html",
    styleUrls: ["./modal-plaza-observada.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class ModalPlazaObservadaComponent implements OnInit {
    form: FormGroup;
    @ViewChildren(SingleFileInputComponent)
    fileComponent: QueryList<SingleFileInputComponent>;

    working = false;
    nowDate = new Date();

    modal = {
        icon: "",
        title: "",
        action: "",
    };

    combo = {
        motivos: [],
        tiposDocumento: [],
        tiposFormatoSustento: [],
    };

    displayedColumns: string[] = [
        "index",
        "tipoDocumentoSustento",
        "numeroDocumentoSustento",
        "tipoFormatoSustento",
        "numeroFolios",
        "fechaEmision",
        "fechaRegistro",
        "opciones",
    ];

    private _loadingChange = new BehaviorSubject<boolean>(false);
    loading = this._loadingChange.asObservable();
    dataSource: MatTableDataSource<any>;
    selection = new SelectionModel<any>(false, []);
    sustentos: any[] = [];
    dialogRef: any;
    plazasSeleccionadas: any[];
    cantidadTotalFilas:number;
    isSeleccionadoTodosPrepublicadas:any;
    noSeleccionados:any;
    idEtapaProceso:number;
    codigoCentroTrabajoMaestro:number;
    idSituacionValidacion:number;

    constructor(
        public matDialogRef: MatDialogRef<ModalPlazaObservadaComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private materialDialog: MatDialog,
        private formBuilder: FormBuilder,
        private dataService: DataService
    ) {}

    ngOnInit(): void {
        this.buildForm();
    }

    buildForm() {
        this.form = this.formBuilder.group({
            motivo: [null], //, Validators.required
            detalle: [null],
            fechaRegistro: [null],
            idTipoFormatoSustento: [null, Validators.required],
            idTipoDocumento: [null, Validators.required],
            numeroDocumento: [null, Validators.required],
            numeroFolios: [null, Validators.compose([ Validators.required, Validators.pattern(/^[0-9]\d*$/), Validators.maxLength(3)])],
            sumilla: [null],
            codigoAdjuntoSustento: [null],
            entidadEmisora: [null],
            fechaEmision: [null, Validators.required]
        });

        this.dataSource = new MatTableDataSource([]);
        this.initialize();
    }

    initialize() {
        this.modal = this.data.modal;
        this.plazasSeleccionadas = this.data.plazasObservadas;
	this.cantidadTotalFilas = this.data.cantidadTotalFilas;
	this.isSeleccionadoTodosPrepublicadas = this.data.isSeleccionadoTodosPrepublicadas;
	this.noSeleccionados = this.data.noSeleccionados;
	this.idEtapaProceso = this.data.idEtapaProceso;
	this.codigoCentroTrabajoMaestro = this.data.codigoCentroTrabajoMaestro;
	this.idSituacionValidacion = this.data.idSituacionValidacion;
        this.form.get("fechaRegistro").setValue(this.nowDate);
        this.handleCombos();
    }

    handleCombos() {
        this.getComboMotivos();
        this.getComboTiposDocumento();
        this.getComboTiposDocumentoFormato();
    }

    getComboMotivos() {
        this.dataService.Contrataciones().getCombosModalPlazasObservadas(CatalogoItemEnum.MOTIVO_NO_PUBLICACION).pipe(
                catchError(() => {
                    this.dataService.SnackBar().msgError(CONFIGURACION_PROCESO_MESSAGE.TIPOS_DOCUMENTO_SUSTENTO, SNACKBAR_BUTTON.CLOSE);
                    return of(null);
                }
            )
        )
        .subscribe((response: any) => {
            if (response) {
                this.combo.motivos = response;
            } else {
                this.combo.motivos = [];
            }
        });
    }

    getComboTiposDocumento() {
        this.dataService.Contrataciones().getCombosModalPlazasObservadas(CatalogoItemEnum.TIPO_DOCUMENTO_SUSTENTO).pipe(
                catchError(() => {
                    this.dataService.SnackBar().msgError(CONFIGURACION_PROCESO_MESSAGE.TIPOS_DOCUMENTO_SUSTENTO, SNACKBAR_BUTTON.CLOSE);
                    return of(null);
                }
            )
        )
        .subscribe((response: any) => {
            if (response) {
                this.combo.tiposDocumento = response;
            } else {
                this.combo.tiposDocumento = [];
            }
        });
    }

    getComboTiposDocumentoFormato() {
        this.dataService.Contrataciones().getCombosModalPlazasObservadas(CatalogoItemEnum.TIPO_FORMATO_SUSTENTO).pipe(
                catchError(() => {
                    this.dataService.SnackBar().msgError(CONFIGURACION_PROCESO_MESSAGE.TIPOS_FORMATO_SUSTENTO, SNACKBAR_BUTTON.CLOSE);
                    return of(null);
                }
            )
        )
        .subscribe((response: any) => {
            if (response) {
                this.combo.tiposFormatoSustento = response;
            } else {
                this.combo.tiposFormatoSustento = [];
            }
        });
    }

    adjunto(pIdDocumento) {
        this.form.patchValue({ codigoAdjuntoSustento: pIdDocumento });
    }

    handleAgregar() {
        if (!this.form.valid) {
            this.dataService.Message().msgWarning('"INGRESE LOS CAMPOS OBLIGATORIOS DE LA SECCIÓN DOCUMENTO DE SUSTENTO."', () => {});
            return;
        }

        const form = this.form.value;
        const documento = this.combo.tiposDocumento.find((d) => d.id === form.idTipoDocumento);
        const formatoSustento = this.combo.tiposFormatoSustento.find((d) => d.id === form.idTipoFormatoSustento);
        form.tipoDocumento = documento.descripcion;
        form.tipoFormatoSustento = formatoSustento.descripcion;
        form.codigoAdjuntoSustento = form.codigoAdjuntoSustento ? form.codigoAdjuntoSustento[0] : form.codigoAdjuntoSustento;
        
        this.sustentos.push(form);
        this.cleanSections();

        if (form.codigoAdjuntoSustento != null) {
            this.fileComponent.forEach((c) => c.eliminarDocumento());
            this.subirDocumentoAdjunto(form.codigoAdjuntoSustento);
        }
        else {
            this.dataSource = new MatTableDataSource(this.sustentos);
        }
        
    }

    handleEliminar(row, index) {
        this.dataService.Message().msgConfirm("¿ESTÁ SEGURO DE ELIMINAR EL DOCUMENTO DE SUSTENTO?",
            () => {
                this.sustentos.splice(index, 1);
                this.dataSource = new MatTableDataSource(this.sustentos);
            },
            () => {}
        );
    }

    subirDocumentoAdjunto(file: any) {
        if (file) {
            const documento = new FormData();        
            documento.append('codigoSistema', environment.documentoConfig.CODIGO_SISTEMA);
            documento.append('descripcionDocumento', ' ');
            documento.append('codigoUsuarioCreacion', 'Admin'); //Obtener del SSO Passport
            documento.append('archivo', file);

            this.dataService.Spinner().show("sp6");
            this.dataService.Documento().crear(documento).pipe(
                catchError(() => { this.dataService.SnackBar().msgError(DOCUMENTO_MESSAGE.CREAR, SNACKBAR_BUTTON.CLOSE); return of(null); }),
                finalize(() => { this.dataService.Spinner().hide("sp6"); })
            ).subscribe(response => {
                if (response && response.data) {
                    const codigoAdjunto = response.data;
                    this.sustentos[this.sustentos.length - 1].codigoAdjuntoSustento.codigoDocumento = codigoAdjunto.codigoDocumento;
                    this.dataSource = new MatTableDataSource(this.sustentos);
                } else {
                    this.dataService.Message().msgError('"NO SE PUDO ADJUNTAR DOCUMENTO DE SUSTENTO, SELECCIONE OTRO."', () => { });
                }
            });
        }
    }

    handleVerAdjunto(row) {
        if (!row.codigoAdjuntoSustento) {
            this.dataService.Message().msgWarning('"NO SE PUDO ACCEDER AL DOCUMENTO DE SUSTENTO ADJUNTADO."', () => {});
            return;
        }

        var file = row.codigoAdjuntoSustento.codigoDocumento;
        var nombreDocumento = row.codigoAdjuntoSustento.name;

        console.log("Data archivo: ",file, nombreDocumento);

        this.dataService.Spinner().show("sp6");
        this.dataService
            .Documento()
            .descargar(file)
            .pipe(
                catchError((e) => {
                    this.dataService
                        .SnackBar()
                        .msgError(
                            "Error, no se pudo acceder al servicio.",
                            "Cerrar"
                        );
                    return of(e);
                }),
                finalize(() => this.dataService.Spinner().hide("sp6"))
            )
            .subscribe((response) => {
                if (response) {
                    this.handlePreview(response, nombreDocumento);
                } else {
                    this.dataService
                        .Message()
                        .msgWarning(
                            '"NO SE PUDO OBTENER EL DOCUMENTO SOLICITADO."',
                            () => {}
                        );
                }
            });

        //saveAs(row.codigoAdjuntoSustento, row.codigoAdjuntoSustento.name);
    }

    handlePreview(file: any, nameFile: string) {
        this.dialogRef = this.materialDialog.open(DocumentViewerComponent, {
            panelClass: "modal-viewer-form-dialog",
            disableClose: true,
            data: {
                modal: {
                    icon: "remove_red_eye",
                    title: "Información de Sustento - Documento",
                    file: file,
                    fileName:nameFile
                },
            },
        });

        this.dialogRef.afterClosed().subscribe((response: any) => {
            if (!response) {
                return;
            }
            if (response.download) {
                saveAs(file, nameFile + ".pdf");
            }
        });
    }

    cleanSections() {
        this.form.controls["idTipoFormatoSustento"].reset();
        this.form.controls["idTipoDocumento"].reset();
        this.form.controls["numeroDocumento"].reset();
        this.form.controls["numeroFolios"].reset();
        this.form.controls["sumilla"].reset();
        this.form.controls["codigoAdjuntoSustento"].reset();
        this.form.controls["entidadEmisora"].reset();
        this.form.controls["fechaEmision"].reset();
    }

    informacionSustentoView = (dataSustento) => {
        this.dialogRef = this.materialDialog.open(ModalInformacionSustentoComponent,
            {
                panelClass: "informacion-modal-sustento-dialog",
                width: "850px",
                disableClose: true,
                data: {
                    sustento: dataSustento,
                },
            }
        );
    };

    validarGuardarSustento():boolean {
        var result = true;
        if(this.form.get("motivo").value == null || (this.form.get("detalle").value == null)){
            this.dataService.Message().msgAutoCloseWarning('“COMPLETAR LOS DATOS REQUERIDOS”"',3000, () => {}); //M08
            return false;
        }
        // console.log("Datos Validacion: ", this.form.get("motivo").value, this.form.get("detalle").value, this.dataSource.data.length);
        if(this.dataSource.data.length == 0){
            this.dataService.Message().msgAutoCloseWarning('“DEBE REGISTRAR COMO MÍNIMO UN DOCUMENTO DE SUSTENTO”',3000, () => {}); //M37
            return false;
        }
        return result;
    }
    handleGuardarSustento = () => {
        if(!this.validarGuardarSustento()) {
            return;
        }

        this.dataService.Message().msgConfirm("¿ESTÁ SEGURO DE GUARDAR EL SUSTENTO DE NO PUBLICACIÓN DE PLAZAS?",
            () => {
                this.dataService.Spinner().show("sp6");
                this.working = true;
                const dataSustento = [];
		const idMotivoNoPublicacion = this.form.get('motivo').value;
		const detalleNoPublicacion = this.form.get('detalle').value;

		if(!this.isSeleccionadoTodosPrepublicadas) {
		    for (let i = 0; i < this.plazasSeleccionadas.length; i++) {
			const idPlaza = this.plazasSeleccionadas[i].id_plaza_contratacion_detalle;
			for (let j = 0; j < this.sustentos.length; j++) {
			    const documentoSustento = {
				idMotivoNoPublicacion: idMotivoNoPublicacion,
				detalleNoPublicacion: detalleNoPublicacion,
				idTipoFormato: this.sustentos[j].idTipoFormatoSustento,
				idTipoDocumento: this.sustentos[j].idTipoDocumento,
				idPlazaContratacion: idPlaza,
				codigoDocumento: CodigoDocumentoContratacionEnum.CODIGO_DOCUMENTO,
				numeroDocumento: this.sustentos[j].numeroDocumento,
				entidadEmisora: this.sustentos[j].entidadEmisora,
				fechaEmision: this.sustentos[j].fechaEmision,
				numeroFolios: parseInt(this.sustentos[j].numeroFolios),
				sumilla: this.sustentos[j].sumilla, 
				codigoAdjuntoSustento: this.sustentos[j].codigoAdjuntoSustento ? 
				                            this.sustentos[j].codigoAdjuntoSustento.codigoDocumento : 
							    null,
				fechaCreacion: new Date(),
				usuarioCreacion: "ADMIN"
			    };
			    dataSustento.push(documentoSustento);
			}
		    }
		}

		if( this.isSeleccionadoTodosPrepublicadas) {
		    for (let j = 0; j < this.sustentos.length; j++) {
			const documentoSustento = {
			    idMotivoNoPublicacion: idMotivoNoPublicacion,
			    detalleNoPublicacion: detalleNoPublicacion,
			    idTipoFormato: this.sustentos[j].idTipoFormatoSustento,
			    idTipoDocumento: this.sustentos[j].idTipoDocumento,
			    idPlazaContratacion: 0,
			    codigoDocumento: CodigoDocumentoContratacionEnum.CODIGO_DOCUMENTO,
			    numeroDocumento: this.sustentos[j].numeroDocumento,
			    entidadEmisora: this.sustentos[j].entidadEmisora,
			    fechaEmision: this.sustentos[j].fechaEmision,
			    numeroFolios: parseInt(this.sustentos[j].numeroFolios),
			    sumilla: this.sustentos[j].sumilla, 
			    codigoAdjuntoSustento: this.sustentos[j].codigoAdjuntoSustento ? 
				                        this.sustentos[j].codigoAdjuntoSustento.codigoDocumento : 
							null,
			    fechaCreacion: new Date(),
			    usuarioCreacion: "ADMIN"
			};
			dataSustento.push(documentoSustento);
		    }
		}       
                const sustento: ISustentoMotivosObservacionViewModel = {
		    motivosNoPublicacion: dataSustento,
		    isSeleccionadoTodosPrepublicadas : this.isSeleccionadoTodosPrepublicadas,
		    noSeleccionados : this.noSeleccionados,
		    idEtapaProceso:this.idEtapaProceso,
		    codigoCentroTrabajoMaestro:this.codigoCentroTrabajoMaestro,
		    idSituacionValidacion: this.idSituacionValidacion,
                };

                this.dataService.Contrataciones()
		    .registrarSustentoNoPublicacion(sustento)
		    .pipe(catchError((e) => {
                    this.dataService
		        .SnackBar()
			.msgError(
			    CONFIGURACION_PROCESO_MESSAGE.GENERAR_DOCUMENTO_SUSTENTO,
			    SNACKBAR_BUTTON.CLOSE
			);
                        return of(e);
                    }),
                    finalize(() => {
                        this.dataService.Spinner().hide("sp6");
                        this.working = false;
                    })
                )
                .subscribe((response) => {
                    if (response) {
                        const data = response;
                        if (data) {
                            this.dataService.Message().msgAutoCloseSuccessNoButton('"OPERACIÓN REALIZADA DE FORMA EXITOSA."',3000, () => { this.handleCancelar(data); });
                        } else {
                            this.dataService.Message().msgWarning('"OCURRIÓ UN ERROR AL INTENTAR GUARDAR EL DOCUMENTO SUSTENTO."', () => {});
                        }
                    } else {
                        this.dataService.Message().msgWarning('"OCURRIÓ UN ERROR AL INTENTAR GUARDAR EL DOCUMENTO SUSTENTO."', () => {});
                    }
                });
            }
        );
    }

    handleCancelar(data?: string) {
        if (data) {
            this.matDialogRef.close({ idMotivo: this.sustentos[0].motivo, detalle: this.sustentos[0].detalle, flag: 0 });
        } else {
            data = "0";
            this.matDialogRef.close({ id: data });
        }        
    }
}
