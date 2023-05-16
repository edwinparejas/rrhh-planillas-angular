import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DataService } from 'app/core/data/data.service';
import { SecurityModel } from 'app/core/model/security/security.model';
import { SharedService } from 'app/core/shared/shared.service';
import { EtapaProcesoResponseModel, ResultadoOperacionEnum } from '../../models/reasignacion.model';
import { HttpClient } from '@angular/common/http';
import { TablaPermisos } from 'app/core/model/types';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { mineduAnimations } from '@minedu/animations/animations';
import { ConvocarPlazasObservadasComponent } from '../components/convocar-plazas-observadas/convocar-plazas-observadas.component';
import { ConvocarPlazasConvocadasComponent } from '../components/convocar-plazas-convocadas/convocar-plazas-convocadas.component';
import { analyzeAndValidateNgModules } from '@angular/compiler';
import { RechazarPlazasConvocadasComponent } from '../components/rechazar-plazas-convocadas/rechazar-plazas-convocadas.component';

@Component({
  selector: 'minedu-convocar-plazas',
  templateUrl: './convocar-plazas.component.html',
  styleUrls: ['./convocar-plazas.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations,
})
export class ConvocarPlazasComponent implements OnInit {

  @ViewChild(ConvocarPlazasConvocadasComponent) private convocarPlazasConvocadasComponent: ConvocarPlazasConvocadasComponent;
  @ViewChild(ConvocarPlazasObservadasComponent) private convocarPlazasObservadasComponent: ConvocarPlazasObservadasComponent;
  etapaResponse: any = {};
  form: FormGroup;
  etapa: EtapaProcesoResponseModel = new EtapaProcesoResponseModel();
  idep: number;
  idcp: number;
  currentSession: SecurityModel = new SecurityModel();
  ipAddress = '';
  instancia = '';
  situacion: any;
  idConsolidadoPlaza: number;
  subinstancia = '';
  dialogRef: any;
  selectedTabIndex = 0;
  consolidadoPlaza: any = {};
  comboLists = {
    listCodigoModular: [],
    listCodigoPlaza: []
  };

  request = {
    idep: null,
    idcp: null,
    operacion: null,
    codigo_modular: null,
    codigo_plaza: null
  };

  isMobile = false;
  getIsMobile(): boolean {
    const w = document.documentElement.clientWidth;
    const breakpoint = 992;
    if (w < breakpoint) {
      return true;
    } else {
      return false;
    }
  }
  permisos = {
    autorizadoAgregar: false,
    autorizadoModificar: false,
    autorizadoEliminar: false,
    autorizadoEnviar: false,
    autorizadoExportar: false
  };
  constructor(
    private dataService: DataService,
    private formBuilder: FormBuilder,
    private sharedService: SharedService,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private materialDialog: MatDialog,
  ) { }

  ngOnInit(): void {
    setTimeout(_ => this.buildShared());
    this.buildForm();
    this.handleResponsive();
    this.buildSeguridad();
    this.route.params.subscribe(
      params => {
        this.idep = parseInt(params['id']);
        this.idcp = parseInt(params['idcp']);
        // this.instancia = params['instancia'];
        // this.subinstancia = params['subinstancia'];
        this.buscarEtapaProceso();
      });
    this.obtenerConsolidadoPlaza();
  }

  buildShared() {
    this.sharedService.setSharedBreadcrumb("Consolidado / Listado de Plazas");
    this.sharedService.setSharedTitle("Listado de  Plazas");
  }
  buildForm(): void {
    this.form = this.formBuilder.group({
      idInstancia: [null],
      idSubInstancia: [null],
      idCodigoModular: null,
      idCodigoPlaza: null
    });
  }
  handleResponsive(): void {
    this.isMobile = this.getIsMobile();
    window.onresize = () => {
      this.isMobile = this.getIsMobile();
    };
  }
  buildSeguridad = () => {
    this.permisos.autorizadoExportar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Eliminar);
    this.currentSession = this.dataService.Storage().getInformacionUsuario();
  }

  buscarEtapaProceso = () => {
    let dato = {
      id: Number(this.idep)
    }
    this.dataService.Reasignaciones()
      .getBuscarEtapaProceso(dato)
      .pipe(
        catchError(() => of([])),
        finalize(() => { })
      )
      .subscribe((response: any) => {
        if (response) {
          this.etapa = response[0];
          this.etapaResponse = response[0];
          if (response.length === 0) {
            this.dataService
              .Message()
              .msgWarning(
                'No se encontró información de la Etapa Proceso',
                () => { }
              );
          }
        }
        else if (response === ResultadoOperacionEnum.NotFound) {
          this.dataService.Message().msgWarning(response.messages[0], () => { });
        } else if (response === ResultadoOperacionEnum.UnprocessableEntity) {
          this.dataService.Message().msgWarning(response.messages[0], () => { });
        } else {
          this.dataService.Message().msgError('Ocurrieron algunos problemas al obtener la información.', () => { });
        }
      });
  }

  handleBuscar = () => {
    this.buscarPlazas();
  };
  handleLimpiar(): void {
    this.resetForm();
  }
  resetForm = () => {
    this.form.reset();
  };

  handleRetornar(): void {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

  handleSelectTab = (e) => {
    this.selectedTabIndex = e.index;
    this.buscarPlazas();
  };

  aprobarRechazar = (proceso) => {
    if (proceso === 'APROBAR') {
      let dato = {
        idcp: Number(this.idcp),
        motivo: '',
        operacion: proceso,
        usuario: this.currentSession.nombreUsuario,
        ip: this.ipAddress
      }
      const resultMessage = '"SE APROBARON CORRECTAMENTE."';
      this.dataService.Message().msgConfirm(
        "¿ESTÁ SEGURO QUE DESEA APROBAR EL LISTADO DE LAS PLAZAS?",
         () => {
            this.dataService.Spinner().show("sp6");
            this.dataService.Reasignaciones()
            .getAprobarRechazarConsolidado(dato).pipe(
              catchError((e) => of(e)),
              finalize(() => {
                this.dataService.Spinner().hide("sp6");
              })
            )
              .subscribe((response) => {
                if (response) {
                  this.dataService.Message().msgAutoCloseSuccessNoButton(resultMessage, 3000, () => { });
                  this.obtenerConsolidadoPlaza();
                  // this.buscarPlazas();
                } else if (response && response.statusCode === ResultadoOperacionEnum.NotFound) {
                  this.dataService.Message().msgWarning(response.messages[0], () => { });
                } else if (response && response.statusCode === ResultadoOperacionEnum.UnprocessableEntity) {
                  this.dataService.Message().msgWarning(response.messages[0], () => { });
                } else {
                  this.dataService.Message().msgError('"OCURRIERON ALGUNOS PROBLEMAS AL APROBAR LISTADO DE PLAZAS."', () => { });
                }
              });
          },
          (error) => { }
        );

    } else if (proceso === 'RECHAZAR') {
      this.dialogRef = this.materialDialog.open(RechazarPlazasConvocadasComponent, {
        panelClass: "minedu-rechazar-plazas-convocadas",
        width: "700px",
        disableClose: true,
        data: {
          action: 'RECHAZAR',
          idcp: this.idcp,
        },
      });
      this.dialogRef.afterClosed().subscribe((response) => {
        if (response === 'guardado') {
          this.dataService
          .Message()
          .msgAutoSuccess(
            '<b>SE REALIZO CON EXITO EL RECHAZO.</b>',
            3000, () => { }
          );
          this.obtenerConsolidadoPlaza();
        }
      });
    }
  }

  obtenerConsolidadoPlaza = () => {
    let dato = {
      idcp: this.idcp
    }
    this.dataService
      .Reasignaciones()
      .getBuscarConsolidado(dato)
      .pipe(
        catchError(() => of([])),
        finalize(() => { })
      )
      .subscribe((response: any) => {
        if (response) {
          this.instancia = response[0].instancia;
          this.subinstancia = response[0].subinstancia;
          let valor = response[0].situacion;
          this.situacion = (valor === 'Aprobado' || valor === 'Rechazado') ? true : false;
          this.consolidadoPlaza = response;
          this.buscarPlazas();
        }
      });
  };


  buscarPlazas = () => {
    const codigoModular = this.form.get('idCodigoModular').value;
    const codigoPlaza = this.form.get('idCodigoPlaza').value;

    switch (this.selectedTabIndex) {
      case 0:
        this.convocarPlazasConvocadasComponent.actualizarLista(
          this.request = {
            idep: this.idep,
            idcp: Number(this.idcp),
            codigo_modular: codigoModular,
            codigo_plaza: codigoPlaza,
            operacion: 'CONVOCAR'
          }
        );
        break;
      case 1:
        this.convocarPlazasObservadasComponent.actualizarLista(
          this.request = {
            idep: this.idep,
            idcp: Number(this.idcp),
            codigo_modular: codigoModular,
            codigo_plaza: codigoPlaza,
            operacion: 'OBSERVADA'
          }
        );
        break;
      default:
        break;
    }
  }
}
