"use strict";

if (!window.Chinese) {
    window.Chinese = {};
}

Chinese._escapeReChars = function (txt) {
    return txt.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g, "\\$&");
};

Chinese._compileDict = function (d, flags) {
    var keys = [];
    if (d.constructor === Array)
        keys = d.slice();
    else if (d.constructor === Object)
        keys = Object.keys(d);
    keys.sort(this.sortByLen);
    var sb = [];
    for (var i = 0; i < keys.length; i++) {
        sb.push(this._escapeReChars(keys[i]));
    }
    var pstr = sb.join("|");
    return new RegExp(pstr, (flags ? flags : 'g'));
};

Chinese.init = function () {
    this.patterns = {};
    this.patterns.s2t_pattern = this._compileDict(this.zh2Hant);
    this.patterns.s2tt_pattern = this._compileDict(this.zh2THant);
    this.patterns.t2s_pattern = this._compileDict(this.zh2Hans);
    this.patterns.s2t_hk_pattern = this._compileDict(this.zh2HK);
    this.patterns.s2t_tw_pattern = this._compileDict(this.zh2TW);
};

Chinese.keyValueReplacePreserved = function (txt, dict, p) {
    var start = 0;
    var searching_str = '';
    while (start < txt.length) {
        searching_str = txt.substr(start, 1);
        while (dict[searching_str] && start + searching_str.length < txt.length) {
            searching_str = txt.substr(start, searching_str.length + 1);
        }
        if (!(searching_str in dict))
            searching_str = txt.substr(start, searching_str.length - 1);
        if (searching_str.length) {
            txt = txt.substr(0, start) + dict[searching_str] + txt.substr(start + searching_str.length, txt.length - start - searching_str.length);
        }
        start += (searching_str.length ? searching_str.length : 1);
    }
    return txt;
};

