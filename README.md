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

#### Audio
In src/js/three/objects/Choreograph.js on line 54 an audio file is loaded and set to the walls.
If you want multiple audio files, repeat line 56:
```
        audioLoader.load('assets/sounds/SlidingStoneLong.mp3', buffer => {
```
Change the mp3 filename and set it to the a wall of your liking.

Want all walls to have a random loaded sound asigned? Just randomly pick walls from the `this.walls` array and set the audio for the right loader.
