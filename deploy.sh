now=$(date)
echo "$now: started deploying" >> deploy.log
echo "git pull"
error=$(git pull 2>&1)
rc=$?
if [[ $rc != 0 ]]
then
  echo "$now: git pull errored" >> deploy.log
  echo $error
  exit $rc
fi

rm -rf node_modules

echo "npm install"
error=$(npm install 2>&1)
rc=$?
if [[ $rc != 0 ]]
then
  echo "$now: npm install errored" >> deploy.log
  echo $error
  exit $rc
fi

echo "restart service"
svc -du ~/service/sfs-backend
sleep 10s
echo "$now: show last 10 lines of service log"
readlog sfs-backend | tail -10

echo "$now: deploy finished" >> deploy.log

