//#region REGLAS DEL JUEGO
//se colocan cartas en orden decreciente (comenzando con 12) y alternando colores (naranja y gris).
function siguiente(prev, sig) {
	return siguienteNumero(prev, sig) && siguientePalo(prev, sig);
}

function siguienteNumero(prev, sig) {
	return (prev == undefined && sig.numero == 12) ||
		(sig.numero === prev?.numero - 1)
}

function siguientePalo(prev, sig) {
	if (!prev) return true;
	return (prev.palo === palos[0] || prev.palo === palos[1] ?
		sig.palo == palos[2] || sig.palo == palos[3] :
		sig.palo == palos[0] || sig.palo == palos[1]);
}

//Comprobar victoria
function comprobarVictoria() {
	return mazoInicial.next() === undefined && mazoSobrantes.next() === undefined;
}

//Volcar sobrantes a inicial al vaciarse el inicial
function volcarSobrantesAInicial() {
	while (mazoSobrantes.next() !== undefined) {
		mazoSobrantes.moverA(mazoInicial, true);
	}
	mazoInicial.barajar();
	mazoInicial.imprimir();
}

function ejecutarVictoria() {
	setTimeout(() =>
		alert("¡Has ganado!\nTiempo: " + contTiempo.HHMMSS() + "\nMovimientos: " + contMovimientos.value)
		, 50);
}
//#endregion

//#region CARTA
//CONSTANTES
// Array de palos
const palos = ["viu", "cua", "hex", "cir"];
// Array de número de cartas
const numeros = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
//const numeros = [9, 10, 11, 12];
class Carta {
	palo; /** string, de palos  */
	numero; /** int, número de carta */
	imgElement; /** Elemento img asociado a la carta */
	currentParent; /** Elemento padre actual del imgElement */

	constructor(palo, numero) {
		this.palo = palo;
		this.numero = numero;
		this.rutaImagen = `../images/baraja/${numero}-${palo}.png`;
	}

	imprimir(x, y, z, newParent) {
		if (!this.imgElement) {
			this.imgElement = document.createElement("img");
			this.imgElement.style.position = "absolute";
			newParent.appendChild(this.imgElement);
			this.currentParent = newParent;
			this.imgElement.src = this.rutaImagen;
			this.imgElement.style.maxWidth = "80px";
			this.imgElement.style.maxHeight = "100px";
			
			// Hacer la carta draggable
			this.imgElement.draggable = true;
			this.imgElement.addEventListener("dragstart", (e) => this.onDragStart(e));
		} else {
			this.currentParent.removeChild(this.imgElement);
			newParent.appendChild(this.imgElement);
			this.currentParent = newParent;
		}
		this.imgElement.setAttribute("data-parent", newParent.getAttribute("data-object")); //Para identificar el mazo origen en el drop de Drag&Drop
		this.imgElement.style.left = `${x}px`;
		this.imgElement.style.top = `${y}px`;
		this.imgElement.style.zIndex = z + 1;
	}

	onDragStart(e) {
		// Guardar referencia al mazo origen
		const parentId = this.imgElement.getAttribute("data-parent");
		// Encontrar el mazo correspondiente
		const mazos = [mazoInicial, mazoSobrantes, mazoReceptor1, mazoReceptor2, mazoReceptor3, mazoReceptor4];
		mazoOrigen = mazos.find(m => m.toString() === parentId);
		
		// Solo permitir arrastrar si el mazo permite sacar cartas y esta es la carta superior
		if (mazoOrigen && mazoOrigen.puedeSacar && mazoOrigen.next() === this) {
			e.dataTransfer.effectAllowed = "move";
			this.imgElement.style.opacity = "0.5";
		} else {
			e.preventDefault();
		}
	}
}

//Funciones
function todasLasCartas() {
	let cartas = [];
	for (let palo of palos) {
		for (let numero of numeros) {
			cartas.push(new Carta(palo, numero));
		}
	}
	return cartas;
}

