const express = require("express");
const mongoose = require("mongoose");

// App de espress
const app = express();

//Middleware para parsear la BD. a Json (Primer Middleware)
app.use(express.json());

// Segundo Middleware
app.use((request, response, next) => {
    console.log("Primer Middleware");
    next();
})
app.use((request, response, next) => {
    console.log("Segundo Middlewate");
    next();
})
// Middleware Encapsulado para un Endpoint en específico (Para Rutas Publicas o Privadas)
//Se guarda en una constante para ocuparse después.
const middlewareEncapsulado = (req, res, next) => {
    console.log("Middleware encapsulado para un endpoint en específico");
    next();
}
 


/* 
 * Middlewares */
/*  * 1 - Hacer un middleware para toda la aplicacion que imprima en consola el metodo */
  /* * 2 - Un middleware para el endpoint de obtener un koder donde imprima en consola 'Obteniendo koder ......'  */
 
 
 
 /* * 3 - Hacer un middleware para el endpoint de crear Koder donde si no nos manda informacion(datos, json)  */
 /* * REGRESAR "No estas mandado objetos" ->>> para que ni entre al endpoint de crear Koder */



  /**
   * Middlewares
   * - Nos sirve para poder realizar codigo antes de los endpoints.
   * - Tienen acceso a la request, a la response.
   * - Tienen una palabra llamada next() -> indica que puedes continuar
   */

//URL de Base de Datos
const databaseURL = "mongodb+srv://LuisDOlvera:Mongo01@cluster0.ii34zsj.mongodb.net/Kodemia"

/*
* Colecciones
*Documentos -> schemas/modelos
 */
const koderSchema = new mongoose.Schema({
    name: {
        type: String,
        minlength: 3,
        maxlength: 10,
        required: true
    },
    module: {
        type: String
    },
    generation: {
        type: String
    },
    age: {
        type: Number,
        required: true,
        min: 18,
        max: 100
    },
    sex: {
        type: String,
        enum: ["f", "m", "o"]
    }
})

// Modelos -> Va Capitalizado y en singular. (Koder)
// Nombre de la Colección -> en Plural. ("koders")
const Koder = mongoose.model("Koders", koderSchema, "Koders");

// Endpoint en Home
app.get("/", (req, res) => {
    res.json("Estamos en el endpoint de HOME");
})

/*
* path params -> request.params
* query params -> request.query 
*/

//Endpoint de Koders
//Query param
app.get("/koders", async (req, res)=> {
    //Accedemos a nuestra Base de Datos

   try {
    //Todo lo que podia fallar
    const koders = await Koder.find(req.query); // {name: "Daniel"}
    console.log("koders", koders);
    res.json({
        success: true,
        data: koders
    })
   }catch(err) {
    console.log("err", err);
    res.status(400)
    res.json({
        success: false,
        message: err.message
    })
   }  
})

//Crear un Koder
//Parámetros con normalidad ---> ruta, callback
//Si queremos un Middleware para ese endpoint en específicio, se pone como 2do parámetro.
//Parámetros con Middlewares ---> ruta, middleware, callback
app.post("/koders", middlewareEncapsulado, async (req, res) => {
    console.log("body en el empoint de Post --->", req.body);
    try {
        const koder = await Koder.create(req.body) //Modelo para crear Koder con lo que está en el Body
        console.log("koder ---->", koder);
        res.status(201);
        res.json({
            success: true,
            data: koder
        })
    } catch(err) {
        res.status(400);
        res.json({
            success: false,
            message: err.message
        })
    }
})

/*
* Crear un Endpiont donde pueda encontrar un koder por su id. 
* Model.findById()
*/
// Ruta -> /koders/:id
// Método -> get

app.get("/koders/:id", async (req, res) => {
    const { id } = req.params
    try {
        const selectedKoder = await Koder.findById(id).exec();
        if (!selectedKoder) {
            res.status(404);
            res.json({
                success: false,
                message: "El ID buscado, no existe"
            })
        } else {
            res.json({
                success: true,
                data: selectedKoder
            });
        }
    } catch(err) {
        res.status(400);
        res.json({
            success: false,
            message: err.message
        })
    }
});

//Endpoint donde eliminemos al Koder
// Ruta -> /koders/:id
//método -> delete

app.delete("/koders/:id", async (req, res) => {
    const { id } = req.params
    try {
        const deletedKoder = await Koder.findByIdAndDelete(id)
        console.log("deletedKoder", deletedKoder)
        let success = true;
        // !variable --> variable === null, variable === undefined, variable === false
        if(!deletedKoder) {
            success = false;
            res.status(404);
        }
        //Mi código continúa...
        res.json({
            success,
            message: "El koder fue eliminado"
        })

    } catch(err) {
        response.status(400);
        response.json({
            success: false,
            message: err.message
        })
    }
});

//Endpoint donde Actualicemos a un Koder
// Ruta -> /koders/:id
//método -> patch

app.patch("/koders/:id", async (req, res) => {    
    //Otra forma para el parámetro de Options
    /* const options = {
        returnDocument: "after"
    }; */
    const { body, params } = req
    try{
        const updatedKoder = await Koder.findByIdAndUpdate(params.id, body, { returnDocument : "after" });
        console.log(updatedKoder);
        res.status(200);
        res.json({
            success: true,
            data: updatedKoder,
            message: "El Koder Fue Actualizado con Exito!!"
        })
    } catch(err) {
        res.status(400);
        res.json({
            success: false,
            message: err.message
        })
    }
})

//Conectar a la base de datos
mongoose.connect(databaseURL)
.then(() => {
    console.log("Conexion a la Base de Datos exitosa");
    //Levantar el servidor dentro de .then
    app.listen(8080, () => {
        console.log("Mi servidor está levantado");
    })
})
.catch((err) => {
    console.log("No se pudo conectar a la Base de Datos");
})