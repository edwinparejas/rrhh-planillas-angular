import { RestangularService } from '../data/services/restangular.service';

export abstract class Modelo  {

    private _restangular: RestangularService;

    constructor(restangular: RestangularService) {
        this._restangular = restangular;
    }

    one(path: string, id: string): RestangularService {
        return this._restangular.one(path, id);
    }

    all(path: string): RestangularService {
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

    abstract build(): Modelo;
}
