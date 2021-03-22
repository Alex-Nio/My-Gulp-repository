"use strict";

const {src, dest}    = require("gulp");
const gulp           = require("gulp");
const autoprefixer   = require("gulp-autoprefixer");
const cssbeautify    = require("gulp-cssbeautify");
const concat         = require('gulp-concat'); // Подключаем gulp-concat (для конкатенации файлов)
const removeComments = require('gulp-strip-css-comments');
const rename         = require("gulp-rename");
const sass           = require("gulp-sass");
const cssnano        = require("gulp-cssnano");
const uglify         = require("gulp-uglify");
const plumber        = require("gulp-plumber");
const panini         = require("panini");
const imagemin       = require("gulp-imagemin");
const del            = require("del");
const notify         = require("gulp-notify");
const webpack        = require('webpack');
const webpackStream  = require('webpack-stream');
const browserSync    = require("browser-sync").create();


/* Paths */
const srcPath = '#src/';
const distPath = 'dist/';

const path = {
    build: {
        html:       distPath,
        js:         distPath + "assets/js/",
        libs:       distPath + "assets/js/libs/",
        css:        distPath + "assets/css/",
        libscss:    distPath + "assets/libs/css-libs/",
        images:     distPath + "assets/images/",
        fonts:      distPath + "assets/fonts/"
    },
    src: {
        html:       srcPath + "*.html",
        js:         srcPath + "assets/js/**/*.js",
        libs:       srcPath + "assets/js/libs/*.js",
        libscss:    srcPath + "assets/libs/libs-css/*.css",
        css:        srcPath + "assets/sass/*.sass",
        images:     srcPath + "assets/images/**/*.{jpg,png,svg,gif,ico,webp,webmanifest,xml,json}",
        fonts:      srcPath + "assets/fonts/**/*.{eot,woff,woff2,ttf,svg}"
    },
    watch: {
        html:   srcPath + "**/*.html",
        js:     srcPath + "assets/js/**/*.js",
        css:    srcPath + "assets/sass/**/*.sass",
        images: srcPath + "assets/images/**/*.{jpg,png,svg,gif,ico,webp,webmanifest,xml,json}",
        fonts:  srcPath + "assets/fonts/**/*.{eot,woff,woff2,ttf,svg}"
    },
    clean: "./" + distPath
}



/* Tasks */

function serve() {
    browserSync.init({
        server: {
            baseDir: "./" + distPath,
            index: 'index.html'
        },
        port: 3000,
        browser: 'chrome'
    });
}

// LIBS COMPRESSOR

function libs(cb) {
    return gulp.src([ // Берем все необходимые библиотеки ИМЕННО В ТАКОМ ПОРЯДКЕ!!!
        '#src/assets/libs/jquery/jquery-3.5.1.min.js', // Берем jQuery
        '#src/assets/libs/wow/wow.min.js', // Берем WOW (Анимации)
        '#src/assets/libs/anime/anime.min.js', // Берем Anime (Анимации)
        '#src/assets/libs/waypoints/jquery.waypoints.min.js', // Берем Waypoints (библиотека для слежки за скроллингом страницы)
        '#src/assets/libs/swiper/swiper.min.js', // Берем Swiper (библиотека для создания слайдеров)
        '#src/assets/libs/microplugin/microplugin.min.js', // Берем Microplugin (это облегченная архитектура подключаемых модулей для вашей библиотеки JavaScript)
        '#src/assets/libs/sifter/sifter.min.js', // Берем Shifter (библиотека для текстового поиска в массивах и объектах)
        '#src/assets/libs/selectize/selectize.min.js', // Берем Selectize (Плагин, который превратит селект в текстовое поле с выпадающим списком. Помимо поиска имеет другие возможности.)
        '#src/assets/libs/jqueryui/jquery-ui.min.js', // Берем jQueryUi (Это набор плагинов для jQuery, который добавляет новые функциональные возможности в базовую библиотеку jQuery)
        '#src/assets/libs/jqueryui/jquery.ui.touch-punch.min.js', // Берем jQueryUi Touch Punch (Touch Punch – это хак. Он использует некоторый функционал jQuery UI для обработки touch-событий.)
        '#src/assets/libs/theasidebar/theia-sticky-sidebar.min.js', // Берем Theia Sticky Sidebar (Библиотека липких сайдбаров)
        '#src/assets/libs/resizeSensor/ResizeSensor.min.js', // Берем Resize Sensor (Библиотека ResizeSensor, помогающая определить, когда элементы на сайте изменяют свой размер)
        '#src/assets/libs/magnific-popup/jquery.magnific-popup.min.js', // Берем jQuery Magnific Popup (Magnific Popup - это бесплатный адаптивный jQuery lightbox-плагин, в котором основной упор сделан на производительность и предоставление наилучшего отображения всплывающего окна в независимости от того с какого устройства пользователь открыл страницу.)
        '#src/assets/libs/ionrangeslider/ion.rangeslider.min.js', // Берем ion.rangeSlider (Монстр-плагин для рендж слайдеров)
        '#src/assets/libs/isotope/isotope.pkgd.min.js' // Берем isotope (Плагин для фильтрации и сортировки)

        ])
        .pipe(concat('libs.min.js')) // Собираем их в кучу в новом файле libs.min.js
        .pipe(uglify()) // Сжимаем JS файл
        .pipe(gulp.dest(srcPath + 'assets/js/libs')); // Выгружаем в папку js/libs

    cb();
}


