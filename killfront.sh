ps aux|grep front/build|grep -v grep|awk '{print $2}'|xargs kill -9

