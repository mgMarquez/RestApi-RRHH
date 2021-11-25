require("dotenv").config();
const app = require("../src/app");
const request = require("supertest");
const DB = require("../src/db");

describe("Rest API Departamentos", () => {
  it("GET /api/v1/departamentos", async () => {
    const response = await request(app).get("/api/v1/departamentos");
    expect(response).toBeDefined();
    expect(response.statusCode).toBe(200);
    const deptos = response.body;
    expect(deptos.length).toBeGreaterThan(0);
  });

  it("GET /api/v1/departamentos/d009", async () => {
    const response = await request(app).get("/api/v1/departamentos/d009");
    expect(response).toBeDefined();
    expect(response.statusCode).toBe(200);
    const depto = response.body;
    expect(depto).toBeDefined();
    expect(depto.dept_no).toBeDefined();
    expect(depto.dept_no).toBe("d009");
    expect(depto.dept_name).toBeDefined();
    expect(depto.dept_name).toBe("Customer Service");
  });

  it("GET /api/v1/departamentos/d009/manager", async () => {
    const response = await request(app).get(
      "/api/v1/departamentos/d009/manager"
    );
    expect(response).toBeDefined();
    expect(response.statusCode).toBe(200);
    const manager = response.body;
    expect(manager).toBeDefined();
    expect(manager.emp_no).toBeDefined();
    expect(manager.emp_no).toBe(111939);
    expect(manager.first_name).toBeDefined();
    expect(manager.first_name).toBe("Yuchang");
  });

  it("GET /api/v1/departamentos/d00999", async () => {
    const response = await request(app).get("/api/v1/departamentos/d00999");
    expect(response).toBeDefined();
    expect(response.statusCode).toBe(404);
    expect(response.text).toBe("Departamento no encontrado!!!");
  });

  it("POST /api/v1/departamentos  sin parámetros", async () => {
    const response = await request(app).post("/api/v1/departamentos").send();
    expect(response).toBeDefined();
    expect(response.statusCode).toBe(400);
    expect(response.text).toBe("dept_no es Requerido!!!");
  });

  it("POST /api/v1/departamentos  sólo con dept_no", async () => {
    const depto = { dept_no: "d999" };
    const response = await request(app)
      .post("/api/v1/departamentos")
      .send(depto);
    expect(response).toBeDefined();
    expect(response.statusCode).toBe(400);
    expect(response.text).toBe("dept_name es Requerido!!!");
  });

  it("POST /api/v1/departamentos  sólo con dept_name", async () => {
    const depto = { dept_name: "Depto nueve nueve nueve" };
    const response = await request(app)
      .post("/api/v1/departamentos")
      .send(depto);
    expect(response).toBeDefined();
    expect(response.statusCode).toBe(400);
    expect(response.text).toBe("dept_no es Requerido!!!");
  });

  it("Verificar que agrega con POST /api/v1/departamentos", async () => {
    const depto = { dept_no: "d999", dept_name: "Depto nueve nueve nueve" };
    const response = await request(app)
      .post("/api/v1/departamentos")
      .send(depto);
    expect(response).toBeDefined();
    expect(response.statusCode).toBe(201);
    expect(response.body).toStrictEqual(depto);

    //verificar que un objeto obtenido de la api conicide con el agregado
    const responseGET = await request(app).get("/api/v1/departamentos/d999");
    expect(responseGET).toBeDefined();
    expect(responseGET.statusCode).toBe(200);
    expect(responseGET.body).toStrictEqual(depto);

    // luego eliminar
    const responseDelete = await request(app)
      .delete("/api/v1/departamentos/d999")
      .send();
    expect(responseDelete).toBeDefined();
    expect(responseDelete.statusCode).toBe(204);
  });

  it("Verificar que modifica con PUT /api/v1/departamentos", async () => {
    const depto = { dept_no: "d999", dept_name: "Depto nueve nueve nueve" };
    //Primero Agregamos
    const response = await request(app)
      .post("/api/v1/departamentos")
      .send(depto);
    expect(response).toBeDefined();
    expect(response.statusCode).toBe(201);
    expect(response.body).toStrictEqual(depto);

    //Ahora modificamos con PUT
    const deptoCopia = { ...depto }; //clonamos el objeto
    deptoCopia.dept_no = "este código no lo tiene en cuenta";
    deptoCopia.atributoAdicional =
      "a este atributo adicional tampoco lo tiene en cuenta";
    deptoCopia.dept_name = "Departamento 999"; //modifica el nombre del departamento
    const responseUpdate = await request(app)
      .put("/api/v1/departamentos/d999") // en la url debe ir la clave
      .send(deptoCopia); //enviamos la copia
    expect(responseUpdate).toBeDefined();
    expect(responseUpdate.statusCode).toBe(200);
    const deptoCopiaVerificar = { ...depto }; //clonamos el objeto
    deptoCopiaVerificar.dept_name = "Departamento 999"; //modifica el nombre del departamento
    expect(responseUpdate.body).toStrictEqual(deptoCopiaVerificar); //verificamos con la copia para verificar

    //verificar que un objeto obtenido de la api conicide con el agregado y luego modificado
    const responseGET = await request(app).get("/api/v1/departamentos/d999");
    expect(responseGET).toBeDefined();
    expect(responseGET.statusCode).toBe(200);
    expect(responseGET.body).toStrictEqual(deptoCopiaVerificar); //verificamos con la copia para verificar

    // luego eliminar
    const responseDelete = await request(app)
      .delete("/api/v1/departamentos/d999")
      .send();
    expect(responseDelete).toBeDefined();
    expect(responseDelete.statusCode).toBe(204);
  });

  // Punto 1

  it("GET /api/v1/departamentos/d00999/empleados no existe el departamento", async () => {
    const response = await request(app).get(
      "/api/v1/departamentos/d00999/empleados"
    );
    expect(response).toBeDefined();
    expect(response.statusCode).toBe(404);
    expect(response.text).toBe("Departamento no encontrado!!!");
  });

  it("GET /api/v1/departamentos/d009/empleados", async () => {
    const response = await request(app).get(
      "/api/v1/departamentos/d009/empleados"
    );
    expect(response).toBeDefined();
    expect(response.statusCode).toBe(200);
    const empleados = response.body;
    expect(empleados).toBeDefined();
    expect(empleados.length).toBeGreaterThan(0);
    empleados.forEach((emp) => {
      expect(emp.emp_no).toBeDefined();
      expect(emp.first_name).toBeDefined();
      expect(emp.last_name).toBeDefined();
    });
  });

  it("GET /api/v1/departamentos/d009/empleados", async () => {
    const response = await request(app).get(
      "/api/v1/departamentos/d009/empleados"
    );
    expect(response).toBeDefined();
    expect(response.statusCode).toBe(200);
    const empleados = response.body;
    expect(empleados).toBeDefined();
    expect(empleados.length).toBeGreaterThan(0);
    empleados.forEach((emp) => {
      expect(emp.emp_no).toBeDefined();
      expect(emp.first_name).toBeDefined();
      expect(emp.last_name).toBeDefined();
    });
  });

  describe("departamento sin emp", () => {
    // creamos un departamento
    const departamentoPrueba = {
      dept_no: "dinf",
      dept_name: "Depto. de Sistemas",
    };

    beforeEach(async () => {
      // agregamos departamento en la base de datos
      await DB.Departmens.add(departamentoPrueba);
    });

    afterEach(async () => {
      // eliminamos departamentoPrueba de la base de datos
      await DB.Departmens.delete(departamentoPrueba);
    });

    it("GET /api/v1/departamentos/d00999/empleados departamento sin empleados", async () => {
      // iniciamos el test
      const response = await request(app).get(
        "/api/v1/departamentos/dinf/empleados"
      );
      expect(response).toBeDefined();
      expect(response.statusCode).toBe(400);
      expect(response.text).toBe("El departamento no tiene empleados!!!");
    });
  });
});
