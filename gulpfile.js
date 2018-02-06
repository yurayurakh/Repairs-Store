// Определяем зависимости в переменных
var gulp = require('gulp'),
	gulpSequence = require('gulp-sequence'),
	debug = require('gulp-debug'),
	gutil = require('gulp-util'),
	rimraf = require('rimraf'), //для clean
	watch = require('gulp-watch'),
	plumber = require('gulp-plumber'), //(Предохраняем Gulp от вылета)
	include = require('gulp-include'), //include
	htmlmin = require('gulp-htmlmin'),
	sass = require('gulp-sass'),
	autoprefixer = require('gulp-autoprefixer'),
	cleanCss = require('gulp-clean-css'), //minifier
	sourceMaps = require('gulp-sourcemaps'),
	uglifyJs = require('gulp-uglify'),
	imagemin = require('gulp-imagemin'),
	imageminJpegRecompress = require('imagemin-jpeg-recompress'),
	imageminPngquant = require('imagemin-pngquant'),
	spritesmith = require("gulp.spritesmith"), //объединение картинок в спрайты
	browserSync = require('browser-sync'),
	reload = browserSync.reload,
	ngrok = require('ngrok');


// Создаём js объект в котором прописываем все нужные нам пути
var path = {
	dev: { //Тут мы укажем куда складывать готовые после сборки файлы
		html: 'dev/',
		js: 'dev/js/',
		css: 'dev/css/',
		img: 'dev/img/',
		fonts: 'dev/fonts/',
		php: 'dev/',
		favicon: 'dev/',
		video: 'dev/video/'
	},
	prod: { //Тут мы укажем куда складывать готовые после сборки файлы
		html: 'prod/',
		js: 'prod/js/',
		css: 'prod/css/',
		img: 'prod/img/',
		fonts: 'prod/fonts/',
		php: 'prod/',
		favicon: 'prod/',
		video: 'prod/video/'
	},
	src: { //Пути откуда брать исходники
		html: 'src/*.html', //Синтаксис src/*.html говорит gulp что мы хотим взять все файлы с расширением .html
		js: 'src/js/main.js',//В стилях и скриптах нам понадобятся только main файлы
		//jsFiles: ['src/js/*.js', '!src/js/main.js'], //для форматирования (пока не используется)
		//jsFolder: 'src/js/', //для форматирования (пока не используется)
		styles: 'src/styles/main.scss',
		stylesPartialsFolder: 'src/styles/partials/', //для спрайта
		img: ['src/img/**/*.*', '!src/img/icons/*.*'], //Синтаксис img/**/*.* означает - взять все файлы всех расширений из папки и из вложенных каталогов
		imgFolder: 'src/img/', //для спрайта
		icons: 'src/img/icons/*.*',
		fonts: 'src/fonts/**/*.*',
		//fontsFolder: 'src/fonts/',
		php: 'src/**/*.php',
		favicon: 'src/favicon.{png,ico}',
		video: 'src/video/**/*'
	},
	watch: { //Тут мы укажем, за изменением каких файлов мы хотим наблюдать
		html: ['src/*.html', 'src/templates/*.html'], //нельзя указывать 'src/**/*.html', увеличивается время выполнения тасков в watch-e. хз почему.
		js: 'src/js/**/*.js',
		styles: 'src/styles/**/*.{css,scss}',
		img: ['src/img/**/*.*', '!src/img/icons/*.*'],
		icons: 'src/img/icons/*.*',
		fonts: 'src/fonts/**/*',
		php: 'src/*.php', // опять же нельзя указывать 'src/**/*.php'
		favicon: 'src/favicon.{png,ico}',
		video: 'src/video/**/*'
	},
	cleanDev: './dev',
	cleanProd: './prod'
};

// Создадим переменную с настройками нашего dev сервера:
var config = {
	server: {
		baseDir: "./dev"
	},
	//tunnel: true,
	host: 'localhost',
	port: 2626,
	logPrefix: "MSerj"
};

