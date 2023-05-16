import { map } from 'rxjs/operators';
import { RotacionRestangularService } from '../data/services/resources/rotacion.restangular.service';

export abstract class RotacionBaseModel {

    private _restangular: RotacionRestangularService;

    constructor(restangular: RotacionRestangularService) {
        this._restangular = restangular;
    }

    one(path: string, id: string): RotacionRestangularService {
        return this._restangular.one(path, id);
    }

    all(path: string): RotacionRestangularService {
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

    abstract build(): RotacionBaseModel;
}
