import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { AuthGuard } from "app/core/guard/auth.guard";

const routes: Routes = [
    // { path: "", redirectTo: "authorization", pathMatch: "full" },
    { path: "", redirectTo: "personal", pathMatch: "full" },
    {
        path: "authorization",
        loadChildren: () =>
            import("./authorization/authorization.module").then(
                (m) => m.AuthorizationModule
            ),
    },
    {
        path: "personal",
        // canActivate: [AuthGuard],
        loadChildren: () =>
            import("./apps/apps.module").then((m) => m.AppsModule),
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class MainRoutingModule {}
