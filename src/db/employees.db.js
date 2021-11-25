const pool = require("./connection.db");
const TABLE = "employees";

/**
 * Retorna un empleado
 * @param {number} id id del empleado
 * @returns 
 */
module.exports.getById = async function (id) {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(
        `SELECT * FROM ${TABLE} d WHERE emp_no=?`, [id]);
    return rows[0];
  } catch (err) {
    return Promise.reject(err);
  } finally {
    if (conn) await conn.release();
  }
};

/**
 * Agrega un empleado
 * @param {Object} empleado 
 * @returns 
 */
module.exports.add = async function(empleado) {
  let conn;
  try {
    conn = await pool.getConnection();
    const SQL=`
    INSERT INTO ${TABLE} 
      (emp_no, birth_date, first_name, last_name, gender, hire_date) 
      VALUES(?, ?, ?, ?, ?, ?)`    
    const params=[]
    params[0]=empleado.emp_no
    params[1]=empleado.birth_date
    params[2]=empleado.first_name
    params[3]=empleado.last_name
    params[4]=empleado.gender
    params[5]=empleado.hire_date
    const rows = await conn.query(SQL,params);
    return rows;
  } catch (err) {
    return Promise.reject(err);
  } finally {
    if (conn) await conn.release();
  }
}

/**
 * Elimina un empleado
 * @param {Object} empleado 
 * @returns 
 */
module.exports.delete = async function(empleado) {
  let conn;
  try {
    conn = await pool.getConnection();
    const SQL=`
    DELETE FROM ${TABLE}
	    WHERE emp_no=?;`    
    const params=[]
    params[0]=empleado.emp_no
    const rows = await conn.query(SQL,params);
    return rows;
  } catch (err) {
    return Promise.reject(err);
  } finally {
    if (conn) await conn.release();
  }
}


