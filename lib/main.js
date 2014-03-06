var pageMod = require("sdk/page-mod");

pageMod.PageMod({
    include: ['*.burlsource.us'],
    contentScriptFile: require("sdk/self").data.url("convert.js")
});