const pool = require("./connection.db");
const TABLE = "salaries";

/**
 * Retorna el salario actual identificado con la fecha
 * 9999-01-01 en to_date
 * @param {number} emp_no id del empleado
 * @returns salario actual del empleado
 */
module.exports.getActual = async function (emp_no) {
  let conn;
  try {
    conn = await pool.getConnection();
    const SQL = `
        SELECT s.* FROM salaries s
            INNER JOIN employees e USING (emp_no)
        WHERE emp_no=? and s.to_date='9999-01-01'
        `;
    const rows = await conn.query(SQL, [emp_no]);
    return rows[0];
  } catch (err) {
    return Promise.reject(err);
  } finally {
    if (conn) await conn.release();
  }
};

/**
 * Retorna una lista de salarios de un empleado
 * @param {number} emp_no id del empleado
 * @returns lista de salarios
 */
module.exports.getAll = async function (emp_no) {
  let conn;
  try {
    conn = await pool.getConnection();
    const SQL = `
          SELECT s.* FROM salaries s
              INNER JOIN employees e USING (emp_no)
          WHERE emp_no=?
          `;
    const rows = await conn.query(SQL, [emp_no]);
    return rows;
  } catch (err) {
    return Promise.reject(err);
  } finally {
    if (conn) await conn.release();
  }
};

/**
 * Agrega un nuevo salario
 * @param {Object} salario salario nuevo
 * @returns
 */
module.exports.add = async function (salario) {
  let conn;
  try {
    conn = await pool.getConnection();
    const SQL = `INSERT INTO ${TABLE} 
        (emp_no, salary, from_date, to_date) 
            VALUES(?, ?, ?, ?)`;
    const params = [];
    params[0] = salario.emp_no;
    params[1] = salario.salary;
    params[2] = salario.from_date;
    params[3] = salario.to_date;
    const rows = await conn.query(SQL, params);
    return rows;
  } catch (err) {
    return Promise.reject(err);
  } finally {
    if (conn) await conn.release();
  }
};

/**
 * Actualiza un salario
 * @param {Object} salario
 * @returns
 */
module.exports.update = async function (salario) {
  let conn;
  try {
    conn = await pool.getConnection();
    const SQL = `
          UPDATE salaries
              SET salary=?,to_date=?
          WHERE emp_no=? AND from_date=?
      `;
    const params = [];
    params[0] = salario.salary;
    params[1] = salario.to_date;
    params[2] = salario.emp_no;
    params[3] = salario.from_date;
    const rows = await conn.query(SQL, params);
    return rows;
  } catch (err) {
    return Promise.reject(err);
  } finally {
    if (conn) await conn.release();
  }
};

/**
 * Elimina un salario
 * @param {Object} salario
 * @returns
 */
module.exports.delete = async function (salario) {
  let conn;
  try {
    conn = await pool.getConnection();
    const SQL = `
        DELETE FROM ${TABLE}
            WHERE emp_no=? AND from_date=?`;
    const params = []
    params[0] = salario.emp_no
    params[1] = salario.from_date
    const rows = await conn.query(SQL, params);
    return rows;
  } catch (err) {
    return Promise.reject(err);
  } finally {
    if (conn) await conn.release();
  }
};

/**
 * Retorna un salario por su Id
 * @param {number} emp_no
 * @param {Object} from_date
 * @returns
 */
module.exports.getById = async function (emp_no, from_date) {
  let conn;
  try {
    conn = await pool.getConnection();
    const SQL = `
          SELECT s.* FROM ${TABLE} s
              INNER JOIN employees e USING (emp_no)
          WHERE emp_no=? and s.from_date=?
          `;
    const rows = await conn.query(SQL, [emp_no, from_date]);
    return rows[0];
  } catch (err) {
    return Promise.reject(err);
  } finally {
    if (conn) await conn.release();
  }
};


/**
 * Agrega un nuevo salario con la fecha actual en from_date
 * y fecha 9999-01-01 en to_date a un empleado con id emp_no
 * @param {number} emp_no id del empleado a modificar el salario
 * @param {number} salario salario nuevo del empleado a agregar
 * @returns 
 */
module.exports.addNuevoAumentoSalario = async function(emp_no, salario){
    let conn;
    try {
      conn = await pool.getConnection();
      const SQL = `INSERT INTO ${TABLE} 
        (emp_no, salary, from_date, to_date) 
        VALUES(?,?,current_date(),'9999-01-01')`;
      const params = [];
      params[0] = emp_no;
      params[1] = salario;
      const rows = await conn.query(SQL, params);
      return rows;
    } catch (err) {
      return Promise.reject(err);
    } finally {
      if (conn) await conn.release();
    }
}

/**
 * Actualiza la fecha to_date del ultimo salario a la
 * fecha actual del empleado con id emp_no
 * @param {number} emp_no id del empleado
 * @returns 
 */
module.exports.updateUltimoSalario = async function (emp_no) {
    let conn;
    try {
      conn = await pool.getConnection();
      const SQL = `
            UPDATE ${TABLE}
                SET to_date=current_date()
            WHERE emp_no=? AND to_date='9999-01-01'
        `;
      const rows = await conn.query(SQL,emp_no);
      return rows;
    } catch (err) {
      return Promise.reject(err);
    } finally {
      if (conn) await conn.release();
    }
  };
