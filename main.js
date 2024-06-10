const firebaseConfig = {
    apiKey: "AIzaSyAhQnwHTyYmXr3CG3w4AZjFdBw3FbIfgTQ",
    authDomain: "biblioteca-times.firebaseapp.com",
    projectId: "biblioteca-times",
    storageBucket: "biblioteca-times.appspot.com",
    messagingSenderId: "252916477826",
    appId: "1:252916477826:web:b9a2c5898337d95dc3299b"
};

firebase.initializeApp(firebaseConfig);// Inicializaar app Firebase

const db = firebase.firestore();// db representa mi BBDD //inicia Firestore

//** VARIABLES **
const fragment = document.createDocumentFragment()
const main = document.querySelector('main');
const divCargando = document.createElement("div");
divCargando.classList = "cargando";
divCargando.innerHTML = '<div style="width:100%;height:0;padding-bottom:84%;position:relative;"><iframe src="https://giphy.com/embed/iheTB65YtlVZ0PJXFU" width="100%" height="100%" style="position:absolute" frameBorder="0" class="giphy-embed" allowFullScreen></iframe></div><p><a href="https://giphy.com/gifs/Friends-friends-episode-14-tv-iheTB65YtlVZ0PJXFU"></a></p>'
let listaActual;// creo una lista con lo libros que se pintan en pantalla en una categoria para luego poder entrar a esa lista en el evento de asignar favoritos ya que al pintarse los libros en el DOM dentro de una funcion, no puedo acceder a ellos desde el evento.
let librosFavoritos = [];
let usuarioActual;
let rutaFavoritos; // la creo en global pero no la puedo definir hasta que usuario este logeado porque si no me da error. se crea con la funcion llamarRutaUsusario() cuando el usuario se logea
let filtroAlfabetico = false;


/** EVENTOS **/

document.addEventListener('click', (event) => {
    if (event.target.innerText == "Read More!") {
        const indiceCategoria = event.target.id
        pintarLibros(indiceCategoria)
    } else if (event.target.innerText == "BACK TO INDEX") {
        pintarCategorias();
    } else if (event.target.innerText == "BUY AT AMAZON") {
        window.open(event.target.id, '_blank');
    } else if (event.target.textContent == "favorite") {
        event.target.classList.toggle("relleno");
        const indiceLibroFav = event.target.id
        let libroFav = listaActual[indiceLibroFav];
        console.log(libroFav)//indice del libro en la lista
        let query = rutaFavoritos.doc(libroFav.title);
        query.get().then((doc) => {
            if (doc.exists) {
                borrarLibroFav(indiceLibroFav);
            } else {
                guardarLibroFav(indiceLibroFav);
                alert(`el siguiente libro se ha GUARDADO en favoritos:\n${libroFav.title}`)
            }
        }).catch((error) => {
            console.log("Error getting document:", error);
        });

    } else if (event.target.textContent == "IR A FAVORITOS") {
        pintarLibrosFav();
    } else if (event.target.textContent == "SALIR") {
        salirUsuario()
    } else if (event.target.textContent == "LogIn") {
        console.log(event)
        pintarLogin();
    } else if (event.target.textContent == "Darse de alta") {
        pintarDarDeAlta();
    } else if (event.target.id == "usuario") {
        pintarOpcionesUsuario();
    } else if (event.target.id == "AZ") {
        filtroAlfabetico = "AZ"
        document.querySelector(".portadaCategoria") ? pintarLibros() : pintarCategorias();
    } else if (event.target.id == "ZA") {
        filtroAlfabetico = "ZA"
        document.querySelector(".portadaCategoria") ? pintarLibros() : pintarCategorias();
    }
});

