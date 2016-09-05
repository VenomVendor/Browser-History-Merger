import console from 'better-console';

import childProcess from 'child_process';

import del from 'del';

import gulp from 'gulp';

import gulpLoadPlugins from 'gulp-load-plugins';

const srcFiles = {
    client: ['src/**/*.js', '!src/**/vendor/*.js'],
    clientVendor: ['src/**/vendor/*.js'],
    html: ['src/**/*.html'],
    sql: ['src/**/*.sql']
};

const destFiles = {
    dir: 'build/'
};

const DEBUG = true;
const OBFUSCATE = false;
const RENAME = false;
const $ = gulpLoadPlugins();

/**
 * delete files
 * @param destFdr path of the folder to be deleted.
 */
const deleteFilesDirs = (destFdr) => del(destFdr);

/**
 * eslint source files & fail on error
 * @param files
 * @returns {*}
 */
const linter = (files) => gulp.src(files)
    .pipe($.eslint())
    .pipe($.eslint.format());

/**
 * Files to be copied.
 * Reference is from root directory of gulpfile.js
 * @param files destination path of the files to be copied.
 */
const copier = (files) => gulp.src(files, { base: 'src' })
    .pipe($.plumber())
    .pipe(gulp.dest(destFiles.dir));

/**
 * es-lint gulpfile.js
 */
gulp.task('js-self-lint', () => linter(['*.js']));

/**
 * Clean build dir.
 */
gulp.task('clean', () => deleteFilesDirs(destFiles.dir));

/**
 * eslint all client/browser files.
 */
gulp.task('eslintClient', () => linter(srcFiles.client));

/**
 * eslint all js.
 */
gulp.task('eslint', gulp.series('eslintClient'));

/**
 * babelify, minify & uglify js.
 */
gulp.task('minify-js', () => gulp.src(srcFiles.client)
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.babel())
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest(destFiles.dir))
    .pipe(RENAME ? $.rename({ suffix: '.min' }) : $.util.noop())
    .pipe(gulp.dest(destFiles.dir))
    .pipe(DEBUG ? $.util.noop() : $.uglify())
    .pipe(!DEBUG && OBFUSCATE ? $.jsObfuscator() : $.util.noop())
    .pipe(gulp.dest(destFiles.dir)));

/**
 * clears console in bash.
 */
gulp.task('clearConsole', (done) => {
    console.clear();
    done();
});

/**
 * copy 3rd party js to build dir.
 */
gulp.task('vendor-js', () => copier(srcFiles.clientVendor));

/**
 * copy sql queries to build dir.
 */
gulp.task('sql', () => copier(srcFiles.sql));

/**
 * copy sql queries to build dir.
 */
gulp.task('html', () => copier(srcFiles.html));

/**
 * watches all required tasks.
 */
gulp.task('watch', (done) => {
    gulp.watch(srcFiles.client, gulp.parallel('clearConsole', gulp.series('eslintClient', 'minify-js')));
    gulp.watch(srcFiles.clientVendor, gulp.parallel('vendor-js'));
    gulp.watch([srcFiles.html], gulp.parallel('html'));
    gulp.watch(['*.js'], gulp.parallel('js-self-lint'));
    done();
});

/**
 * Start app.
 */
gulp.task('start', (done) => {
    childProcess.exec('electron loader.js', (err, stdout, stderr) => {
        if (err) {
            console.log(stdout);
            console.log(stderr);
            throw new Error(err);
        }
        done();
    });
});

/**
 * Travis
 */
gulp.task('travis',
    gulp.series(
        'clean',
        gulp.parallel(
            'vendor-js',
            'sql',
            'html',
            'js-self-lint',
            gulp.series('eslint', 'minify-js')
        )
    ));

/**
 * Initial/default task.
 */
gulp.task('default',
    gulp.series(
        'clean',
        gulp.parallel(
            'vendor-js',
            'sql',
            'html',
            'js-self-lint',
            gulp.series('eslint', 'minify-js')
        ),
        'watch',
        'start'
    ));

export default gulp;
