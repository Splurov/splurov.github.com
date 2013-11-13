window.platformIos = !!navigator.userAgent.match(/(?:iPad|iPhone|iPod)/i);
if (window.platformIos) {
    document.documentElement.classList.add('ios');
} else {
    document.documentElement.classList.add('not-ios');
}
