export function generarFormDataUtil(formValue:any) {

    let data = formValue;
    const documento = new FormData();
    appendFormDataUtil(documento, data, "");
    console.log(documento);
    
    return documento;
}
export function convertDateUtil(inputFormat) {
    function pad(s) { return (s < 10) ? '0' + s : s; }
    var d = new Date(inputFormat)
    return [pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join('-')
}
export function appendFormDataUtil(formData, data, rootName) {        
    let root = rootName || "";
    if (data instanceof File) {
        formData.append(root, data);
    } else if (data instanceof Date) {
        formData.append(root, convertDateUtil(data));
    } else if (Array.isArray(data)) {
        for (var i = 0; i < data.length; i++) {
            appendFormDataUtil(formData, data[i], root + "[" + i + "]");
        }
    } else if (typeof data === "object" && data) {
        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                if (root === "") {
                    appendFormDataUtil(formData, data[key], key);
                } else {
                    appendFormDataUtil(
                        formData,
                        data[key],
                        root + "." + key
                    );
                }
            }
        }
    } else {
        if (data !== null && typeof data !== "undefined") {
            formData.append(root, data);
        }
    }
}