// Создадим переменную с настройками плагина plumber для захвата ошибок
var plumberOptions = {
	handleError: function (err) {
		console.log(err);
		this.emit('end');
	}
};

// Создадим переменную с настройками плагина autoprefixer
var autoprefixerOptions = {
	browsers: ['last 5 versions', "ie 9", 'android 4', 'opera 12.1'],
	cascade: false
};

/**************************Общие таски***************************/
// Таск для запуска browserSync сервера с настройками, которые мы определили в объекте config
gulp.task('browserSync', function () {
//	browserSync(config);
	browserSync(config, function (err, bs) {
		ngrok.connect({
			proto: 'http', // http|tcp|tls
			addr: bs.options.get('port'), // port or network address
		}, function (err, url) {
			gutil.log('[ngrok]', ' => ', gutil.colors.magenta.underline(url));
		});
	});
});

// Таск для создании спрайтов
gulp.task('sprite', function() {
	var spriteData =
		gulp.src(path.src.icons) // путь, откуда берем картинки для спрайта
			.pipe(debug({title: 'building sprite:', showFiles: true}))
			.pipe(spritesmith({
				imgName: '../img/sprite.png',
				cssName: '_sprite.scss',
				algorithm: 'binary-tree',
				padding: 5,
				cssVarMap: function(sprite) {
					sprite.name = 's-' + sprite.name //имя каждой иконки будет состоять из имени файла и конструкции 's-' в начале имени
				}
			}));
	spriteData.img.pipe(gulp.dest(path.src.imgFolder)); // путь, куда сохраняем картинку
	spriteData.css.pipe(gulp.dest(path.src.stylesPartialsFolder)); // путь, куда сохраняем стили
});

///////////////////////////////dev///////////////////////////////

// Таск для сборки html:
gulp.task('html:dev', function () {
	return gulp.src(path.src.html) //Выберем файлы по нужному пути
		.pipe(debug({title: 'building html:', showFiles: true}))
		.pipe(plumber(plumberOptions))
		.pipe(include()).on('error', console.log) //Прогоним через include-file
		.pipe(gulp.dest(path.dev.html)); //Выплюнем их в папку dev
});

// Таск для сборки js:
gulp.task('js:dev', function () {
	return gulp.src(path.src.js) //Найдем наш main.js файл
		.pipe(debug({title: 'building js:', showFiles: true}))
		.pipe(plumber(plumberOptions))
		.pipe(sourceMaps.init()) //Инициализируем sourcemap
		.pipe(include()).on('error', console.log) //Прогоним через include-file
		.pipe(sourceMaps.write('../sourceMaps')) //Пропишем карты
		.pipe(gulp.dest(path.dev.js)); //Выплюнем готовый файл в dev
});

// Таск для сборки css:
gulp.task('styles:dev', function () {
	return gulp.src(path.src.styles) //Выберем наш main.scss
		.pipe(debug({title: 'building css:', showFiles: true}))
		.pipe(plumber(plumberOptions))
		.pipe(sourceMaps.init()) //Инициализируем sourcemap
		.pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError)) //Скомпилируем sass
		.pipe(sourceMaps.write('../sourceMaps')) //Пропишем карты
		.pipe(gulp.dest(path.dev.css)) //И в dev
		.pipe(reload({stream: true}));
});

// Таск для оптимизации изображений
gulp.task('img:dev', function () {
	return gulp.src(path.src.img) //Выберем наши картинки
		.pipe(debug({title: 'Copying img:', showFiles: true}))
		.pipe(plumber(plumberOptions))
		.pipe(gulp.dest(path.dev.img)); //И бросим в dev
});

// Таск для копирования шрифтов (ничего с ними не делая)
gulp.task('fonts:dev', function() {
	return gulp.src(path.src.fonts)
		.pipe(debug({title: 'Copying fonts:', showFiles: true}))
		.pipe(gulp.dest(path.dev.fonts))
});

