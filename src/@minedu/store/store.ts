import { BehaviorSubject, Observable } from "rxjs";
import { map, distinctUntilChanged } from "rxjs/operators";

const P = <T>(property: (object: T) => void) => {
    const chaine = property.toString();
    const arr = chaine.match(/[\s\S]*{[\s\S]*\.([^\.; ]*)[ ;\n]*}/);
    return arr[1];
};

export class Store<T> {
    private _state$: BehaviorSubject<T>;

    protected constructor(initialState: T) {
        this._state$ = new BehaviorSubject(initialState);
    }

    private get state$(): Observable<T> {
        return this._state$.asObservable();
    }

    private getState(): T {
        return this._state$.getValue();
    }

    setState(nextState: T): void {
        this._state$.next(nextState);
    }

    buildScopedSetState<E>(propName: string) {
        return (state: E) => {
            this.setState({ ...this.getState(), [propName]: state });
        };
    }

    buildScopedGetState<E>(propName: string) {
        return (): E => this.getState()[propName];
    }

    dispatch = (newState: T, prop = null) => {
        const state =
            typeof newState === "function"
                ? newState(prop ? this.getState()[prop] : this.getState())
                : newState;

        if (prop) {
            this.setState({ ...this.getState(), [prop]: state });
        } else {
            this.setState({ ...this.getState(), ...state });
        }
    };

    buildDispatch = (exp: (obj: T) => any) => {
        console.log("tipo de: ", P<T>(exp));
        return (newState) => {
            this.dispatch(newState, P<T>(exp));
        };
    };

    select = <D>(arg: (s: T) => D) => {
        return this.state$.pipe(map(arg), distinctUntilChanged());
    };

    selectSnapshot = <D>(arg: (s: T) => D): D => {
        return arg(JSON.parse(JSON.stringify(this.getState())));
    };
}
