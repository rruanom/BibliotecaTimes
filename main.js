const fragment = document.createDocumentFragment()
const main = document.querySelector('main');
const divCargando = document.createElement("div");
divCargando.classList="cargando";
divCargando.innerHTML = '<div style="width:100%;height:0;padding-bottom:84%;position:relative;"><iframe src="https://giphy.com/embed/iheTB65YtlVZ0PJXFU" width="100%" height="100%" style="position:absolute" frameBorder="0" class="giphy-embed" allowFullScreen></iframe></div><p><a href="https://giphy.com/gifs/Friends-friends-episode-14-tv-iheTB65YtlVZ0PJXFU">via GIPHY</a></p>'
document.addEventListener('click', (event) => {
    if (event.target.innerText == "Read More!") {
        const indiceCategoria = event.target.id
        pintarLibros(indiceCategoria)
    } else if (event.target.innerText == "VOLVER") {
        listaCategorias();
    } else if (event.target.innerText == "BUY AT AMAZON"){
        window.open(event.target.id, '_blank');
    }
})

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
let listaCategorias = async()=>{
main.append(divCargando)
setTimeout(async()=>
    {const resp = await traerCategorias()
        main.innerHTML = ""
        const container = document.createElement("section");
        container.classList = "container";
        resp.forEach((element) => {
            const listName = element.list_name_encoded;
            const divCategoria = document.createElement("div");
            const divTitulo = document.createElement("div");
            const divDatos = document.createElement("div");
            const divReadMore = document.createElement("div");
            const botonReadMore = document.createElement("button");
            divCategoria.classList = 'categoria'
            divTitulo.classList = 'tituloCategoria'
            divDatos.classList = 'datosCategoria'
            divReadMore.classList = 'readMore'
            divTitulo.textContent = element.display_name
            divDatos.innerHTML = `<p>Oldest: ${element.oldest_published_date}</p><p>Newest: ${element.newest_published_date}</p><p>Update: ${element.updated}</p>`
            botonReadMore.setAttribute("type", "button");
            botonReadMore.textContent = "Read More!"
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

const traerLibros = async (categoria1) => {
    try {
        const respuesta = await fetch(`https://api.nytimes.com/svc/books/v3/lists/current/${categoria1}.json?api-key=2KGgtZps9ppvRaQucc9uRZqmGxz7GkPZ`)
        if (respuesta.ok) {
            const datos = await respuesta.json();
            return datos.results.books
        } else {
            throw 'no se han encontrado los libros de esta categoria'
        }
    } catch (error) {
        alert(error)
    }
}
const pintarLibros = async (categoria) => {
    main.append(divCargando);
    const listaLibros = await traerLibros(categoria);
    console.log(listaLibros)
    main.innerHTML = "";
    const secbotonVolver = document.createElement("section");
    secbotonVolver.classList = "botonVolver";
    const botonVolver = document.createElement("button");
    botonVolver.textContent = "VOLVER";
    botonVolver.id = `volver`;
    secbotonVolver.append(botonVolver);
    const secListaLibros = document.createElement("section");
    secListaLibros.classList = "container";

    listaLibros.forEach(libro => {

        const artLibro = document.createElement("art");
        const divNombre = document.createElement("div");
        const divImagen = document.createElement("div");
        const imagen = document.createElement("img");
        const divWeeks = document.createElement("div");
        const divDescription = document.createElement("div");
        const divBottonBuy = document.createElement("div");
        const botonBuy = document.createElement("button");

        artLibro.classList = "libro";
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

        fragment.append(divNombre);
        fragment.append(divImagen);
        fragment.append(divWeeks);
        fragment.append(divDescription);
        fragment.append(divBottonBuy);
    })
    secListaLibros.append(fragment);
    main.append(secbotonVolver)
    main.append(secListaLibros);
}

listaCategorias();