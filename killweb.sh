ps aux|grep web|grep -v grep|awk '{print $2}'|xargs kill -9

