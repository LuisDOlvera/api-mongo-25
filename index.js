const express = require("express");
const mongoose = require("mongoose");

// App de espress
const app = express();
//Middleware para parsear la BD.
app.use(express.json());

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
app.post("/koders", async (req, res) => {
    console.log("body --->", req.body)
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
    const { id } = req.params
    try{
        const updatedKoder = await Koder.findByIdAndUpdate(id, {
			"name": "Damian",
			"age": 22,
			"module": "AWS",
        });
        console.log(updatedKoder);
        res.status(201);
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