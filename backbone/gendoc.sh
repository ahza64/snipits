jsdoc -c jsdoc_conf.json
cd docs
find . -name "*.ht*" | while read i; do pandoc -f html -t markdown_github "$i" -o "${i%.*}.md"; done
mv *.md markdown/
find ./markdown -name '*.md' | xargs sed -i .bak 's/.html/.md/g'
rm ./markdown/*.bak
