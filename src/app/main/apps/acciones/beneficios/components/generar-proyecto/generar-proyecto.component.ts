import { saveAs } from "file-saver";
import { Component, OnInit, Inject, ViewEncapsulation, OnDestroy, ViewChild, AfterViewInit, QueryList, ViewChildren } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectionModel, DataSource, CollectionViewer } from '@angular/cdk/collections';
import { mineduAnimations } from '@minedu/animations/animations';
import { catchError, finalize, takeUntil, filter, find } from 'rxjs/operators';
import { DataService } from 'app/core/data/data.service';
import { SharedService } from 'app/core/shared/shared.service';
import { MatPaginator } from '@angular/material/paginator';
import { Subscription, of, Observable, BehaviorSubject, Subject } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { SingleFileInputComponent } from 'app/main/apps/components/single-file-input/single-file-input.component';
import { DocumentViewerComponent } from 'app/main/apps/components/document-viewer/document-viewer.component';
import { MISSING_TOKEN, TablaSeccion, TablaTipoSeccion } from 'app/core/model/types';
import { environment } from 'environments/environment';
import { PASSPORT_MESSAGE } from 'app/core/model/messages-error';
import { SingleFileInputTempComponent } from 'app/main/apps/components/single-file-input-temp/single-file-input-temp.component';
import { PlazaModelS } from '../../models/generar-proyecto-model';
import { MensajesSolicitud, TipoFormularioBeneficioEnum, TipoMotivoAccionEnum } from "../../_utils/constants";
import { HttpErrorResponse } from "@angular/common/http";

