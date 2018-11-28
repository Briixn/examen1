const fs = require('fs');
const inquirer = require('inquirer');
const rxjs = require('rxjs');
const mergeMap = require('rxjs/operators').mergeMap;
const map = require('rxjs/operators').map;
const find = require('rxjs/operators').find;
const nombreBD= 'people.json';

const preguntaMenu = {
    type: 'list',
    name: 'opcionMenu',
    message: 'Que quieres hacer??',
    choices: [
        'Crear',

    ]
};


const preguntaNuevaPeople = [
    {
        type: 'input',
        name: 'name',
        message: 'Nombre del persona: '
    },
    {
        type: 'input',
        name: 'height',
        message: 'Tipo del persona: '

    },
    {
        type: 'input',
        name: 'mass',
        message: 'Grado del persona: '
    },
    {
        type: 'input',
        name: 'hair_color',
        message: 'Ingrese el color del cabello: '
    },
    {
        type: 'input',
        name: 'skin_color',
        message: 'Ingrese el color de la piel: '
    },
    {
        type: 'input',
        name: 'eye_color',
        message: 'Ingrese el color de los ojos '
    },
    {
        type: 'input',
        name: 'birth_year',
        message: 'Ingrese el año de nacimiento '
    },
    {
        type: 'input',
        name: 'gender',
        message: 'Genero: '
    },
    {
        type: 'input',
        name: 'homeworld',
        message: 'homeworld '
    },
    {
        type: 'input',
        name: 'created',
        message: 'ingrese created '
    },
    {
        type: 'input',
        name: 'edited',
        message: 'ingrese edited '
    },
    {
        type: 'input',
        name: 'url',
        message: 'ingrese url '
    },
];

function main(){
    inicializarBase()
        .pipe(
            mergeMap(
                (respuestaBDD: RespuestaBDD)=> {
                    return Menu()
                        .pipe(
                            map(
                                (respuesta: OpcionesPregunta) => {
                                    return {
                                        respuestaPreguntas: respuesta,
                                        respuestaBDD
                                    }
                                }
                            )
                        )
                }
            ),
            //ALMACENAR NOMBRE NO ===
            mergeMap( //preuntar y devolver observable
                (respuesta: RespuestaPreguntas) => {
                    switch (respuesta.respuestaPreguntas.opcionMenu) {
                        case 'Crear':
                            return rxjs
                                .from(inquirer.prompt(preguntaNuevaPeople))
                                .pipe(
                                    map(
                                        (licor:People) => {
                                            respuesta.persona = licor;
                                            return respuesta
                                        }
                                    )
                                );

                        default:
                            respuesta.persona = {
                                name: null,
                                height: null,
                                mass: null,
                                hair_color: null,
                            skin_color: null,
                            eye_color: null,
                            birth_year: null,
                            gender: null,
                            homeworld: null,
                            films: null,

                            species: null,
                            vehicles: null,
                            starships: null,
                            created: null,
                            edited: null,
                            url: null
                            };
                            rxjs.of(respuesta)

                    }
                }
            ),
            map(//Actuar
                (respuesta: RespuestaPreguntas) => {
                    console.log('respuesta en accion', respuesta);
                    switch (respuesta.respuestaPreguntas.opcionMenu) {
                        case 'Crear':
                            const nuevoLicor = respuesta.persona;
                            respuesta.respuestaBDD.bdd.personas.push(nuevoLicor);
                            return respuesta;

                    }
                }

            ), // Guardar Base de Datos
            mergeMap(
                (respuesta: RespuestaPreguntas) => {
                    return guardarBase(respuesta.respuestaBDD.bdd);
                }
            )
        )
        .subscribe(
            (mensaje) => {
                console.log(mensaje);
            },
            (error) => {
                console.log(error);
            }, () => {
                console.log('Completado');
                main();
            }
        )
}
function Menu(){
    return rxjs.from(inquirer.prompt(preguntaMenu))
}


//

function inicializarBase() {
    const leerBDD$ = rxjs.from(leerBDPromesa());

    return leerBDD$
        .pipe(
            mergeMap(
                (respuestaLeerBDD: RespuestaBDD) => {
                    if (respuestaLeerBDD.bdd) {
                        return rxjs.of(respuestaLeerBDD)
                    } else {
                        // falsy / null
                        return rxjs.from(crearBD())
                    }
                }
            )
        );
}

function leerBDPromesa(){
    // @ts-ignore
    return new Promise(
        (resolve) => {
            fs.readFile(
                nombreBD,
                'utf-8',
                (error, contenidoLeido) => {
                    if (error) {
                        resolve({
                            mensaje: 'Base de datos vacia',
                            bdd: null
                        });
                    } else {
                        resolve({
                            mensaje: 'Si existe la Base',
                            bdd: JSON.parse(contenidoLeido)
                        });
                    }

                }
            );
        }
    );
}

function crearBD() {
    const base = '{"personas": []}';
    // @ts-ignore
    return new Promise(
        (resolve,reject) => {
            fs.writeFile(
                nombreBD,
                base,
                (err) => {
                    if(err){
                        reject({Mensaje: 'error creando Base', error: 500});
                    }else {
                        resolve({Mensaje: 'Base creada', bdd: JSON.parse(base)});
                    }
                }
            )
        }
    )
}

function guardarBase(bdd: BaseDeDatos) {
    // @ts-ignore
    return new Promise(
        (resolve,reject)=> {
            fs.writeFile(
                nombreBD,
                JSON.stringify(bdd,null,2),
                (error) => {
                    if(error){
                        reject({Mensaje: 'error guardando', error: 500});
                    } else {
                        resolve({Mensaje: 'Base guardada'});
                    }
                }
            )
        }
    )
}

//
interface People {
    ///
    name: string;
    height: string;
    mass: string;
    hair_color: string;
    skin_color: string;
    eye_color: string;
    birth_year: string;
    gender: string;
    homeworld: string;
    films: {};

    species: {};
    vehicles:{};
    starships: {};
    created: string;
    edited: string;
    url: string;
    ///


}

interface BaseDeDatos {
    personas: People[];
}
interface RespuestaBDD {
    mensaje: string,
    bdd: BaseDeDatos
}
interface OpcionesPregunta {
    opcionMenu: 'Crear'
}

interface RespuestaPreguntas {
    respuestaPreguntas: OpcionesPregunta,
    respuestaBDD: RespuestaBDD,
    persona?: People
}

function buscarGENERO() {
    return new Promise(
        (resolve, reject) => {
            fs.readFile('people.json', 'utf-8',
                (err, contenido) => {
                    if (err) {
                        reject({mensaje: 'Error leyendo'});
                    } else {
                        const bdd = JSON.parse(contenido);
                        const respuestaFind = bdd.persona
                            .map(
                                (people)=>{
                                    return  people.gender;
                                }
                            )

                        resolve(respuestaFind);
                    }
                });
        }
    );
}

var male= [];
var female= [];
buscarGENERO()
    .then(
    (contenidoArchivo)=>{
        console.log('GENERO...',contenidoArchivo);
        contenidoArchivo.map(
            (personas)=> {
                if (personas === 'male') {
                    male.push(personas);
                    console.log('male',male)
                }else{
                    if(personas === 'female'){
                    female.push(personas)
                        console.log('female',female)
                    }
                }

            }

        )

    }
    )
    .catch(
        (resultadoError)=>{
            console.log('error...',resultadoError);
        }
    )

main();