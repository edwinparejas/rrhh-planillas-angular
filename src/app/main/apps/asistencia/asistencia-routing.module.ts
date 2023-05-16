import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { CommonModule } from '@angular/common';
import { AsistenciaComponent } from './asistencia.component';
import { ReporteAsistenciaModule } from './reporte-asistencia/reporte-asistencia.module';

const routes: Routes = [
    {    path: '',       
        component: AsistenciaComponent,    
        children:[
            {
                path: "bandeja",
                loadChildren: () =>
                    import("./control-asistencia/control-asistencia.module").then(
                        (m) => m.ControlAsistenciaModule
                    ),
            },           
            {
                path: "consolidado",
                loadChildren: () => import("./control-consolidado/control-consolidado.module").then(
                    (m) => m.ControlConsolidadoModule
                    ),
            },      
            {
                path: "aprobacion",
                loadChildren: () =>import("./consolidado-aprobacion/consolidado-aprobacion.module").then(
                    (m) => m.ConsolidadoAprobacionModule
                    ),
            },
            // {
            //     path: "bandeja/:id/reporte",
            //     loadChildren: () =>import("./reporte-asistencia/reporte-asistencia.module").then(
            //         (m) => m.ReporteAsistenciaModule
            //         ),
            // }           
        ],
    },
];
        
       
  

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class AsistenciaRoutingModule {}
