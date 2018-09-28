const fetch = require('node-fetch');
const {cli} = require('cli-ux');
const throwError = require('../error');

const createTables = async (tables, url, headers, overwrite, runSql, sql) => {
  if (overwrite) {
    cli.action.stop('Skipped!');
    cli.action.start('Creating tables');
    await runSql(sql, url, headers);
  } else {
    try {
      const resp = await fetch(
        `${url}/v1/query`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            type: 'select',
            args: {
              table: {
                name: 'hdb_table',
                schema: 'hdb_catalog',
              },
              columns: ['*.*'],
              where: {
                table_schema: 'public',
              },
            },
          }),
        }
      );
      const dbTables = await resp.json();
      if (resp.status === 401) {
        throw (dbTables);
      } else {
        let found = false;
        tables.forEach(table => {
          if (dbTables.find(dbTable => dbTable.table_name === table.name)) {
            found = true;
            throwError('Message: Your JSON database contains tables that already exist in Postgres. Please use the flag "--overwrite" to overwrite them.');
          }
        });
        if (!found) {
          cli.action.stop('Done!');
          cli.action.start('Creating tables');
          await runSql(sql, url, headers);
        }
      }
    } catch (e) {
      console.log(e);
      throwError(e);
    }
  }
};

module.exports = {
  createTables,
};
