const express = require("express");
const router = express.Router();
const DB = require("../db");

// salario actual de un empleado
// GET /api/v1/salarios/:id/actual
router.get("/:id/actual", async (req, res) => {
  const salario = await DB.Salaries.getActual(req.params.id);
  if (salario) {
    res.status(200).json(salario);
  } else {
    res.status(404).send("Salario actual no encontrado!!!");
  }
});

// todos los salarios de un empleado
// GET /api/v1/salarios/:id
router.get("/:id", async (req, res) => {
  const salarios = await DB.Salaries.getAll(req.params.id);
  if (salarios.length > 0) {
    res.status(200).json(salarios);
  } else {
    res.status(404).send("No se encontraron salarios!!!");
  }
});

// Actualiza a la fecha salario actual a fecha de hoy  y
//  agrega un nuevo salario que comienza con
//  fecha desde de hoy y fecha hasta la actual (9999-01-01)
// PUT /api/v1/salarios
router.put("/", async (req, res) => {
  const { emp_no, salary } = req.body;

  if (!emp_no) {
    res.status(400).send("emp_no es Requerido!!!");
    return;
  }

  if (!salary) {
    res.status(400).send("salary es Requerido!!!");
    return;
  }

  const salarioActual = await DB.Salaries.getActual(emp_no);
  if (!salarioActual) {
    res.statusCode(404).send("No se encontró el salario actual!!!");
    return;
  }

  const isUpdateOk = await DB.Salaries.updateUltimoSalario(emp_no);
  if (!isUpdateOk) {
    res.statusCode(500).send("Falló al actualizar el ultimo salario!!!");
    return;
  }

  const isAddOk = await DB.Salaries.addNuevoAumentoSalario(emp_no, salary);
  if (isAddOk) {
    const salarioActualizado = await DB.Salaries.getActual(emp_no);
    res.status(200).json(salarioActualizado);
  } else {
    res.statusCode(500).send("Falló al agregar el nuevo salario!!!");
  }
});

// agrega un salario
// POST /api/v1/salarios
router.post("/", async (req, res) => {
  const { emp_no, salary, from_date, to_date } = req.body;

  if (!emp_no) {
    res.status(400).send("emp_no es Requerido!!!");
    return;
  }

  if (!salary) {
    res.status(400).send("salary es Requerido!!!");
    return;
  }

  if (!from_date) {
    res.status(400).send("from_date es Requerido!!!");
    return;
  }

  if (!to_date) {
    res.status(400).send("to_date es Requerido!!!");
    return;
  }

  const empleado = await DB.Employees.getById(emp_no);
  if (!empleado) {
    res.status(404).send("Empleado no encontrado!!!");
    return;
  }

  const depto = await DB.Salaries.getById(emp_no, from_date);
  if (depto) {
    res.status(500).send("ya existe el Salario !!!");
    return;
  }

  const salario = { dept_no, emp_no, salary, from_date, to_date };
  const isAddOk = await DB.Salaries.add(salario);
  if (isAddOk) {
    res.status(201).json(salario);
  } else {
    res.status(500).send("Falló al agregar el salario!!!");
  }
});

// elimina un salario
// DELETE /api/v1/salarios
router.delete("/", async (req, res) => {
  const { emp_no, from_date } = req.body;
  if (!emp_no) {
    res.status(400).send("emp_no es Requerido!!!");
    return;
  }

  if (!from_date) {
    res.status(400).send("from_date es Requerido!!!");
    return;
  }

  const empleado = await DB.Employees.getById(emp_no);
  if (!empleado) {
    res.status(404).send("Empleado no encontrado!!!");
    return;
  }

  const salario = await DB.Salaries.getById(emp_no, from_date);
  if (!salario) {
    res.status(404).send("Salario no encontrado!!!");
    return;
  }

  const isDeleteOk = await DB.Salaries.delete(salario);
  if (isDeleteOk) {
    res.status(204).send("Salario eliminado");
  } else {
    res.status(500).send("Falló al eliminar el salario!!!");
  }
});

// vuelve a fecha to_date a 9999-01-01 un salario
// PATCH /api/v1/salarios
router.patch("/", async (req, res) => {
  const { emp_no, from_date } = req.body;

  if (!emp_no) {
    res.status(400).send("emp_no es Requerido!!!");
    return;
  }

  if (!from_date) {
    res.status(400).send("from_date es Requerido!!!");
    return;
  }

  const empleado = await DB.Employees.getById(emp_no);
  if (!empleado) {
    res.status(404).send("Empleado no encontrado!!!");
    return;
  }

  const salario = await DB.Salaries.getById(emp_no, from_date);
  if (!salario) {
    res.status(404).send("Salario no encontrado!!!");
    return;
  }
  salario.to_date = "9999-01-01";
  const isDPatchOk = await DB.Salaries.update(salario);
  if (isDPatchOk) {
    res.status(200).send("Salario actualizado");
  } else {
    res.status(500).send("Falló al actualizar el salario!!!");
  }
});

// GET /api/v1/salarios/:id/:from_date
router.get("/:id/:from_date", async (req, res) => {
  const salario = await DB.Salaries.getById(
    req.params.id,
    req.params.from_date
  );
  if (salario) {
    res.status(200).json(salario);
  } else {
    res.status(404).send("Salario no encontrado!!!");
  }
});

module.exports = router;
