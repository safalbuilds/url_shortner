``
sudo pacman -S postgresql
``

postgresql
|
|---postgres (Server)
|
|---psql (client)


Initialize the postgres cluster
```
sudo -iu postgres initdb -D /var/lib/postgres/data
```

start postgres server
```
sudo systemctl start postgresql
```
check status
```
sudo systemctl status postgrers
```

Connect to PostgreSQL
```
sudo -iu postgresql psql
```

Create DataBase
```
CREATE DATABASE url_shortner;
```

List all DATABSES
```
\l
```
Connect to DB
```
\c url_shortner
```

Similar to moongose we need prisma here
```
npm i prisma
npx prisma init
```

this creastes new files

|
|
|---prisma
|       |
|       |---schema.prisma
|
|----.env
|
|----prisma.config.ts


in /prisma/schema.prisma make new model
hit
```
npx prisma db pull // This matches model in schema.prisma from the url in .env here it is in localserver and fetches it
npx prisma generate  // This...
```
