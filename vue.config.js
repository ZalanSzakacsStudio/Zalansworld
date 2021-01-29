module.exports = {
    publicPath: 'zalansconcept',
    chainWebpack: config => {
        // Manually set the entry point
        config
            .entry('app')
            .clear()
            .add('./src/js/main.js');
        // Manually set template path
        config.plugin('html').tap(args => {
            args[0].template = './index.html';
            return args;
        });
    },
    // https://cli.vuejs.org/guide/css.html#passing-options-to-pre-processor-loaders
    css: {
        sourceMap: true,
        loaderOptions: {
            sass: {
                data: `@import "./src/scss/main.scss";`
            }
        }
    }
};
