import { AsistenciaRestangularService } from '../data/services/resources/asistencia-restangular.service';

export abstract class Model {

    private _restangular: AsistenciaRestangularService;

    constructor(restangular: AsistenciaRestangularService) {
        this._restangular = restangular;
    }

    one(path: string, id: string): AsistenciaRestangularService {
        return this._restangular.one(path, id);
    }

    all(path: string): AsistenciaRestangularService {
        return this._restangular.all(path);
    }

    // reload() {
    //     return this.restangular
    //         .get()
    //         .map(response => Object.assign(this.build(), response.json()));
    // }

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

    abstract build(): Model;
}
