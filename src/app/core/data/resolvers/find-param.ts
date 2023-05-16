import { ActivatedRouteSnapshot } from '@angular/router';

export function findParam(paramName, route: ActivatedRouteSnapshot) {
    let param;
    do {
        param = route.params[paramName];
        route = route.parent;
    } while (!param && route);
    return param;
}