//#endregion

//#region CONTADORES
//Contadores de cartas

//CLASE
class Contador {
	id /**string, id de elemento en DOM*/;
	defaultValue; /** int, valor inicial y para reset */
	value; /** int, valor actual */

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
function resetContadores() {
	contInicial.reset();
	contSobrantes.reset();
	contReceptor1.reset();
	contReceptor2.reset();
	contReceptor3.reset();
	contReceptor4.reset();
	contMovimientos.reset();
}
//#endregion

//#region BARAJA
//CONSTANTES
// paso (top y left) en pixeles de una carta a la siguiente en un mazo
const paso = 5;

//CLASE
class Baraja {
	//Baraja actua como una PILA FILO
	estadoInicial; /** Array de cartas, iniciales, sin desordenar*/
	mazo; /** Array de cartas */
	id; /** string, id de elemento en DOM del tapete*/
	reglaAdmision; /** Función que define la regla de admisión de cartas de esta baraja */
	puedeSacar; /** bool, define si se puede sacar carta de esta baraja */
	mostrarTodas; /** bool, true, muestra todas, false muestra la ultima */
	alVaciarse; /** Función que se ejecuta al vaciarse la baraja */
	contador; /** Contador asociado a esta baraja */
	constructor({
		id,
		reglaAdmitir,
		puedeSacar = false,
		mostrarTodas = false,
		estadoInicial = [],
		alVaciarse = () => { },
		contador
	}) {
		this.estadoInicial = estadoInicial;
		this.id = id;
		setTimeout(() => {
			const tapete = document.getElementById(this.id);
			tapete.setAttribute("data-object", this); //Para identificar la baraja en el drop de Drag&Drop
			// Configurar eventos de drop en el tapete
			this.configurarEventosDrop(tapete);
		}, 50);
		this.puedeSacar = puedeSacar;
		this.reglaAdmision = reglaAdmitir;
		this.mostrarTodas = mostrarTodas;
		this.alVaciarse = alVaciarse;
		this.contador = contador;
		this.reiniciar(); //Set mazo
	}

	configurarEventosDrop(tapete) {
		tapete.addEventListener("dragover", (e) => {
			e.preventDefault();
			e.dataTransfer.dropEffect = "move";
		});

		tapete.addEventListener("dragenter", (e) => {
			e.preventDefault();
			tapete.style.boxShadow = "0 0 10px rgba(0,0,0,0.3)";
		});

		tapete.addEventListener("dragleave", (e) => {
			if (e.target === tapete) {
				tapete.style.boxShadow = "";
			}
		});

		tapete.addEventListener("drop", (e) => {
			e.preventDefault();
			tapete.style.boxShadow = "";
			
			// Intentar mover la carta desde mazoOrigen a este mazo
			if (mazoOrigen && mazoOrigen !== this) {
				mazoOrigen.moverA(this);
			}
			
			// Restaurar opacidad de todas las cartas
			document.querySelectorAll('img[draggable="true"]').forEach(img => {
				img.style.opacity = "1";
			});
		});
	}

	toString() {
		return `Tapete ${this.id}`;
	}

	next() {
		return this.mazo.length > 0 ? this.mazo[this.mazo.length - 1] : undefined;
	}

	push(carta) {
		this.mazo.push(carta);
	}

	moverA(otraBaraja, forzar = false) {
		if (!this.puedeSacar) return;
		const carta = this.next();
		if (carta) {
			if (forzar || otraBaraja.admite(carta)) {
				this.mazo.pop();
				this.contador.decContador();
				otraBaraja.push(carta);
				otraBaraja.contador.incContador();
				contMovimientos.incContador();
				this.imprimir();
				otraBaraja.imprimir();
			}
		}
		if (this.next() === undefined) {
			this.alVaciarse();
		}
	}

