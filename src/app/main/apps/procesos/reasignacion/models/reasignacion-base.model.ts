import { map } from 'rxjs/operators';
import { ReasignacionesRestangularService } from '../../../../../core/data/services/resources/reasignaciones-restangular.service';
export abstract class ReasignacionBaseModel {
    private _restangular: ReasignacionesRestangularService;
    
    constructor(restangular: ReasignacionesRestangularService) {
        this._restangular = restangular;
    }
    one(path: string, id: string): ReasignacionesRestangularService {
        return this._restangular.one(path, id);
    }

    all(path: string): ReasignacionesRestangularService {
        return this._restangular.all(path);
    }

    reload() {
        return this.restangular
            .get()
            .pipe(map(response => Object.assign(this.build(), response.json())));
    }

    save(model?: any) {
        if (model) {
            return this._restangular.put(model);
        } else {
            return this._restangular.put(this);
        }
    }

    delete() {
        return this._restangular.delete();
    }

    get restangular() {
        return this._restangular;
    }

    abstract build(): ReasignacionBaseModel;
}