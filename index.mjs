import fs from "fs/promises"
import { constants } from "fs"
import { input } from "./utils.mjs"

const fecha = new Date()
const archivo = `./csvs/${fecha.getFullYear()}-${fecha.getMonth() + 1}-${fecha.getDate()}.csv`

try {
    await fs.access("./csvs", constants.F_OK)
} catch {
    await fs.mkdir("./csvs")
}

try {
    await fs.access(archivo, constants.F_OK)
} catch {
    await fs.writeFile(archivo, "ID,Producto,Stock,Precio\n", "utf-8")
    console.log(`Archivo creado: ${archivo}`)
}

async function leerCSV() {
    const datos = await fs.readFile(archivo, "utf-8")
    const lineas = datos.trim().split("\n")
    const encabezado = lineas[0].split(",")
    const filas = datos.split('\n').slice(1).filter(linea => linea.trim() !== '').map(linea => {
            const [id, producto, stock, precio] = linea.split(',')
            return { ID: id, Producto: producto, Stock: stock, Precio: precio }
        })
    console.table(filas)
}

async function agregarProducto() {
    const datos = await fs.readFile(archivo, "utf-8")
    const lineas = datos.trim().split("\n")
    const ultimoId = lineas.length > 1 ? parseInt(lineas.at(-1).split(",")[0]) : 0
    const nuevoId = ultimoId + 1

    const producto = await input("Nombre del producto: ")
    const stock = await input("Stock: ")
    const precio = await input("Precio: ")

    const nuevaLinea = `${nuevoId},${producto},${stock},${precio}\n`
    await fs.writeFile(archivo, datos + '\n' + nuevaLinea.trim(), 'utf-8')
    console.log("Producto agregado.")
}

async function borrarProducto() {
    const id = await input("ID del producto a borrar: ")
    const datos = await fs.readFile(archivo, "utf-8")
    const lineas = datos.trim().split("\n")

    const nuevas = lineas.filter((linea, i) => {
        if (i === 0) return true // mantener encabezado
        return parseInt(linea.split(",")[0]) !== parseInt(id)
    })

    if (nuevas.length === lineas.length) {
        console.log("No se encontró ese ID.")
    } else {
        await fs.writeFile(archivo, nuevas.join("\n") + "\n", "utf-8")
        console.log("Producto borrado.")
    }
}

let salir = false
while (!salir) {
    console.log("\n--- MENÚ ---")
    console.log("1. Leer productos")
    console.log("2. Agregar producto")
    console.log("3. Borrar producto")
    console.log("4. Salir")

    const opcion = await input("Elegí una opción: ")

    switch (opcion) {
        case "1":
            await leerCSV()
            break
        case "2":
            await agregarProducto()
            break
        case "3":
            await borrarProducto()
            break
        case "4":
            console.log("Nos vimo")
            salir = true
            break
        default:
            console.log("Opción inválida")
    }
}