document.addEventListener("submit", (event) => {
    event.preventDefault();
    if (event.target.id == "form1") {
        let nombreUsuario = event.target.elements.nombreUsuario.value;
        let email = event.target.elements.email.value;
        let pass = event.target.elements.pass.value;
        let pass2 = event.target.elements.pass2.value;
        // db.collection("user").where("email", "==", email)
        //     .get()
        //     .then((querySnapshot) => {
        //         querySnapshot.forEach((doc) => {
        //             console.log (doc(data))
        //             alert("el documento ya existe")
        //         })
        //     })
        //     .catch(() =>{
        //         pass === pass2 ? darDeAlta(email, pass) : alert("error password");
        //     });
        pass === pass2 ? darDeAlta(nombreUsuario, email, pass) : alert("error password");

    } else if (event.target.id == "form2") {
        let email = event.target.elements.email2.value;
        let pass = event.target.elements.pass3.value;
        logearUsuario(email, pass)
    }
});


/** FUNCIONES **/



//pintar las categorias
const traerCategorias = async () => {
    try {
        const respuesta = await fetch('https://api.nytimes.com/svc/books/v3/lists/names.json?api-key=2KGgtZps9ppvRaQucc9uRZqmGxz7GkPZ')
        if (respuesta.ok) {
            const data = await respuesta.json()
            return data.results
        } else {
            throw 'fallo al conseguir las categorias'
        }
    } catch (error) {
        return error
    }
}

let pintarCategorias = async () => {
    main.innerHTML = "";
    main.append(divCargando);
    document.querySelector(".portadaCategoria") && document.querySelector(".portadaCategoria").remove() //comprueba si existe una categoria en el encabeado y,  si la hay, la borra.
    setTimeout(async () => {
        listaActual = await traerCategorias()
        if (filtroAlfabetico == "AZ") {
            listaActual = ordenarAlfabeticamente(listaActual)
        } else if (filtroAlfabetico == "ZA") {
            listaActual = ordenarAlfabeticamente(listaActual)
        }
        main.innerHTML = ""
        const container = document.createElement("section");
        container.classList = "container";
        listaActual.forEach((element) => {
            const listName = element.list_name_encoded;
            const divCategoria = document.createElement("article");
            const divTitulo = document.createElement("h3");
            const divDatos = document.createElement("div");
            const divReadMore = document.createElement("div");
            const botonReadMore = document.createElement("button");

            divCategoria.classList = 'categoria'
            divTitulo.classList = 'tituloCategoria'
            divDatos.classList = 'datosCategoria'
            divReadMore.classList = 'readMore'
            divTitulo.textContent = element.display_name
            divDatos.innerHTML = `<p>Oldest: ${element.oldest_published_date}</p>
            <p>Newest: ${element.newest_published_date}</p>
            <p>Update: ${element.updated}</p>`
            botonReadMore.setAttribute("type", "button");
            botonReadMore.textContent = "Read More!"
            botonReadMore.classList = "botonReadMore"
            botonReadMore.id = `${listName}`

            divReadMore.append(botonReadMore);
            divCategoria.append(divTitulo);
            divCategoria.append(divDatos);
            divCategoria.append(divReadMore);
            fragment.append(divCategoria);
        })
        container.append(fragment);
        main.append(container);
    }, "2000")
}
pintarCategorias();


//pintar los libros por categoria
const traerLibros = async (categoria1) => {
    try {
        const respuesta = await fetch(`https://api.nytimes.com/svc/books/v3/lists/current/${categoria1}.json?api-key=2KGgtZps9ppvRaQucc9uRZqmGxz7GkPZ`)
        if (respuesta.ok) {
            const datos = await respuesta.json();
            return datos.results
        } else {
            throw 'no se han encontrado los libros de esta categoria'
        }
    } catch (error) {
        alert(error)
    }
}

