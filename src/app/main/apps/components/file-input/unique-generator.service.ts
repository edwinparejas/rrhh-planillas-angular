import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UniqueGeneratorService {

  constructor() { }

  public generate(): string {
    return `minedu-${(Math.random() * 0xFFFFFF << 0).toString(16)}`;
  }
}
