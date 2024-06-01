const fragment = document.createDocumentFragment()
console.log(fragment)
const container = document.querySelector('.container')
console.log(container)

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
let listaCategorias = traerCategorias()
    .then(resp => {
        console.log(resp);
        resp.forEach((element)=>{
            const divCategoria = document.createElement("div");
            const divTitulo = document.createElement("div");
            const divDatos = document.createElement("div");
            const divReadMore = document.createElement("div");
            const botonReadMore = document.createElement("button");
            divTitulo.classList ='tituloCategoria'
            divDatos.classList ='datosCategoria'
            divReadMore.classList = 'readMore'
            divTitulo.textContent = element.display_name
            divDatos.innerHTML = `<p>Oldest: ${element.oldest_published_date}</p><p>Newest: ${element.newest_published_date}</p><p>Update: ${element.updated}</p>`
            botonReadMore.setAttribute("type", "button");
            botonReadMore.textContent = "Read More!"
            divReadMore.append(botonReadMore);
            divCategoria.append(divTitulo);
            divCategoria.append(divDatos);
            divCategoria.append(divReadMore);
            fragment.append(divCategoria);
            console.log(fragment)
        })
        container.append(fragment);
    })
    .catch(error => alert(error))