const pintarLibros = async (categoria) => {
    document.querySelector(".portadaCategoria") && document.querySelector(".portadaCategoria").remove()
    categoriaActual = categoria;
    main.innerHTML = "";
    main.append(divCargando);
    const header = document.querySelector('.header')
    const data = await traerLibros(categoria);
    listaActual = data.books;
    if (filtroAlfabetico == "AZ") {
        listaActual = ordenarAlfabeticamente(listaActual, "ascendente")
    } else if (filtroAlfabetico == "ZA") {
        listaActual = ordenarAlfabeticamente(listaActual, "ascendente")
    }
    main.innerHTML = "";
    const secbotonVolver = document.createElement("section");
    secbotonVolver.classList = "botonVolver";
    const botonVolver = document.createElement("button");
    botonVolver.textContent = "BACK TO INDEX";
    botonVolver.id = `volver`;
    secbotonVolver.append(botonVolver);
    const seclistaActual = document.createElement("section");
    seclistaActual.classList = "container1";
    const portadaCategoría = document.createElement("p")
    portadaCategoría.classList = "portadaCategoria"
    portadaCategoría.textContent = `${data.list_name}`
    header.append(portadaCategoría);

    listaActual.forEach(libro => {

        const artLibro = document.createElement("art");
        const divNombre = document.createElement("div");
        const divImagen = document.createElement("div");
        const imagen = document.createElement("img");
        const divWeeks = document.createElement("div");
        const divDescription = document.createElement("div");
        const divBottonBuy = document.createElement("div");
        const botonBuy = document.createElement("button");


        artLibro.classList = "libro";
        artLibro.id = `libro${listaActual.indexOf(libro)}`
        divNombre.classList = "tituloLibro";
        divImagen.classList = "imagen";
        divWeeks.classList = "weeks";
        divDescription.classList = "description";
        divBottonBuy.classList = "botonBuy";

        divNombre.textContent = `#${libro.rank} ${libro.title}`;
        imagen.setAttribute("src", `${libro.book_image}`);
        imagen.setAttribute("alt", `${libro.title}`);
        divWeeks.innerHTML = `<p><em>Weeks on list: ${libro.weeks_on_list}</em></p>`;
        divDescription.innerHTML = `<p>${libro.description}</p>`;
        botonBuy.textContent = "BUY AT AMAZON"
        botonBuy.id = `${libro.amazon_product_url}`



        divImagen.append(imagen);
        divBottonBuy.append(botonBuy);

        artLibro.append(divNombre);
        artLibro.append(divImagen);
        artLibro.append(divWeeks);
        artLibro.append(divDescription);
        artLibro.append(divBottonBuy);

        if (usuarioActual) {
            const favBoton = document.createElement("button");
            const favorite = document.createElement("span")
            favorite.classList = "material-symbols-outlined"
            favorite.textContent = `favorite`
            favorite.id = `${listaActual.indexOf(libro)}`
            divBottonBuy.append(favBoton);
            favBoton.append(favorite);
        }

        seclistaActual.append(artLibro)
    })
    main.append(secbotonVolver)
    main.append(seclistaActual);
}


//administracion de favoritos
const llamarRutaFavoritos = () => {
    rutaFavoritos = db.collection("users").doc(usuarioActual.bc.email).collection("favoritos")
}

const guardarLibroFav = async (indiceLibro) => {
    let libroFav = listaActual[indiceLibro];
    rutaFavoritos
        .doc(libroFav.title)
        .set(libroFav)
    traerLibrosFav();
};

const borrarLibroFav = async (indiceLibro) => {
    let libroFav = librosFavoritos[indiceLibro];
    rutaFavoritos.doc(libroFav.title).delete().then(() => {
        alert(`Se ha BORRADO el siguiente libro de la lista de favoritos:\n${libroFav.title}`);
        traerLibrosFav();
        if (document.querySelector(".portadaCategoria").textContent == "Favoritos") { 
            console.log("he entrado")
            pintarLibrosFav(); 
        }
    }).catch((error) => {
        console.error("Error removing document: ", error);
    })
}
    

