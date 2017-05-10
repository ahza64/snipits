
COMPARE="HEAD"; 
if [ $1 ]
then    
    COMPARE=$1; 
fi

LIST=`git diff --name-only $COMPARE | grep .*\\.js | grep -v json`
if [ !"$LIST" ] && [ $COMPARE == "HEAD" ]
then
    COMPARE="HEAD~1"
    LIST=`git diff --name-only $COMPARE | grep .*\\.js | grep -v json`
fi

if [ "$LIST" ]
then
    node node_modules/eslint/bin/eslint.js  $LIST;
fi
