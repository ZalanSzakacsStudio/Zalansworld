# ZALANSWORLD

## START
- Install git https://git-scm.com/
- Install NODE https://nodejs.org/en/
- Copy the https link of the project -> https://github.com/ZalanSzakacsStudio/Zalansworld.git
- Open terminal and navigate (cd command) to where the project should be located. 
- Run the command `git clone <url>` (url = the url copied from step 3)
This will clone the repository in the directory `zalansworld`

### Updating the project
Now that you have installed git we do not have to download the project over and over
Follow the steps below to update the project:
- Open the terminal and navigate (cd command) to project directory
- Run the command `git pull`

### Branches
There might be multiple branches in the git project, to switch a branch:
- Open the terminal and navigate (cd command) to project directory
- Run the command `git checkout <branchname>`
- From here follow the steps below

## Production
```
npm install
```

```
npm run build
```
After building, there will be a `dist` directory, the contents of this directory have to be uploaded to the domain.

### Subdomain
Do you use a subdomain https://www.example.com/subdomain ?
Change the `publicPath` inside `vue.config.js` to whatever the subdomain should be.
For the example above it should look like:
```
module.exports = {
    publicPath: 'subdomain',
    ...
```

## Development
```
npm install
```

```
npm run serve
```
After serving the application, it will show on what address the application is served on. `localhost:8080`.

After changing the `publicPath` repeat the **Production** step.
