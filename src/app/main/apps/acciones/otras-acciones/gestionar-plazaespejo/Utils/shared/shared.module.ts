import { NgModule } from '@angular/core';
import { NoRegistradoPipe } from './pipes/no-registrado.pipe';



@NgModule({
    declarations: [NoRegistradoPipe],
    imports: [],
    exports: [NoRegistradoPipe]
})
export class SharedModule { }
