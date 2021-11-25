const pool = require("./connection.db");
const TABLE='dept_manager'
const TABLE_EMPLEADOS = "employees";

/**
 * Retorna el historial del gerente en un departamento
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
        dm.*
      FROM ${TABLE} dm
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


/*##############################FUNCIONA ##########################*/
/**
 * Retorna  todos los gerente  de los departamento
 * @returns 
 */
module.exports.getAll = async function () {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(`SELECT * FROM ${TABLE} d where to_date='9999-01-01'`);
    return rows;
  } catch (err) {
    return Promise.reject(err);
  } finally {
    if (conn) await conn.release();
  }
};

/*##############################FUNCIONA ##########################*/
/**
 * Retorna una historial de gerente actual usando el numero dept_no
 * @param {number} dept_no ide del departamento
 * @returns historia de gerente actual
 */
module.exports.getHistoriaActual = async function (dept_no) {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(`SELECT * FROM ${TABLE} d WHERE dept_no=? AND to_date='9999-01-01'`,[dept_no]);
    return rows[0];
  } catch (err) {
    return Promise.reject(err);
  } finally {
    if (conn) await conn.release();
  }
};


/*##############################FUNCIONA AGREGAR##########################*/
/**
 * Agrega un dept_manager 
 * @param {Object} dept_manager
 * @returns 
 */
module.exports.add = async function (dept_manager) {
  let conn;
  try {
    conn = await pool.getConnection();
    const SQL=`
    INSERT INTO ${TABLE} 
      (emp_no, dept_no, from_date, to_date)
      VALUES(?, ?, ?, ?)`
    const params=[]
    params[0]=dept_manager.emp_no
    params[1]=dept_manager.dept_no
    params[2]=dept_manager.from_date
    params[3]=dept_manager.to_date
    const rows = await conn.query(SQL,params);
    return rows;
  } catch (err) {
    return Promise.reject(err);
  } finally {
    if (conn) await conn.release();
  }
};

/*################################FUNCIONANDO#########################*/
/**
 * Modifica un gerente
 * @param {Object} gerente
 * @returns 
 */
module.exports.update = async function (gerente) {
  let conn;
  try {
    conn = await pool.getConnection();
    const SQL=`
      UPDATE dept_manager  
        SET to_date=?, from_date=?
      WHERE emp_no=? 
        AND dept_no=?
      `
    const params=[]
    params[0]=gerente.to_date
    params[1]=gerente.from_date
    params[1]=gerente.emp_no
    params[1]=gerente.dept_no
    const rows = await conn.query(SQL,params);
    return rows;
  } catch (err) {
    return Promise.reject(err);
  } finally {
    if (conn) await conn.release();
  }
};

/**
 * Actualiza la fecha del historial de gerente por la actual
 * @param {Object} gerente 
 * @returns 
 */
module.exports.updateHistorial = async function (gerente) {
  let conn;
  try {
    conn = await pool.getConnection();
    const SQL=`
      UPDATE dept_manager  
        SET to_date=CURRENT_DATE() 
      WHERE emp_no=? 
        AND dept_no=? 
        AND to_date='9999-01-01'
      `
    const params=[]
    params[0]=gerente.emp_no
    params[1]=gerente.dept_no  
    const rows = await conn.query(SQL,params);
    return rows;
  } catch (err) {
    return Promise.reject(err);
  } finally {
    if (conn) await conn.release();
  }
};

/**
 * Agrega un nuevo historial de gerente con fecha desde la de hoy
 * y fecha hasta con '9999-01-01'
 * @param {number} emp_no 
 * @param {string} dept_no 
 * @returns 
 */
module.exports.addNuevoCambioHistorialGerente = async function(emp_no, dept_no){
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
