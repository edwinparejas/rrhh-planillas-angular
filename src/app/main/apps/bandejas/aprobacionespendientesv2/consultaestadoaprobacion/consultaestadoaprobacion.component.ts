import { Component, Inject, OnInit, ViewEncapsulation } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatTableDataSource } from "@angular/material/table";
import { Routes, RouterModule, ActivatedRoute, Router } from "@angular/router";
import { mineduAnimations } from "@minedu/animations/animations";
import { DataService } from "app/core/data/data.service";
import { StorageService } from "app/core/data/services/storage.service";
import { PASSPORT_MESSAGE } from "app/core/model/message";
import { MISSING_TOKEN } from "app/core/model/types";
import { GlobalsService } from "app/core/shared/globals.service";
import { of } from "rxjs";
import { catchError } from "rxjs/internal/operators/catchError";
import { finalize } from "rxjs/internal/operators/finalize";


@Component({
  selector: 'minedu-consultaestadoaprobacion',
  templateUrl: './consultaestadoaprobacion.component.html',
  styleUrls: ['./consultaestadoaprobacion.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations,
  
})
export class ConsultaestadoaprobacionComponent implements OnInit {
  displayedColumns: string[] = [
    "nivel",
    "descripcionAlcance",
    "descripcionRolPassport",
    "instanciaSolicitante",
    "subinstanciaSolicitante",
    "institucionEducativa",
    "descripcionTipoSede",
    "estadoAprobacion",
    "documentoAprobador",
    "nombresApellidosAprobador",
    "fecha",
    "motivoRechazo",
];

dataSource = new MatTableDataSource();
datos : any;
aprobacion : any ={};
aprobacionNiveles: Array<any>= [];

  constructor(
    public globals: GlobalsService,
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private materialDialog: MatDialog,
    private storageService: StorageService,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => { this.datos = params; });  
     this.visulizaAprobacion(this.datos.params);

  }

  visulizaAprobacion(aprobacion : any){

    this.dataService.Aprobacion().visualizarAprobacion(aprobacion).pipe(catchError(() => of([])),
        finalize(() => { })
    )
    .subscribe(async (response: any) => {  
        if (await response) { 

          this.aprobacion = await response;    
          this.dataSource = await response.aprobacionNiveles;
          this.aprobacionNiveles  = await response.aprobacionNiveles;

        }else if (response && (response.code === 401 || response.error === MISSING_TOKEN.INVALID_TOKEN)) {
            this.dataService.Message().msgInfo(PASSPORT_MESSAGE.SESION_END, () => { this.dataService.Storage().passportUILogin(); });
        }
    });

  }


  retornar(){ 

  this.router.navigate(['ayni','personal','bandejas','aprobacionespendientes',this.datos.params],{
    skipLocationChange: true
   }) 

  }


}
