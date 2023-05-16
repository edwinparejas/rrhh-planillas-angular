import { AfterViewInit, Component, Inject, Input, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { GlobalsService } from 'app/core/shared/globals.service';
import { SharedService } from 'app/core/shared/shared.service';
import { BehaviorSubject, Observable, of, Subject, Subscription } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

@Component({
  selector: 'minedu-informacion-plaza',
  templateUrl: './informacion-plaza.component.html',
  styleUrls: ['./informacion-plaza.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations
})
export class InformacionPlazaComponent implements OnInit{

    idProceso :number;
    paginatorPageIndex = 1;
    paginatorPageSize = 3;

    informacionplaza:{
        codigo_modular:"",
        centro_trabajo :"",
        instancia :"",
        modalidad :"",
        nivel_educativo :"",
        tipo_gestion :"",
        subinstancia :"",
        tipo_institucion_educativa :"",
        eib :"",
        es_bilingue: boolean,
        es_frontera: boolean,
        lengua_originaria :"",
        forma_atencion :"",
        tipo_ruralidad :"",
        frontera :"",
        vraem :"",
        codigo_plaza :"",
        area_desempenio :"",
        cargo :"",
        jornada_laboral :"",
        tipo_plaza :"",
        area_curricular:"",
        especialidad:"",
        vigencia_inicio: Date,
        vigencia_fin: Date,
        regimen_laboral:"",
        motivo_vacancia:"",
        area_desempenio_laboral:""
    };

    // working: false;

    @ViewChild('paginator', { static: true }) paginator: MatPaginator;

    constructor(
        public matDialogRef: MatDialogRef<InformacionPlazaComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { idPlazaReasignacion: number, idPlazaReasignacionDetalle: number, idPlaza: number },
        private dataService: DataService,
        private dataShared: SharedService,
        public globals: GlobalsService,
        private materialDialog: MatDialog) { }


    ngOnInit(): void {
        this.informacionPlaza();
    }

    handleCancel = () => {
        this.matDialogRef.close();
    }
  
    informacionPlaza = () => {
        this.dataService.Reasignaciones()
        .getPrePubPlaPlazaById(this.data.idPlaza)
        .pipe(
            catchError(() => of([])),
            finalize(() => { })
        )
        .subscribe((response: any) => {
            this.informacionplaza = response;
        });
    }

}


 