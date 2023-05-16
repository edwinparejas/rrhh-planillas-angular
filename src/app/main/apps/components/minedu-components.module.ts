import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ButtonAddComponent } from "./button-add/button-add.component";
import { ButtonCancelComponent } from "./button-cancel/button-cancel.component";
import { ButtonSaveComponent } from "./button-save/button-save.component";
import { ButtonSendComponent } from "./button-send/button-send.component";
import { ButtonUpdateComponent } from "./button-update/button-update.component";
import { FormFieldValidationMessagesComponent } from "./form-field-validation-messages/form-field-validation-messages.component";
import { FormFieldsStatusComponent } from "./form-fields-status/form-fields-status.component";
import { MonthPickerComponent } from "./month-picker/month-picker.component";
import { RegularDatepickerComponent } from "./regular-datepicker/regular-datepicker.component";
import { MineduDatepickerComponent } from "./minedu-datepicker/minedu-datepicker.component";
import { YearPickerComponent } from "./year-picker/year-picker.component";
import { FormFieldValidationStateDirective } from "./directives/form-field-validation-state.directive";
import { FormRequiredLabelDirective } from "./directives/form-required-label.directive";
import { DisabledControlDirective } from "./directives/disabled-control.directive";
import { MineduSharedModule } from "@minedu/shared.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MaterialModule } from "app/material/material.module";
import { FileInputComponent } from "./file-input/file-input.component";
import { UppercaseInputDirective } from "./directives/uppercase-input.directive";
import { LowercaseInputDirective } from "./directives/lowercase-input.directive";
import { FieldsetComponent } from "./fieldset/fieldset.component";
import { ButtonExportarComponent } from "./button-exportar/button-exportar.component";
import { ButtonSearchComponent } from "./button-search/button-search.component";
import { ButtonClearComponent } from "./button-clear/button-clear.component";
import { ButtonDeleteComponent } from "./button-delete/button-delete.component";
import { DocumentViewerComponent } from "./document-viewer/document-viewer.component";
import { CargaMasivaComponent } from "./carga-masiva/carga-masiva.component";
import { ArchivoCargaComponent } from "./carga-masiva/archivo-carga/archivo-carga.component";
import { DetalleErrorComponent } from "./carga-masiva/detalle-error/detalle-error.component";
import { HistorialCargaComponent } from "./carga-masiva/historial-carga/historial-carga.component";
import { ButtonCustomizedComponent } from './button-customized/button-customized.component';
import { SingleFileInputComponent } from './single-file-input/single-file-input.component';
import { ButtonClearSearchComponent } from './button-clear-search/button-clear-search.component';
import { MaxLengthDirective } from './directives/max-length.directive';
import {AlphaNumericDirective} from './directives/alpha-numeric.directive';
import {NumberDirective} from './directives/numbers-only.directive';
import { ButtonReturnComponent } from './button-return/button-return.component';
import { SingleFileInputTempComponent } from './single-file-input-temp/single-file-input-temp.component';
import { InstanciasViewComponent } from "./instancias-view/instancias-view.component";

@NgModule({
    declarations: [
        ButtonAddComponent,
        ButtonCancelComponent,
        ButtonSaveComponent,
        ButtonSendComponent,
        ButtonUpdateComponent,
        FormFieldValidationMessagesComponent,
        FormFieldsStatusComponent,
        MonthPickerComponent,
        RegularDatepickerComponent,
        MineduDatepickerComponent,
        YearPickerComponent,
        UppercaseInputDirective,
        LowercaseInputDirective,
        FormFieldValidationStateDirective,
        FormRequiredLabelDirective,
        DisabledControlDirective,
        FileInputComponent,
        FieldsetComponent,
        ButtonExportarComponent,
        ButtonSearchComponent,
        ButtonClearComponent,
        ButtonDeleteComponent,
        DocumentViewerComponent,
        CargaMasivaComponent,
        ArchivoCargaComponent,
        DetalleErrorComponent,
        HistorialCargaComponent,
        ButtonCustomizedComponent,
        SingleFileInputComponent,
        ButtonClearSearchComponent,
        MaxLengthDirective,
        NumberDirective,
        AlphaNumericDirective,
        ButtonReturnComponent,
        SingleFileInputTempComponent,
        InstanciasViewComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        MineduSharedModule,
    ],
    exports: [
        FormFieldsStatusComponent,
        FormFieldValidationMessagesComponent,
        UppercaseInputDirective,
        LowercaseInputDirective,
        FormFieldValidationStateDirective,
        FormRequiredLabelDirective,
        ButtonSaveComponent,
        ButtonAddComponent,
        ButtonCancelComponent,
        ButtonUpdateComponent,
        DisabledControlDirective,
        ButtonSendComponent,
        MineduDatepickerComponent,
        FileInputComponent,
        FieldsetComponent,
        ButtonExportarComponent,
        ButtonSearchComponent,
        ButtonClearComponent,
        ButtonDeleteComponent,
        DocumentViewerComponent,
        CargaMasivaComponent,
        ArchivoCargaComponent,
        DetalleErrorComponent,
        HistorialCargaComponent,
        ButtonCustomizedComponent,
        SingleFileInputComponent,
        ButtonClearSearchComponent,
        MaxLengthDirective,
        NumberDirective,
        AlphaNumericDirective,
        ButtonReturnComponent,
        SingleFileInputTempComponent,
        InstanciasViewComponent
    ],
})
export class MineduComponentsModule { }
