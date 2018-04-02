ps aux|grep node|grep -v grep|awk '{print $2}'|xargs kill -9

