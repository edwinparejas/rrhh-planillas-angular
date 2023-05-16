import { Component, Input, OnInit, ViewEncapsulation, Output, EventEmitter, SimpleChanges } from "@angular/core";
import { mineduAnimations } from "../../../../../../../@minedu/animations/animations";
import { DataService } from "app/core/data/data.service";
import { EtapaResponseModel } from "../../models/contratacion.model";
import { catchError, finalize } from "rxjs/operators";
import { of, forkJoin } from "rxjs";

@Component({
  selector: "minedu-informacion-proceso-etapa",
  templateUrl: "./informacion-proceso-etapa.component.html",
  styleUrls: ["./informacion-proceso-etapa.component.scss"],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations,
})
export class InformacionProcesoEtapaComponent implements OnInit {
  @Input() idProcesoEtapa: number;
  @Input() consolidado: boolean = false;

  @Input() codSede: string;


  etapaResponse: EtapaResponseModel;
  @Output() eventDataInfo = new EventEmitter<any>();
  constructor(private dataService: DataService,) { }

  ngOnInit(): void {
    this.obtenerEtapa();
  }
  ngOnChanges(changes: SimpleChanges) {
    if(changes.codSede.currentValue != changes.codSede.previousValue){
    this.obtenerEtapa();
    }
  }
  obtenerEtapa = () => {
    if (this.codSede == undefined) {
      this.codSede = '000000'
    }

    forkJoin(
      this.dataService
        .Contrataciones()
        .obtenerCabeceraEtapaProcesoById(this.idProcesoEtapa),

      this.dataService
        .Contrataciones()
        .obtenerCabeceraEstadoDesarrolloEtapaProceso(this.idProcesoEtapa, this.codSede)
    ).pipe(
      catchError(() => of([])),
      finalize(() => { })
    ).subscribe((response: any) => {
      if (response[0]) {
        let data = response[0];
        this.etapaResponse = {
          anio: data.anio,
          codigoEtapa: data.codigo,
          codigoProceso: data.codigo,
          codigoEtapaFase: data.codigo,
          descripcionEstadoEtapaProceso: data.estado,
          descripcionEtapa: data.etapa,
          descripcionEtapaFase: data.etapa,
          descripcionNumeroConvocatoria: data.numero_convocatoria,
          descripcionRegimenLaboral: data.regimen_laboral,
          idRegimenLaboral: data.id_regimen_laboral,
          descripcionTipoProceso: data.proceso,
          fechaCreacion: data.fecha_creacion,
          idEtapa: data.id_etapa_proceso,
          idProceso: data.id_proceso,
        };
      }
      if (response[1]) {
        this.etapaResponse.descripcionEstadoEtapaProceso = response[1].estadoDesarrollo;
        this.etapaResponse.idEstadoDesarrollo = response[1].idEstadoDesarrollo;
      }
      this.eventDataInfo.emit(this.etapaResponse);
    });

    //this.dataService
    //.Contrataciones()
    //.obtenerCabeceraEtapaProcesoById(this.idProcesoEtapa)
    //.pipe(
    //catchError(() => of([])),
    //finalize(() => {})
    //)
    //.subscribe((response: any) => {
    //if (response) {
    //this.etapaResponse = {
    //anio: response.anio,
    //codigoEtapa: response.codigo,
    //codigoProceso: response.codigo,
    //codigoEtapaFase: response.codigo,
    //descripcionEstadoEtapaProceso: response.estado,
    //descripcionEtapa: response.etapa,
    //descripcionEtapaFase: response.etapa,
    //descripcionNumeroConvocatoria: response.numero_convocatoria,
    //descripcionRegimenLaboral: response.regimen_laboral,
    //idRegimenLaboral:response.id_regimen_laboral,
    //descripcionTipoProceso: response.proceso,
    //fechaCreacion: response.fecha_creacion,
    //idEtapa: response.id_etapa_proceso,
    //idProceso: response.id_proceso,
    //};
    //this.eventDataInfo.emit(this.etapaResponse);
    //this.obtenerEstadoDesarrolloEtapa();
    //}
    //});
  };

  obtenerEstadoDesarrolloEtapa = () => {
    console.log("Cabecera: CodigoSede procesado", this.codSede);

    if (this.codSede == undefined) {
      this.codSede = '000000'
    }

    this.dataService
      .Contrataciones()
      .obtenerCabeceraEstadoDesarrolloEtapaProceso(this.idProcesoEtapa, this.codSede)
      .pipe(
        catchError(() => of([])),
        finalize(() => { })
      )
      .subscribe((response: any) => {
        if (response) {
          this.etapaResponse.descripcionEstadoEtapaProceso = response.estadoDesarrollo;
        }
      });
  };
}