const pintarLibrosFav = async () => {
    document.querySelector(".portadaCategoria") && document.querySelector(".portadaCategoria").remove()
    main.innerHTML = "";
    const header = document.querySelector('.header')
    const secbotonVolver = document.createElement("section");
    secbotonVolver.classList = "botonVolver";
    const botonVolver = document.createElement("button");
    botonVolver.textContent = "BACK TO INDEX";
    botonVolver.id = `volver`;
    secbotonVolver.append(botonVolver);
    const seclistaActual = document.createElement("section");
    seclistaActual.classList = "container1";
    const portadaCategoría = document.createElement("p")
    portadaCategoría.classList = "portadaCategoria"
    portadaCategoría.textContent = `Favoritos`
    header.append(portadaCategoría);

    if (filtroAlfabetico == "AZ") {
        librosFavoritos = ordenarAlfabeticamente(librosFavoritos, "ascendente")
    } else if (filtroAlfabetico == "ZA") {
        librosFavoritos = ordenarAlfabeticamente(librosFavoritos, "ascendente")
    }

    librosFavoritos.forEach(libro => {

        const artLibro = document.createElement("art");
        const divNombre = document.createElement("div");
        const divImagen = document.createElement("div");
        const imagen = document.createElement("img");
        const divWeeks = document.createElement("div");
        const divDescription = document.createElement("div");
        const divBottonBuy = document.createElement("div");
        const botonBuy = document.createElement("button");
        const favBoton = document.createElement("button");
        const favorite = document.createElement("span")

        artLibro.classList = "libro";
        artLibro.id = `libro${librosFavoritos.indexOf(libro)}`
        divNombre.classList = "tituloLibro";
        divImagen.classList = "imagen";
        divWeeks.classList = "weeks";
        divDescription.classList = "description";
        divBottonBuy.classList = "botonBuy";

        divNombre.textContent = `#${libro.rank} ${libro.title}`;
        imagen.setAttribute("src", `${libro.book_image}`);
        imagen.setAttribute("alt", `${libro.title}`);
        divWeeks.innerHTML = `<p><em>Weeks on list: ${libro.weeks_on_list}</em></p>`;
        divDescription.innerHTML = `<p>${libro.description}</p>`;
        botonBuy.textContent = "BUY AT AMAZON"
        botonBuy.id = `${libro.amazon_product_url}`
        favorite.classList = "material-symbols-outlined"
        favorite.textContent = `favorite`
        favorite.id = `${librosFavoritos.indexOf(libro)}`

        favBoton.append(favorite);
        divImagen.append(imagen);
        divBottonBuy.append(botonBuy);
        divBottonBuy.append(favBoton);

        artLibro.append(divNombre);
        artLibro.append(divImagen);
        artLibro.append(divWeeks);
        artLibro.append(divDescription);
        artLibro.append(divBottonBuy);

        seclistaActual.append(artLibro)
        main.append(secbotonVolver)
        main.append(seclistaActual);
    });
}

const traerLibrosFav = async () => {
    librosFavoritos = [];
    rutaFavoritos.get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            librosFavoritos.push(doc.data());
        });
    })
}

const crearCabeceraFav = async () => {
    let usuario;
    let botonLogIn = document.querySelector(".logIn")
    let auth = document.querySelector(".auth")
    let botonFav = document.createElement("button")


    //pinta el boton "IR A FAVORITOS"
    botonFav.setAttribute("type", "button")
    botonFav.classList.add("botonFav");
    botonFav.textContent = "IR A FAVORITOS";

    auth.append(botonFav)


    // Pintar el nombre de usuario en vez de logIn
    await db.collection("users").doc(usuarioActual.bc.email).get()
        .then((doc) => {
            if (doc.exists) {
                console.log(doc.data());
                usuario = doc.data().nombreUsuario;
            } else {
                throw "No such document!"
            }
        }).catch((error) => {
            console.log("Error getting document:", error);
        });
    console.log(usuario)
    botonLogIn.innerHTML = `<img src=./assets/iconoUsusario2.png alt="Icono de usuario"></img>${usuario}`
    botonLogIn.id = "usuario"
}

// SUBIR IMAGENES




//FILTROS

const ordenarAlfabeticamente = (lista) => {
    console.log(lista)
    console.log("ordenAlfabetico")
    if (lista[0].rank){
        if (filtroAlfabetico == "AZ") {
            listaOrdenada = lista.sort((a, b) =>a.title.localeCompare(b.title))
        } else if (filtroAlfabetico == "ZA") {
            listaOrdenada = lista.sort((a, b) =>b.title.localeCompare(a.title))
        } else {
            console.log("error con el filtroAlfabetico")
        }
    } else {
            if (filtroAlfabetico == "AZ") {
                listaOrdenada = lista.sort((a, b) => a.display_name.localeCompare(b.display_name))
            } else if (filtroAlfabetico == "ZA") {
                listaOrdenada = lista.sort((a, b) =>b.display_name.localeCompare(a.display_name))            
            } else {
                console.log("error con el filtroAlfabetico")
            }
        }
    
    console.log(listaOrdenada)
    return listaOrdenada
}