Chinese.keyValueReplace = function (txt, dict, pattern_name) {
    var reg;
    if (pattern_name in this.patterns) {
        reg = this.patterns[pattern_name];
    } else {
        reg = this._compileDict(dict);
        if (pattern_name)
            this.patterns[pattern_name] = reg;
    }
    txt = txt.replace(reg, function (full_match) {
        return dict[full_match];
    });
    return txt;
};
Chinese.s2t = function (txt) {
    // char by char transfer
    var _txt = '';
    for (var i = 0; i < txt.length; i++)
        _txt += (this.zh2Chart[txt[i]] ? this.zh2Chart[txt[i]] : txt[i]);
    // word revision
    return Chinese.keyValueReplace(_txt, Chinese.zh2THant, 's2tt_pattern');
};
Chinese.s2t_hk = function (txt) {
    return Chinese.keyValueReplace(Chinese.s2t(txt), Chinese.zh2HK, 's2t_hk_pattern');
};
Chinese.s2t_tw = function (txt) {
    return Chinese.keyValueReplace(Chinese.s2t(txt), Chinese.zh2TW, 's2t_tw_pattern');
};
Chinese.t2s = function (txt) {
    return Chinese.keyValueReplace(txt, Chinese.zh2Hans, 't2s_pattern');
};
Chinese.t2s_cn = function (txt) {
    return Chinese.keyValueReplace(Chinese.keyValueReplace(txt, Chinese.zh2Hans, 't2s_pattern'), Chinese.zh2CN, 'cn_pattern');
};
Chinese.indexOf = function (txt, substring, case_sensitive) {
    if (case_sensitive)
        return this.t2s(txt).indexOf(this.t2s(substring));
    return this.t2s(txt).toLowerCase().indexOf(this.t2s(substring).toLowerCase());
};
Chinese.highlightKeywords = function (txt, keywords, chinese_simp_ind, case_sensitive) {
    var c = this.getColors(keywords.length);
    var _txt = '';
    if (chinese_simp_ind === 't') {
        keywords = this.uniqueKeywords(keywords, 't');
        _txt = this.s2t(txt);
    } else {
        keywords = this.uniqueKeywords(keywords);
        _txt = this.t2s(txt);
    }
    if (chinese_simp_ind !== 's' && chinese_simp_ind !== 't') {
        keywords = keywords.sort(this.sortByLen);
    }
    return this.highlightSolve(_txt, txt, keywords, c, chinese_simp_ind, case_sensitive);
};
Chinese.highlightSolve = function (_txt, txt, keywords, c, chinese_simp_ind, case_sensitive) {
    if (chinese_simp_ind !== 's' && chinese_simp_ind !== 't') {
        var _keywords = keywords.slice();
        for (var i = 0; i < keywords.length; i++) {
            _keywords.shift();
            var kw = keywords[i];
            var ind = 0;
            if (case_sensitive) {
                ind = _txt.indexOf(kw);
            } else {
                ind = _txt.toLowerCase().indexOf(kw.toLowerCase());
            }
            if (ind != -1) {
                var former = txt.substring(0, ind);
                var _former = _txt.substring(0, ind);
                var mid = txt.substring(ind, ind + kw.length);
                var _mid = _txt.substring(ind, ind + kw.length);
                var latter = txt.substring(ind + kw.length, txt.length);
                var _latter = _txt.substring(ind + kw.length, txt.length);
                var former_str_highlighted = this.highlightSolve(_former, former, _keywords, c, chinese_simp_ind, case_sensitive);
                var middle_str_highlighted = this.highlightSolve(_mid, mid, _keywords, c, chinese_simp_ind, case_sensitive);
                var latter_str_highlighted = this.highlightSolve(_latter, latter, keywords, c, chinese_simp_ind, case_sensitive);
                return former_str_highlighted + '<span class=\'' + c[_keywords.length] + '\'>' + middle_str_highlighted + '</span>' + latter_str_highlighted;
            }
        }
        return txt;
    } else {
        var pattern;
        if (!case_sensitive)
            pattern = this._compileDict(keywords, 'gi');
        else
            pattern = this._compileDict(keywords);
        var c_ind = 0;
        _txt = _txt.replace(pattern, function (match) {
            return '<span class=\'' + c[c_ind++] + '\'>' + match + '</span>';
        });
        return _txt;
    }
};
Chinese.sortByLen = function (a, b) {
    return b.length - a.length;
};
Chinese.getColors = function (n) {
    if (!document.getElementById('color_set')) {
        var style = document.createElement('style');
        style.type = 'text/css';
        style.id = 'color_set';
        var c = [0, 80, 45];
        var rgb = [];
        for (var i = 0; i < 50; i++) {
            rgb = this.hslToRgb(c[0] / 360, c[1] / 100, c[2] / 100);
            style.innerHTML += '.hue_' + c[0] + '{ color: rgb(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + '); font-weight:bold; }';
            c[0] -= 20;
            if (c[0] > 360) {
                c[0] -= 360;
            }
        }
        document.getElementsByTagName('head')[0].appendChild(style);
    }
    var c = [0, 80, 45];
    var c_set = [];
    while (c_set.length < n) {
        c_set.push('hue_' + c[0]);
        c[0] -= 20;
        if (c[0] > 360) {
            c[0] -= 360;
        }
    }
    return c_set;
};
Chinese.uniqueKeywords = function (arr, chinese_simp_ind) {
    if (chinese_simp_ind === 't') {
        for (var i = 0; i < arr.length; i++) {
            arr[i] = this.s2t(arr[i]);
        }
    } else {
        for (var i = 0; i < arr.length; i++) {
            arr[i] = this.t2s(arr[i]);
        }
    }
    var obj = {},
        i = 0,
        len = 0;
    if (Array.isArray(arr) && arr.length > 0) {
        len = arr.length;
        for (i = 0; i < len; i += 1) {
            obj[arr[i]] = arr[i];
        }
        return Object.keys(obj);
    }
    return [];
};
Chinese.hslToRgb = function (h, s, l) {
    var r, g, b;
    if (s == 0) {
        r = g = b = l; // achromatic
    } else {
        var hue2rgb = function hue2rgb(p, q, t) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
};