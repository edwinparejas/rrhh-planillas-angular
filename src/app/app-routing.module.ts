import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

const routes: Routes = [
    { path: "", redirectTo: "ayni", pathMatch: "full" },
    { path: "ayni", loadChildren: () => import("./main/main.module").then((m) => m.MainModule) },
    { path: "not-found", loadChildren: () => import("./main/apps/errors/404/error-404.module").then((m) => m.Error404Module) },
    { path: "server-error", loadChildren: () => import("./main/apps/errors/500/error-500.module").then((m) => m.Error500Module) },
    { path: "**", redirectTo: "not-found" },
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes)
    ],
    exports: [RouterModule],
})
export class AppRoutingModule { }