// LIBS TASK

function libscss (cb) {
    return src(path.src.libscss, {base: srcPath + "assets/sass/libs.sass"})// Выбираем файл для минификации
        .pipe(sass()) // Преобразуем Sass в CSS посредством gulp-sass
        .pipe(dest(path.build.libscss)); // Выгружаем в папку dist/css

    cb();
}



function html(cb) {
    panini.refresh();
    return src(path.src.html, {base: srcPath})
        .pipe(plumber())
        .pipe(panini({
            root:       srcPath,
            layouts:    srcPath + 'layouts/',
            partials:   srcPath + 'partials/',
            helpers:    srcPath + 'helpers/',
            data:       srcPath + 'data/'
        }))
        .pipe(dest(path.build.html))
        .pipe(browserSync.reload({stream: true}));

    cb();
}

function css(cb) {
    return src(path.src.css, {base: srcPath + "assets/sass/"})
        .pipe(plumber({
            errorHandler : function(err) {
                notify.onError({
                    title:    "SASS Error",
                    message:  "Error: <%= error.message %>"
                })(err);
                this.emit('end');
            }
        }))
        .pipe(sass({
            includePaths: './node_modules/'
        }))
        .pipe(autoprefixer({
            cascade: true
        }))
        .pipe(cssbeautify())
        .pipe(dest(path.build.css))
        .pipe(cssnano({
            zindex: false,
            discardComments: {
                removeAll: true
            }
        }))
        .pipe(removeComments())
        .pipe(rename({
            suffix: ".min",
            extname: ".css"
        }))
        .pipe(dest(path.build.css))
        .pipe(browserSync.reload({stream: true}));

    cb();
}

function cssWatch(cb) {
    return src(path.src.css, {base: srcPath + "assets/sass/"})
        .pipe(plumber({
            errorHandler : function(err) {
                notify.onError({
                    title:    "SASS Error",
                    message:  "Error: <%= error.message %>"
                })(err);
                this.emit('end');
            }
        }))
        .pipe(sass({
            includePaths: './node_modules/'
        }))
        .pipe(rename({
            suffix: ".min",
            extname: ".css"
        }))
        .pipe(dest(path.build.css))
        .pipe(browserSync.reload({stream: true}));

    cb();
}

function js(cb) {
    return src(path.src.js, {base: srcPath + 'assets/js/'})
        .pipe(plumber({
            errorHandler : function(err) {
                notify.onError({
                    title:    "JS Error",
                    message:  "Error: <%= error.message %>"
                })(err);
                this.emit('end');
            }
        }))
        .pipe(dest(path.build.js))
        .pipe(browserSync.reload({stream: true}));

    cb();
}

function jsWatch(cb) {
    return src(path.src.js, {base: srcPath + 'assets/js/'})
        .pipe(plumber({
            errorHandler : function(err) {
                notify.onError({
                    title:    "JS Error",
                    message:  "Error: <%= error.message %>"
                })(err);
                this.emit('end');
            }
        }))
        .pipe(dest(path.build.js))
        .pipe(browserSync.reload({stream: true}));

    cb();
}

function images(cb) {
    return src(path.src.images)
        .pipe(imagemin([
            imagemin.gifsicle({interlaced: true}),
            imagemin.mozjpeg({quality: 95, progressive: true}),
            imagemin.optipng({optimizationLevel: 5}),
            imagemin.svgo({
                plugins: [
                    { removeViewBox: true },
                    { cleanupIDs: false }
                ]
            })
        ]))
        .pipe(dest(path.build.images))
        .pipe(browserSync.reload({stream: true}));

    cb();
}

function fonts(cb) {
    return src(path.src.fonts)
        .pipe(dest(path.build.fonts))
        .pipe(browserSync.reload({stream: true}));

    cb();
}

function clean(cb) {
    return del(path.clean);

    cb();
}

function watchFiles() {
    gulp.watch([path.watch.html], html);
    gulp.watch([path.watch.css], cssWatch);
    gulp.watch([path.watch.js], jsWatch);
    gulp.watch([path.watch.images], images);
    gulp.watch([path.watch.fonts], fonts);
}

const build = gulp.series(clean, libs, libscss, gulp.parallel(html, css, js, images, fonts));
const watch = gulp.parallel(watchFiles, serve);


/* Exports Tasks */
exports.html = html;
exports.css = css;
exports.libs = libs;
exports.libscss = libscss;
exports.js = js;
exports.images = images;
exports.fonts = fonts;
exports.clean = clean;
exports.build = build;
exports.watch = watch;
exports.default = watch;
