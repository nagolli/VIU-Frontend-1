/***** INICIO DECLARACIÓN DE VARIABLES GLOBALES *****/

// Array de palos
let palos = ["viu", "cua", "hex", "cir"];
// Array de número de cartas
//let numeros = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
// En las pruebas iniciales solo se trabajará con cuatro cartas por palo:
let numeros = [9, 10, 11, 12];

// paso (top y left) en pixeles de una carta a la siguiente en un mazo
let paso = 5;

// Tapetes				
let tapeteInicial = document.getElementById("inicial");
let tapeteSobrantes = document.getElementById("sobrantes");
let tapeteReceptor1 = document.getElementById("receptor1");
let tapeteReceptor2 = document.getElementById("receptor2");
let tapeteReceptor3 = document.getElementById("receptor3");
let tapeteReceptor4 = document.getElementById("receptor4");

// Mazos
let mazoInicial = [];
let mazoSobrantes = [];
let mazoReceptor1 = [];
let mazoReceptor2 = [];
let mazoReceptor3 = [];
let mazoReceptor4 = [];

/***** FIN DECLARACIÓN DE VARIABLES GLOBALES *****/


// Rutina asociada a boton reset
/*** !!!!!!!!!!!!!!!!!!! CODIGO !!!!!!!!!!!!!!!!!!!! **/


// El juego arranca ya al cargar la página: no se espera a reiniciar
/*** !!!!!!!!!!!!!!!!!!! CODIGO !!!!!!!!!!!!!!!!!!!! **/

// Desarrollo del comienzo de juego
function comenzarJuego() {
	/* Crear baraja, es decir crear el mazoInicial. Este será un array cuyos 
	elementos serán elementos HTML <img>, siendo cada uno de ellos una carta.
	Sugerencia: en dos bucles for, bárranse los "palos" y los "numeros", formando
	oportunamente el nombre del fichero png que contiene a la carta (recuérdese poner
	el path correcto en la URL asociada al atributo src de <img>). Una vez creado
	el elemento img, inclúyase como elemento del array mazoInicial. 
	*/

	/*** !!!!!!!!!!!!!!!!!!! CODIGO !!!!!!!!!!!!!!!!!!!! **/


	// Barajar y dejar mazoInicial en tapete inicial
	/*** !!!!!!!!!!!!!!!!!!! CODIGO !!!!!!!!!!!!!!!!!!!! **/

	// Puesta a cero de contadores de mazos
	resetContadores();

	// Arrancar el conteo de tiempo
	/*** !!!!!!!!!!!!!!!!!!! CODIGO !!!!!!!!!!!!!!!!!!!! **/

} // comenzarJuego

/**
	  En el elemento HTML que representa el tapete inicial (variable tapeteInicial)
	se deben añadir como hijos todos los elementos <img> del array mazo.
	Antes de añadirlos, se deberían fijar propiedades como la anchura, la posición,
	coordenadas top y left, algun atributo de tipo data-...
	Al final se debe ajustar el contador de cartas a la cantidad oportuna
*/
function cargarTapeteInicial(mazo) {
	/*** !!!!!!!!!!!!!!!!!!! CODIGO !!!!!!!!!!!!!!!!!!!! **/
} // cargarTapeteInicial

//#region CONTADORES
//Contadores de cartas

//CLASE
class Contador {
	id /**string, id de elemento */;
	defaultValue; /** int */
	value; /** int */

	constructor(idElemento, initValue = 0) {
		this.id = idElemento;
		this.defaultValue = initValue;
		this.value = initValue;
		this.updateVisual();
	}

	incContador() {
		this.value++;
		this.updateVisual();
	}

	decContador() {
		this.value--;
		this.updateVisual();
	}

	reset() {
		this.value = this.defaultValue;
		this.updateVisual();
	}

	setContador(newValue) {
		this.value = newValue;
		this.updateVisual();
	}

	updateVisual() {
		//Ajustar si hiciera falta
		const element = document.getElementById(this.id);
		if (element) element.textContent = this.value;
	}
}

//VARIABLES
let contInicial = new Contador("contador_inicial", numeros.length * palos.length);
let contSobrantes = new Contador("contador_sobrantes", 0);
let contReceptor1 = new Contador("contador_receptor1", 0);
let contReceptor2 = new Contador("contador_receptor2", 0);
let contReceptor3 = new Contador("contador_receptor3", 0);
let contReceptor4 = new Contador("contador_receptor4", 0);
let contMovimientos = new Contador("contador_movimientos");

//FUNCIONES SOBRE CONJUNTO DE CONTADORES
resetContadores = function () {
	contInicial.reset();
	contSobrantes.reset();
	contReceptor1.reset();
	contReceptor2.reset();
	contReceptor3.reset();
	contReceptor4.reset();
	contMovimientos.reset();
}
//#endregion

//#region TEMPORIZADOR
//CLASE
class Temporizador extends Contador {
	temporizador; /** Temporizador */

	constructor(idElemento) {
		super(idElemento, 0);
		this.reanudar();
	}

	reiniciar() {
		super.setContador(0);
		this.reanudar();
	}

	pausar() {
		clearInterval(this.temporizador);
	}

	reanudar() {
		if (this.temporizador) clearInterval(this.temporizador); //Limpieza de temporizador, si no se hubiera limpiado antes
		this.temporizador = setInterval(() => this.incContador(), 1000);
	}

	//Funcion originalmente sugerida por Ismael
	//Devueve el value en formato HH:MM:SS
	HHMMSS() {
		let seg = Math.trunc(this.value % 60);
		let min = Math.trunc((this.value % 3600) / 60);
		let hor = Math.trunc((this.value % 86400) / 3600);
		return ((hor < 10) ? "0" + hor : "" + hor)
			+ ":" + ((min < 10) ? "0" + min : "" + min)
			+ ":" + ((seg < 10) ? "0" + seg : "" + seg);
	}

	updateVisual() {
		const element = document.getElementById(this.id);
		if (element) element.textContent = this.HHMMSS();
	}
}

//VARIABLE
// Tiempo
let contTiempo = new Temporizador("contador_tiempo");

//#endregion

//#region BARAJA

/**
	Si mazo es un array de elementos <img>, en esta rutina debe ser
	reordenado aleatoriamente. Al ser un array un objeto, se pasa
	por referencia, de modo que si se altera el orden de dicho array
	dentro de la rutina, esto aparecerá reflejado fuera de la misma.
*/
function barajar(mazo) {
	/*** !!!!!!!!!!!!!!!!!!! CODIGO !!!!!!!!!!!!!!!!!!!! **/
} // barajar

//#endregion

//Iniciar el juego al cargar la página
setTimeout(() => {
	comenzarJuego();
}, 100);