@Component({
  selector: 'minedu-generar-proyecto',
  templateUrl: './generar-proyecto.component.html',
  styleUrls: ['./generar-proyecto.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations
})
export class GenerarProyectoComponent
implements OnInit, AfterViewInit
{
ELEMENTOS_TEMP_DATAGRID: tblGridAccGrab[] = [];
CONSIDERANDO_TEMP_DATAGRID: tblGridConGrab[] = [];

form: FormGroup;
formCons: FormGroup;

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
comboLists = {
    listTipoResolucion: [],
    listTipoDocumentoSustento: [],
    listTipoFormatoSustento:[],
};
constructor(
    public matDialogRef: MatDialogRef<GenerarProyectoComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private materialDialog: MatDialog
) {}

valoresRecibidos: any;
ACCIONES_GRABADAS_IDS: any[] = [];
DatosCabecera;
idDetalleGestionBeneficio = 0;
tipoFormularioBeneficio = 0;
operacion  = 0;
esSubisidioTitular = false;
ngOnInit(): void {
    this.buildForm();
    this.DatosCabecera = this.data.datosAccion;
    this.operacion=this.data.operacion;
    if(!this.data.datosBeneficio){
        this.idDetalleGestionBeneficio = this.data.idBeneficio;
    }else{
        this.tipoFormularioBeneficio = this.data.datosBeneficio.tipoFormularioBeneficio;
        this.esSubisidioTitular =  (this.data.datosBeneficio.tipoSubsidio=="TITULAR");
    }
        
    console.log("idBeneficio",this.data.idBeneficio);
    console.log("idDetalleGestionBeneficio",this.idDetalleGestionBeneficio);
    console.log("datosBeneficio",this.data.datosBeneficio);
    setTimeout(() => {
        this.loadCombos();
    });
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

fechaActual = new Date(new Date().setDate(new Date().getDate() + 0));
loadCombos() {
    
    this.loadTipoResolucion();
    this.loadTipoFormatoSustento();
    this.loadTipoDocumentoSustento();
};
loadTipoResolucion() {
    this.dataService.Beneficios().getComboTipoResolucion().pipe(catchError(() => of([])), finalize(() => { })).subscribe((result: any) => {
        if (result) {
            if(result.length == 0)
            {
                this.dataService.Message().msgInfo(
                    "NO HAY REGISTROS DE TIPO RESOLUCIÓN", () => {
                    
                });
            }
            this.comboLists.listTipoResolucion = result.map((x) => ({
                ...x,
                value: x.idTipoResolucion,
                label: x.descripcionTipoResolucion
            }));
        }
        
    });
}
loadTipoFormatoSustento() {
    this.dataService.Beneficios().getComboTipoFormatoSustento().pipe(catchError(() => of([])), finalize(() => { })).subscribe((result: any) => {
        if (result) {
            if(result.length == 0)
            {
                this.dataService.Message().msgInfo(
                    "NO HAY REGISTROS DE TIPO FORMATO SUSTENTO", () => {
                    
                });
            }
            this.comboLists.listTipoFormatoSustento = result.map((x) => ({
                ...x,
                value: x.idTipoFormatoSustento,
                label: x.descripcionTipoFormatoSustento
            }));
        }
        
    });
}
loadTipoDocumentoSustento() {
    this.dataService.Beneficios().getComboTipoDocumentoSustento().pipe(catchError(() => of([])), finalize(() => { })).subscribe((result: any) => {
        if (result) {
            if(result.length == 0)
            {
                this.dataService.Message().msgInfo(
                    "NO HAY REGISTROS DE TIPO DOCUMENTO SUSTENTO", () => {
                    
                });
            }
            this.comboLists.listTipoDocumentoSustento = result.map((x) => ({
                ...x,
                value: x.idTipoDocumentoSustento,
                label: x.descripcionTipoDocumentoSustento
            }));
        }
        
    });
}
buildForm() {
    this.form = this.formBuilder.group({
        idTipoResolucion: [null, [Validators.required]],
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
            [Validators.required, Validators.maxLength(400)],
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
        sumilla: [null, [Validators.required, Validators.maxLength(400)]],
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

private relogin(response){
    if (
        response &&
        (response.statusCode === 401 ||
            response.error === MISSING_TOKEN.INVALID_TOKEN)
    ) {
        this.dataService.Message().msgInfo(PASSPORT_MESSAGE.SESION_END, () => {
                this.dataService.Storage().passportUILogin();
            });
    }
}

ngAfterViewInit() {}
@ViewChildren(SingleFileInputTempComponent)
fileComponent: QueryList<SingleFileInputTempComponent>;
limpiar() {
    this.form.controls["idTipoDocumentoSustento"].reset();
    this.form.controls["numeroDocumentoSustento"].reset();
    this.form.controls["entidadEmisora"].reset();
    this.form.controls["fechaEmision"].reset();
    this.form.controls["numeroFolios"].reset();
    this.form.controls["idTipoFormatoSustento"].reset();
    this.form.controls["sumilla"].reset();
    this.form.controls["adjuntarDocumento"].reset();
    this.form.controls["vistoDeProyecto"].reset();
    this.fileComponent.forEach((c) => c.eliminarDocumento());
    
}

limpiarConsiderando() {
    this.formCons.controls["considerando"].reset();
    //this.form.controls["considerando"].setErrors(null);
}

//   private busquedaConfirmar = (dato: any) => {
//       this.validarAccionPassport(TablaPermisos.Consultar, "validBusqueda", dato);
//   };

agregarAGrillaTemporal() {
    if (this.form.valid) {
        const usuario = this.dataService.Storage().getPassportUserData();
        
       
        let conDocumento = false;
        if(this.form.value.adjuntarDocumento)
            conDocumento= true;
        let item: tblGridAccGrab = {
            tipoDocumentoSustento: this.comboLists.listTipoDocumentoSustento.filter(
                (ds) =>
                    ds.value ==
                    this.form.value.idTipoDocumentoSustento
            )[0].label,
            tipoFormatoSustento: this.comboLists.listTipoFormatoSustento.filter(
                (ts) =>
                    ts.value ==
                    this.form.value.idTipoFormatoSustento
            )[0].label,
            idDocumentoSustento: 0,
            idAccionGrabada:null,// this.ACCIONES_GRABADAS_IDS[0].idAccionGrabada,
            idTipoResolucion: 0 /*este item se llenara al final cuando se envie la lista final, ya que es 1 resolucion por el bloque*/,
            idTipoDocumentoSustento:
                this.form.value.idTipoDocumentoSustento,
            idTipoFormatoSustento: this.form.value.idTipoFormatoSustento,
            numeroDocumentoSustento:
                this.form.value.numeroDocumentoSustento,
            entidadEmisora: this.form.value.entidadEmisora,
            fechaEmision: this.form.value.fechaEmision,
            numeroFolios: this.form.value.numeroFolios,
            sumilla: this.form.value.sumilla,
            codigoDocumentoSustento: "", //this.form.value.adjuntarDocumento,
            vistoProyecto:
                this.form.value.vistoDeProyecto == "1" ? true : false,
            vistoProyectoDes:
                    this.form.value.vistoDeProyecto == "1" ? 'SI' : 'NO',
            activo: true,
            fechaCreacion: new Date(),
            usuarioCreacion: usuario.NOMBRES_USUARIO,
            ipCreacion: "",
            fechaModificacion: new Date(),
            archivoSustento: (conDocumento)?this.form.value.adjuntarDocumento:null,
            nombreArchivoSustento: (conDocumento)?this.form.value.adjuntarDocumento.name:null,
        };

        this.ELEMENTOS_TEMP_DATAGRID.push(item);
        console.log('ELEMENTOS 25/02/2022', this.ELEMENTOS_TEMP_DATAGRID);
        this.limpiar();
    } else {
        this.dataService.Message().msgWarning('"DEBE INGRESAR TODOS LOS CAMPOS OBLIGATORIOS"',() => {});
        return;
    }
}

agregarConsiderandoAGrillaTemporal() {
    if (this.formCons.valid) {
        const usuario = this.dataService.Storage().getPassportUserData();

        let item: tblGridConGrab = {
            seccion: this.seccion,
            tipoSeccion: this.tipoSeccion,
            idSeccion: 2,
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

convertirAListaParaGuardar() {
    let listaFinal: tblGridAccGrab[] = [];
    if (this.ACCIONES_GRABADAS_IDS.length > 0) {
        for (let i = 0; i < this.ACCIONES_GRABADAS_IDS.length; i++) {
            for (let j = 0; j < this.ELEMENTOS_TEMP_DATAGRID.length; j++) {
                listaFinal.push({
                    idAccionGrabada : this.ACCIONES_GRABADAS_IDS[i].idAccionGrabada,
                    idTipoResolucion : this.form.value.idTipoResolucion,
                    tipoDocumentoSustento : this.ELEMENTOS_TEMP_DATAGRID[j].tipoDocumentoSustento,
                    tipoFormatoSustento : this.ELEMENTOS_TEMP_DATAGRID[j].tipoFormatoSustento,
                    idDocumentoSustento : this.ELEMENTOS_TEMP_DATAGRID[j].idDocumentoSustento,
                    idTipoDocumentoSustento : this.ELEMENTOS_TEMP_DATAGRID[j].idTipoDocumentoSustento,
                    idTipoFormatoSustento : this.ELEMENTOS_TEMP_DATAGRID[j].idTipoFormatoSustento,
                    numeroDocumentoSustento : this.ELEMENTOS_TEMP_DATAGRID[j].numeroDocumentoSustento,
                    entidadEmisora : this.ELEMENTOS_TEMP_DATAGRID[j].entidadEmisora,
                    fechaEmision :this.ELEMENTOS_TEMP_DATAGRID[j].fechaEmision,
                    numeroFolios : this.ELEMENTOS_TEMP_DATAGRID[j].numeroFolios,
                    sumilla : this.ELEMENTOS_TEMP_DATAGRID[j].sumilla,
                    codigoDocumentoSustento : this.ELEMENTOS_TEMP_DATAGRID[j].codigoDocumentoSustento,
                    archivoSustento : this.ELEMENTOS_TEMP_DATAGRID[j].archivoSustento,
                    vistoProyecto : this.ELEMENTOS_TEMP_DATAGRID[j].vistoProyecto,
                    vistoProyectoDes : this.ELEMENTOS_TEMP_DATAGRID[j].vistoProyectoDes,
                    activo : this.ELEMENTOS_TEMP_DATAGRID[j].activo,
                    fechaCreacion : this.ELEMENTOS_TEMP_DATAGRID[j].fechaCreacion,
                    usuarioCreacion : this.ELEMENTOS_TEMP_DATAGRID[j].usuarioCreacion,
                    ipCreacion : this.ELEMENTOS_TEMP_DATAGRID[j].ipCreacion,
                    fechaModificacion : this.ELEMENTOS_TEMP_DATAGRID[j].fechaModificacion,
                    nombreArchivoSustento : this.ELEMENTOS_TEMP_DATAGRID[j].nombreArchivoSustento,
                });
            }
        }
    }
    return listaFinal;
}

generarObjetoProyectoResolucion() {
    
    let data = this.data.datosBeneficio;
    data.proyectoResolucion = {
        //idAccionPersonal: this.idDetalleGestionBeneficio,
        idTipoResolucion: this.form.value.idTipoResolucion,
        documentosSustento: this.ELEMENTOS_TEMP_DATAGRID,
        detalleConsiderando: this.CONSIDERANDO_TEMP_DATAGRID,
    };
    const documento = new FormData();
    this.appendFormData(documento, data, "");
    console.log(documento);
    console.log(this.ELEMENTOS_TEMP_DATAGRID);
    
    return documento;
}
generarObjetoProyectoResolucionSinBeneficio() {
    
    const usuario = this.dataService.Storage().getPassportUserData();
    let proyectoResolucion = {
        tipoMotivoAccion: this.obtenerTipoMotivoAccion(),
        idAccionPersonal: this.idDetalleGestionBeneficio,
        idTipoResolucion: this.form.value.idTipoResolucion,
        documentos: this.ELEMENTOS_TEMP_DATAGRID,
        detalleConsiderando: this.CONSIDERANDO_TEMP_DATAGRID,
        fechaCreacion: new Date(),
        usuarioCreacion: usuario.NUMERO_DOCUMENTO,
        ipCreacion: ":1",
    };
    const documento = new FormData();
    this.appendFormData(documento, proyectoResolucion, "");
    console.log(documento);
    console.log(this.ELEMENTOS_TEMP_DATAGRID);
    
    return documento;
}
obtenerTipoMotivoAccion(){
    
    var tipoMotivoAccion = "";
    switch (this.tipoFormularioBeneficio) {
        case TipoFormularioBeneficioEnum.CTS29944:
            tipoMotivoAccion = TipoMotivoAccionEnum.CTS29944;
            break;
        case TipoFormularioBeneficioEnum.CTS276:
            tipoMotivoAccion = TipoMotivoAccionEnum.CTS276;
            break;
        case TipoFormularioBeneficioEnum.CreditoDevengado:
            tipoMotivoAccion = TipoMotivoAccionEnum.CreditoDevengado;
            break;
        case TipoFormularioBeneficioEnum.VacacionesTruncas:
            tipoMotivoAccion = TipoMotivoAccionEnum.VacacionesTruncas;
            break;
        case TipoFormularioBeneficioEnum.SubsidioFamiliar:
            if(this.esSubisidioTitular)
                tipoMotivoAccion = TipoMotivoAccionEnum.SubsidioTitular;
            else
                tipoMotivoAccion = TipoMotivoAccionEnum.SubsidioFamiliar;
            break;
        case TipoFormularioBeneficioEnum.ATS25:
            tipoMotivoAccion = TipoMotivoAccionEnum.ATS25;
            break;
        case TipoFormularioBeneficioEnum.ATS30:
            tipoMotivoAccion = TipoMotivoAccionEnum.ATS30;
            break;
        case TipoFormularioBeneficioEnum.GST25:
            tipoMotivoAccion = TipoMotivoAccionEnum.GST25;
            break;
        case TipoFormularioBeneficioEnum.BonificacionFamiliar:
            tipoMotivoAccion = TipoMotivoAccionEnum.BonificacionFamiliar;
            break;
        case TipoFormularioBeneficioEnum.BonificacionPersonal:
            tipoMotivoAccion = TipoMotivoAccionEnum.BonificacionPersonal;
            break;
        case TipoFormularioBeneficioEnum.IncentivoProfesional:
            tipoMotivoAccion = TipoMotivoAccionEnum.IncentivoProfesional;
            break;
        case TipoFormularioBeneficioEnum.IncentivoEstudios:
            tipoMotivoAccion = TipoMotivoAccionEnum.IncentivoEstudios;
            break;
        default:
            break;
    }
    return tipoMotivoAccion;
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

guardarDocumentoSustentoYGenerarProyectoResolucionSinBeneficio(){
    this.dataService.Message().msgConfirm(
        "¿ESTÁ SEGURO QUE DESEA GUARDAR LA INFORMACIÓN DE LOS DOCUMENTOS DE SUSTENTO?",
        () => {
            this.dataService.Spinner().show("sp6");

            this.dataService
                .Beneficios()
                .enviarProyectoResolucion(
                    this.generarObjetoProyectoResolucionSinBeneficio()
                ).pipe(
                    catchError((response : HttpErrorResponse) =>{
                        this.dataService.Message().msgWarning(response.error.messages[0]);
                        return of(null);
                    }),
                    finalize(()=>{this.dataService.Spinner().hide("sp6");})
                ).subscribe(
                  (response:any) => {
                    if(response){
                        this.dataService.Message().msgAutoCloseSuccessNoButton('"OPERACIÓN REALIZADA DE FORMA EXITOSA."', 3000, () => {
                            this.matDialogRef.close(response);
                            return response;
                        });
                    }
                  });                  
        },
        () => {}
    );
}
guardarDocumentoSustentoYGenerarProyectoResolucionResponseValidacion(response){
    if (response) {
        this.dataService
            .Util()
            .msgAutoCloseSuccess(
                "OPERACIÓN REALIZADA DE FORMA EXITOSA",
                2000,
                () => {
                    this.matDialogRef.close(response); //le puse el response
                }
            );
        //@aqui retornamos el response, para ver si en la vista de lista, lo recibe
        return response;
    } else if (
        response &&
        (response.statusCode === 422 ||
            response.statusCode === 404)
    ) {
        this.dataService.Message().msgWarning('"'+response.messages[0]+'"', () => {});
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
}

guardarDocumentoSustentoYGenerarProyectoResolucion() {
    
    if (this.ELEMENTOS_TEMP_DATAGRID.length == 0) {
        this.dataService.Message().msgWarning('"AGREGUE DOCUMENTOS DE SUSTENTO PARA LA GENERACIÓN DE PROYECTO"',() => {});
        return;
    }

    let encontradoVistoProy: boolean = false;
    for (let i = 0; i < this.ELEMENTOS_TEMP_DATAGRID.length; i++) {
        if (this.ELEMENTOS_TEMP_DATAGRID[i].vistoProyecto == true) {
            encontradoVistoProy = true;
        }
    }
    if (!encontradoVistoProy) {
        this.dataService.Message().msgWarning(MensajesSolicitud.M31,() => {});
        return;
    }
    switch (this.operacion) {
        
        case 1:
            switch (this.tipoFormularioBeneficio) {
                case TipoFormularioBeneficioEnum.CTS29944:
                    this.guardarDocumentoSustentoYGenerarProyectoResolucionConBeneficioCTS29944();
                    break;
                case TipoFormularioBeneficioEnum.CTS276:
                    this.guardarDocumentoSustentoYGenerarProyectoResolucionConBeneficioCTS276();
                    break;
                case TipoFormularioBeneficioEnum.CreditoDevengado:
                    this.guardarDocumentoSustentoYGenerarProyectoResolucionConBeneficioCreditoDevengado();
                    break;
                case TipoFormularioBeneficioEnum.VacacionesTruncas:
                    this.guardarDocumentoSustentoYGenerarProyectoResolucionConBeneficioVacacionesTruncas();
                    break;
                case TipoFormularioBeneficioEnum.SubsidioFamiliar:
                    this.guardarDocumentoSustentoYGenerarProyectoResolucionConBeneficioSubsidioFamiliar();
                    break;
                case TipoFormularioBeneficioEnum.ATS25:
                    this.guardarDocumentoSustentoYGenerarProyectoResolucionConBeneficioATS25();
                    break;
                case TipoFormularioBeneficioEnum.ATS30:
                    this.guardarDocumentoSustentoYGenerarProyectoResolucionConBeneficioATS30();
                    break;
                case TipoFormularioBeneficioEnum.GST25:
                    this.guardarDocumentoSustentoYGenerarProyectoResolucionConBeneficioGTS25();
                    break;
                case TipoFormularioBeneficioEnum.BonificacionFamiliar:
                    this.guardarDocumentoSustentoYGenerarProyectoResolucionConBeneficioBonificacionFamiliar();
                    break;
                case TipoFormularioBeneficioEnum.BonificacionPersonal:
                    this.guardarDocumentoSustentoYGenerarProyectoResolucionConBeneficioBonificacionPersonal();
                    break;
                case TipoFormularioBeneficioEnum.IncentivoEstudios:
                    this.guardarDocumentoSustentoYGenerarProyectoResolucionConBeneficioIncentivoEstudios();
                    break;
                case TipoFormularioBeneficioEnum.IncentivoProfesional:
                    this.guardarDocumentoSustentoYGenerarProyectoResolucionConBeneficioIncentivoProfesional();
                    break;
                default:
                    break;
            }
        break;
        case 2:
            switch (this.tipoFormularioBeneficio) {
                case TipoFormularioBeneficioEnum.CTS29944:
                    this.guardarEditarDocumentoSustentoYGenerarProyectoResolucionConBeneficioCTS29944();
                    break;
                case TipoFormularioBeneficioEnum.CTS276:
                    this.guardarEditarDocumentoSustentoYGenerarProyectoResolucionConBeneficioCTS276();
                    break;
                case TipoFormularioBeneficioEnum.CreditoDevengado:
                    this.guardarEditarDocumentoSustentoYGenerarProyectoResolucionConBeneficioCreditoDevengado();
                    break;
                case TipoFormularioBeneficioEnum.VacacionesTruncas:
                    this.guardarEditarDocumentoSustentoYGenerarProyectoResolucionConBeneficioVacacionesTruncas();
                    break;
                case TipoFormularioBeneficioEnum.SubsidioFamiliar:
                    this.guardarEditarDocumentoSustentoYGenerarProyectoResolucionConBeneficioSubsidioFamiliar();
                    break;
                case TipoFormularioBeneficioEnum.ATS25:
                    this.guardarEditarDocumentoSustentoYGenerarProyectoResolucionConBeneficioATS25();
                    break;
                case TipoFormularioBeneficioEnum.ATS30:
                    this.guardarEditarDocumentoSustentoYGenerarProyectoResolucionConBeneficioATS30();
                    break;
                case TipoFormularioBeneficioEnum.GST25:
                    this.guardarEditarDocumentoSustentoYGenerarProyectoResolucionConBeneficioGTS25();
                    break;
                case TipoFormularioBeneficioEnum.BonificacionFamiliar:
                    this.guardarEditarDocumentoSustentoYGenerarProyectoResolucionConBeneficioBonificacionFamiliar();
                    break;
                case TipoFormularioBeneficioEnum.BonificacionPersonal:
                    this.guardarEditarDocumentoSustentoYGenerarProyectoResolucionConBeneficioBonificacionPersonal();
                    break;
                case TipoFormularioBeneficioEnum.IncentivoEstudios:
                    this.guardarEditarDocumentoSustentoYGenerarProyectoResolucionConBeneficioIncentivoEstudios();
                    break;
                case TipoFormularioBeneficioEnum.IncentivoProfesional:
                    this.guardarEditarDocumentoSustentoYGenerarProyectoResolucionConBeneficioIncentivoProfesional();
                    break;
                default:
                    break;
            }
        break;
        case 3:
            this.guardarDocumentoSustentoYGenerarProyectoResolucionSinBeneficio();
        break;
        default:
            break;
    }
    
}
/** Guardar Documento Sustento Y Generar Proyecto Resolucion Con Beneficio
 */
/**Crear Beneficio */
 guardarDocumentoSustentoYGenerarProyectoResolucionConBeneficioCTS29944(){
    this.dataService.Message().msgConfirm(
        "¿ESTÁ SEGURO QUE DESEA GUARDAR LA INFORMACIÓN DE LOS DOCUMENTOS DE SUSTENTO?",
        () => {
            this.dataService.Spinner().show("sp6");

            this.dataService
                .Beneficios()
                .guardarBeneficioCTS29944(
                    this.generarObjetoProyectoResolucion()
                )
                .pipe(
                    catchError((response : HttpErrorResponse) =>{
                        this.dataService.Message().msgWarning(response.error.messages[0]);
                        return of(null);
                    }),
                    finalize(()=>{this.dataService.Spinner().hide("sp6");})
                ).subscribe(
                  (response:any) => {
                    if(response){
                        this.dataService.Message().msgAutoCloseSuccessNoButton('"OPERACIÓN REALIZADA DE FORMA EXITOSA."', 3000, () => {
                            this.matDialogRef.close(response);
                            return response;
                        });
                    }
                  });   
        },
        () => {}
    );
}
guardarDocumentoSustentoYGenerarProyectoResolucionConBeneficioCTS276(){
    this.dataService.Message().msgConfirm(
        "¿ESTÁ SEGURO QUE DESEA GUARDAR LA INFORMACIÓN DE LOS DOCUMENTOS DE SUSTENTO?",
        () => {
            this.dataService.Spinner().show("sp6");

            this.dataService
                .Beneficios()
                .guardarBeneficioCTS276(
                    this.generarObjetoProyectoResolucion()
                )
                .pipe(
                    catchError((response : HttpErrorResponse) =>{
                        this.dataService.Message().msgWarning(response.error.messages[0]);
                        return of(null);
                    }),
                    finalize(()=>{this.dataService.Spinner().hide("sp6");})
                ).subscribe(
                  (response:any) => {
                    if(response){
                        this.dataService.Message().msgAutoCloseSuccessNoButton('"OPERACIÓN REALIZADA DE FORMA EXITOSA."', 3000, () => {
                            this.matDialogRef.close(response);
                            return response;
                        });
                    }
                  });   
        },
        () => {}
    );
}
guardarDocumentoSustentoYGenerarProyectoResolucionConBeneficioCreditoDevengado(){
    this.dataService.Message().msgConfirm(
        "¿ESTÁ SEGURO QUE DESEA GUARDAR LA INFORMACIÓN DE LOS DOCUMENTOS DE SUSTENTO?",
        () => {
            this.dataService.Spinner().show("sp6");

            this.dataService
                .Beneficios()
                .guardarBeneficioCreditoDevengado(
                    this.generarObjetoProyectoResolucion()
                )
                .pipe(
                    catchError((response : HttpErrorResponse) =>{
                        this.dataService.Message().msgWarning(response.error.messages[0]);
                        return of(null);
                    }),
                    finalize(()=>{this.dataService.Spinner().hide("sp6");})
                ).subscribe(
                  (response:any) => {
                    if(response){
                        this.dataService.Message().msgAutoCloseSuccessNoButton('"OPERACIÓN REALIZADA DE FORMA EXITOSA."', 3000, () => {
                            this.matDialogRef.close(response);
                            return response;
                        });
                    }
                  });   
        },
        () => {}
    );
} 

guardarDocumentoSustentoYGenerarProyectoResolucionConBeneficioSubsidioFamiliar(){
    this.dataService.Message().msgConfirm(
        "¿ESTÁ SEGURO QUE DESEA GUARDAR LA INFORMACIÓN DE LOS DOCUMENTOS DE SUSTENTO?",
        () => {
            this.dataService.Spinner().show("sp6");

            this.dataService
                .Beneficios()
                .guardarBeneficioSubsidioFamiliar(
                    this.generarObjetoProyectoResolucion()
                ).pipe(
                    catchError((response : HttpErrorResponse) =>{
                        this.dataService.Message().msgWarning(response.error.messages[0]);
                        return of(null);
                    }),
                    finalize(()=>{this.dataService.Spinner().hide("sp6");})
                ).subscribe(
                  (response:any) => {
                    if(response){
                        this.dataService.Message().msgAutoCloseSuccessNoButton('"OPERACIÓN REALIZADA DE FORMA EXITOSA."', 3000, () => {
                            this.matDialogRef.close(response);
                            return response;
                        });
                    }
                  });   
        },
        () => {}
    );
}
guardarDocumentoSustentoYGenerarProyectoResolucionConBeneficioVacacionesTruncas(){
    this.dataService.Message().msgConfirm(
        "¿ESTÁ SEGURO QUE DESEA GUARDAR LA INFORMACIÓN DE LOS DOCUMENTOS DE SUSTENTO?",
        () => {
            this.dataService.Spinner().show("sp6");

            this.dataService
                .Beneficios()
                .guardarBeneficioVacacionesTruncas(
                    this.generarObjetoProyectoResolucion()
                ).pipe(
                    catchError((response : HttpErrorResponse) =>{
                        this.dataService.Message().msgWarning(response.error.messages[0]);
                        return of(null);
                    }),
                    finalize(()=>{this.dataService.Spinner().hide("sp6");})
                ).subscribe(
                  (response:any) => {
                    if(response){
                        this.dataService.Message().msgAutoCloseSuccessNoButton('"OPERACIÓN REALIZADA DE FORMA EXITOSA."', 3000, () => {
                            this.matDialogRef.close(response);
                            return response;
                        });
                    }
                  });   
        },
        () => {}
    );
}
guardarDocumentoSustentoYGenerarProyectoResolucionConBeneficioATS25(){
    this.dataService.Message().msgConfirm(
        "¿ESTÁ SEGURO QUE DESEA GUARDAR LA INFORMACIÓN DE LOS DOCUMENTOS DE SUSTENTO?",
        () => {
            this.dataService.Spinner().show("sp6");

            this.dataService
                .Beneficios()
                .guardarBeneficioATS25(
                    this.generarObjetoProyectoResolucion()
                ).pipe(
                    catchError((response : HttpErrorResponse) =>{
                        this.dataService.Message().msgWarning(response.error.messages[0]);
                        return of(null);
                    }),
                    finalize(()=>{this.dataService.Spinner().hide("sp6");})
                ).subscribe(
                  (response:any) => {
                    if(response){
                        this.dataService.Message().msgAutoCloseSuccessNoButton('"OPERACIÓN REALIZADA DE FORMA EXITOSA."', 3000, () => {
                            this.matDialogRef.close(response);
                            return response;
                        });
                    }
                  });   
        },
        () => {}
    );
}
guardarDocumentoSustentoYGenerarProyectoResolucionConBeneficioATS30(){
    this.dataService.Message().msgConfirm(
        "¿ESTÁ SEGURO QUE DESEA GUARDAR LA INFORMACIÓN DE LOS DOCUMENTOS DE SUSTENTO?",
        () => {
            this.dataService.Spinner().show("sp6");

            this.dataService
                .Beneficios()
                .guardarBeneficioATS30(
                    this.generarObjetoProyectoResolucion()
                ).pipe(
                    catchError((response : HttpErrorResponse) =>{
                        this.dataService.Message().msgWarning(response.error.messages[0]);
                        return of(null);
                    }),
                    finalize(()=>{this.dataService.Spinner().hide("sp6");})
                ).subscribe(
                  (response:any) => {
                    if(response){
                        this.dataService.Message().msgAutoCloseSuccessNoButton('"OPERACIÓN REALIZADA DE FORMA EXITOSA."', 3000, () => {
                            this.matDialogRef.close(response);
                            return response;
                        });
                    }
                  });   
        },
        () => {}
    );
}
guardarDocumentoSustentoYGenerarProyectoResolucionConBeneficioGTS25(){
    this.dataService.Message().msgConfirm(
        "¿ESTÁ SEGURO QUE DESEA GUARDAR LA INFORMACIÓN DE LOS DOCUMENTOS DE SUSTENTO?",
        () => {
            this.dataService.Spinner().show("sp6");

            this.dataService
                .Beneficios()
                .guardarBeneficioGTS25(
                    this.generarObjetoProyectoResolucion()
                ).pipe(
                    catchError((response : HttpErrorResponse) =>{
                        this.dataService.Message().msgWarning(response.error.messages[0]);
                        return of(null);
                    }),
                    finalize(()=>{this.dataService.Spinner().hide("sp6");})
                ).subscribe(
                  (response:any) => {
                    if(response){
                        this.dataService.Message().msgAutoCloseSuccessNoButton('"OPERACIÓN REALIZADA DE FORMA EXITOSA."', 3000, () => {
                            this.matDialogRef.close(response);
                            return response;
                        });
                    }
                  });   
        },
        () => {}
    );
}
guardarDocumentoSustentoYGenerarProyectoResolucionConBeneficioBonificacionFamiliar(){
    this.dataService.Message().msgConfirm(
        "¿ESTÁ SEGURO QUE DESEA GUARDAR LA INFORMACIÓN DE LOS DOCUMENTOS DE SUSTENTO?",
        () => {
            this.dataService.Spinner().show("sp6");

            this.dataService
                .Beneficios()
                .guardarBeneficioBonificacionFamiliar(
                    this.generarObjetoProyectoResolucion()
                ).pipe(
                    catchError((response : HttpErrorResponse) =>{
                        this.dataService.Message().msgWarning(response.error.messages[0]);
                        return of(null);
                    }),
                    finalize(()=>{this.dataService.Spinner().hide("sp6");})
                ).subscribe(
                  (response:any) => {
                    if(response){
                        this.dataService.Message().msgAutoCloseSuccessNoButton('"OPERACIÓN REALIZADA DE FORMA EXITOSA."', 3000, () => {
                            this.matDialogRef.close(response);
                            return response;
                        });
                    }
                  });   
        },
        () => {}
    );
}
guardarDocumentoSustentoYGenerarProyectoResolucionConBeneficioBonificacionPersonal(){
    this.dataService.Message().msgConfirm(
        "¿ESTÁ SEGURO QUE DESEA GUARDAR LA INFORMACIÓN DE LOS DOCUMENTOS DE SUSTENTO?",
        () => {
            this.dataService.Spinner().show("sp6");

            this.dataService
                .Beneficios()
                .guardarBeneficioBonificacionPersonal(
                    this.generarObjetoProyectoResolucion()
                ).pipe(
                    catchError((response : HttpErrorResponse) =>{
                        this.dataService.Message().msgWarning(response.error.messages[0]);
                        return of(null);
                    }),
                    finalize(()=>{this.dataService.Spinner().hide("sp6");})
                ).subscribe(
                  (response:any) => {
                    if(response){
                        this.dataService.Message().msgAutoCloseSuccessNoButton('"OPERACIÓN REALIZADA DE FORMA EXITOSA."', 3000, () => {
                            this.matDialogRef.close(response);
                            return response;
                        });
                    }
                  });   
        },
        () => {}
    );
}
guardarDocumentoSustentoYGenerarProyectoResolucionConBeneficioIncentivoEstudios(){
    this.dataService.Message().msgConfirm(
        "¿ESTÁ SEGURO QUE DESEA GUARDAR LA INFORMACIÓN DE LOS DOCUMENTOS DE SUSTENTO?",
        () => {
            this.dataService.Spinner().show("sp6");

            this.dataService
                .Beneficios()
                .guardarBeneficioIncentivoEstudios(
                    this.generarObjetoProyectoResolucion()
                ).pipe(
                    catchError((response : HttpErrorResponse) =>{
                        this.dataService.Message().msgWarning(response.error.messages[0]);
                        return of(null);
                    }),
                    finalize(()=>{this.dataService.Spinner().hide("sp6");})
                ).subscribe(
                  (response:any) => {
                    if(response){
                        this.dataService.Message().msgAutoCloseSuccessNoButton('"OPERACIÓN REALIZADA DE FORMA EXITOSA."', 3000, () => {
                            this.matDialogRef.close(response);
                            return response;
                        });
                    }
                  });   
        },
        () => {}
    );
}
guardarDocumentoSustentoYGenerarProyectoResolucionConBeneficioIncentivoProfesional(){
    this.dataService.Message().msgConfirm(
        "¿ESTÁ SEGURO QUE DESEA GUARDAR LA INFORMACIÓN DE LOS DOCUMENTOS DE SUSTENTO?",
        () => {
            this.dataService.Spinner().show("sp6");

            this.dataService
                .Beneficios()
                .guardarBeneficioIncentivoProfesional(
                    this.generarObjetoProyectoResolucion()
                ).pipe(
                    catchError((response : HttpErrorResponse) =>{
                        this.dataService.Message().msgWarning(response.error.messages[0]);
                        return of(null);
                    }),
                    finalize(()=>{this.dataService.Spinner().hide("sp6");})
                ).subscribe(
                  (response:any) => {
                    if(response){
                        this.dataService.Message().msgAutoCloseSuccessNoButton('"OPERACIÓN REALIZADA DE FORMA EXITOSA."', 3000, () => {
                            this.matDialogRef.close(response);
                            return response;
                        });
                    }
                  });   
        },
        () => {}
    );
}

/**Modificar Beneficio */
guardarEditarDocumentoSustentoYGenerarProyectoResolucionConBeneficioCTS29944(){
    this.dataService.Message().msgConfirm(
        "¿ESTÁ SEGURO QUE DESEA GUARDAR LA INFORMACIÓN DE LOS DOCUMENTOS DE SUSTENTO?",
        () => {
            this.dataService.Spinner().show("sp6");

            this.dataService
                .Beneficios()
                .guardarEditarBeneficioCTS29944(
                    this.generarObjetoProyectoResolucion()
                ).pipe(
                    catchError((response : HttpErrorResponse) =>{
                        this.dataService.Message().msgWarning(response.error.messages[0]);
                        return of(null);
                    }),
                    finalize(()=>{this.dataService.Spinner().hide("sp6");})
                ).subscribe(
                  (response:any) => {
                    if(response){
                        this.dataService.Message().msgAutoCloseSuccessNoButton('"OPERACIÓN REALIZADA DE FORMA EXITOSA."', 3000, () => {
                            this.matDialogRef.close(response);
                            return response;
                        });
                    }
                  });   
        },
        () => {}
    );
}
guardarEditarDocumentoSustentoYGenerarProyectoResolucionConBeneficioCTS276(){
    this.dataService.Message().msgConfirm(
        "¿ESTÁ SEGURO QUE DESEA GUARDAR LA INFORMACIÓN DE LOS DOCUMENTOS DE SUSTENTO?",
        () => {
            this.dataService.Spinner().show("sp6");

            this.dataService
                .Beneficios()
                .guardarEditarBeneficioCTS276(
                    this.generarObjetoProyectoResolucion()
                ).pipe(
                    catchError((response : HttpErrorResponse) =>{
                        this.dataService.Message().msgWarning(response.error.messages[0]);
                        return of(null);
                    }),
                    finalize(()=>{this.dataService.Spinner().hide("sp6");})
                ).subscribe(
                  (response:any) => {
                    if(response){
                        this.dataService.Message().msgAutoCloseSuccessNoButton('"OPERACIÓN REALIZADA DE FORMA EXITOSA."', 3000, () => {
                            this.matDialogRef.close(response);
                            return response;
                        });
                    }
                  });   
        },
        () => {}
    );
}
guardarEditarDocumentoSustentoYGenerarProyectoResolucionConBeneficioCreditoDevengado(){
    this.dataService.Message().msgConfirm(
        "¿ESTÁ SEGURO QUE DESEA GUARDAR LA INFORMACIÓN DE LOS DOCUMENTOS DE SUSTENTO?",
        () => {
            this.dataService.Spinner().show("sp6");

            this.dataService
                .Beneficios()
                .guardarEditarBeneficioCreditoDevengado(
                    this.generarObjetoProyectoResolucion()
                ).pipe(
                    catchError((response : HttpErrorResponse) =>{
                        this.dataService.Message().msgWarning(response.error.messages[0]);
                        return of(null);
                    }),
                    finalize(()=>{this.dataService.Spinner().hide("sp6");})
                ).subscribe(
                  (response:any) => {
                    if(response){
                        this.dataService.Message().msgAutoCloseSuccessNoButton('"OPERACIÓN REALIZADA DE FORMA EXITOSA."', 3000, () => {
                            this.matDialogRef.close(response);
                            return response;
                        });
                    }
                  });   
        },
        () => {}
    );
} 

guardarEditarDocumentoSustentoYGenerarProyectoResolucionConBeneficioSubsidioFamiliar(){
    this.dataService.Message().msgConfirm(
        "¿ESTÁ SEGURO QUE DESEA GUARDAR LA INFORMACIÓN DE LOS DOCUMENTOS DE SUSTENTO?",
        () => {
            this.dataService.Spinner().show("sp6");

            this.dataService
                .Beneficios()
                .guardarEditarBeneficioSubsidioFamiliar(
                    this.generarObjetoProyectoResolucion()
                ).pipe(
                    catchError((response : HttpErrorResponse) =>{
                        this.dataService.Message().msgWarning(response.error.messages[0]);
                        return of(null);
                    }),
                    finalize(()=>{this.dataService.Spinner().hide("sp6");})
                ).subscribe(
                  (response:any) => {
                    if(response){
                        this.dataService.Message().msgAutoCloseSuccessNoButton('"OPERACIÓN REALIZADA DE FORMA EXITOSA."', 3000, () => {
                            this.matDialogRef.close(response);
                            return response;
                        });
                    }
                  });   
        },
        () => {}
    );
}
guardarEditarDocumentoSustentoYGenerarProyectoResolucionConBeneficioVacacionesTruncas(){
    this.dataService.Message().msgConfirm(
        "¿ESTÁ SEGURO QUE DESEA GUARDAR LA INFORMACIÓN DE LOS DOCUMENTOS DE SUSTENTO?",
        () => {
            this.dataService.Spinner().show("sp6");

            this.dataService
                .Beneficios()
                .guardarEditarBeneficioVacacionesTruncas(
                    this.generarObjetoProyectoResolucion()
                ).pipe(
                    catchError((response : HttpErrorResponse) =>{
                        this.dataService.Message().msgWarning(response.error.messages[0]);
                        return of(null);
                    }),
                    finalize(()=>{this.dataService.Spinner().hide("sp6");})
                ).subscribe(
                  (response:any) => {
                    if(response){
                        this.dataService.Message().msgAutoCloseSuccessNoButton('"OPERACIÓN REALIZADA DE FORMA EXITOSA."', 3000, () => {
                            this.matDialogRef.close(response);
                            return response;
                        });
                    }
                  });   
        },
        () => {}
    );
}
guardarEditarDocumentoSustentoYGenerarProyectoResolucionConBeneficioATS25(){
    this.dataService.Message().msgConfirm(
        "¿ESTÁ SEGURO QUE DESEA GUARDAR LA INFORMACIÓN DE LOS DOCUMENTOS DE SUSTENTO?",
        () => {
            this.dataService.Spinner().show("sp6");

            this.dataService
                .Beneficios()
                .guardarEditarBeneficioATS25(
                    this.generarObjetoProyectoResolucion()
                ).pipe(
                    catchError((response : HttpErrorResponse) =>{
                        this.dataService.Message().msgWarning(response.error.messages[0]);
                        return of(null);
                    }),
                    finalize(()=>{this.dataService.Spinner().hide("sp6");})
                ).subscribe(
                  (response:any) => {
                    if(response){
                        this.dataService.Message().msgAutoCloseSuccessNoButton('"OPERACIÓN REALIZADA DE FORMA EXITOSA."', 3000, () => {
                            this.matDialogRef.close(response);
                            return response;
                        });
                    }
                  });   
        },
        () => {}
    );
}
guardarEditarDocumentoSustentoYGenerarProyectoResolucionConBeneficioATS30(){
    this.dataService.Message().msgConfirm(
        "¿ESTÁ SEGURO QUE DESEA GUARDAR LA INFORMACIÓN DE LOS DOCUMENTOS DE SUSTENTO?",
        () => {
            this.dataService.Spinner().show("sp6");

            this.dataService
                .Beneficios()
                .guardarEditarBeneficioATS30(
                    this.generarObjetoProyectoResolucion()
                ).pipe(
                    catchError((response : HttpErrorResponse) =>{
                        this.dataService.Message().msgWarning(response.error.messages[0]);
                        return of(null);
                    }),
                    finalize(()=>{this.dataService.Spinner().hide("sp6");})
                ).subscribe(
                  (response:any) => {
                    if(response){
                        this.dataService.Message().msgAutoCloseSuccessNoButton('"OPERACIÓN REALIZADA DE FORMA EXITOSA."', 3000, () => {
                            this.matDialogRef.close(response);
                            return response;
                        });
                    }
                  });   
        },
        () => {}
    );
}
guardarEditarDocumentoSustentoYGenerarProyectoResolucionConBeneficioGTS25(){
    this.dataService.Message().msgConfirm(
        "¿ESTÁ SEGURO QUE DESEA GUARDAR LA INFORMACIÓN DE LOS DOCUMENTOS DE SUSTENTO?",
        () => {
            this.dataService.Spinner().show("sp6");

            this.dataService
                .Beneficios()
                .guardarEditarBeneficioGTS25(
                    this.generarObjetoProyectoResolucion()
                ).pipe(
                    catchError((response : HttpErrorResponse) =>{
                        this.dataService.Message().msgWarning(response.error.messages[0]);
                        return of(null);
                    }),
                    finalize(()=>{this.dataService.Spinner().hide("sp6");})
                ).subscribe(
                  (response:any) => {
                    if(response){
                        this.dataService.Message().msgAutoCloseSuccessNoButton('"OPERACIÓN REALIZADA DE FORMA EXITOSA."', 3000, () => {
                            this.matDialogRef.close(response);
                            return response;
                        });
                    }
                  });   
        },
        () => {}
    );
}
guardarEditarDocumentoSustentoYGenerarProyectoResolucionConBeneficioBonificacionFamiliar(){
    this.dataService.Message().msgConfirm(
        "¿ESTÁ SEGURO QUE DESEA GUARDAR LA INFORMACIÓN DE LOS DOCUMENTOS DE SUSTENTO?",
        () => {
            this.dataService.Spinner().show("sp6");

            this.dataService
                .Beneficios()
                .guardarEditarBeneficioBonificacionFamiliar(
                    this.generarObjetoProyectoResolucion()
                ).pipe(
                    catchError((response : HttpErrorResponse) =>{
                        this.dataService.Message().msgWarning(response.error.messages[0]);
                        return of(null);
                    }),
                    finalize(()=>{this.dataService.Spinner().hide("sp6");})
                ).subscribe(
                  (response:any) => {
                    if(response){
                        this.dataService.Message().msgAutoCloseSuccessNoButton('"OPERACIÓN REALIZADA DE FORMA EXITOSA."', 3000, () => {
                            this.matDialogRef.close(response);
                            return response;
                        });
                    }
                  });   
        },
        () => {}
    );
}
guardarEditarDocumentoSustentoYGenerarProyectoResolucionConBeneficioBonificacionPersonal(){
    this.dataService.Message().msgConfirm(
        "¿ESTÁ SEGURO QUE DESEA GUARDAR LA INFORMACIÓN DE LOS DOCUMENTOS DE SUSTENTO?",
        () => {
            this.dataService.Spinner().show("sp6");

            this.dataService
                .Beneficios()
                .guardarEditarBeneficioBonificacionPersonal(
                    this.generarObjetoProyectoResolucion()
                ).pipe(
                    catchError((response : HttpErrorResponse) =>{
                        this.dataService.Message().msgWarning(response.error.messages[0]);
                        return of(null);
                    }),
                    finalize(()=>{this.dataService.Spinner().hide("sp6");})
                ).subscribe(
                  (response:any) => {
                    if(response){
                        this.dataService.Message().msgAutoCloseSuccessNoButton('"OPERACIÓN REALIZADA DE FORMA EXITOSA."', 3000, () => {
                            this.matDialogRef.close(response);
                            return response;
                        });
                    }
                  });   
        },
        () => {}
    );
}
guardarEditarDocumentoSustentoYGenerarProyectoResolucionConBeneficioIncentivoEstudios(){
    this.dataService.Message().msgConfirm(
        "¿ESTÁ SEGURO QUE DESEA GUARDAR LA INFORMACIÓN DE LOS DOCUMENTOS DE SUSTENTO?",
        () => {
            this.dataService.Spinner().show("sp6");

            this.dataService
                .Beneficios()
                .guardarEditarBeneficioIncentivoEstudios(
                    this.generarObjetoProyectoResolucion()
                ).pipe(
                    catchError((response : HttpErrorResponse) =>{
                        this.dataService.Message().msgWarning(response.error.messages[0]);
                        return of(null);
                    }),
                    finalize(()=>{this.dataService.Spinner().hide("sp6");})
                ).subscribe(
                  (response:any) => {
                    if(response){
                        this.dataService.Message().msgAutoCloseSuccessNoButton('"OPERACIÓN REALIZADA DE FORMA EXITOSA."', 3000, () => {
                            this.matDialogRef.close(response);
                            return response;
                        });
                    }
                  });   
        },
        () => {}
    );
}
guardarEditarDocumentoSustentoYGenerarProyectoResolucionConBeneficioIncentivoProfesional(){
    this.dataService.Message().msgConfirm(
        "¿ESTÁ SEGURO QUE DESEA GUARDAR LA INFORMACIÓN DE LOS DOCUMENTOS DE SUSTENTO?",
        () => {
            this.dataService.Spinner().show("sp6");

            this.dataService
                .Beneficios()
                .guardarEditarBeneficioIncentivoProfesional(
                    this.generarObjetoProyectoResolucion()
                ).pipe(
                    catchError((response : HttpErrorResponse) =>{
                        this.dataService.Message().msgWarning(response.error.messages[0]);
                        return of(null);
                    }),
                    finalize(()=>{this.dataService.Spinner().hide("sp6");})
                ).subscribe(
                  (response:any) => {
                    if(response){
                        this.dataService.Message().msgAutoCloseSuccessNoButton('"OPERACIÓN REALIZADA DE FORMA EXITOSA."', 3000, () => {
                            this.matDialogRef.close(response);
                            return response;
                        });
                    }
                  });   
        },
        () => {}
    );
}
handleAdjunto(FILE) {
    if (FILE != null || FILE != undefined) {
        this.form.patchValue({ adjuntarDocumento: FILE.file });
    } else this.form.patchValue({ adjuntarDocumento: null });
}

handleMostrar(fileTEMP) {
    console.log("Mostrar pdf", fileTEMP);
    this.handlePreview(fileTEMP, fileTEMP.name);
}

handlePreview(file: any, codigoAdjuntoAdjunto: string) {
    console.log("mostrar pDF 2", file)
    this.dialogRef = this.materialDialog.open(DocumentViewerComponent, {
        panelClass: "modal-viewer-form-dialog",
        disableClose: true,
        data: {
            modal: {
                icon: "remove_red_eye",
                title: "Proyecto de Resolución",
                file: file,
                fileName: codigoAdjuntoAdjunto,
            },
        },
    });

    this.dialogRef.afterClosed().subscribe((response: any) => {
        if (!response) {
            //this.form.reset();
            //this.form.controls["idTipoResolucion"].setValue(-1);
            this.form.controls["idTipoDocumentoSustento"].setValue(-1);
            this.form.controls["numeroDocumentoSustento"].setErrors(null);
            this.form.controls["entidadEmisora"].setErrors(null);
            this.form.controls["numeroFolios"].setErrors(null);
            this.form.controls["idTipoFormatoSustento"].setValue(-1);
            this.form.controls["sumilla"].setErrors(null);
            this.form.controls["vistoDeProyecto"].setValue(-1);
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