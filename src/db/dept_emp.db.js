const pool = require("./connection.db");
const TABLE = "dept_emp";
const TABLE_EMPLEADOS = "employees";

/**
 * Retorna el historial del empleado en un departamento
 * @param {number} emp_no id empleado
 * @param {number} dept_no id departamento
 * @returns historial de empleado
 */
module.exports.getById = async function (emp_no, dept_no) {
  let conn;
  try {
    conn = await pool.getConnection();
    const SQL = `
      SELECT 
        de.*
      FROM ${TABLE} de
        INNER JOIN ${TABLE_EMPLEADOS} e USING (emp_no)
      WHERE emp_no = ? and dept_no = ?
      limit 100`;
    const rows = await conn.query(SQL, [emp_no, dept_no]);
    return rows[0];
  } catch (err) {
    return Promise.reject(err);
  } finally {
    if (conn) await conn.release();
  }
};

/**
 * Retorna el historial de empleado actual
 * @param {number} emp_no id del empleado
 * @returns
 */
module.exports.getHistorialActual = async function (emp_no) {
  let conn;
  try {
    conn = await pool.getConnection();
    const SQL = `
      SELECT 
        de.*
      FROM ${TABLE} de
        INNER JOIN ${TABLE_EMPLEADOS} e USING (emp_no)
      WHERE emp_no = ? and to_date = '9999-01-01'
      limit 100`;
    const rows = await conn.query(SQL, [emp_no]);
    return rows[0];
  } catch (err) {
    return Promise.reject(err);
  } finally {
    if (conn) await conn.release();
  }
};

/**
 * Actualiza un historial de empleado dept_emp
 * @param {number} dept_no
 * @returns
 */
module.exports.updateHistorialEmp = async function (emp_no) {
  let conn;
  try {
    conn = await pool.getConnection();
    const SQL = `
          UPDATE ${TABLE}
              SET to_date=current_date()
          WHERE emp_no=? and to_date='9999-01-01'
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
 * Retorna los empleados actuales de un Departamento
 * @param {Object} departamento
 * @returns
 */
module.exports.getActualEmpleados = async function (dept_no) {
  let conn;
  try {
    conn = await pool.getConnection();
    const SQL = `
      SELECT 
        e.*
      FROM ${TABLE} de
        INNER JOIN ${TABLE_EMPLEADOS} e ON (e.emp_no = de.emp_no)
      WHERE de.dept_no = ?
      limit 100 
      `;
    const rows = await conn.query(SQL, [dept_no]);
    return rows;
  } catch (err) {
    return Promise.reject(err);
  } finally {
    if (conn) await conn.release();
  }
};

/**
 * Agrega un dept_emp
 * @param {Object} dept_emp 
 * @returns 
 */
 module.exports.add = async function(dept_emp) {
  let conn;
  try {
    conn = await pool.getConnection();
    const SQL=`
    INSERT INTO ${TABLE} 
      (emp_no, dept_no, from_date, to_date)
      VALUES(?, ?, ?, ?)`
    const params=[]
    params[0]=dept_emp.emp_no
    params[1]=dept_emp.dept_no
    params[2]=dept_emp.from_date
    params[3]=dept_emp.to_date
    const rows = await conn.query(SQL,params);
    return rows;
  } catch (err) {
    return Promise.reject(err);
  } finally {
    if (conn) await conn.release();
  }
}

/**
 * Elimina un dept_emp
 * @param {Object} empleado 
 * @returns 
 */
module.exports.delete = async function(dept_emp) {
  let conn;
  try {
    conn = await pool.getConnection();
    const SQL=`
    DELETE FROM ${TABLE}
	    WHERE emp_no=? AND dept_no= ?;`    
    const params=[]
    params[0]=dept_emp.emp_no
    params[1]=dept_emp.dept_no
    const rows = await conn.query(SQL,params);
    return rows;
  } catch (err) {
    return Promise.reject(err);
  } finally {
    if (conn) await conn.release();
  }
}

/**
 * Agrega un nuevo historial de empleado con fecha desde la de hoy
 * y fecha hasta con '9999-01-01'
 * @param {number} emp_no 
 * @param {string} dept_no 
 * @returns 
 */
module.exports.addNuevoCambioHistorialEmpleado = async function(emp_no, dept_no){
  let conn;
  try {
    conn = await pool.getConnection();
    const SQL = `INSERT INTO ${TABLE} 
      (emp_no, dept_no, from_date, to_date) 
      VALUES(?,?,current_date(),'9999-01-01')`;
    const params = [];
    params[0] = emp_no;
    params[1] = dept_no;
    const rows = await conn.query(SQL, params);
    return rows;
  } catch (err) {
    return Promise.reject(err);
  } finally {
    if (conn) await conn.release();
  }
}