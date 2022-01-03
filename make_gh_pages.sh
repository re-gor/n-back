#!/usr/bin/env bash

echo "Will publish on github pages"
echo ""
git worktree add --no-checkout ./gh-pages
cp -r src/* ./gh-pages
cd ./gh-pages
git add *
git commit -m 'prepare gh-pages'
git push -uf origin gh-pages

cd ..
git worktree remove -f gh-pages 
echo ""
echo "Published"
