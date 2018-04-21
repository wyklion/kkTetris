# centos
### nodejs
```
https://nodejs.org/en/download/
wget https://nodejs.org/dist/v8.11.1/node-v8.11.1-linux-x64.tar.xz
yum search xz
yum install xz.x86_64
xz -d node-v8.11.1-linux-x64.tar.xz
tar -xf node-v8.11.1-linux-x64.tar
mv node-v8.11.1-linux-x64 node
ln -s /root/node/bin/node /usr/local/bin/node  
ln -s /root/node/bin/npm /usr/local/bin/npm
```
### mongodb
```
vi /etc/yum.repos.d/mongodb-org-3.4.repo
```
```
[mongodb-org-3.4]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/redhat/$releasever/mongodb-org/3.4/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://www.mongodb.org/static/pgp/server-3.4.asc
```
```
yum install -y mongodb-org
vi /etc/mongod.conf
创建目录data/db。
```
```
db.users.update({},{$set:{'keyboard.downDelay':20}},{multi:true})
db.users.update({},{$set:{'speed40Date':0,dig18Best:1000,dig18Times:0,dig18Date:0}},{multi:true})
```

### git
```
ssh-keygen -t rsa -C "wyklion@qq.com"
github上加ssh key。
测试ssh -T git@github.com
git config --global push.default simple
git config --global credential.helper store
git config --global user.name "KK"
git config --global user.email wyklion@qq.com
git clone https://github.com/wyklion/kkTetris
```
```
git add 加入暂存
git status
git status -s
git add README
git commit -a 跳过暂存
git commit --amend覆盖提交
git rm -f强制
git mv file_from file_to 改名
git log
git reset HEAD CONTRIBUTING.md 取消暂存
git checkout -- CONTRIBUTING.md 撤消修改

git remote add origin https://github.com/wyklion/kkTetris.git
git remote
git fetch [remote-name]
git push origin master
```

## 启动
旧
```
vi web/public/src/config.js //修改SERVER_NAME
./startdb.sh
./startweb.sh
```
新
```
vi front/src/config.js //修改SERVER_NAME
./startdb.sh
./startserver.sh
./startfront.sh
```

# windows
mongochef免费可选。

```
运行：
startDatabase.bat
startWeb.bat
```
```
linux:
安全组。开80端口。
sudo /sbin/iptables -I INPUT -p tcp --dport 80 -j ACCEPT
sudo /sbin/iptables -I INPUT -p tcp --dport 21 -j ACCEPT
sudo /sbin/iptables -A INPUT -p tcp -m state --state NEW -m tcp --dport 27017 -j ACCEPT
sudo /etc/rc.d/init.d/iptables save
sudo /etc/rc.d/init.d/iptables restart
sudo /etc/init.d/iptables status

linux:
sudo /sbin/iptables -I INPUT -p tcp --dport 80 -j ACCEPT
sudo /etc/rc.d/init.d/iptables save
sudo vi /etc/sysconfig/iptables
sudo /etc/init.d/iptables start
sudo /etc/init.d/iptables status
sudo yum -y install vsftpd
sodu vi /etc/vsftpd/vsftpd.conf
sudo useradd -d /home/ec2-user/work/kkTetris -s /sbin/nologin kkkkk
sudo passwd kkkk
sudo chmod -R 755 /home/ec2-user/work/kkTetris
sudo chown -R kk /home/ec2-user/work/kkTetris
sudo /etc/rc.d/init.d/vsftpd restart
sudo chkconfig --level 35 vsftpd on
```

