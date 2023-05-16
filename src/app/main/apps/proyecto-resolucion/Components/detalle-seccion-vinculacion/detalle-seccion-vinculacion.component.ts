import { Component, OnInit, ViewEncapsulation, Input} from '@angular/core';
import { mineduAnimations } from '@minedu/animations/animations';
import { SelectionModel, DataSource, CollectionViewer } from '@angular/cdk/collections';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { DataService } from 'app/core/data/data.service';

@Component({
    selector: 'minedu-detalle-seccion-vinculacion',
    templateUrl: './detalle-seccion-vinculacion.component.html',
    styleUrls: ['./detalle-seccion-vinculacion.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class DetalleSeccionVinculacionComponent implements OnInit {
    selection = new SelectionModel<any>(true, []);
    @Input() detalleVistaProyecto;
    dataObject:{id:number,valorCampo:string,bold:number}[]=[];
    dataTable:{id:number,dataObject}[]=[];
    saltoLinea:boolean=false;
    constructor(
    ) { 
    }
    ngOnInit(): void {   
        let cantidad=1;   
        let apoyo=1;    
        this.detalleVistaProyecto.forEach(async (detalle) => {    
            debugger     
            var splitg=JSON.parse(detalle.valorCampoFormateado);
            splitg.forEach(async (split) => {


                this.saltoLinea=cantidad%3==0?true:false;
                let bold=cantidad==1?1:0;
                this.dataObject.push({id:cantidad,valorCampo:split,bold:bold}); 

                if(this.saltoLinea){
                    this.dataTable.push({id:apoyo,dataObject:this.dataObject});
                    this.dataObject=[];
                    apoyo=apoyo+1;
                    cantidad=0;
                }

                cantidad=cantidad+1;
            });
          });
          console.log(this.dataTable);
    }
}

