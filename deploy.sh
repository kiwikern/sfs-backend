now=$(date)
deploy=~/bin/sfs-schedule

# helper functions
log() {
  echo "$now: $1" >> $deploy/deploy.log
}

log "started deploying"
cd $deploy
echo "git pull"
error=$(git pull 2>&1)
rc=$?
if [[ $rc != 0 ]]
then
  log "git pull errored"
  echo $error
  exit $rc
fi

rm -rf node_modules

echo "npm install"
error=$(npm install 2>&1)
rc=$?
if [[ $rc != 0 ]]
then
  log "npm install errored"
  echo $error
  exit $rc
fi

echo "restart service"
svc -du ~/service/sfs-backend
sleep 10s
echo "$now: show last 10 lines of service log"
readlog sfs-backend | tail -10

log "deploy finished"
