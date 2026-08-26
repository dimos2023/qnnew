var OverrideSetting = {};
OverrideSetting.getPlatform = function () {
    if (pc.platform.browser) {
        window.CONTEXT_OPTIONS = {
            'antialias': true,
            'alpha': false,
            'preserveDrawingBuffer': false,
            'preferWebGl2': true,
            'powerPreference': "high-performance"
        }
    }
}
OverrideSetting.getPlatform();