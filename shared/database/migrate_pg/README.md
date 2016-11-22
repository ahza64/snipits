# Postgres Migrations

Trying out [Sequelize Migration](http://docs.sequelizejs.com/en/latest/docs/migrations) 

## Install

```
npm install -g sequelize-cli
npm install -g pg
```


## File sturcture

This was built by sequelize init

    config             A folder that contains the config files.
    config/config.json A file that contains the configuration for the ORM.
    migrations         A folder that containts the migration files.
    seeders            A folder that containts the seed files.
    models             A folder that contains the model files.
    models/index.js    A file that can be required to load all the models.


## Create a Migration
```
$ sequelize migration:create --name add_history_table

Sequelize [Node: 4.2.1, CLI: 2.4.0, ORM: 3.24.4, pg: ^6.1.0]

Loaded configuration file "config/config.json".
Using environment "development".
Successfully created migrations folder at "/Users/gabriellittman/Development/services/shared/database/migrate_pg/migrations".
New migration was created at /Users/gabriellittman/Development/services/shared/database/migrate_pg/migrations/20161118014300-add_history_table.js .
```

## Run Migraitons
```
$ sequelize db:migrate

Sequelize [Node: 4.2.1, CLI: 2.4.0, ORM: 3.24.4, pg: ^6.1.0]

Loaded configuration file "config/config.json".
Using environment "development".
== 20161118014300-add_history_table: migrating =======
== 20161118014300-add_history_table: migrated (0.047s)
```

## Undo the Migration
```
$ sequelize db:migrate:undo

Sequelize [Node: 4.2.1, CLI: 2.4.0, ORM: 3.24.4, pg: ^6.1.0]

Loaded configuration file "config/config.json".
Using environment "development".
== 20161118014300-add_history_table: reverting =======
== 20161118014300-add_history_table: reverted (5.120s)
```