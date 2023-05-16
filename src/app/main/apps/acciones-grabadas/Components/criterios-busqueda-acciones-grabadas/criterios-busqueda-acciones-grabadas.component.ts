import { Component,EventEmitter,Input,OnInit,Output,ViewEncapsulation } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRoute, Router } from "@angular/router";
import { mineduAnimations } from "@minedu/animations/animations";
import { DataService } from "app/core/data/data.service";
import { StorageService } from "app/core/data/services/storage.service";
import { ACCIONES_GRABADAS_MESSAGE } from "app/core/model/message";
import { PASSPORT_MESSAGE } from "app/core/model/messages-error";
import { SecurityModel } from "app/core/model/security/security.model";
import { MISSING_TOKEN, TablaTipoDocumentoIdentidad } from "app/core/model/types";
import { environment } from "environments/environment";
import { of } from "rxjs";
import { catchError, finalize, map } from "rxjs/operators";
import { TablaCatalogoNivelInstancia } from "../../Models/accionesGrabadas.model";
import { fechas } from "../../Models/fechas.model";
import { CODIGO_ROL_RESPONSABLE_PERSONAL, CODIGO_SISTEMA_PERSONAL, GRUPO_ACCION_PLAZA, TipoDocumentoIdentidadEnum } from "../../_utils/constants";
import { BuscarDocumentoIdentidadComponent } from "../buscar-documento-identidad/buscar-documento-identidad.component";
import { BuscarPlazaComponent } from "../buscar-plaza/buscar-plaza.component";


