// (c) http://www.jonathantneal.com/blog/understand-the-favicon/
navigator.appName == "Microsoft Internet Explorer" && (function (i, d, s, l) {
    i.src = "/clash-of-clans/i/favicon-v2.ico";
    s = d.getElementsByTagName("script")[0];
    l = s.parentNode.insertBefore(d.createElement("link"), s);
    l.rel = "shortcut icon";
    l.href = i.src;
})(new Image, document);