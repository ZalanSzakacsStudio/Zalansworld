# URANUS

## Project setup
```
npm install
```

## Development

```
npm run serve
```
After serving the application, it will show on what address the application is served on. `localhost:8080`.

## Production
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

After changing the `publicPath` repeat the **Production** step.
