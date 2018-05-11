nohup mongod --bind_ip 127.0.0.1 --port 27017 --dbpath data/db --logpath data/mongod.log --logappend >/dev/null 2>dblog.out &
