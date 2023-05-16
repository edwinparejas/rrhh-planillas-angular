import { HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { throwError } from "rxjs";

@Injectable({
    providedIn: "root",
})
export class HandlerService {

  handleErrorPassport(response: HttpErrorResponse) {
    let errorMessage = response.error;
    return throwError(errorMessage);
  }

  handleError(response: HttpErrorResponse) {
    let errorMessage = response.error;
    return throwError(errorMessage);
  }
}