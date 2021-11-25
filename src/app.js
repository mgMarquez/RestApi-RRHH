const express = require('express')
const app=express()
const ROUTES=require('./routes')
const cors = require('cors')

//midlewares
//permite leer el cuerpo de la solicitud en formato json
app.use(express.json())
//permite leer los datos enviados en un formulario standard
app.use(express.urlencoded({extended: true}))
//habilita Cross-Origin Resource Sharing a todas las rutas
app.use(cors())

//rutas
app.get('/',(req,res)=>{
    res.send('Hola Mundo!!!')
});

app.get('/ping',(req,res)=>{
    res.json({msg:'pong'})
});

app.use('/api/v1/departamentos',ROUTES.Departments);
app.use('/api/v1/salarios',ROUTES.Salaries);
app.use('/api/v1/historial-empleado',ROUTES.HistorialEmpleado);
app.use('/api/v1/gerente',ROUTES.Gerente);


module.exports=app