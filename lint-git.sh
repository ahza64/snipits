# A POSIX variable
OPTIND=1         # Reset in case getopts has been used previously in the shell.

show_help() {
    echo "-h -? show help"
    echo "-f set output format"
    echo "-o set output file"
    echo "-c lints only files changed since git commit specified"
    echo "-H lints only currenly uncommited files or if no files lints the last commit"
    echo "-x auto fix errors"
}


# Initialize our own variables:
output_file=""
output_format="-f stylish"
all=0
fix=""
commit=""
while getopts "h?xf:o:c:H" opt; do
    case "$opt" in
    h|\?)
        show_help
        exit 0
        ;;
    f)  output_format="-f $OPTARG"
        ;;
    o)  output_file=$OPTARG
        ;;
    c)  commit=$OPTARG
        ;;
    H)  head="true"
        ;;
    x)  fix="--fix"
        ;;
    esac
done


if [ "$commit" ]
then
    echo "COMMIT"
    LIST=`git diff --name-only $commit | grep .*\\.js | grep -v json`
elif [ "$head" ]
then
    LIST=`git diff --name-only HEAD | grep .*\\.js | grep -v json`    
    #if compare was HEAD and nothing found then check the current commit
    if [ !"$LIST" ] 
    then
        LIST=`git diff --name-only HEAD~1 | grep .*\\.js | grep -v json`
    fi    
else
    LIST=". --ext js,jsx"
fi


    
if [ "$LIST" ]
then
    echo "node node_modules/eslint/bin/eslint.js  $LIST $output_format $fix"
    if [ "$output_file" ]
    then
        node node_modules/eslint/bin/eslint.js  $LIST $output_format $fix > $output_file | echo "Lint failed!"
    else
        node node_modules/eslint/bin/eslint.js  $LIST $output_format $fix
    fi
fi
