const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const sourcemaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');
const cssnano = require('gulp-cssnano');
const purgecss = require('gulp-purgecss');
const rename = require('gulp-rename');
const stripCssComments = require('gulp-strip-css-comments');
const stripComments = require('gulp-strip-comments');
const uglify = require('gulp-uglify');
const browserSync = require('browser-sync').create();

// Compile SCSS to CSS with autoprefixer, clean CSS, and sourcemaps

function style() {
    return gulp
        .src('./src/scss/**/*.scss')
        .pipe(sourcemaps.init()) // Initialize sourcemaps
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer()) // Add autoprefixer
        .pipe(concat('style.css')) // Create style.css
        .pipe(gulp.dest('public/assets/css'))
        .pipe(cleanCSS({ compatibility: 'ie11' })) // Minify CSS
        .pipe(concat('style.min.css')) // Create style.min.css
        .pipe(cssnano()) // Minify CSS using gulp-cssnano
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('public/assets/css'))
        .pipe(browserSync.stream());
}

// Task to copy HTML files from ./src folder to the root of public folder
function copyHTML() {
    return gulp.src('./src/**/*.html')
        .pipe(gulp.dest('public'));
}

// Task to copy JavaScript files from ./src/assets/js to public/assets/js
function copyJS() {
    return gulp
        .src('./src/assets/js/**/*.js')
        .pipe(sourcemaps.init()) // Initialize sourcemaps
        .pipe(concat('script.js')) // Concatenate JS files
        .pipe(gulp.dest('public/assets/js'))
        .pipe(uglify()) // Minify JS
        .pipe(stripComments()) // Remove comments
        .pipe(rename('script.min.js')) // Rename to script.min.js
        .pipe(sourcemaps.write('.')) // Write sourcemaps to the same directory
        .pipe(gulp.dest('public/assets/js'));
}

// Task to copy image files from ./src/assets/images to public/assets/images
function copyImages() {
    return gulp.src('./src/assets/images/**/*')
        .pipe(gulp.dest('public/assets/images'));
}

function copyIcons() {
    return gulp.src('./src/assets/icons/**/*')
        .pipe(gulp.dest('public/assets/icons'));

}
// Task to remove unused CSS rules with PurgeCSS
function purgeCss() {
    return gulp.src('public/assets/css/style.css')
        .pipe(purgecss({
            content: ['./public/**/*.html'], // Configure the HTML files to analyze
        }))
        .pipe(rename('style.min.css'))
        .pipe(stripCssComments()) // Remove CSS comments
        .pipe(gulp.dest('public/assets/css'));
}


// Task to initialize BrowserSync
function watch() {
    browserSync.init({
        server: {
            baseDir: './public',
        }
    });
    gulp.watch('./src/scss/**/*.scss', style);
    gulp.watch('./src/**/*.html').on('change', gulp.series(copyHTML, purgeCss, browserSync.reload)); // Copy HTML, purge CSS, and reload on change
    gulp.watch('./src/assets/js/**/*.js').on('change', gulp.series(copyJS, browserSync.reload)); // Copy JS and reload on change
    gulp.watch('./src/assets/images/**/*').on('change', gulp.series(copyImages, browserSync.reload)); // Copy images and reload on change
}

exports.style = style;
exports.copyHTML = copyHTML;
exports.copyJS = copyJS;
exports.copyImages = copyImages;
exports.copyIcons = copyIcons;
exports.purgeCss = purgeCss;
exports.watch = watch;
