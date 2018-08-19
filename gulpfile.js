const gulp = require('gulp');
const imagemin = require('imagemin');
const concat = require('gulp-concat');
const imageminWebp = require('imagemin-webp');
const gimagemin = require('gulp-imagemin');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const minifyCSS = require('gulp-minify-css');
const browserify = require('gulp-browserify');


gulp.task('images', function() {
    imagemin(['src/img/*.{jpg,png}'], 'build/images', {
        use: [
            imageminWebp({quality: 50})
        ]
    }).then(() => {
        console.log('Images optimized');
    });
    
})

gulp.task('imagemin', function(){
    return gulp.src('src/img/*.+(png|jpg|gif|svg)')
    .pipe(gimagemin(
        {
            optimizationLevel: 5,
            progressive: true,
        }
    ))
    .pipe(gulp.dest('build/images'))
  });


gulp.task('min', function() {
  gulp.src('src/style/*.scss')
    .pipe(sass({outputStyle: 'compressed'}))
    .pipe(minifyCSS())
    .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9'))
    .pipe(concat('style.min.css'))
    .pipe(gulp.dest('build/css'))  
})

gulp.task('scripts', function() {
    gulp.src('src/js/*.js')
        .pipe(browserify({
            insertGlobals: true,
            debug : !gulp.eventNames.production
        }))
        .pipe(gulp.dest('/build/js'))
})

