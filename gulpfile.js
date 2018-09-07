const gulp = require('gulp');
const imagemin = require('imagemin');
const concat = require('gulp-concat');
const imageminWebp = require('imagemin-webp');
const gimagemin = require('gulp-imagemin');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const minifyCSS = require('gulp-minify-css');
const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync').create();

const paths = {
    base: '/src',
    build: '/build',
    styles: {
        src: './src/style',
        dest: './build/css'
    },
    script: {
        src: './src/js',
        dest: './build/js'
    }
}

gulp.task('watch', ['min'], function() {
    browserSync.init({
        server: "."
    });
    gulp.watch("./src/style/*.scss", ['min']).on('change', browserSync.reload);
    gulp.watch("./index.html").on('change', browserSync.reload);
})

gulp.task('default', ['build']);

gulp.task('build', ['scripts', 'min']);

gulp.task('scripts', function() {
    return gulp.src(paths.script.src + '/*.js')
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.script.dest))
})

gulp.task("babel", function () {
    const $in = paths.script.src + '/*.js';
    const $out = paths.script.dest + '/*.js';
    console.log($in + $out)
    return gulp.src($in)
      .pipe(sourcemaps.init())
      .pipe(babel({
          minified: true,
          comments: false,
          presets: ["latest"]
      }))
    //   .pipe(concat("all.js"))
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest($out));
      
  })

gulp.task('images', function() {
    imagemin(['img/*.{jpg,png}'], 'build/images', {
        use: [
            imageminWebp({quality: 50})
        ]
    }).then(() => {
        console.log('Images optimized');
    });
    
})

gulp.task('imagemin', function(){
    return gulp.src('img/*.+(png|jpg|gif|svg)')
    .pipe(gimagemin(
        {
            optimizationLevel: 5,
            progressive: true,
        }
    ))
    .pipe(gulp.dest('build/images'))
  });
  gulp.task('min', function() {
    gulp.src(paths.styles.src + '/*.scss')
      .pipe(sass({outputStyle: 'compressed'}))
      .pipe(minifyCSS())
      .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9'))
      .pipe(concat('style.min.css'))
      .pipe(gulp.dest('build/css'))  
  })

