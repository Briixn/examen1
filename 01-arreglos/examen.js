var fs = require('fs');
var inquirer = require('inquirer');
var rxjs = require('rxjs');
var mergeMap = require('rxjs/operators').mergeMap;
var map = require('rxjs/operators').map;
var find = require('rxjs/operators').find;
var nombreBD = 'people.json';
var preguntaMenu = {
    type: 'list',
    name: 'opcionMenu',
    message: 'Que quieres hacer??',
    choices: [
        'Crear',
    ]
};
var preguntaNuevaPeople = [
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
function main() {
    inicializarBase()
        .pipe(mergeMap(function (respuestaBDD) {
        return Menu()
            .pipe(map(function (respuesta) {
            return {
                respuestaPreguntas: respuesta,
                respuestaBDD: respuestaBDD
            };
        }));
    }), 
    //ALMACENAR NOMBRE NO ===
    mergeMap(//preuntar y devolver observable
    function (respuesta) {
        switch (respuesta.respuestaPreguntas.opcionMenu) {
            case 'Crear':
                return rxjs
                    .from(inquirer.prompt(preguntaNuevaPeople))
                    .pipe(map(function (licor) {
                    respuesta.persona = licor;
                    return respuesta;
                }));
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
                rxjs.of(respuesta);
        }
    }), map(//Actuar
    function (respuesta) {
        console.log('respuesta en accion', respuesta);
        switch (respuesta.respuestaPreguntas.opcionMenu) {
            case 'Crear':
                var nuevoLicor = respuesta.persona;
                respuesta.respuestaBDD.bdd.personas.push(nuevoLicor);
                return respuesta;
        }
    }), // Guardar Base de Datos
    mergeMap(function (respuesta) {
        return guardarBase(respuesta.respuestaBDD.bdd);
    }))
        .subscribe(function (mensaje) {
        console.log(mensaje);
    }, function (error) {
        console.log(error);
    }, function () {
        console.log('Completado');
        main();
    });
}
function Menu() {
    return rxjs.from(inquirer.prompt(preguntaMenu));
}
//
function inicializarBase() {
    var leerBDD$ = rxjs.from(leerBDPromesa());
    return leerBDD$
        .pipe(mergeMap(function (respuestaLeerBDD) {
        if (respuestaLeerBDD.bdd) {
            return rxjs.of(respuestaLeerBDD);
        }
        else {
            // falsy / null
            return rxjs.from(crearBD());
        }
    }));
}
function leerBDPromesa() {
    // @ts-ignore
    return new Promise(function (resolve) {
        fs.readFile(nombreBD, 'utf-8', function (error, contenidoLeido) {
            if (error) {
                resolve({
                    mensaje: 'Base de datos vacia',
                    bdd: null
                });
            }
            else {
                resolve({
                    mensaje: 'Si existe la Base',
                    bdd: JSON.parse(contenidoLeido)
                });
            }
        });
    });
}
function crearBD() {
    var base = '{"personas": []}';
    // @ts-ignore
    return new Promise(function (resolve, reject) {
        fs.writeFile(nombreBD, base, function (err) {
            if (err) {
                reject({ Mensaje: 'error creando Base', error: 500 });
            }
            else {
                resolve({ Mensaje: 'Base creada', bdd: JSON.parse(base) });
            }
        });
    });
}
function guardarBase(bdd) {
    // @ts-ignore
    return new Promise(function (resolve, reject) {
        fs.writeFile(nombreBD, JSON.stringify(bdd, null, 2), function (error) {
            if (error) {
                reject({ Mensaje: 'error guardando', error: 500 });
            }
            else {
                resolve({ Mensaje: 'Base guardada' });
            }
        });
    });
}
function buscarGENERO() {
    return new Promise(function (resolve, reject) {
        fs.readFile('people.json', 'utf-8', function (err, contenido) {
            if (err) {
                reject({ mensaje: 'Error leyendo' });
            }
            else {
                var bdd = JSON.parse(contenido);
                var respuestaFind = bdd.persona
                    .map(function (people) {
                    return people.gender;
                });
                resolve(respuestaFind);
            }
        });
    });
}
var male = [];
var female = [];
buscarGENERO()
    .then(function (contenidoArchivo) {
    console.log('GENERO...', contenidoArchivo);
    contenidoArchivo.map(function (personas) {
        if (personas === 'male') {
            male.push(personas);
            console.log('male', male);
        }
        else {
            if (personas === 'female') {
                female.push(personas);
                console.log('female', female);
            }
        }
    });
})
    .catch(function (resultadoError) {
    console.log('error...', resultadoError);
});
main();