@Component({
    selector: "minedu-criterios-busqueda-acciones-grabadas",
    templateUrl: "./criterios-busqueda-acciones-grabadas.component.html",
    styleUrls: ["./criterios-busqueda-acciones-grabadas.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class CriteriosBusquedaAccionesGrabadasComponent implements OnInit {
    @Input() working = false;
    @Input() esConsultaResolucion = false;
    @Input() currentSession: SecurityModel = new SecurityModel();

    @Output() mineduOnClick: EventEmitter<any> = new EventEmitter<any>();
    @Output() mineduOnClickExportar: EventEmitter<any> = new EventEmitter<any>();

    

    tiposDocumento: any[] = [];
    aniosAperturados: any[] = [];

    regimenesLaborales: any[] = [];
    gruposAccion: any[] = [];

    acciones: any[] = [];
    motivosAccion: any[] = [];

    estados: any[] = [];
    maximo: number = 12;

    now = new Date();
    form: FormGroup;
    dialogRef: any;

    anioActual;

    textComboDefault = "TODOS";
    consultaPersonal: boolean = false;

    
    minLengthnumeroDocumentoIdentidad: number;
    maxLengthnumeroDocumentoIdentidad: number;
    
    instancias: any[] = [];
    subInstancias: any[] = [];
    mostrarInstancia: boolean = false;
    mostrarSubinstancia: boolean = false;

    dataForm:any;

    data: any = {
        idNivelInstancia: null,
        idEntidadSede: null,
        idOtraInstancia: null,
        idDre: null,
        idUgel: null,
        idRolPassport: null,
        codigoRolPassport: null,
        descripcionRolPassport: null,
    };

    constructor(
        private route: ActivatedRoute,
        private formBuilder: FormBuilder,
        private dataService: DataService,
        private storageService: StorageService,
        private materialDialog: MatDialog,
        private router: Router
    ) {}

    FechaAnioMax=fechas.obtenerFechaMasAnios(this.now,1);
    fechaInicioAnio=fechas.obtenerFechaInicioDelAnioIngresado(this.now);
    fechaInicioAnioHasta=fechas.obtenerFechaInicioDelAnioIngresado(this.now);
    fechaFinAnio=fechas.obtenerFechaFinDelAnioIngresado(this.FechaAnioMax);

    ngOnInit() {
        // this.datosSede(); 
        this.buildForm();
        setTimeout(() => { this.buildData();}, 0);
        //   this.route.data.subscribe((data) => {
        //       this.tiposDocumento = data["TiposDocumentoIdentidad"]["data"] || [];
        //       this.regimenesLaborales = data["RegimenesLaborales"]["data"] || [];
        //       this.aniosAperturados = this.comprobarListaAnios(data["AniosAperturados"]["data"] || [])
        //       this.estados = data["EstadosAccionesGrabadas"]["data"] || [];
        //   });

        setTimeout(() => {
            this.loadTiposDocumento();
            this.loadRegimenesLaborales();
            // this.loadAniosAperturados();
            this.loadEstados();
            // this.loadGruposAccion();
            // this.loadAcciones();
            // this.loadMotivosAccion();
            // this.derivacionRolGrupoAcciones();
            // this.loadInstancias();
        }, 0);      
          
    }
    buildData(): void {

        this.form.get("idGrupoAccion").setValue(0);
        this.form.get("idMotivoAccion").setValue(0);
        this.form.get("idAccion").setValue(0);
    }
    //Verificacion

    // derivacionRolGrupoAcciones(){
        
    //   let consultaPersonal =
    //         this.dataService.Storage().getPassportRolSelected().CODIGO_ROL ==
    //             CODIGO_ROL_RESPONSABLE_PERSONAL; 

    //         console.log('Informacion del storage ',this.dataService.Storage().getPassportRolSelected() );


    //     if(!consultaPersonal){
    //         //console.log('1');
    //         this.loadGruposAccion();
    //    }
    //     else
    //        //console.log('2');
    //        this.loadGruposAccionFiltrado( );
    // }

    definirFechaValorMin(valueIni,valueCampo){    
        const fechaValueini=new Date(valueIni);
        const fechavalueCampo=new Date(valueCampo);  
        let fechaEvaluar=new Date();      
        fechaEvaluar=(fechaValueini.getFullYear()>=fechavalueCampo.getFullYear()?
            fechas.obtenerFechaInicioDelAnioIngresado(this.now):
            fechavalueCampo);
        return fechaEvaluar;
    }

    loadTiposDocumento() {
        this.dataService.Spinner().show("sp6"); /////
        this.dataService
            .AccionesGrabadas()
            .getTiposDocumentoIdentidad()
            .pipe(
                catchError((e) => {
                    return of(e);
                }),
                finalize(() => {
                    this.dataService.Spinner().hide("sp6");
                })
            )
            .subscribe((response) => {
                if(response){
                    this.tiposDocumento = response;
                }
                else{
                    this.dataService.Message().msgInfo(PASSPORT_MESSAGE.SESION_END, () => {
                        this.dataService.Storage().passportUILogin();
                    });
                }
            });
    }

    loadRegimenesLaborales() {
        this.dataService.Spinner().show("sp6"); /////
        // var currentSession = this.dataService.Storage().getInformacionUsuario();
        const data={
            codTipoSede: this.currentSession.codigoTipoSede,
            codRol:this.currentSession.codigoRol
        }
        console.log(data);
        this.dataService
            .AccionesGrabadas()
            .getRegimenesLaboralesPorRolyTipoSede(data)
            .pipe(
                catchError((e) => {
                    return of(e);
                }),
                finalize(() => {
                    this.dataService.Spinner().hide("sp6");
                })
            )
            .subscribe((response) => {    
                if(response){
                    this.regimenesLaborales = response;
                    
                    const itemAll = {
                        idRegimenLaboral: 0,
                        descripcionRegimenLaboral: this.textComboDefault,
                    };

                    const data = response.map((x) => ({
                        ...x,
                        idRegimenLaboral: x.idRegimenLaboral,
                        descripcionRegimenLaboral: `${x.descripcionRegimenLaboral}`,
                    }));

                    response.unshift(itemAll);

                    this.form.get("idRegimenLaboral").setValue(0);
                }
                else{
                    this.dataService.Message().msgInfo(PASSPORT_MESSAGE.SESION_END, () => {
                            this.dataService.Storage().passportUILogin();
                        });
                }
            });
    }

    loadAniosAperturados() {
        this.dataService.Spinner().show("sp6"); /////
        this.dataService
            .AccionesGrabadas()
            .getAniosAperturados()
            .pipe(
                catchError((e) => {
                    return of(e);
                }),
                finalize(() => {
                    this.dataService.Spinner().hide("sp6");
                })
            )
            .subscribe((response) => {
                // if (response && response.result) {
                //     this.aniosAperturados = response.data;
                //     if (this.aniosAperturados.length < 1)
                //         this.comprobarListaAnios(this.estados);

                //     console.log("Años aperturados ", this.aniosAperturados);
                // } else if (
                //     response &&
                //     (response.statusCode === 401 ||
                //         response.error === MISSING_TOKEN.INVALID_TOKEN)
                // ) {
                //     this.dataService
                //         .Message()
                //         .msgInfo(PASSPORT_MESSAGE.SESION_END, () => {
                //             this.dataService.Storage().passportUILogin();
                //         });
                // }      
                if(response){
                    this.aniosAperturados = response;
                    if (this.aniosAperturados.length < 1)
                        this.comprobarListaAnios(this.estados);
                }
                else{
                    this.dataService.Message().msgInfo(PASSPORT_MESSAGE.SESION_END, () => {
                            this.dataService.Storage().passportUILogin();
                        });
                }
            });
    }

    comprobarListaAnios(data: any) {
        const anio = new Date();
        if (data.length == 0) {
            data = [
                {
                    idCatalogoItem: anio.getFullYear(),
                    descripcionCatalogoItem: anio.getFullYear(),
                },
            ];
        }
        return data;
    }

    loadEstados() {
        this.dataService.Spinner().show("sp6"); /////
        this.dataService
            .AccionesGrabadas()
            .getEstadosAccionesGrabadas()
            .pipe(
                catchError((e) => {
                    return of(e);
                }),
                finalize(() => {
                    this.dataService.Spinner().hide("sp6");
                })
            )
            .subscribe((response) => {
                // if (response && response.result) {
                //     this.estados = response.data;
                // } else if (
                //     response &&
                //     (response.statusCode === 401 ||
                //         response.error === MISSING_TOKEN.INVALID_TOKEN)
                // ) {
                //     this.dataService
                //         .Message()
                //         .msgInfo(PASSPORT_MESSAGE.SESION_END, () => {
                //             this.dataService.Storage().passportUILogin();
                //         });
                // }  
                if(response){
                    this.estados = response;
                }
                else{
                    this.dataService.Message().msgInfo(PASSPORT_MESSAGE.SESION_END, () => {
                            this.dataService.Storage().passportUILogin();
                        });
                }
            });
    }

    loadGruposAccion(idRegimen:any) {
        // let sistema =environment.personalDesplazamiento.CODIGO_SISTEMA;
        this.form.controls['idGrupoAccion'].setValue(0);
        this.form.controls['idAccion'].setValue(0);
        this.form.controls['idMotivoAccion'].setValue(0);
        this.gruposAccion=[];
        this.acciones = [];
        this.motivosAccion= [];
        // var currentSession = this.dataService.Storage().getInformacionUsuario();
        const data={
            idRegimenLaboral: idRegimen,
            codTipoSede: this.currentSession.codigoTipoSede,
            codRol:this.currentSession.codigoRol
        }
        console.log(data);
        this.dataService.Spinner().show("sp6"); /////
        this.dataService
            .AccionesGrabadas()
            .getGrupoAccionPorRegimenLaboralPorRolTipoSede(data)
            .pipe(
                catchError((e) => {
                    return of(e);
                }),
                finalize(() => {
                    this.dataService.Spinner().hide("sp6");
                })
            )
            .subscribe((response) => {       
                if(response){
                    this.gruposAccion = response;
                    this.form.get("idGrupoAccion").setValue(0);
                }
                else{
                    this.dataService.Message().msgInfo(PASSPORT_MESSAGE.SESION_END, () => {
                            this.dataService.Storage().passportUILogin();
                        });
                }
            });
    }

    loadGruposAccionFiltrado(sistema:string) {
        this.dataService.Spinner().show("sp6"); /////
        this.dataService
            .AccionesGrabadas()
            .getGruposAccion()
            .pipe(
                catchError((e) => {
                    return of(e);
                }),
                finalize(() => {
                    this.dataService.Spinner().hide("sp6");
                })
            )
            .subscribe((response) => {
             
                // if (response && response.result) {
                
                //         this.gruposAccion = response.data;
                 
                //         let grupoFiltrado = this.gruposAccion.filter(
                //         (m) => m.idGrupoAccion > GRUPO_ACCION_PLAZA
                //         ); 
                //         this.gruposAccion = grupoFiltrado;
                //         console.log('cargo..')
                // } else if (
                //     response && 
                //     (response.statusCode === 401 ||
                //         response.error === MISSING_TOKEN.INVALID_TOKEN)
                // ) {
                //     this.dataService
                //         .Message()
                //         .msgInfo(PASSPORT_MESSAGE.SESION_END, () => {
                //             this.dataService.Storage().passportUILogin();
                //         });
                // }       
                if(response){
                    this.gruposAccion = response;
                }
                else{
                    this.dataService.Message().msgInfo(PASSPORT_MESSAGE.SESION_END, () => {
                            this.dataService.Storage().passportUILogin();
                        });
                }
            });
    }

    buildForm() {
        this.anioActual = new Date();
        this.form = this.formBuilder.group({
            anio: [this.anioActual],
            idTipoDocumentoIdentidad: ["-1", null],
            numeroDocumentoIdentidad: [null],
            idCodigoPlaza: [null],
            idRegimenLaboral: [null],
            idGrupoAccion: [null],
            idAccion: [null],
            idMotivoAccion: [null],
            fechaVigenciaInicio: [null],
            fechaVigenciaFin: [null],
            idEstadoAccionGrabada: ["-1", null],
            codigoProyectoResolucion: [null, Validators.maxLength(6)],
            esMandatoJudicial: ["-1"],
            // idInstancia: [""],
            // idSubInstancia: [""],
            // idNivelInstancia: [""],
            // idDre: [""],
            // idUgel: [""],
            // idOtraInstancia: [""]
        });

        // this.form.get("idInstancia").valueChanges.subscribe((value) => {
        //     if (value !== null && value !== undefined && value !== "") {
        //         const data = this.instancias.find((x) => x.idInstancia === value);
        //         var idEntidadSedes = parseInt(value.split("-")[0].toString());
        //         var idInstancia = data.idInstancia;
               
        //         if (idEntidadSedes == TablaCatalogoNivelInstancia.MINEDU)
        //             this.mostrarOpciones(true, false);
        //         else
        //             this.mostrarOpciones(true, true);

        //         this.listarSubInstancias(idInstancia);
        //     } else {
        //         this.mostrarOpciones(true, false);
        //     }
        // });
        
        this.form.get("fechaVigenciaInicio").valueChanges.subscribe((value) => {
            this.form.get("fechaVigenciaFin").setValue(null);
            if (value) {
                this.fechaInicioAnioHasta = value;
            } else {
                this.fechaInicioAnioHasta = fechas.obtenerFechaInicioDelAnioIngresado(this.now);
            }
        });

        this.form.get("numeroDocumentoIdentidad").disable();

        this.form.get("idRegimenLaboral").valueChanges.subscribe((value) => {
            if (value) {
                this.loadGruposAccion(value);
                this.form.controls.idGrupoAccion.enable();
            } else {
                
                this.gruposAccion = [
                    { descripcionGrupoAccion: this.textComboDefault, idGrupoAccion: 0 },
                ];
                this.form.controls.idGrupoAccion.disable();
            }
        });
        

        this.form.get("idGrupoAccion").valueChanges.subscribe((value) => {
            if (value) {
                this.loadAcciones(value);
                this.form.controls.idAccion.enable();
            } else {
                this.acciones = [
                    { descripcionAccion: this.textComboDefault, idAccion: 0 },
                ];
                this.form.controls.idAccion.disable();
            }
        });

        this.form.get("idAccion").valueChanges.subscribe((value) => {
            if (value) {
                this.loadMotivosAccion(
                    value
                );
                this.form.controls.idMotivoAccion.enable();
            } else {
                this.motivosAccion = [
                    { descripcionMotivoAccion: this.textComboDefault, idMotivoAccion: 0 },
                ];
                this.form.controls.idMotivoAccion.disable();
            }
        });
    }

    // private validarTipoDocumentoIdentidad = (value: number) => {
    //     this.maximo = 8;
    //     const tipoDocumentoIdentidad = this.tiposDocumento.find(
    //         (pred) => pred.idCatalogoItem === value
    //     );
    //     let validatorNumeroDocumento = null;
    //     switch (tipoDocumentoIdentidad?.codigoCatalogoItem) {
    //         case TablaTipoDocumentoIdentidad.DNI:
    //             this.maximo = 8;
    //             validatorNumeroDocumento = Validators.compose([
    //                 Validators.minLength(this.maximo),
    //                 Validators.maxLength(this.maximo),
    //                 Validators.pattern("^[0-9]*$"),
    //             ]);
    //             break;
    //         case TablaTipoDocumentoIdentidad.CARNET_DE_EXTRANJERIA:
    //             this.maximo = 12;
    //             validatorNumeroDocumento = Validators.compose([
    //                 Validators.minLength(this.maximo),
    //                 Validators.maxLength(this.maximo),
    //                 Validators.pattern("^[a-zA-Z0-9]*$"),
    //             ]);
    //             break;
    //         case TablaTipoDocumentoIdentidad.PASAPORTE:
    //             this.maximo = 12;
    //             validatorNumeroDocumento = Validators.compose([
    //                 Validators.minLength(this.maximo),
    //                 Validators.maxLength(this.maximo),
    //                 Validators.pattern("^[a-zA-Z0-9]*$"),
    //             ]);
    //             break;
    //         default:
    //             this.maximo = 8;
    //             break;
    //     }

    //     const numeroDocumentoIdentidad = this.form.get(
    //         "numeroDocumentoIdentidad"
    //     );

    //     numeroDocumentoIdentidad.setValidators(validatorNumeroDocumento);
    //     numeroDocumentoIdentidad.updateValueAndValidity();
    // };

    loadAcciones(idGrupoAccion:any) {
        this.form.controls['idAccion'].setValue(0);
        this.form.controls['idMotivoAccion'].setValue(0);
        this.acciones = [];
        this.motivosAccion= [];
        // let data= {
        //     idGrupoAccion: idGrupoAccion,
        //     idRegimenLaboral:  this.form.get('idRegimenLaboral').value,
        //     activo: true
        // };
        // var currentSession = this.dataService.Storage().getInformacionUsuario();
        const data={
            idRegimenLaboral:  this.form.get('idRegimenLaboral').value,
            idGrupoAccion: idGrupoAccion,
            codTipoSede: this.currentSession.codigoTipoSede,
            codRol:this.currentSession.codigoRol
        }

        console.log(data);
        this.dataService.Spinner().show("sp6");
        // const form = this.form.value;
        this.dataService
            .AccionesGrabadas()
            // .getAcciones()
            // .getAccionesporGrupo(data)
            .getAccionPorRegimenLaboralPorGrupoAccionPorRolPorTipoSede(data)
            .pipe(
                catchError((e) => {
                    return of(e);
                }),
                finalize(() => {
                    this.dataService.Spinner().hide("sp6");
                })
            )
            .subscribe((response) => {
                if(response){
                    response = response ? response : [];
                    const itemAll = {
                        idAccion: 0,
                        descripcionAccion: this.textComboDefault,
                    };
                    response.unshift(itemAll);
                    const data = response.map((x) => ({
                        ...x,
                        idAccion: x.idAccion,
                        descripcionAccion: `${x.descripcionAccion}`,
                    }));
                    this.acciones = data;
                    this.form.get("idAccion").setValue(0);
                }
                else{
                    this.dataService.Message().msgInfo(PASSPORT_MESSAGE.SESION_END, () => {
                            this.dataService.Storage().passportUILogin();
                        });
                }
            });
    }

    loadMotivosAccion(idAccion:any) {
        this.form.controls['idMotivoAccion'].setValue(0);
        this.motivosAccion= [];
        // let data= {
        //     idAccion: idAccion,
        //     idGrupoAccion: this.form.get('idGrupoAccion').value,
        //     idRegimenLaboral:  this.form.get('idRegimenLaboral').value,
        //     activo: true
        // };
        
        // var currentSession = this.dataService.Storage().getInformacionUsuario();
        const data={
            idRegimenLaboral:  this.form.get('idRegimenLaboral').value,
            idGrupoAccion: this.form.get('idGrupoAccion').value,
            idAccion: idAccion,
            codTipoSede: this.currentSession.codigoTipoSede,
            codRol:this.currentSession.codigoRol
        }
        console.log(data);
        this.dataService.Spinner().show("sp6");
        const form = this.form.value;
        this.dataService
            .AccionesGrabadas()
            // .getMotivosAccion()
            // .getMotivosAccionporAccion(data)
            .getMotivoAccionPorRegimenLaboralPorGrupoAccionPorAccionPorRolPorTipoSede(data)
            .pipe(
                catchError((e) => {
                    return of(e);
                }),
                finalize(() => {
                    this.dataService.Spinner().hide("sp6");
                })
            )
            .subscribe((response) => {         
                if(response){
                    response = response ? response : [];

                    const itemAll = {
                        idMotivoAccion: 0,
                        descripcionMotivoAccion: this.textComboDefault,
                    };
                    response.unshift(itemAll);
                    const data = response.map((x) => ({
                        ...x,
                        idMotivoAccion: x.idMotivoAccion,
                        descripcionMotivoAccion: `${x.descripcionMotivoAccion}`,
                    }));
                    this.motivosAccion = data;
                    this.form.get("idMotivoAccion").setValue(0);
                }
                else{
                    this.dataService.Message().msgInfo(PASSPORT_MESSAGE.SESION_END, () => {
                            this.dataService.Storage().passportUILogin();
                        });
                }
            });
    }

    validDataForm(){
        let brespuesta:Boolean=false;
        if (!this.form.valid) {
            let mensajes="";
            if(this.form.controls.idTipoDocumentoIdentidad.value>0){
                if (this.form.controls.numeroDocumentoIdentidad.valid == false) {
                    let mensajeNumDocumento=(this.form.get("idTipoDocumentoIdentidad").value === TipoDocumentoIdentidadEnum.DNI ? ACCIONES_GRABADAS_MESSAGE.M34 : ACCIONES_GRABADAS_MESSAGE.M116);
                    mensajes=(mensajes.length==0?mensajeNumDocumento:mensajes+", "+mensajeNumDocumento);                
                }
            }
            
            if (this.form.controls.idCodigoPlaza.valid == false) {
                mensajes=(mensajes.length==0?ACCIONES_GRABADAS_MESSAGE.M64:mensajes+", "+ACCIONES_GRABADAS_MESSAGE.M64);                
            }
            
            mensajes=(mensajes.length==0?'"EXISTEN ERRORES, REVISAR LOS CRITERIOS DE BÚSQUEDA"':mensajes);
            this.dataService.Message().msgWarning(mensajes, () => { });

            return brespuesta=true;
        }

        if(this.form.controls.fechaVigenciaInicio.value!=null && this.form.controls.fechaVigenciaFin.value!=null){
            if(Date.parse(this.form.controls.fechaVigenciaInicio.value) < Date.parse(this.form.controls.fechaVigenciaFin.value)){
                this.dataService
                .Message().msgWarning(
                    '"LA FECHA FIN NO PUEDE SER MENOR A LA FECHA INICIO"',
                    () => { });
                return brespuesta=true;
            }
        }
        if(this.form.controls.fechaVigenciaInicio.value!=null && this.form.controls.fechaVigenciaFin.value==null)
        {
            this.dataService
            .Message().msgWarning(
                '"DEBE DE INGRESAR LA FECHA FIN"',
                () => { });
            return brespuesta=true;
        }
    
        if(this.form.controls.fechaVigenciaInicio.value==null && this.form.controls.fechaVigenciaFin.value!=null)
        {
            this.dataService
            .Message().msgWarning(
                '"DEBE DE INGRESAR LA FECHA INICIO"',
                () => { });
            return brespuesta=true;
        }       

        return brespuesta;
    }

    onClickChild(event) {       
        if(this.validDataForm()){
            event.preventDefault();
            return { form: this.dataForm, isClean: true };
        }
        this.dataFormValue(true);
        if (this.mineduOnClick) {
            const info = { form: this.dataForm, isClean: false };
            this.mineduOnClick.next(info);
        }
    }

    dataFormValue(butonAccion:boolean=false){
        this.dataForm = {
            ...this.form.value,
            butonAccion:butonAccion
        };
        // if(!dataForm.idInstancia) {
        //     let InstanciaControl=this.form.get('idInstancia').value;
        //     let InstanciaValue=InstanciaControl.split("-")[1];
        //     if(InstanciaValue!='null'){
        //         dataForm ={ ...dataForm,
        //                     'idInstancia':this.form.get('idInstancia').value
        //         }
        //     }
        // }
        // if(dataForm.idInstancia.split("-")[1]=='null'){
        //     dataForm.idInstancia="";
        // }
        // if(!dataForm.idSubInstancia) {
        //     let SubInstanciaControl=this.form.get('idSubInstancia').value;
        //     let SubInstanciaValue=SubInstanciaControl.split("-")[1];            
        //     if(SubInstanciaValue!='null'){
        //         dataForm ={ ...dataForm,
        //                     'idSubInstancia':this.form.get('idSubInstancia').value,
        //         }
        //     }
        // }
        // if(dataForm.idSubInstancia.split("-")[1]=='null'){
        //     dataForm.idSubInstancia="";
        // }
    }

    exportarData(){
        if(this.validDataForm()){
            return { form: this.dataForm, isClean: true };
        }
        this.dataFormValue();
        if (this.mineduOnClick) {
            return { form: this.dataForm, isClean: false };
        }
    }

    limpiar() {
        this.form.patchValue({
            fechaResolucion: null,
            idTipoDocumentoIdentidad: "-1",
            numeroDocumentoIdentidad: null,
            idRegimenLaboral: 0,
            idGrupoAccion: 0,
            idAccion: 0,
            idMotivoAccion: 0,
            codigoCentroTrabajo: null,
            codigoProyectoResolucion: null,
            razonSocialInstitucionEducativa: null,
            idEstadoResolucion: null,
            idSituacionResolucion: null,
            idCodigoPlaza: null,
            fechaVigenciaInicio: null,
            fechaVigenciaFin: null,
            idEstadoAccionGrabada: "-1",
            anio: this.anioActual,
            esMandatoJudicial: "-1"
        });

        this.now = new Date();
        this.form.get("numeroDocumentoIdentidad").disable();
        // this.loadInstancias();

       this.dataFormValue();

        const info = { form: this.dataForm, isClean: false };

        this.mineduOnClick.next(info);
    }

    buscarPersonaDialog() {
        this.dialogRef = this.materialDialog.open(
            BuscarDocumentoIdentidadComponent,
            {
                panelClass: "buscar-documento-identidad-form-dialog",
                disableClose: true,
                data: {
                    action: "buscar",
                    centroEstudio: this.form.value
                },
            }
        );

        this.dialogRef.afterClosed().subscribe((response: any) => {
            if (!response) {
                return;
            }
            const servidorPublico = response.servidorPublico;
            this.form.get("idTipoDocumentoIdentidad").setValue(servidorPublico.codigoTipoDocumentoIdentidad);
            this.selectTipoDocumento(servidorPublico.codigoTipoDocumentoIdentidad);
            this.form.get("numeroDocumentoIdentidad").setValue(servidorPublico.numeroDocumentoIdentidad);
        });
    }

    buscarPlazaDialog() {
        this.dialogRef = this.materialDialog.open(BuscarPlazaComponent, {
            panelClass: "buscar-plaza-form-dialog",
            width: "1200px",
            disableClose: true,
            data: {
                action: "buscar",
                centroEstudio: this.form.value,
                currentSession: this.currentSession
            },
        });
        this.dialogRef.afterClosed().subscribe((response: any) => {
            if (!response) {
                return;
            }
            this.form.patchValue({
                idCodigoPlaza: response.plaza.codigoPlaza.trim(),
            });
        });
    }

    // onKeyOnlyNumbers(e) {
    //     const idTipoDocumentoIdentidad = this.form.get(
    //         "idTipoDocumentoIdentidad"
    //     ).value;
    //     let permiteIngreso = true;
    //     const tipoDocumentoIdentidad = this.tiposDocumento.find(
    //         (pred) => pred.idCatalogoItem === idTipoDocumentoIdentidad
    //     );
    //     switch (tipoDocumentoIdentidad?.codigoCatalogoItem) {
    //         case TablaTipoDocumentoIdentidad.DNI:
    //             if (e.keyCode == 13 || (e.keyCode >= 48 && e.keyCode <= 57)) {
    //                 permiteIngreso = true;
    //             } else {
    //                 permiteIngreso = false;
    //             }
    //             break;
    //         case TablaTipoDocumentoIdentidad.CARNET_DE_EXTRANJERIA:
    //             permiteIngreso = true;

    //             break;
    //         case TablaTipoDocumentoIdentidad.PASAPORTE:
    //             permiteIngreso = true;

    //             break;
    //         default:
    //             permiteIngreso = false;
    //             break;
    //     }
    //     return permiteIngreso;
    // }
    selectTipoDocumento(tipoDocumento: number): void {
        this.form.get("numeroDocumentoIdentidad").setValue("");
        this.minLengthnumeroDocumentoIdentidad = tipoDocumento === TipoDocumentoIdentidadEnum.DNI ? 8 : 9;
        this.maxLengthnumeroDocumentoIdentidad = tipoDocumento === TipoDocumentoIdentidadEnum.DNI ? 8 : 12;
        
        if(tipoDocumento===null || 
           tipoDocumento===undefined || 
           tipoDocumento<=0)this.form.get("numeroDocumentoIdentidad").disable();
        else this.form.get("numeroDocumentoIdentidad").enable();

        this.form
            .get("numeroDocumentoIdentidad")
            .setValidators([
                Validators.minLength(this.minLengthnumeroDocumentoIdentidad),
                Validators.maxLength(this.maxLengthnumeroDocumentoIdentidad)
            ]);
    };
    validaNumericos = (event) => {
        if (event.charCode >= 48 && event.charCode <= 57) {
            return true;
        }
        return false;
    };

    validatexto(){
        if(this.maxLengthnumeroDocumentoIdentidad==8)
        if(!Number( this.form.get("numeroDocumentoIdentidad").value))
        this.form.get("numeroDocumentoIdentidad").setValue("");
    };

    validaNumerosyLetras = (event) => {
    
        if (event.charCode >= 48 && event.charCode <= 57) {
            return true;
        }
        var key = event.keyCode || event.which,
        tecla = String.fromCharCode(key).toLowerCase(),
        letras = " 0123456789áéíóúabcdefghijklmnñopqrstuvwxyz",
        especiales = [8, 37, 39, 46],
        tecla_especial = false;

        for (var i in especiales) {
        if (key == especiales[i]) {
            tecla_especial = true;
            break;
        }
        }

        if (letras.indexOf(tecla) == -1 && !tecla_especial) {
        return false;
        }
   };
  
    // datosSede(){
    //     var currentSession = this.dataService.Storage().getInformacionUsuario();
    //     const data={
    //         codigoSede: currentSession.codigoSede,
    //         activo:true
    //     }
    //     this.dataService
    //         .AccionesGrabadas()
    //         .obtenerCentroTrabajoPorCodigoSede(data).pipe(catchError((e) => of([e])),
    //         finalize(() => {})
    //     )
    //     .subscribe((response) => {
            
    //         this.data.idNivelInstancia=response.codigoNivelInstancia;
    //         this.data.idEntidadSede=response.idEntidadSede;
    //         this.data.idOtraInstancia = response.idOtraInstancia;
    //         this.data.idDre = response.idDre;
    //         this.data.idUgel = response.idUgel;
        
    //         this.form.controls['idNivelInstancia'].setValue(this.data.idNivelInstancia);
    //         this.form.controls['idDre'].setValue(this.data.idDre);
    //         this.form.controls['idUgel'].setValue(this.data.idUgel);
    //         this.form.controls['idOtraInstancia'].setValue(this.data.idOtraInstancia);
        
    //         this.storageService.setCurrentSession(this.data);
    //     });
    // }

    // loadInstancias(){       
    //     this.dataService
    //             .AccionesGrabadas()
    //             .listarInstancia(true)
    //             .pipe(
    //                 catchError((e) => of(e)),
    //                 map((response: any) => response)
    //             )
    //             .subscribe((response) => {
    //                 if (response) {
                        
    //                     this.instancias = response;  
    //                     switch (parseInt(this.data.idNivelInstancia)) {
    //                         case TablaCatalogoNivelInstancia.MINEDU: {
    //                             const idInstancia = this.data.idNivelInstancia + '-' + this.data.idOtraInstancia;
    //                             this.form.controls['idInstancia'].setValue(idInstancia);
    //                             this.form.controls['idInstancia'].enable();
    //                             this.mostrarSubinstancia = true;
    //                             break;
    //                         }
    //                         case TablaCatalogoNivelInstancia.DRE: {
    //                             const idInstancia = this.data.idNivelInstancia + '-' + this.data.idDre;
    //                             this.form.controls['idInstancia'].setValue(idInstancia);
    //                             this.form.controls['idInstancia'].disable();
    //                             this.mostrarSubinstancia = true;                     
    //                             break;
    //                         }
    //                         case TablaCatalogoNivelInstancia.UGEL: {
    //                             const idInstanciax = TablaCatalogoNivelInstancia.DRE + '-' + this.data.idDre;                          
    //                             this.form.controls['idInstancia'].setValue(idInstanciax);
    //                             this.form.controls['idInstancia'].disable();
                                                            
    //                             // const idSubinstanciax = this.data.idNivelInstancia + "-" + this.data.idUgel;
                                
    //                             // setTimeout(() => { this.form.controls["idSubInstancia"].setValue(idSubinstanciax);}, 7000);
    //                             this.form.controls["idSubInstancia"].disable();
    //                             this.mostrarSubinstancia = true;
    //                             break;
    //                         }
    //                     }
    //                 } 
    //             });
    // }

    // listarSubInstancias(idInstancia: any) {
    //     var instancia = idInstancia.split("-")[0];
        
    //     if (instancia == TablaCatalogoNivelInstancia.DRE) {
    //         this.dataService
    //         .AccionesGrabadas()
    //         .listarSubinstancia(idInstancia.split("-")[1], true)
    //         .pipe(
    //             catchError((e) => of(e)),
    //             map((response: any) => response)
    //         )
    //         .subscribe((response) => {
    //             if (response) {
    //                 this.subInstancias = response;  

    //                 const idSubinstanciax = this.data.idNivelInstancia + "-" + this.data.idUgel;
    //                 this.form.controls["idSubInstancia"].setValue(idSubinstanciax);

    //             } else if (response && (response.statusCode === 401 || response.error === MISSING_TOKEN.INVALID_TOKEN)) {
    //                 this.dataService.Message().msgInfo(PASSPORT_MESSAGE.SESION_END, () => { this.dataService.Storage().passportUILogin(); });
    //             }
    //         });
    //     }

    //     if (instancia == TablaCatalogoNivelInstancia.MINEDU)
    //         this.mostrarSubinstancia = false;
    // }
    // mostrarOpciones(instancia, subinstancia) {
    //     this.mostrarInstancia = instancia;
    //     this.mostrarSubinstancia = subinstancia;
    // }

}
