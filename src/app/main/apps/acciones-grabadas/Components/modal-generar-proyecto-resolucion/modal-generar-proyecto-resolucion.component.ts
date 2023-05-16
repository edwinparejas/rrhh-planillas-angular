import { saveAs } from "file-saver";
import { AfterViewInit, Component, Inject, OnInit, QueryList, ViewChildren, ViewEncapsulation } from '@angular/core';
import { DataSource } from "@angular/cdk/table";
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from 'environments/environment';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DataService } from 'app/core/data/data.service';
import { MISSING_TOKEN, TablaPermisos, TablaSeccion, TablaTipoSeccion } from 'app/core/model/types';
import { catchError, finalize } from 'rxjs/operators';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { ACCIONES_GRABADAS_MESSAGE, PASSPORT_MESSAGE } from 'app/core/model/message';
import { CollectionViewer } from '@angular/cdk/collections';
import { SingleFileInputTempComponent } from 'app/main/apps/components/single-file-input-temp/single-file-input-temp.component';
import { mineduAnimations } from "@minedu/animations/animations";
import { DocumentViewerComponent } from "app/main/apps/components/document-viewer/document-viewer.component";
import { ModalVistaInformacionSustentoComponent } from "../modal-vista-informacion-sustento/modal-vista-informacion-sustento.component";
import { SecurityModel } from "app/core/model/security/security.model";

