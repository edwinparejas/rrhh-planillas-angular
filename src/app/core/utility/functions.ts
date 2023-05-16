import { FormGroup } from '@angular/forms';


export function s2ab(s) {
  var buf = new ArrayBuffer(s.length);
  var view = new Uint8Array(buf);
  for (var i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
  return buf;
}

export function descargarExcel(array, nombreArchivo) {
  let blob = new Blob([s2ab(atob(array))], { type: 'application/octet-stream' });
  let a = document.createElement('a');
  let url = window.URL.createObjectURL(blob);
  a.href = url;
  a.download = nombreArchivo;
  a.click();
  window.URL.revokeObjectURL(url);
}