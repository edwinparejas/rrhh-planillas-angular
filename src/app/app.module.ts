import { NgModule, LOCALE_ID } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MatMomentDateModule } from "@angular/material-moment-adapter";

import { MineduModule } from "@minedu/minedu.module";
import { MineduSharedModule } from "@minedu/shared.module";

import { mineduConfig } from "app/config/minedu-config";

import { AppComponent } from "app/app.component";
import { LayoutModule } from "app/layout/layout.module";
import { AppRoutingModule } from "./app-routing.module";
import { CoreModule } from "./core/core.module";
import { MineduProgressBarModule } from "@minedu/components/progress-bar/progress-bar.module";
import { MineduSidebarModule } from "@minedu/components/sidebar/sidebar.module";
import { MaterialModule } from "./material/material.module";
import { NgxSpinnerModule } from "ngx-spinner";
import { TokenInterceptorService } from "./core/data/interceptors/token-interceptor.service";
import { ErrorInterceptorService } from "./core/data/interceptors/error-interceptor.service";
import { registerLocaleData } from "@angular/common";
import localeEs from "@angular/common/locales/es";
import { LoadingInterceptor } from "./core/data/interceptors/loading.interceptor";

registerLocaleData(localeEs, "es-PE");

@NgModule({
    declarations: [AppComponent],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        AppRoutingModule,
        NgxSpinnerModule,
        // Material moment date module
        MatMomentDateModule,
        MaterialModule,

        // Minedu modules
        MineduModule.forRoot(mineduConfig),
        MineduProgressBarModule,
        MineduSharedModule,
        MineduSidebarModule,

        // App modules
        LayoutModule,
        CoreModule,
    ],
    bootstrap: [AppComponent],
    providers: [
        {
            provide: HTTP_INTERCEPTORS,
            useClass: TokenInterceptorService,
            multi: true,
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: ErrorInterceptorService,
            multi: true,
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: LoadingInterceptor,
            multi: true,
        },
        { provide: LOCALE_ID, useValue: "es-PE" },
    ],
})
export class AppModule {}
