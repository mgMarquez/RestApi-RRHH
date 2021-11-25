require("dotenv").config();
const app = require("../src/app");
const request = require("supertest");
const DB = require("../src/db");

describe("Rest API Historial empleado", () => {
  describe("Rest API Historial - Pruebas basicas", () => {
    it("PUT /api/v1/historial-empleado/ empleado no existe", async () => {
      const pruebaCambio = { emp_no: 11, dept_no: "d002" };

      const response = await request(app)
        .put("/api/v1/historial-empleado/")
        .send(pruebaCambio);
      expect(response).toBeDefined();
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe("Empleado no encontrado!!!");
    });

    it("PUT /api/v1/historial-empleado/ departamento destino no existe", async () => {
      const pruebaCambio = { emp_no: 10001, dept_no: "d0002" };

      const response = await request(app)
        .put("/api/v1/historial-empleado/")
        .send(pruebaCambio);
      expect(response).toBeDefined();
      expect(response.statusCode).toBe(404);
      expect(response.text).toBe("Departamento de destino no encontrado!!!");
    });

    it("PUT /api/v1/historial-empleado/ departamento igual al destino", async () => {
      // busca historia actual del empleado 10001
      const historia_empleado = await DB.Dept_Emp.getHistorialActual(10001);
      // id empleado y departamento actuales para probar
      // enviar el mismo empleado a su mismo departamento

      const pruebaCambio = {
        emp_no: historia_empleado.emp_no,
        dept_no: historia_empleado.dept_no,
      };

      const response = await request(app)
        .put("/api/v1/historial-empleado/")
        .send(pruebaCambio);
      expect(response).toBeDefined();
      expect(response.statusCode).toBe(400);
      expect(response.text).toBe(
        "El dept_no destino es el mismo del origen!!!"
      );
    });
  });

  describe("Rest API Historial empleado cargando la base de datos", () => {
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

      const deptoTest = {
        dept_no: "d999",
        dept_name: "Depto. Testing",
      };

      await DB.Departmens.add(deptoTest);

      const deptoTest2 = {
        dept_no: "d888",
        dept_name: "Depto. Testing 2",
      };

      await DB.Departmens.add(deptoTest2);

      const dept_empTest = {
        emp_no: 1,
        dept_no: "d999",
        from_date: "2010-10-10",
        to_date: "9999-01-01",
      };
      await DB.Dept_Emp.add(dept_empTest);
    });

    afterEach(async () => {
      await DB.Employees.delete({ emp_no: 1 });
      await DB.Departmens.delete({ dept_no: "d999" });
      await DB.Departmens.delete({ dept_no: "d888" });
    });

    // Historial de empleado actual del empleado 1
    it("GET /api/v1/historial-empleado/1/actual", async () => {
      const response = await request(app).get(
        "/api/v1/historial-empleado/1/actual"
      );
      expect(response).toBeDefined();
      expect(response.statusCode).toBe(200);
      const historial_emp = response.body;
      expect(historial_emp).toBeDefined();
      expect(historial_emp.emp_no).toBeDefined();
      expect(historial_emp.emp_no).toBe(1);
      expect(historial_emp.to_date).toBeDefined();

      const to_date_actual = historial_emp.to_date;
      expect(to_date_actual.split("T")[0]).toBe("9999-01-01");
    });

    // EJECUTA LA API
    // Cambiar de empleado de departamento
    it("PUT /api/v1/historial-empleado/", async () => {
      // primero creamos un objeto para cambio de departament de un empleado
      const cambioDepartamentoEmpleado = { emp_no: 1, dept_no: "d888" };

      // enviamos el objeto que modifica el departamento de empleado con PUT
      const response = await request(app)
        .put("/api/v1/historial-empleado/")
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
      const historialModificado = await DB.Dept_Emp.getById(1, "d999");
      expect(historialModificado).toBeDefined();
      const to_dateModificado = historialModificado.to_date.toISOString();
      expect(to_dateModificado).toBeDefined();
      expect(to_dateModificado.split("T")[0]).toBe(`${fechaActual}`); // split corta hasta la T del tiempo

      // verificar que se agrego el nuevo historial
      const historialNuevo = await DB.Dept_Emp.getHistorialActual(1)
      expect(historialNuevo.from_date).toBeDefined();
      const from_dateNuevo = historialNuevo.from_date.toISOString();
      expect(from_dateNuevo.split("T")[0]).toBe(`${fechaActual}`); // split, lo mismo que el anterior
      expect(historialNuevo.to_date).toBeDefined();
      const to_dateNuevo = historialNuevo.to_date.toISOString();
      expect(to_dateNuevo.split("T")[0]).toBe('9999-01-01'); // verifica fecha to_date
      expect(historialNuevo.dept_no).toBeDefined();
      expect(historialNuevo.dept_no).toBe('d888');

    });
  });
});
