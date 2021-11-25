const express = require('express')
const router = express.Router();
const DB = require('../db')

// GET /api/v1/departamentos
router.get('/',async (req,res)=>{
    const deptos = await DB.Departmens.getAll();    
    res.status(200).json(deptos)
});

// GET /api/v1/departamentos/:id
router.get('/:id',async (req,res)=>{
    const depto = await DB.Departmens.getById(req.params.id);
    if(depto){
        res.status(200).json(depto)
    }else{
        res.status(404).send('Departamento no encontrado!!!')
    }    
});

// GET /api/v1/departamentos/:id/manager
router.get('/:id/manager',async (req,res)=>{
    const depto = await DB.Departmens.getById(req.params.id);
    if(!depto){
        res.status(404).send('Departamento no encontrado!!!')
        return
    }
    const manager = await DB.Departmens.getActualManager(depto);
    res.status(200).json(manager)
});

// POST /api/v1/departamentos
router.post('/',async (req,res)=>{
    const {dept_no,dept_name} =req.body
    if(!dept_no){
        res.status(400).send('dept_no es Requerido!!!')
        return
    }
    if(!dept_name){
        res.status(400).send('dept_name es Requerido!!!')
        return
    }
    const depto = await DB.Departmens.getById(dept_no);
    if(depto){
        res.status(500).send('ya existe el Departamento !!!')
        return
    }
    const deptoNuevo = {dept_no,dept_name}
    const isAddOk = await DB.Departmens.add(deptoNuevo)
    if(isAddOk){
        res.status(201).json(deptoNuevo)
    }else{
        res.status(500).send('Falló al agregar el departamento!!!')
    }
});

// PUT /api/v1/departamentos/:id
router.put('/:id',async (req,res)=>{
    const {dept_name} =req.body    
    if(!dept_name){
        res.status(400).send('dept_name es Requerido!!!')
        return
    }
    const depto = await DB.Departmens.getById(req.params.id);
    if(!depto){
        res.status(404).send('Departamento no encontrado!!!')
        return
    }
    depto.dept_name=dept_name
    const isUpdateOk = await DB.Departmens.update(depto)
    if(isUpdateOk){
        res.status(200).json(depto)
    }else{
        res.status(500).send('Falló al modificar el departamento!!!')
    }
});

// DELETE /api/v1/departamentos/:id
router.delete('/:id',async (req,res)=>{
    const depto = await DB.Departmens.getById(req.params.id);
    if(!depto){
        res.status(404).send('Departamento no encontrado!!!')
        return
    }
    const isDeleteOk = await DB.Departmens.delete(depto)
    if(isDeleteOk){
        res.status(204).send()
    }else{
        res.status(500).send('Falló al eliminar el departamento!!!')
    }
});

// Punto 1

// GET /api/v1/departamentos/:id/empleados
router.get('/:id/empleados', async (req,res)=>{
    const depto = await DB.Departmens.getById(req.params.id)
    if(!depto){
        res.status(404).send('Departamento no encontrado!!!')
        return
    }
    const empleados = await DB.Dept_Emp.getActualEmpleados(req.params.id);
    if(empleados.length > 0){
        res.status(200).json(empleados)
    }
    else {
        res.status(400).send("El departamento no tiene empleados!!!")
    }
});
 
module.exports=router