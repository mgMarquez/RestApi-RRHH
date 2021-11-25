const express = require("express");
const router = express.Router();
const DB = require("../db");

// GET /api/v1/gerente
router.get("/", async (req, res) => {
  const deptos = await DB.Gerente.getAll();
  res.status(200).json(deptos);
});


// PUT /api/v1/gerente/
router.put("/", async (req, res) => {
  const { emp_no, dept_no } = req.body;
  if (!emp_no) {
    res.status(400).send("dept_name es Requerido!!!");
    return;
  }

  if (!dept_no) {
    res.status(400).send("dept_no Requerido!!!");
    return;
  }

  const departamento = await DB.Departmens.getById(dept_no);

  if (!departamento) {
    res.status(404).send("Departamento no encontrado!!!");
    return;
  }

  const empleado = await DB.Employees.getById(emp_no);

  if (!empleado) {
    res.status(404).send("Empleado no encontrado!!!");
    return;
  }

  const historialActual = await DB.Gerente.getHistoriaActual(dept_no);
  if (!historialActual) {
    res.status(404).send("Historial actual no encontrado!!!");
    return;
  }
  
  if (historialActual.emp_no === emp_no) {
    res
      .status(400)
      .send("El empleado es el gerente actual del departamento!!!");
    return;
  }
  
  const isUpdateOk = await DB.Gerente.updateHistorial(historialActual);
  if (!isUpdateOk) {
    res
      .status(500)
      .send("Falló al actualizar el ultimo historial del gerente!!!");
    return;
  }

  const isAddOk = await DB.Gerente.addNuevoCambioHistorialGerente(
    emp_no,
    dept_no
  );

  if (isAddOk) {
    const historiaActualizada = await DB.Gerente.getHistoriaActual(emp_no)
    res.status(200).json(historiaActualizada)
  } else {
    res
    .status(400)
    .send("Falló al actualizar el ultimo historial del gerente!!!")
  }


});

module.exports = router;
