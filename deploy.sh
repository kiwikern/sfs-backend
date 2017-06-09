now=$(date)
deploy=~/bin/sfs-backend

# helper functions
log() {
  echo "$now: $1" >> $deploy/deploy.log
}

log "started deploying"
cd $deploy
latesttag=$(git describe --tags)
log "checking out ${latesttag}"
error=$(git checkout ${latesttag} 2>&1)
rc=$?
if [[ $rc != 0 ]]
then
  log "git checkout errored"
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