const filtroBuscar = () => {

}

//Autenticación

const traerDatosUsuarioActual = () => {
    usuarioActual = firebase.auth().currentUser;
    console.log(usuarioActual)
}

const pintarLogin = () => {
    main.innerHTML = "";
    main.innerHTML =
        `<section>
            <div class = "formulario">
                <h3>Login</h3>
                <form id="form2" action="#" method="POST">
                    <div>
                        <label for="email2">Email:</label><br>
                        <input type="email" id="email2" name="email2" placeholder="Introduce email..."><br>
                        <label for="pass3">Password:</label><br>
                        <input type="password" id="pass3" name="pass3" placeholder="Introduce password..."><br>
                        <input type="submit" value="Enviar">
                    </div>
                </form>
            <button type="button" class= "altaUsuario">Darse de alta</button>
            </div>
    </section>`
}

const pintarDarDeAlta = () => {
    main.innerHTML = "";
    main.innerHTML =
        `<div class = "formulario">
                <h3>Formulario de Registro</h3>
                <form id="form1" action="#" method="POST">
                    <div>
                        <label for="nombreUsuario">Nombre de usuario:</label><br>
                        <input type="text" id="nombreUsusario" name="nombreUsuario" placeholder="Introduce nombre de usuario..."><br>
                        <label for="email">Email:</label><br>
                        <input type="email" id="email" name="email" placeholder="Introduce email..."><br>
                        <label for="pass">Password:</label><br>
                        <input type="password" id="pass" name="pass" placeholder="Introduce password..."><br>
                        <label for="pass2">Repite password:</label><br>
                        <input type="password" id="pass2" name="pass2" placeholder="Repite password..."><br><br>
                        <input type="submit" value="Enviar">
                    </div>
                </form>
            </div>`

}

const pintarOpcionesUsuario = () => {
    main.innerHTML = "";
    main.innerHTML =
        `<section class="container"
        <div class= "formulario">
            <h3>Configuración</h3>
            <form id="form3" action="#" method="POST">
                <label for=img>Sube tu imagen de perfin</label>
                <input type="file" id="img" name="img" multiple />
                <input type="submit" value="Subir">
        </div>
        <div class= "LogOut">
            <button class= "logOut">SALIR</button>
        </div>
        </section>`
};

const logearUsuario = async (email, password) => {
    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Signed in
            let user = userCredential.user;
            console.log(`se ha logado ${user.email} ID:${user.uid}`)
            alert(`se ha logado ${user.email} ID:${user.uid}`)
            console.log("USER", user);
            pintarCategorias()
            traerDatosUsuarioActual();
            llamarRutaFavoritos();
            crearCabeceraFav();
            traerLibrosFav();
        })
        .catch((error) => {
            let errorCode = error.code;
            let errorMessage = error.message;
            console.log(errorCode)
            console.log(errorMessage)

        });

};

const salirUsuario = () => {
    let user = firebase.auth().currentUser;

    firebase.auth().signOut().then(() => {
        console.log("Sale del sistema: " + user.email)
    }).catch((error) => {
        console.log("hubo un error: " + error);
    });
    location.reload()
}

const darDeAlta = (nombreUsuario, email, password) => {
    firebase
        .auth()
        .createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Signed in
            let user = userCredential.user;
            console.log(`se ha registrado ${user.email} ID:${user.uid}`)
            alert(`se ha registrado ${user.email} ID:${user.uid}`)
            // ...
            // Saves user in firestore
            crearUsuario({
                id: user.uid,
                email: user.email,
                imagen: "default",
                nombreUsuario: nombreUsuario
            });
            pintarLogin();
        })
        .catch((error) => {
            console.log("Error en el sistema" + error.message, "Error: " + error.code);
        });

};

const crearUsuario = (user) => {
    db.collection("users")
        .doc(user.email)
        .set(user)
        .then(() => console.log(`usuario guardado correctamente con id: ${user.email}`))
        .catch((error) => console.error("Error adding document: ", error));
};
