export class fechas {
    public static obtenerFechaMasAnios(fecha:Date,valor:number):Date {
        const dateCopy = new Date(fecha);
        dateCopy.setFullYear(dateCopy.getFullYear() + valor);
        return dateCopy;
    };
    public static obtenerFechaInicioDeMesActual():Date {
        const fechaInicio = new Date();
        return new Date(fechaInicio.getFullYear(), fechaInicio.getMonth(), 1);
    };
     public static obtenerFechaInicioDeMesIngresado(fecha:Date):Date {
        const fechaInicio = new Date(fecha);
        return new Date(fechaInicio.getFullYear(), fechaInicio.getMonth(), 1);
    };
    public static obtenerFechaFinDeMesActual():Date {
        const fechaFin = new Date();
	// Iniciar en este año, el siguiente mes, en el día 0 (así que así nos regresamos un día)
	return new Date(fechaFin.getFullYear(), fechaFin.getMonth() + 1, 0);
    };
    public static obtenerFechaFinDeMesActualIngresado(fecha:Date):Date {
        const fechaFin = new Date(fecha);
	// Iniciar en este año, el siguiente mes, en el día 0 (así que así nos regresamos un día)
	return new Date(fechaFin.getFullYear(), fechaFin.getMonth() + 1, 0);
    };
    public static obtenerFechaInicioDelAnioIngresado(fecha:Date):Date {
        const fechaFin = new Date(fecha);
	// Iniciar en este año, el siguiente mes, en el día 0 (así que así nos regresamos un día)
	return new Date(fechaFin.getFullYear(), 0, 1);
    };
    public static obtenerFechaFinDelAnioIngresado(fecha:Date):Date {
        const fechaFin = new Date(fecha);
	// Iniciar en este año, el siguiente mes, en el día 0 (así que así nos regresamos un día)
	return new Date(fechaFin.getFullYear(), 12, 0);
    };
}