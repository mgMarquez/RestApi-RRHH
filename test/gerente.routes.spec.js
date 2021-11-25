require("dotenv").config();
const app = require("../src/app");
const request = require("supertest");
const DB = require("../src/db");

describe("Rest API gerente", () => {
  describe("Rest API gerente - pruebas simples", () => {
    it("/api/v1/gerente el departamento no existe", async () => {
      const cambioGerente = { emp_no: 10001, dept_no: "d777" };

      const response = await request(app)
        .put("/api/v1/gerente")
        .send(cambioGerente);
      expect(response).toBeDefined();
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe("Departamento no encontrado!!!");
    });

    it("/api/v1/gerente el empleado no existe", async () => {
      const cambioGerente = { emp_no: 11, dept_no: "d002" };

      const response = await request(app)
        .put("/api/v1/gerente")
        .send(cambioGerente);
      expect(response).toBeDefined();
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe("Empleado no encontrado!!!");
    });

    it("/api/v1/gerente - empleado enviado es gerente del departamento a cambiar", async () => {
      // busca historia actual del departamento d002
      const historia_gerente = await DB.Gerente.getHistoriaActual("d002");
      // id gerente y departamento actuales para probar
      // enviar el mismo gerente a su mismo departamento

      const cambioGerente = {
        emp_no: historia_gerente.emp_no,
        dept_no: historia_gerente.dept_no,
      };

      const response = await request(app)
        .put("/api/v1/gerente")
        .send(cambioGerente);
      expect(response).toBeDefined();
      expect(response.statusCode).toBe(400);
      expect(response.text).toBe(
        "El empleado es el gerente actual del departamento!!!"
      );
    });
  });

  describe("Rest API gerente cargando la base de datos", () => {
    beforeEach(async () => {
      const empleadoTest = {
        emp_no: 1,
        birth_date: "2000-01-01",
        first_name: "nombre prueba",
        last_name: "apellido prueba",
        gender: "M",
        hire_date: "2010-10-10",
      };

      await DB.Employees.add(empleadoTest);

      const empleadoTest2 = {
        emp_no: 2,
        birth_date: "2001-10-10",
        first_name: "nombre prueba2",
        last_name: "apellido prueba2",
        gender: "M",
        hire_date: "2011-11-11",
      };

      await DB.Employees.add(empleadoTest2);

      const deptoTest = {
        dept_no: "d999",
        dept_name: "Depto. Testing",
      };

      await DB.Departmens.add(deptoTest);

      const dept_managerTest = {
        emp_no: 2,
        dept_no: "d999",
        from_date: "2010-10-10",
        to_date: "9999-01-01",
      };
      await DB.Gerente.add(dept_managerTest);
    });

    afterEach(async () => {
      await DB.Employees.delete({ emp_no: 1 });
      await DB.Employees.delete({ emp_no: 2 });
      await DB.Departmens.delete({ dept_no: "d999" });
    });

    // EJECUTA LA API
    // Cambiar de empleado de departamento
    it("PUT /api/v1/gerente/", async () => {
      // primero creamos un objeto para cambio de departament de un empleado
      const cambioDepartamentoEmpleado = { emp_no: 1, dept_no: "d999" };

      // enviamos el objeto que modifica el departamento de empleado con PUT
      const response = await request(app)
        .put("/api/v1/gerente/")
        .send(cambioDepartamentoEmpleado);
      expect(response).toBeDefined();
      expect(response.statusCode).toBe(200);

      // calcula la fecha de hoy en y la convierte en el horario local para pasar a formato ISO
      // arregla problema de día adelantado que me pasaba a las 9 de la noche
      const fecha = new Date();
      fecha.setMinutes(fecha.getMinutes() - fecha.getTimezoneOffset());
      const fechaActual = fecha.toISOString().split("T")[0];
      //

      // verificamos que se modifico la fecha del historial anterior
      const historialModificado = await DB.Gerente.getById(2, 'd999')
      expect(historialModificado).toBeDefined();
      const to_dateModificado = historialModificado.to_date.toISOString();
      expect(to_dateModificado).toBeDefined();
      expect(to_dateModificado.split("T")[0]).toBe(`${fechaActual}`); // split corta hasta la T del tiempo

      // verificar que se agrego el nuevo historial
      const historialNuevo = await DB.Gerente.getHistoriaActual('d999')
      expect(historialNuevo.from_date).toBeDefined();
      const from_dateNuevo = historialNuevo.from_date.toISOString();
      expect(from_dateNuevo.split("T")[0]).toBe(`${fechaActual}`); // split, lo mismo que el anterior
      expect(historialNuevo.to_date).toBeDefined();
      const to_dateNuevo = historialNuevo.to_date.toISOString();
      expect(to_dateNuevo.split("T")[0]).toBe("9999-01-01"); // verifica fecha to_date
      expect(historialNuevo.emp_no).toBeDefined();
      expect(historialNuevo.emp_no).toBe(1);
    });
  });
});
