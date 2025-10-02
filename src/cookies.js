// Función para establecer una cookie
export function setCookie(name, value, days, sameSite = "Lax", secure = false) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    // Configurar SameSite y Secure solo si estamos en un entorno seguro (HTTPS)
    const secureStr = secure ? "; Secure" : "";
    document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=" + sameSite + secureStr;
}

// Función para obtener una cookie
export function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

// Función para borrar una cookie
export function eraseCookie(name, sameSite = "Lax", secure = false) {
    // Configurar SameSite y Secure solo si estamos en un entorno seguro (HTTPS)
    const secureStr = secure ? "; Secure" : "";
    document.cookie = name + '=; Max-Age=-99999999; path=/; SameSite=' + sameSite + secureStr;
}