// Таск для копирования скриптов (ничего с ними не делая)
gulp.task('php:dev', function() {
	return gulp.src(path.src.php)
		.pipe(debug({title: 'Copying php:', showFiles: true}))
		.pipe(gulp.dest(path.dev.php))
});

// Таск для копирования favicon-а (ничего с ними не делая)
gulp.task('favicon:dev', function() {
	return gulp.src(path.src.favicon)
		.pipe(debug({title: 'Copying favicon:', showFiles: true}))
		.pipe(gulp.dest(path.dev.favicon))
});

// Таск для копирования video (ничего с ними не делая)
gulp.task('video:dev', function() {
	return gulp.src(path.src.video)
		.pipe(debug({title: 'Copying video:', showFiles: true}))
		.pipe(gulp.dest(path.dev.video))
});

// Таск для очистки при неоходимости
gulp.task('cleanDev', function (cb, done) {
	rimraf(path.cleanDev, cb); // Очистка dev-а (просто удаляет всё из папок)
});

// Таск dev который запускает все таски для билда, html js css fonts img
gulp.task('dev', gulpSequence('cleanDev', 'sprite', [
	'html:dev',
	'js:dev',
	'styles:dev',
	'fonts:dev',
	'php:dev',
	'favicon:dev',
	'img:dev',
	'video:dev'
]));

// Таск для автоматического запуска нужной задачи при изменении какого то файла
gulp.task('watch', function(){
	watch(path.watch.html, function(event, cb) {
		gulpSequence('html:dev', reload); //Выполним таск и ПОСЛЕ его выполнения перезагрузим сервер
	});
	watch(path.watch.styles, function(event, cb) {
		gulp.start('styles:dev');
	});
	watch(path.watch.js, function(event, cb) {
		gulpSequence('js:dev', reload); //Выполним таск и ПОСЛЕ его выполнения перезагрузим сервер
	});
	watch(path.watch.fonts, function(event, cb) {
		gulpSequence('fonts:dev', reload); //Выполним таск и ПОСЛЕ его выполнения перезагрузим сервер
	});
	watch(path.watch.php, function(event, cb) {
		gulpSequence('php:dev', reload); //Выполним таск и ПОСЛЕ его выполнения перезагрузим сервер
	});
	watch(path.watch.favicon, function(event, cb) {
		gulpSequence('favicon:dev', reload); //Выполним таск и ПОСЛЕ его выполнения перезагрузим сервер
	});
	watch(path.watch.img, function(event, cb) {
		gulpSequence('img:dev', reload); //Выполним таск и ПОСЛЕ его выполнения перезагрузим сервер
	});
	watch(path.watch.video, function(event, cb) {
		gulpSequence('video:dev', reload); //Выполним таск и ПОСЛЕ его выполнения перезагрузим сервер
	});
	watch(path.watch.icons, function(event, cb) {
		gulpSequence('sprite', reload); //Выполним таск и ПОСЛЕ его выполнения перезагрузим сервер
	});
});

// Дефолтный таск, который будет запускать всю нашу сборку.
gulp.task('default', ['dev', 'browserSync', 'watch']);


///////////////////////////////prod///////////////////////////////////

// Таск для сборки html:
gulp.task('html:prod', function () {
	return gulp.src(path.src.html) //Выберем файлы по нужному пути
		.pipe(debug({title: 'building html:', showFiles: true}))
		.pipe(plumber(plumberOptions))
		.pipe(include()).on('error', console.log) //Прогоним через include-file
		.pipe(htmlmin({collapseWhitespace: true, conservativeCollapse: true, removeComments: true})) //Минифицируем html
		.pipe(gulp.dest(path.prod.html)); //Выплюнем их в папку prod
});

