require("dotenv").config();
const app = require("../src/app");
const request = require("supertest");
const DB = require("../src/db");

describe("Rest API Salarios", () => {
  // un sueldo actual del empleado 10001
  it("GET /api/v1/salarios/10001/actual", async () => {
    const response = await request(app).get("/api/v1/salarios/10001/actual");
    expect(response).toBeDefined();
    expect(response.statusCode).toBe(200);
    const salario = response.body;
    expect(salario).toBeDefined();
    expect(salario.emp_no).toBeDefined();
    expect(salario.emp_no).toBe(10001);
    expect(salario.salary).toBeDefined();
    expect(salario.salary).toBe(88958);
  });

  // listado de sueldos del empleado 10001
  it("GET /api/v1/salarios/10001", async () => {
    const response = await request(app).get("/api/v1/salarios/10001");
    expect(response).toBeDefined();
    expect(response.statusCode).toBe(200);    
    const salarios = response.body;
    expect(salarios.length).toBeGreaterThan(0);
    salarios.forEach((s) => {
      expect(s.salary).toBeDefined();
      expect(s.to_date).toBeDefined();
      expect(s.from_date).toBeDefined();
      expect(s.emp_no).toBeDefined();
    });
  });

  it("GET /api/v1/salarios/10000001 no existe empleado o no tiene salarios", async () => {
    const response = await request(app).get("/api/v1/salarios/10000001");
    expect(response).toBeDefined();
    expect(response.statusCode).toBe(404);
    expect(response.text).toBe("No se encontraron salarios!!!");
  });

  // creamos un nuevo describe para usar before y after solo en estas pruebas
  describe("prueba con PUT salario", () => {
    // Iniciar base de datos cargando empleado y salario de prueba
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

      const salarioTest = {
        emp_no: 1,
        salary: 555,
        from_date: "2000-02-02",
        to_date: "9999-01-01",
      };

      await DB.Salaries.add(salarioTest);
    });
    // al finalizar la prueba se borra el empleado (tambien se borra el salario)
    afterEach(async () => {
      await DB.Employees.delete({ emp_no: 1 });
    });

    it('PUT /api/v1/salarios sin emp_no ', async () => {
      const salario = { salary: 909 };
      const response = await request(app)
        .put("/api/v1/salarios")
        .send(salario);
      expect(response).toBeDefined();
      expect(response.statusCode).toBe(400);
      expect(response.text).toBe("emp_no es Requerido!!!");
    });

    it('PUT /api/v1/salarios sin salary ', async () => {
      const salario = { emp_no: 1 };
      const response = await request(app)
        .put("/api/v1/salarios")
        .send(salario);
      expect(response).toBeDefined();
      expect(response.statusCode).toBe(400);
      expect(response.text).toBe("salary es Requerido!!!");
    });

    it("Verifica que modifica y crea un salario con PUT /api/v1/salarios", async () => {
      // Primero creamos un objeto para modificar el salario
      const salario = { emp_no: 1, salary: 909 };

      // Ahora enviamos el objeto que modifica el salario con PUT
      const response = await request(app).put("/api/v1/salarios").send(salario);
      expect(response).toBeDefined();
      expect(response.statusCode).toBe(200);

      // calcula la fecha de hoy en y la convierte en el horario local para pasar a formato ISO
      // arregla problema de día adelantado que me pasaba a las 9 de la noche
      const fecha = new Date()
      fecha.setMinutes(fecha.getMinutes() - fecha.getTimezoneOffset())
      const fechaActual = fecha.toISOString().split("T")[0]
      //

      // verificamos que se modifico la fecha del ultimo salario a la fehca actual
      const salarioModificado = await DB.Salaries.getById(1, "2000-02-02");
      expect(salarioModificado).toBeDefined();
      const to_dateModificado = salarioModificado.to_date.toISOString();
      expect(to_dateModificado).toBeDefined();
      expect(to_dateModificado.split("T")[0]).toBe(`${fechaActual}`); // split corta hasta la T del tiempo 

      // verificar que se agrego el nuevo salario
      const salarioNuevo = await DB.Salaries.getActual(1);
      expect(salarioNuevo.from_date).toBeDefined();
      const from_dateNuevo = salarioNuevo.from_date.toISOString()
      expect(from_dateNuevo.split("T")[0]).toBe(`${fechaActual}`); // split, lo mismo que el anterior
      expect(salarioNuevo.salary).toBeDefined();
      expect(salarioNuevo.salary).toBe(909); // verifica que el salario nuevo sea el enviado
    });
  });
});
