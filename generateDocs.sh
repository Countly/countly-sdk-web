#!/bin/sh

#Original source https://gist.github.com/vidavidorra/548ffbcdae99d752da02

echo "Starting documention deployment script"
GITHUB_BRANCH=${GITHUB_REF##*/}
echo "$GITHUB_BRANCH"
echo "$GITHUB_HEAD_REF"
echo "$GITHUB_REF"
echo "$GITHUB_REPOSITORY"
# // TODO: if check here needs to be fortified?
if [ "$GITHUB_REPOSITORY" == "Countly/countly-sdk-web" ]; then

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo 'Setting up the script...'
# Exit with nonzero exit code if anything fails
set -e

# Create a clean working directory for this script.
mkdir code_docs
cd code_docs

# Get the current gh-pages branch
git clone -b gh-pages "http://github.com/$GITHUB_REPOSITORY" repo
cd repo

##### Configure git.
# Set the push default to simple i.e. push only the current branch.
git config --global push.default simple
# Pretend to be an user called Tracey.
git config user.name "Github Actions"
git config user.email "actions@github.com"

# Remove everything currently in the gh-pages branch.
# GitHub is smart enough to know which files have changed and which files have
# stayed the same and will only update the changed files. So the gh-pages branch
# can be safely cleaned, and it is sure that everything pushed later is the new
# documentation.
# rm -rf * 
#TODO: D wussed out but might be brought back

# Need to create a .nojekyll file to allow filenames starting with an underscore
# to be seen on the gh-pages site. Therefore creating an empty .nojekyll file.
echo "" > .nojekyll

################################################################################
##### Generate JSDOC documents.          #####
echo 'Generating JSDoc code documentation...'
"$DIR/node_modules/.bin/jsdoc" "$DIR/lib/countly.js" "$DIR/README.md" -c  "$DIR/jsdoc_conf.json" -d  "$DIR/code_docs/repo" ;
#TODO: erased plugins from here but might be back
################################################################################
##### Upload the documentation to the gh-pages branch of the repository.   #####
# Only upload if JSDoc successfully created the documentation.
# Check this by verifying that the file index.html exists
if [ -f "index.html" ]; then

    echo 'Uploading documentation to the gh-pages branch...'
    # Add everything in this directory to the
    # gh-pages branch.
    # GitHub is smart enough to know which files have changed and which files have
    # stayed the same and will only update the changed files.
    git add --all

    # Commit the added files with a title and description containing the Github
    # build number and the GitHub commit reference that issued this build.
    git commit -m "Deploy code docs to GitHub Pages build: ${GITHUB_RUN_ID}" -m "Commit: ${GITHUB_SHA}"

    # Force push to the remote gh-pages branch.
    # The ouput is redirected to /dev/null to hide any sensitive credential data
    # that might otherwise be exposed.
    git push --force "https://${GITHUB_ACTOR}:${GITHUB_TOKEN}@github.com/${GITHUB_REPOSITORY}.git"
else
    echo '' >&2
    echo 'Warning: No documentation (html) files have been found!' >&2
    echo 'Warning: Not going to push the documentation to GitHub!' >&2
    exit 1
fi

fi
