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
gulp.task('babel', () => {

    return gulp.src('./src/js/*.js')
      .pipe(sourcemaps.init())
      .pipe(babel({
          presets: ["env"]
      }))
    //   .pipe(concat("combined-index.js"))
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest('./build/js'));
})

gulp.task('watch', ['min'], function() {
    browserSync.init({
        server: ".",
    });
    gulp.watch("./src/style/*.scss", ['min']).on('change', browserSync.reload);
    gulp.watch("./index.html").on('change', browserSync.reload);
    gulp.watch('./src/js/*.js', ['babel']).on('change', browserSync.reload);
    gulp.watch('sw.js').on('change', browserSync.reload)
})


gulp.task('images', function() {
    imagemin(['./src/img/*.{jpg,png}'], 'build/images', {
        use: [
            imageminWebp({quality: 50})
        ]
    }).then(() => {
        console.log('Images optimized');
    });
    
})

gulp.task('imagemin', function(){
    return gulp.src('.src/img/*.+(png|jpg|gif|svg)')
    .pipe(gimagemin(
        {
            optimizationLevel: 5,
            progressive: true,
        }
    ))
    .pipe(gulp.dest('./build/images'))
  });
  gulp.task('min', function() {
    gulp.src(paths.styles.src + '/*.scss')
      .pipe(sass({outputStyle: 'compressed'}))
      .pipe(minifyCSS())
      .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9'))
      .pipe(concat('style.min.css'))
      .pipe(gulp.dest('build/css'))  
  })

