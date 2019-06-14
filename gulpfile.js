var bump = require('gulp-bump');
var gulp = require('gulp');
var fs = require('fs');
var ts = require('gulp-typescript')
var gutil = require('gulp-util');
var runSequence = require('run-sequence');
var zip = require('gulp-zip');


var configLoc = './src/config/config.json'

function buildSequence(lifecycle) {
    switch (lifecycle) {
        case 'qa':
            runSequence('typescript', 'zip', 'bump-patch');
            break;
        case 'q2':
            runSequence('typescript', 'zip', 'bump-patch');
            break;
        case 'pr':
            runSequence('typescript', 'zip', 'bump-patch');
            break;
        default:
            break;
    }
}

function getConfigProperies() {
    let NODE_ENV = gutil.env.NODE_ENV;
    if (!NODE_ENV) gutil.env.NODE_ENV = NODE_ENV = "local";
    var configJson = JSON.parse(fs.readFileSync(configLoc, 'utf8'));
    var appConfig = configJson[NODE_ENV];

    return appConfig;
}

gulp.task('typescript', () => {
    return gulp.src('src/**/*.ts')
        .pipe(ts({
            module: "commonjs",
            noImplicitAny: true,
            target: "es6",
            removeComments: true,
            preserveConstEnums: true,
            outDir: "dist/",
            sourceMap: true,
            types : [ "node", "core-js" ],
            lib : [ "es2016", "dom"],
            experimentalDecorators: true,
            isolatedModules: true
        }))
        .pipe(gulp.dest('dist'));
});

gulp.task('watch', ['typescript'], () => {
    gulp.watch('src/**/*.ts', ['typescript']);
});

/* Bumps bower.json and package.json versions to current version */
gulp.task('bump-patch', function() {
    gulp.src(['./package.json', './bower.json'])
        .pipe(bump({ type: 'patch' }))
        .pipe(gulp.dest('./'));
});

gulp.task('build-qa', () => {
    gutil.env.NODE_ENV = 'QA';
    gutil.log(gutil.colors.bold.white.bgBlue(`BUILDING FOR: ${gutil.env.NODE_ENV}`));
    buildSequence('qa');
});

gulp.task('build-q2', () => {
    gutil.env.NODE_ENV = 'Q2';
    gutil.log(gutil.colors.bold.white.bgBlue(`BUILDING FOR: ${gutil.env.NODE_ENV}`));
    buildSequence('q2');
});

gulp.task('build-prod', () => {
    gutil.env.NODE_ENV = 'PR';
    gutil.log(gutil.colors.bold.white.bgBlue(`BUILDING FOR: ${gutil.env.NODE_ENV}`));
    buildSequence('pr');
});

gulp.task('zip', () => {
    let appProperties = getConfigProperies();

    // Compress files
    gulp.src(['./dist/**', './src/config/**', 'package.json', 'manifest.yml'], { base: '.' })
        .pipe(zip(`${appProperties.projectInfo.appName}.zip`))
        .pipe(gulp.dest('./'));
});