	admite(cartaSiguiente) {
		const cartaAnterior = this.next();
		if (cartaSiguiente)
			return this.reglaAdmision(cartaAnterior, cartaSiguiente);
		return false;
	}

	imprimir() {
		const tapete = document.getElementById(this.id);
		if (tapete) {
			const x = 5;
			const y = 5;
			if (!this.mostrarTodas) {
				const carta = this.next();
				if (carta) carta.imprimir(x, y, this.mazo.length - 1, tapete);
			} else {
				for (let i = 0; i < this.mazo.length; i++) {
					this.mazo[i].imprimir(x + i * paso, y + i * paso, i, tapete);
				}
			}
		}
	}

	barajar() {
		if (this.mazo.length == 0) return;
		//Para cada carta desde el final
		for (let i = this.mazo.length - 1; i > 0; i--) {
			//Establecer una posición aleatoria
			const j = Math.floor(Math.random() * (i + 1));
			// Permutar las cartas en las posiciones i y j
			[this.mazo[i], this.mazo[j]] = [this.mazo[j], this.mazo[i]];
		}
		//Esto garantiza que todas las cartas se han movido 1 vez a una posicion aleatoria del mazo
	}
	cortar() {
		if (this.mazo.length == 0) return;
		const puntoCorte = Math.floor((Math.random() * this.mazo.length));
		this.mazo = this.mazo.slice(puntoCorte).concat(this.mazo.slice(0, puntoCorte));
	}

	reiniciar() {
		this.mazo = [...this.estadoInicial];
		this.barajar();
		this.cortar();
		this.imprimir();
	}
}

//VARIABLES
// Mazos
let mazoOrigen; //Referencia al mazo origen del Drag&Drop
let mazoInicial = new Baraja({
	id: "inicial",
	reglaAdmitir: () => false,
	puedeSacar: true,
	mostrarTodas: true,
	estadoInicial: todasLasCartas(),
	alVaciarse: () => {
		if (comprobarVictoria()) {
			//Ejecutar victoria
			ejecutarVictoria();
		} else {
			volcarSobrantesAInicial();
		}
	},
	contador: contInicial
});
let mazoSobrantes = new Baraja({
	id: "sobrantes",
	reglaAdmitir: () => true,
	puedeSacar: true,
	alVaciarse: () => {
		if (comprobarVictoria()) {
			ejecutarVictoria();
		}
	},
	contador: contSobrantes
});
let mazoReceptor1 = new Baraja({ id: "receptor1", reglaAdmitir: siguiente, contador: contReceptor1 });
let mazoReceptor2 = new Baraja({ id: "receptor2", reglaAdmitir: siguiente, contador: contReceptor2 });
let mazoReceptor3 = new Baraja({ id: "receptor3", reglaAdmitir: siguiente, contador: contReceptor3 });
let mazoReceptor4 = new Baraja({ id: "receptor4", reglaAdmitir: siguiente, contador: contReceptor4 });

//FUNCIONES
function resetMazos() {
	mazoInicial.reiniciar();
	mazoSobrantes.reiniciar();
	mazoReceptor1.reiniciar();
	mazoReceptor2.reiniciar();
	mazoReceptor3.reiniciar();
	mazoReceptor4.reiniciar();
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
		this.reset();
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

//#region TESTING
//Funcion para testear el movimiento automático de cartas sin el drag&drop
let nextMove;

//#region GUI
// Rutina asociada a boton reset
// Desarrollo del comienzo de juego
function comenzarJuego() {
	if (nextMove) clearTimeout(nextMove);
	// Barajar y dejar mazoInicial en tapete inicial
	resetMazos();
	// Puesta a cero de contadores de mazos
	resetContadores();
	// Arrancar el conteo de tiempo
	contTiempo.reiniciar();
}
//#endregion

//Iniciar el juego al cargar la página
setTimeout(() => {
	comenzarJuego();
	//Test mover cartas
	//testMove(mazoReceptor1);
}, 50);