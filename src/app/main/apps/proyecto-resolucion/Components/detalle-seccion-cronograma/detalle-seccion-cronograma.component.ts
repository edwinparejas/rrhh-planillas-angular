import { Component, OnInit, ViewEncapsulation, Input} from '@angular/core';
import { mineduAnimations } from '@minedu/animations/animations';
import { SelectionModel, DataSource, CollectionViewer } from '@angular/cdk/collections';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { DataService } from 'app/core/data/data.service';

@Component({
    selector: 'minedu-detalle-seccion-cronograma',
    templateUrl: './detalle-seccion-cronograma.component.html',
    styleUrls: ['./detalle-seccion-cronograma.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class DetalleSeccionCronogramaComponent implements OnInit {
    selection = new SelectionModel<any>(true, []);
    @Input() detalleVistaProyecto;
    dataObject:{id:number,valorCampo:string,colspan:number,bold:number,centrado:number}[]=[];
    dataTable:{id:number,dataObject}[]=[];
    saltoLinea:boolean=false;
    constructor(
    ) { 
    }
    ngOnInit(): void {    
        let cantidad=1;   
        let apoyo=1;    
        this.detalleVistaProyecto.forEach(async (detalle) => {        
            var splitg=JSON.parse(detalle.valorCampoFormateado);
            splitg.forEach(async (split) => {
                if(split.length==1){
                    this.dataObject.push({id:cantidad,valorCampo:split[0],colspan:5,bold:1,centrado:1}); 
                    this.dataTable.push({id:apoyo,dataObject:this.dataObject});
                    this.dataObject=[];
                    apoyo=apoyo+1;
                }
                else{       
                    let bold=apoyo==2?1:(split[split.length-1]==""?1:0);                    
                    split.forEach(async (rowFilter) => {
                        this.saltoLinea=cantidad%5==0?true:false;                    
                        this.dataObject.push({id:cantidad,valorCampo:rowFilter,colspan:1,bold:bold,centrado:0}); 
                        if(this.saltoLinea){
                            this.dataTable.push({id:apoyo,dataObject:this.dataObject});
                            this.dataObject=[];
                            apoyo=apoyo+1;
                            cantidad=0;
                        }    
                        cantidad=cantidad+1;
                    });                  
                }
            });
          });
    }
}