@Component({
    selector: "minedu-modal-generar-proyecto-resolucion",
    templateUrl: "./modal-generar-proyecto-resolucion.component.html",
    styleUrls: ["./modal-generar-proyecto-resolucion.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class ModalGenerarProyectoResolucionComponent
    implements OnInit, AfterViewInit
{
    ELEMENTOS_TEMP_DATAGRID: tblGridAccGrab[] = [];
    CONSIDERANDO_TEMP_DATAGRID: tblGridConGrab[] = [];

    formPri: FormGroup;
    formSus: FormGroup;
    formCons: FormGroup;
    tiposDocumentoSustento: any[] = [];
    tiposFormatoSustento: any[] = [];
    tiposDeResolucion: any[] = [];
    maximo: number = 40;
    filename = "";
    file: any = null;
    mostrar: true;
    dialogRef: any;

    datosIged: any = null;
    displayedColumns: string[] = [
        "tipoDocumentoSustento",
        "numeroDocumentoSustento",
        "fechaEmision",
        "tipoFormato",
        "numeroFolios",
        "fechaRegistro",
        "acciones",
    ];

    CODIGO_SISTEMA = environment.documentoConfig.CODIGO_SISTEMA;
    tipoSeccion = "";
    seccion = "";
    fileUPLOADTEMP: any;
    currentSession: SecurityModel = new SecurityModel();
    
    constructor(
        public matDialogRef: MatDialogRef<ModalGenerarProyectoResolucionComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private formBuilder: FormBuilder,
        private dataService: DataService,
        private materialDialog: MatDialog
    ) {
        this.currentSession=this.data.currentSession;
    }

    valoresRecibidos: any;
    ACCIONES_GRABADAS_IDS: any[] = [];
    ngOnInit(): void {
        this.buildForm();
        setTimeout(() => {
            this.buildData();
        });
        debugger
        this.valoresRecibidos = this.data;
        this.verificarMultiples(this.valoresRecibidos);
        this.seccion = TablaSeccion.SECCION;
        this.tipoSeccion = TablaTipoSeccion.PARRAFO;
    }

    multipleRegimen: string = "";
    multipleGrupoAccion: string = "";
    multipleAccion: string = "";
    multipleMotivo: string = "";
    multipleMandatoJudicial: string = "";

    codigoRegimenLaboral: number;
    codigoGrupoAccion: number;
    codigoAccion: number;
    codigoMotivoAccion: number;

    codigoUgel: string;
    codigoDre: string;

    esProyectoIndividual: boolean;

    verificarMultiples(obj) {
        this.esProyectoIndividual = obj.esProyectoIndividual;
        if (obj.accionesGrabadas.length > 0) {
            let idRegimenLaboralGrab = obj.accionesGrabadas[0].idRegimenLaboral;
            let idGrupoAccionGrab = obj.accionesGrabadas[0].idGrupoAccion;
            let idAccion = obj.accionesGrabadas[0].idAccion;
            let idMotivoAccion = obj.accionesGrabadas[0].idMotivoAccion;
            let idAccionGrabada = obj.accionesGrabadas[0].idAccionGrabada;

            this.multipleRegimen = obj.datosAccion.regimenLaboral;
            this.multipleGrupoAccion = obj.datosAccion.grupoAccion;
            this.multipleAccion = obj.datosAccion.accion;
            this.multipleMotivo = obj.datosAccion.motivoAccion;
            
            this.multipleMandatoJudicial = (obj.datosAccion.esMandatoJudicial?'SI':'NO');

            this.codigoRegimenLaboral = obj.datosAccion.codigoRegimenLaboral;
            this.codigoGrupoAccion = obj.datosAccion.codigoGrupoAccion;
            this.codigoAccion = obj.datosAccion.codigoAccion;
            this.codigoMotivoAccion = obj.datosAccion.codigoMotivoAccion;

            this.codigoUgel = obj.datosAccion.codigoUgel;
            this.codigoDre = obj.datosAccion.codigoDre;

            for (let i = 0; i < obj.accionesGrabadas.length; i++) {
                this.ACCIONES_GRABADAS_IDS.push({
                    idAccionGrabada: obj.accionesGrabadas[i].idAccionGrabada,
                    idRegimenLaboral: obj.accionesGrabadas[i].idRegimenLaboral,
                    idGrupoAccion: obj.accionesGrabadas[i].idGrupoAccion,
                    idAccion: obj.accionesGrabadas[i].idAccion,
                    idMotivoAccion: obj.accionesGrabadas[i].idMotivoAccion,
                    codigoPlaza: obj.accionesGrabadas[i].codigoPlaza,
                    idDetalleAccionGrabada:obj.accionesGrabadas[i].idDetalleAccionGrabada,
                    esLista: obj.accionesGrabadas[i].esLista,
                    esMandatoJudicial:obj.accionesGrabadas[i].esMandatoJudicial,
                    codigoTipoDocumentoIdentidad:obj.accionesGrabadas[i].codigoTipoDocumentoIdentidad,
                    numeroDocumentoIdentidad:obj.accionesGrabadas[i].numeroDocumentoIdentidad
                });
            }

            //quitamos los ID de acciones grabadas duplicados, ya que en documentos sustento solo se registra cabecera, no detalle de accGrab
            let sinRepetidos = this.ACCIONES_GRABADAS_IDS.filter(
                (valorActual, indiceActual, arreglo) => {
                    //Podríamos omitir el return y hacerlo en una línea, pero se vería menos legible
                    return (
                        arreglo.findIndex(
                            (valorDelArreglo) =>
                                JSON.stringify(valorDelArreglo) ===
                                JSON.stringify(valorActual)
                        ) === indiceActual
                    );
                }
            );
            this.ACCIONES_GRABADAS_IDS = sinRepetidos;
        }
    }
    fechaActual = new Date(new Date().setDate(new Date().getDate() + 0));

    buildForm() {
        this.formPri = this.formBuilder.group({
            idTipoResolucion: [null, [Validators.required]],
        });

        this.formSus = this.formBuilder.group({
            idTipoDocumentoSustento: [null, [Validators.required]],
            numeroDocumentoSustento: [
                null,
                [
                    Validators.required,
                    Validators.maxLength(this.maximo)
                ],
            ],
            entidadEmisora: [
                null,
                [Validators.maxLength(400)],
            ],
            fechaEmision: [null, [Validators.required]],
            numeroFolios: [
                null,
                [
                    Validators.required,
                    Validators.maxLength(8),
                    Validators.minLength(1),
                ],
            ],
            idTipoFormatoSustento: [null, [Validators.required]],
            sumilla: [null, [Validators.maxLength(400)]],
            adjuntarDocumento: [null],
            vistoDeProyecto: [null, [Validators.required]],
        });

        this.formCons = this.formBuilder.group({
            idSeccion: [1],
            idTipoSeccion: [1],
            seccion: [null],
            TipoSeccion: [null],
            considerando: [null, [Validators.required]],
            sangria: [null],
        });
    }

    buildData() {
        
        // this.validarAccionPassport(TablaPermisos.Consultar, "validBuildData");
        this.dataService.Spinner().show("sp6");
        this.dataService
        .AccionesGrabadas()
        .getTiposResolucion(this.currentSession.codigoTipoSede,this.currentSession.codigoSede,this.data.anio)
        .pipe(
            catchError((e) => {
                return of(e);
            }),
            finalize(() => {
                this.dataService.Spinner().hide("sp6");
            })
        )
        .subscribe((response) => {
            if (response && (response||[]).length>0) {
                this.tiposDeResolucion = response;
            } else if (
                response &&
                (response.statusCode === 401 ||
                    response.error === MISSING_TOKEN.INVALID_TOKEN)
            ) {
                this.dataService.Message().msgInfo(PASSPORT_MESSAGE.SESION_END, () => {
                        this.dataService.Storage().passportUILogin();
                    });
            }
        });
        this.validBuildData();
    }

    private validBuildData() {

       // const rolSelected = this.dataService.Storage().getPassportRolSelected();
       // let codigoTipoSede = rolSelected.CODIGO_TIPO_SEDE;
        this.dataService
            .AccionesGrabadas()
            .getTiposDocumentoSustento()
            .pipe(
                catchError((e) => {
                    return of(e);
                }),
                finalize(() => {})
            )
            .subscribe((response) => {
                if (response && (response||[]).length>0) {
                    this.tiposDocumentoSustento = response;
                } else if (
                    response &&
                    (response.statusCode === 401 ||
                        response.error === MISSING_TOKEN.INVALID_TOKEN)
                ) {
                    this.dataService.Message().msgInfo(PASSPORT_MESSAGE.SESION_END, () => {
                            this.dataService.Storage().passportUILogin();
                        });
                }
            });

        this.dataService
            .AccionesGrabadas()
            .getTiposFormatoSustento()
            .pipe(
                catchError((e) => {
                    return of(e);
                }),
                finalize(() => {})
            )
            .subscribe((response) => {
                if (response && (response||[]).length>0) {
                    this.tiposFormatoSustento = response;
                } else if (
                    response &&
                    (response.statusCode === 401 ||
                        response.error === MISSING_TOKEN.INVALID_TOKEN)
                ) {
                    this.dataService.Message().msgInfo(PASSPORT_MESSAGE.SESION_END, () => {
                            this.dataService.Storage().passportUILogin();
                        });
                }
            });        
    }

    ngAfterViewInit() {}
    @ViewChildren(SingleFileInputTempComponent)
    fileComponent: QueryList<SingleFileInputTempComponent>;
    
    limpiarSustento() {
        this.formSus.controls["idTipoDocumentoSustento"].reset();
        this.formSus.controls["numeroDocumentoSustento"].reset();
        this.formSus.controls["entidadEmisora"].reset();
        this.formSus.controls["fechaEmision"].reset();
        this.formSus.controls["numeroFolios"].reset();
        this.formSus.controls["idTipoFormatoSustento"].reset();
        this.formSus.controls["sumilla"].reset();
        this.formSus.controls["adjuntarDocumento"].reset();
        this.formSus.controls["vistoDeProyecto"].reset();
        this.fileComponent.forEach((c) => c.eliminarDocumento());
        
    }

    limpiarConsiderando() {
        this.formCons.controls["considerando"].reset();
        //this.formpri.controls["considerando"].setErrors(null);
    }

    //   private busquedaConfirmar = (dato: any) => {
    //       this.validarAccionPassport(TablaPermisos.Consultar, "validBusqueda", dato);
    //   };

    agregarSustentoAGrillaTemporal() {
        if (this.formSus.valid) {
            const usuario = this.dataService.Storage().getPassportUserData();

            let item: tblGridAccGrab = {
                tipoDocumentoSustento: this.tiposDocumentoSustento.filter(
                    (ds) =>
                        ds.idCatalogoItem ==
                        this.formSus.value.idTipoDocumentoSustento
                )[0].descripcionCatalogoItem,
                tipoFormatoSustento: this.tiposFormatoSustento.filter(
                    (ts) =>
                        ts.idCatalogoItem ==
                        this.formSus.value.idTipoFormatoSustento
                )[0].descripcionCatalogoItem,
                idDocumentoSustento: 0,
                idAccionGrabada: this.ACCIONES_GRABADAS_IDS[0].idAccionGrabada,
                idTipoResolucion: 0, /*este item se llenara al final cuando se envie la lista final, ya que es 1 resolucion por el bloque*/
                idTipoDocumentoSustento:
                    this.formSus.value.idTipoDocumentoSustento,
                idTipoFormatoSustento: this.formSus.value.idTipoFormatoSustento,
                numeroDocumentoSustento:
                    this.formSus.value.numeroDocumentoSustento,
                entidadEmisora: this.formSus.value.entidadEmisora,
                fechaEmision: this.formSus.value.fechaEmision,
                numeroFolios: this.formSus.value.numeroFolios,
                sumilla: this.formSus.value.sumilla,
                codigoDocumentoSustento: "", //this.formSus.value.adjuntarDocumento,
                vistoProyecto:
                    this.formSus.value.vistoDeProyecto == "1" ? true : false,
                vistoProyectoDes:
                        this.formSus.value.vistoDeProyecto == "1" ? 'SI' : 'NO',
                activo: true,
                fechaCreacion: new Date(),
                usuarioCreacion: usuario.NOMBRES_USUARIO,
                ipCreacion: "",
                fechaModificacion: new Date(),
                archivoSustento:null,
                nombreArchivoSustento:""
            };

            if(this.formSus.value.adjuntarDocumento){
                item={
                    ...item,
                    archivoSustento:this.formSus.value.adjuntarDocumento,
                    nombreArchivoSustento:this.formSus.value.adjuntarDocumento.name
                }
            }

            this.ELEMENTOS_TEMP_DATAGRID.push(item);
            this.limpiarSustento();
        } else {
            let textoError="DEBE INGRESAR TODOS LOS CAMPOS OBLIGATORIOS";
            for (const key of Object.keys(this.formSus.controls)) {
                if(!this.formSus.controls[key].valid){
                    debugger
                    this.formSus.controls[key].markAsTouched({onlySelf:true});
                    if(key=='fechaEmision')textoError=textoError+", FECHA DE EMISIÓN ES REQUERIDO";
                }
              }
            this.dataService.Message().msgWarning('"'+textoError+'"',() => {});
            return;
        }
    }

    agregarConsiderandoAGrillaTemporal() {
        if (this.formCons.valid) {
            const usuario = this.dataService.Storage().getPassportUserData();

            let item: tblGridConGrab = {
                seccion: this.seccion,
                tipoSeccion: this.tipoSeccion,
                idSeccion: 1,
                idtipoSeccion: 1,
                considerando: this.formCons.value.considerando,
                sangria: true,
                activo: true,
                fechaCreacion: new Date(),
                usuarioCreacion: usuario.NOMBRES_USUARIO,
                ipCreacion: "",
                fechaModificacion: new Date(),
            };

            this.CONSIDERANDO_TEMP_DATAGRID.push(item);
            this.limpiarConsiderando();
        } else {
            for (const key of Object.keys(this.formCons.controls)) {
                if(!this.formCons.controls[key].valid){
                    this.formCons.controls[key].markAsTouched({onlySelf:true});
                }
              }
            this.dataService.Message().msgWarning('"DEBE INGRESAR EL CAMPO OBLIGATORIO"', () => {});
            return;
        }
    }

    quitarElimentoDeGrillaTemporal(index) {
        this.ELEMENTOS_TEMP_DATAGRID.splice(index, 1);
    }

    quitarElimentoConsiderandoDeGrillaTemporal(index) {
        this.CONSIDERANDO_TEMP_DATAGRID.splice(index, 1);
    }

    // convertirAListaParaGuardar() {
    //     let listaFinal: tblGridAccGrab[] = [];
    //     if (this.ACCIONES_GRABADAS_IDS.length > 0) {
    //         for (let i = 0; i < this.ACCIONES_GRABADAS_IDS.length; i++) {
    //             for (let j = 0; j < this.ELEMENTOS_TEMP_DATAGRID.length; j++) {
    //                 listaFinal.push({
    //                     idAccionGrabada : this.ACCIONES_GRABADAS_IDS[i].idAccionGrabada,
    //                     idTipoResolucion : this.formpri.value.idTipoResolucion,
    //                     tipoDocumentoSustento : this.ELEMENTOS_TEMP_DATAGRID[j].tipoDocumentoSustento,
    //                     tipoFormatoSustento : this.ELEMENTOS_TEMP_DATAGRID[j].tipoFormatoSustento,
    //                     idDocumentoSustento : this.ELEMENTOS_TEMP_DATAGRID[j].idDocumentoSustento,
    //                     idTipoDocumentoSustento : this.ELEMENTOS_TEMP_DATAGRID[j].idTipoDocumentoSustento,
    //                     idTipoFormatoSustento : this.ELEMENTOS_TEMP_DATAGRID[j].idTipoFormatoSustento,
    //                     numeroDocumentoSustento : this.ELEMENTOS_TEMP_DATAGRID[j].numeroDocumentoSustento,
    //                     entidadEmisora : this.ELEMENTOS_TEMP_DATAGRID[j].entidadEmisora,
    //                     fechaEmision :this.ELEMENTOS_TEMP_DATAGRID[j].fechaEmision,
    //                     numeroFolios : this.ELEMENTOS_TEMP_DATAGRID[j].numeroFolios,
    //                     sumilla : this.ELEMENTOS_TEMP_DATAGRID[j].sumilla,
    //                     codigoDocumentoSustento : this.ELEMENTOS_TEMP_DATAGRID[j].codigoDocumentoSustento,
    //                     archivoSustento : this.ELEMENTOS_TEMP_DATAGRID[j].archivoSustento,
    //                     vistoProyecto : this.ELEMENTOS_TEMP_DATAGRID[j].vistoProyecto,
    //                     vistoProyectoDes : this.ELEMENTOS_TEMP_DATAGRID[j].vistoProyectoDes,
    //                     activo : this.ELEMENTOS_TEMP_DATAGRID[j].activo,
    //                     fechaCreacion : this.ELEMENTOS_TEMP_DATAGRID[j].fechaCreacion,
    //                     usuarioCreacion : this.ELEMENTOS_TEMP_DATAGRID[j].usuarioCreacion,
    //                     ipCreacion : this.ELEMENTOS_TEMP_DATAGRID[j].ipCreacion,
    //                     fechaModificacion : this.ELEMENTOS_TEMP_DATAGRID[j].fechaModificacion,
    //                     nombreArchivoSustento : this.ELEMENTOS_TEMP_DATAGRID[j].nombreArchivoSustento,
    //                 });
    //             }
    //         }
    //     }
    //     return listaFinal;
    // }

    generarObjetoProyectoResolucion() {
        const objTerna = {
            codigoRegimenLaboral: this.codigoRegimenLaboral,
            codigoGrupoAccion: this.codigoGrupoAccion,
            codigoAccion: this.codigoAccion,
            codigoMotivoAccion: this.codigoMotivoAccion,
            codigoUgel: this.codigoUgel,
            codigoDre: this.codigoDre,
        };

        const objGenerarProyectoResolucion = {
            listaIdAccionesGrabadas: this.ACCIONES_GRABADAS_IDS,
            idTipoResolucion: this.formPri.value.idTipoResolucion,
            detalleDocumentos: this.ELEMENTOS_TEMP_DATAGRID,
            codigosTerna: objTerna,
            esProyectoIndividual: this.esProyectoIndividual,
            codigoSistema: this.CODIGO_SISTEMA,
            detalleConsiderando: this.CONSIDERANDO_TEMP_DATAGRID,
        };

        const documento = new FormData();
        this.appendFormData(documento, objGenerarProyectoResolucion, "");
        return documento;
    }
    convertDate(inputFormat) {
        function pad(s) { return (s < 10) ? '0' + s : s; }
        var d = new Date(inputFormat)
        return [pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join('-')
    }
    appendFormData(formData, data, rootName) {        
        let root = rootName || "";
        if (data instanceof File) {
            formData.append(root, data);
        } else if (data instanceof Date) {
            formData.append(root, this.convertDate(data));
        } else if (Array.isArray(data)) {
            for (var i = 0; i < data.length; i++) {
                this.appendFormData(formData, data[i], root + "[" + i + "]");
            }
        } else if (typeof data === "object" && data) {
            for (var key in data) {
                if (data.hasOwnProperty(key)) {
                    if (root === "") {
                        this.appendFormData(formData, data[key], key);
                    } else {
                        this.appendFormData(
                            formData,
                            data[key],
                            root + "." + key
                        );
                    }
                }
            }
        } else {
            if (data !== null && typeof data !== "undefined") {
                formData.append(root, data);
            }
        }
    }

    guardarDocumentoSustentoYGenerarProyectoResolucion() {
        for (const key of Object.keys(this.formPri.controls)) {
            if(!this.formPri.controls[key].valid){
                this.formPri.controls[key].markAsTouched({onlySelf:true});
                return;
            }
        }
        if (this.ELEMENTOS_TEMP_DATAGRID.length == 0) {
            this.dataService.Message().msgWarning(ACCIONES_GRABADAS_MESSAGE.M124,() => {});
            return;
        }

        let encontradoVistoProy: boolean = false;
        for (let i = 0; i < this.ELEMENTOS_TEMP_DATAGRID.length; i++) {
            if (this.ELEMENTOS_TEMP_DATAGRID[i].vistoProyecto == true) {
                encontradoVistoProy = true;
            }
        }
        if (!encontradoVistoProy) {
            this.dataService.Message().msgWarning(ACCIONES_GRABADAS_MESSAGE.M124,() => {});
            return;
        }

        this.dataService.Util().msgConfirmTextButton(
            ACCIONES_GRABADAS_MESSAGE.M29,
            () => {
                this.dataService.Spinner().show("sp6");
                this.dataService
                    .AccionesGrabadas()
                    .crearProyectoResolucion(
                        this.generarObjetoProyectoResolucion()
                    )
                    .pipe(catchError((error) => {
                        this.dataService.Message().msgWarning('"'+error.messages[0].toUpperCase()+'"');
                        return of(null);
                    }), finalize(() => {
                        this.dataService.Spinner().hide("sp6");
                    })).subscribe((response) => {
                        debugger
                        if (response) {
                            if(response.result){
                                debugger
                                let mensaje="OPERACIÓN REALIZADA DE FORMA EXITOSA";
                                if(response.messageError!=""){
                                    mensaje=response.messageError;
                                }
                                this.dataService
                                    .Util()
                                    .msgAutoCloseSuccess(
                                        mensaje,
                                        3000,
                                        () => {
                                            this.matDialogRef.close(response); //le puse el response
                                        }
                                    );
                                //@aqui retornamos el response, para ver si en la vista de lista, lo recibe
                                return response;
                            }
                            else{
                                this.dataService.Util().msgWarning('"'+response.messageError+'"', () => {});
                            }
                        } else if (
                            response &&
                            (response.statusCode === 422 ||
                                response.statusCode === 404)
                        ) {
                            this.dataService.Util().msgWarning('"'+response.messageError[0]+'"', () => {});
                        } else if (
                            response &&
                            (response.statusCode === 401 ||
                                response.error === MISSING_TOKEN.INVALID_TOKEN)
                        ) {
                            this.dataService.Message().msgInfo(PASSPORT_MESSAGE.SESION_END, () => {
                                    this.dataService
                                        .Storage()
                                        .passportUILogin();
                                });
                        } 
                        // else {
                        //     this.dataService
                        //         .Util()
                        //         .msgError(
                        //             "OCURRIERON ALGUNOS PROBLEMAS AL GUARDAR LOS DOCUMENTOS DE SUSTENTO, POR FAVOR INTENTE DENTRO DE UNOS SEGUNDOS, GRACIAS.",
                        //             () => {}
                        //         );
                        // }
                    });
            },
            () => {},
            "Si",
            "No"
        );
    }
    handleAdjunto(FILE) {
        if (FILE != null || FILE != undefined) {
            this.formSus.patchValue({ adjuntarDocumento: FILE.file });
        } else this.formSus.patchValue({ adjuntarDocumento: null });
    }

    handleMostrar(fileTEMP) {
        this.handlePreview(fileTEMP, fileTEMP.name);
    }
    handleMostrarDatos(dataRow) {
        this.dialogRef = this.materialDialog.open(ModalVistaInformacionSustentoComponent, {
            panelClass: "modal-vista-informacion-sustento-dialog",
            disableClose: true,
            data: {
                informacionSustento:dataRow
            },
        });
    }
    handlePreview(file: any, codigoAdjuntoAdjunto: string) {
        console.log("mostrar pDF 2", file)
        this.dialogRef = this.materialDialog.open(DocumentViewerComponent, {
            panelClass: "modal-viewer-form-dialog",
            disableClose: true,
            data: {
                modal: {
                    icon: "remove_red_eye",
                    title: "Accion Grabada",
                    file: file,
                    fileName: codigoAdjuntoAdjunto,
                },
            },
        });

        this.dialogRef.afterClosed().subscribe((response: any) => {
            if (!response) {
                //this.formSus.reset();
                // this.formpri.controls["idTipoResolucion"].setValue(null);
                this.formSus.controls["idTipoDocumentoSustento"].setValue(-1);
                this.formSus.controls["numeroDocumentoSustento"].setValue(null);
                this.formSus.controls["entidadEmisora"].setValue(null);
                this.formSus.controls["numeroFolios"].setValue(null);
                this.formSus.controls["idTipoFormatoSustento"].setValue(-1);
                this.formSus.controls["sumilla"].setValue(null);
                this.formSus.controls["vistoDeProyecto"].setValue(-1);
                return;                
            }
        });
    }

    descargar(registro) {
        const codigoDocumentoReferencia = registro.codigoDocumentoSustento;
        if (codigoDocumentoReferencia === null) {
            this.dataService
                .Util()
                .msgWarning(
                    "LA ACCIÓN GRABADA NO TIENE DOCUMENTO ADJUNTO.",
                    () => {}
                );
            return true;
        }

        this.dataService.Spinner().show("sp6");
        this.dataService
            .Documento()
            .descargar(codigoDocumentoReferencia)
            .pipe(
                catchError((e) => of(null)),
                finalize(() => this.dataService.Spinner().hide("sp6"))
            )
            .subscribe(
                (data) => {
                    const nombreArchivo = "archivo.pdf";
                    saveAs(data, nombreArchivo);
                },
                (error) => {
                    this.dataService
                        .Util()
                        .msgWarning(
                            "NO SE ENCONTRÓ EL DOCUMENTO DE SUSTENTO",
                            () => {}
                        );
                }
            );
    }
}

export class DocumentoIdentidadDataSource extends DataSource<any> {
    private _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);
    private _totalRows = 0;

    loading = this._loadingChange.asObservable();

    constructor(private dataService: DataService) {
        super();
    }

    load(data: any, pageIndex: number, pageSize: number) {
        this._loadingChange.next(true);
        this.dataService
            .AccionesGrabadas()
            .buscarServidorPublico(data, pageIndex, pageSize)
            .pipe(
                catchError((e) => {
                    return of(e);
                }),
                finalize(() => this._loadingChange.next(false))
            )
            .subscribe((response: any) => {
                if (response && (response||[]).length>0) {
                    this._totalRows = (
                        response[0] || [{ total: 0 }]
                    ).total;
                    this._dataChange.next(response);
                } else if (
                    response &&
                    (response.statusCode === 401 ||
                        response.error === MISSING_TOKEN.INVALID_TOKEN)
                ) {
                    this.dataService.Message().msgInfo(PASSPORT_MESSAGE.SESION_END, () => {
                            this.dataService.Storage().passportUILogin();
                        });
                } else {
                    this._totalRows = 0;
                    this._dataChange.next([]);
                }
            });
    }

    connect(collectionViewer: CollectionViewer): Observable<[]> {
        return this._dataChange.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this._dataChange.complete();
        this._loadingChange.complete();
    }

    get dataTotal(): any {
        return this._totalRows;
    }
    get data(): any {
        return this._dataChange.value || [];
    }
}

export interface tblGridAccGrab {
    tipoDocumentoSustento: string;
    tipoFormatoSustento: string;

    idTipoResolucion: number;
    idDocumentoSustento: number;
    idAccionGrabada: number;
    idTipoDocumentoSustento: number;
    idTipoFormatoSustento: number;
    numeroDocumentoSustento: string;
    entidadEmisora: string;
    fechaEmision: Date;
    numeroFolios: number;
    sumilla: string;
    codigoDocumentoSustento: string;
    archivoSustento: File;
    nombreArchivoSustento: string;
    vistoProyecto: boolean;
    vistoProyectoDes: string;
    activo: boolean;
    fechaCreacion: Date;
    usuarioCreacion: string;
    ipCreacion: string;
    fechaModificacion?: Date;
    usuarioModificacion?: string;
    ipModificacion?: string;
}

export interface tblGridConGrab {
    seccion: string;
    tipoSeccion: string;
    idSeccion: number;
    idtipoSeccion: number;
    considerando: string;
    sangria: boolean;
    activo: boolean;
    fechaCreacion: Date;
    usuarioCreacion: string;
    ipCreacion: string;
    fechaModificacion?: Date;
    usuarioModificacion?: string;
    ipModificacion?: string;
}