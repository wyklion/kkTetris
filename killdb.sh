ps aux|grep mongod|grep -v grep|awk '{print $2}'|xargs kill -9