// Таск для сборки js:
gulp.task('js:prod', function () {
	return gulp.src(path.src.js) //Найдем наш main.js файл
		.pipe(debug({title: 'building js:', showFiles: true}))
		.pipe(plumber(plumberOptions))
		//.pipe(sourceMaps.init()) //Инициализируем sourcemap
		.pipe(include()).on('error', console.log) //Прогоним через include-file
		.pipe(uglifyJs()) //Сожмем наш js
		//.pipe(sourceMaps.write('../sourceMaps')) //Пропишем карты
		.pipe(gulp.dest(path.prod.js)); //Выплюнем готовый файл в prod
});

// Таск для сборки css:
gulp.task('styles:prod', function () {
	return gulp.src(path.src.styles) //Выберем наш main.css
		.pipe(debug({title: 'building css:', showFiles: true}))
		.pipe(plumber(plumberOptions))
		//.pipe(sourceMaps.init()) //Инициализируем sourcemap
		.pipe(sass().on('error', sass.logError)) //Скомпилируем sass
		.pipe(autoprefixer(autoprefixerOptions)) //Добавим вендорные префиксы
		.pipe(cleanCss({compatibility: 'ie9'})) //cleanCss
		//.pipe(sourceMaps.write('../sourceMaps'))
		.pipe(gulp.dest(path.prod.css)) //И в prod
		.pipe(reload({stream: true}));
});

// Таск для оптимизации изображений
gulp.task('img:prod', function () {
	return gulp.src(path.src.img) //Выберем наши картинки
		.pipe(debug({title: 'building img:', showFiles: true}))
		.pipe(plumber(plumberOptions))
		.pipe(gulp.dest(path.prod.img)) //Копируем изображения заранее, imagemin может пропустить парочку )
		.pipe(imagemin([
			imagemin.gifsicle({interlaced: true}),
			imageminJpegRecompress({
				progressive: true,
				max: 80,
				min: 70
			}),
			imagemin.svgo({
		        plugins: [
		            {
		            	removeViewBox: false,
		            	cleanupAttrs: true,
		            	removeComments: true,
		            	removeTitle: true,
		            	removeDesc: true,
		            	removeEmptyAttrs: true,
		            	minifyStyles: true,
		            	convertColors: true
		            }
		        ]
		    }),	
			imageminPngquant({quality: '80'}),
		]))
		.pipe(gulp.dest(path.prod.img)); //И бросим в prod отпимизированные изображения
});

// Таск для копирования шрифтов (ничего с ними не делая)
gulp.task('fonts:prod', function() {
	return gulp.src(path.src.fonts)
		.pipe(debug({title: 'Copying fonts:', showFiles: true}))
		.pipe(gulp.dest(path.prod.fonts))
});

// Таск для копирования скриптов (ничего с ними не делая)
gulp.task('php:prod', function() {
	return gulp.src(path.src.php)
		.pipe(debug({title: 'Copying php:', showFiles: true}))
		.pipe(gulp.dest(path.prod.php))
});

// Таск для копирования favicon-а (ничего с ними не делая)
gulp.task('favicon:prod', function() {
	return gulp.src(path.src.favicon)
		.pipe(debug({title: 'Copying favicon:', showFiles: true}))
		.pipe(gulp.dest(path.prod.favicon))
});

// Таск для копирования favicon-а (ничего с ними не делая)
gulp.task('video:prod', function() {
	return gulp.src(path.src.video)
		.pipe(debug({title: 'Copying video:', showFiles: true}))
		.pipe(gulp.dest(path.prod.video))
});

// Таск для очистки при неоходимости
gulp.task('cleanProd', function (cb, done) {
	rimraf(path.cleanProd, cb); // Очистка prod-a (просто удаляет всё из папок)
});

// Таск, который будет запускать всю нашу сборку.
gulp.task('prod', gulpSequence('cleanProd', 'sprite', [
	'html:prod',
	'js:prod',
	'styles:prod',
	'fonts:prod',
	'php:prod',
	'favicon:prod',
	'img:prod',
	'video:prod'
]));