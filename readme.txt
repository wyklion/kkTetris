安装mongodb(加path)。创建目录data/db。
安装nodejs。npm install
mongochef免费可选。

运行：
startDatabase.bat
startWeb.bat

安装git
git config --global user.name "KK"
git config --global user.email wyklion@qq.com
git clone https://github.com/wyklion/kkTetris

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

vi .gitignore
*~
.idea/