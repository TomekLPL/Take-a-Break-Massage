const { src, dest, series, parallel, watch } = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('gulp-cssnano');
const rename = require('gulp-rename');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const imagemin = require('gulp-imagemin');
const sourcemaps = require('gulp-sourcemaps');
const clean = require('gulp-clean');
const kit = require('gulp-kit');
const browserSync = require('browser-sync').create();
const reload = browserSync.reload;

const paths = {
	html: './html/**/*.kit',
	sass: './src/sass/**/*.scss',
	js: './src/js/**/*.js',
	images: './src/img/*',
	dist: './dist',
	sassDest: './dist/css',
	jsDest: './dist/js',
	imagesDest: './dist/img',
};

function sassCompiler(cb) {
	src(paths.sass)
		.pipe(sourcemaps.init())
		.pipe(sass().on('error', sass.logError))
		.pipe(postcss([autoprefixer()]))
		.pipe(cssnano())
		.pipe(rename({ suffix: '.min' }))
		.pipe(sourcemaps.write())
		.pipe(dest(paths.sassDest));
	cb();
}

function javaScript(cb) {
	src(paths.js)
		.pipe(sourcemaps.init())
		.pipe(babel({ presets: ['@babel/env'] }))
		.pipe(uglify())
		.pipe(rename({ suffix: '.min' }))
		.pipe(sourcemaps.write())
		.pipe(dest(paths.jsDest));
	cb();
}

function convertImg(cb) {
	src(paths.images).pipe(imagemin()).pipe(dest(paths.imagesDest));
	cb();
}

function cleanStuff(cb) {
	src(paths.dist, { read: false }).pipe(clean());
	cb();
}

function handleKits(cb) {
	src(paths.html).pipe(kit()).pipe(dest('./'));
	cb();
}

function startBrowserSync(cb) {
	browserSync.init({
		server: {
			baseDir: './',
		},
	});
	cb();
}

function watchForChanges(cb) {
	watch('./*.html').on('change', reload);
	watch([paths.html, paths.sass, paths.js], parallel(handleKits, sassCompiler, javaScript)).on('change', reload);
	watch(paths.images, convertImg).on('change', reload);
	cb();
}

const mainFunsctions = parallel(handleKits, sassCompiler, javaScript, convertImg);
exports.cleanStuff = cleanStuff;
exports.default = series(mainFunsctions, startBrowserSync, watchForChanges);
