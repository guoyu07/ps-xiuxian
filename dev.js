const asciidoctor = require("asciidoctor.js")();
const shell = require("shelljs");
const chalk = require("chalk");
const fs = require("fs-extra");
const { resolve, basename } = require("path");
const log = require("consola");
const Watchpack = require("watchpack");
const glob = require("fast-glob");
const pug = require("pug");

const SOURCE = {
    ADOC_PATH: resolve("./src/adoc"),
    HTML_PATH: resolve("./src/html"),
    ASSERT_PATH: resolve("./src/assert")
};

const OUTPUT = {
    ADOC_PATH: resolve("./docs"),
    HTML_PATH: resolve("./docs"),
    ASSERT_PATH: resolve("./docs/assert")
};

const removeDocs = () => {
    shell.rm("./docs/**/*.html");
    shell.rm("-rf", "./docs/css");
    shell.rm("-rf", "./docs/js");
};

const copyAssert = () => {
    fs.copySync(SOURCE.ASSERT_PATH, OUTPUT.ASSERT_PATH);
    log.success("COPY ASSERT FILE SUCCESS");
};

const compileAdocs = () => {
    const wp = new Watchpack({
        aggregateTimeout: 1000,
        poll: true
    });

    log.success("Watch " + SOURCE.ADOC_PATH);

    wp.watch([], [SOURCE.ADOC_PATH]);

    wp.on("change", function(filePath, mtime) {
        const content = fs.readFileSync(filePath);
        const html = asciidoctor.convert(content);
        const filename = basename(filePath, ".adoc");

        const style = `
            <link href="https://cdn.bootcss.com/font-awesome/4.7.0/css/font-awesome.css" rel="stylesheet">
            <link href="https://cdn.bootcss.com/asciidoctor.js/1.5.6-preview.5/css/asciidoctor.min.css" rel="stylesheet">
        `;

        const code = `
            <link href="https://cdn.bootcss.com/highlight.js/9.12.0/styles/rainbow.min.css" rel="stylesheet">
            <script src="https://cdn.bootcss.com/highlight.js/9.12.0/highlight.min.js"></script>
            <script>hljs.initHighlightingOnLoad();</script>
        `;

        fs.writeFileSync("./docs/" + filename + ".html", style + html + code);
        log.info("COMPILED " + filePath);
    });
};

const compilePug = () => {
    const wp = new Watchpack({
        aggregateTimeout: 1000,
        poll: true
    });
    log.success("Watch " + SOURCE.HTML_PATH);
    wp.watch([], [SOURCE.HTML_PATH]);
    const onChange = function(filePath, mtime) {
        if (filePath.indexOf("layout") != -1) {
            init();
            return;
        }
        const content = fs.readFileSync(filePath);
        try {
            const filename = basename(filePath, ".pug");
            const html = pug.render(content, {
                filename: filePath,
                basedir: "./src/html",
                pretty: true
            });
            fs.writeFileSync("./docs/" + filename + ".html", html);
            log.success(filename + ".pug");
        } catch (e) {
            log.error(e);
        }
    };

    const init = () => {
        log.info("=== 构建所有 ===");
        const allPugFile = glob.sync(SOURCE.HTML_PATH + "/**/*.pug");
        allPugFile.forEach(path => {
            // 避免循环，剔除 layout 模板
            if (path.indexOf("layout") != -1) return;
            onChange(path);
        });
    };

    init();
    wp.on("change", onChange);
};

copyAssert();
compilePug();