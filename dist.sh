if [ "$(git status --porcelain | wc -l)" -eq "0" ]; then
  echo "› 🟢 Git repo is clean."
else
  echo "› Repo is dirty, commit your changes first."
  exit
fi

./build.sh

npm version patch
npm publish
