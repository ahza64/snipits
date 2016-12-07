TXTDIR=markdown
HTMLS=$(wildcard *.html)
MDS=$(patsubst %.html,$(TXTDIR)/%.md, $(HTMLS))

.PHONY : all 

gen_markdown: all

all : $(MDS) fix_links

$(TXTDIR) :
	mkdir $(TXTDIR)

$(TXTDIR)/%.md: %.html $(TXTDIR)
	pandoc -f html -t markdown_github -s $< -o $@

fix_links:
	find ./$(TXTDIR) -name '*.md' | xargs sed -i .bak 's/.html/.md/g'
	rm ./$(TXTDIR)/*.bak
