import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';

import { MineduPipesModule } from '@minedu/pipes/pipes.module';

import { MineduMaterialColorPickerComponent } from '@minedu/components/material-color-picker/material-color-picker.component';

@NgModule({
    declarations: [
        MineduMaterialColorPickerComponent
    ],
    imports: [
        CommonModule,

        FlexLayoutModule,

        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        MatTooltipModule,

        MineduPipesModule
    ],
    exports: [
        MineduMaterialColorPickerComponent
    ],
})
export class MineduMaterialColorPickerModule
{
}
