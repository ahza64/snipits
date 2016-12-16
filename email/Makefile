MD_DIR=./docs
HTML_DIR=./docs/html

.PHONY : markdown 

install:
	npm install --save-dev minami

docs: clean js_doc markdown
	

js_doc: 
	mkdir -p ${HTML_DIR}
	jsdoc -c jsdoc_conf.json


markdown : 
	mkdir -p ${MD_DIR}
	find ${HTML_DIR} -iname "*.html" -type f | xargs -I {} -n1 basename {} .html | xargs -I {} -n1 pandoc "${HTML_DIR}/{}.html" -o "${MD_DIR}/{}.md" 
	find ./$(MD_DIR) -name '*.md' | xargs sed -i .bak 's/.html/.md/g'
	rm ./$(MD_DIR)/*.bak
	
clean:
	rm -rf ./docs
	
	
	
