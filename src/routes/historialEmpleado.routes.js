const express = require("express");
const router = express.Router();
const DB = require("../db");

// GET /api/v1/historial-empleado/:id/actual
router.get("/:id/actual", async (req, res) => {
  const historialEmp = await DB.Dept_Emp.getHistorialActual(req.params.id);
  if (historialEmp) {
    res.status(200).json(historialEmp);
  } else {
    res.status(404).send("Historial de empleado no encontrado!!!");
  }
});

// Mover un empleado a un departamento destino
// PUT /api/v1/historial-empleado/
router.put("/", async (req, res) => {
  const { emp_no, dept_no } = req.body;

  if (!emp_no) {
    res.status(400).send("emp_no es Requerido!!!");
    return;
  }

  if (!dept_no) {
    res.status(400).send("dept_no es Requerido!!!");
    return;
  }

  const empleado = await DB.Employees.getById(emp_no);
  if (!empleado) {
    res.status(404).send("Empleado no encontrado!!!");
    return;
  }

  const departamento = await DB.Departmens.getById(dept_no)
  if (!departamento) {
    res.status(404).send("Departamento de destino no encontrado!!!");
    return;
  }
  
  // historial actual
  const historialActual = await DB.Dept_Emp.getHistorialActual(emp_no)
  if (!historialActual) {
    res.status(404).send("Historial actual no encontrado!!!");
    return;
  }

  if (historialActual.dept_no === dept_no) {
    res.status(400).send("El dept_no destino es el mismo del origen!!!");
    return;
  }

  
  const isUpdateOk = await DB.Dept_Emp.updateHistorialEmp(emp_no);
  if (!isUpdateOk) {
    res
      .status(500)
      .send("Falló al actualizar el ultimo historial de empleado!!!");
    return;
  }

  const isAddOk = await DB.Dept_Emp.addNuevoCambioHistorialEmpleado(
    emp_no,
    dept_no
  );
  if (isAddOk) {
    const historiaActualizada = await DB.Dept_Emp.getHistorialActual(emp_no)
    res.status(200).json(historiaActualizada)
  } else {
    res
    .status(400)
    .send("Falló al actualizar el ultimo historial de empleado!!!")
    return; 
  }
});

module.exports = router;
