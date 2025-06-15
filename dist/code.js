var app = (function (d) {
  "use strict";
  const x = () => {
      try {
        const { sendAs: r = [] } = Gmail.Users.Settings.SendAs.list("me");
        if (r.length) return r.map((e) => e.sendAsEmail);
      } catch (r) {
        Logger.log(r.message);
      }
      return [Session.getActiveUser().getEmail()];
    },
    h = "%[a-f0-9]{2}",
    F = new RegExp("(" + h + ")|([^%]+?)", "gi"),
    S = new RegExp("(" + h + ")+", "gi");
  function u(r, e) {
    try {
      return [decodeURIComponent(r.join(""))];
    } catch {}
    if (r.length === 1) return r;
    e = e || 1;
    const t = r.slice(0, e),
      n = r.slice(e);
    return Array.prototype.concat.call([], u(t), u(n));
  }
  function U(r) {
    try {
      return decodeURIComponent(r);
    } catch {
      let e = r.match(F) || [];
      for (let t = 1; t < e.length; t++)
        (r = u(e, t).join("")), (e = r.match(F) || []);
      return r;
    }
  }
  function $(r) {
    const e = { "%FE%FF": "��", "%FF%FE": "��" };
    let t = S.exec(r);
    for (; t; ) {
      try {
        e[t[0]] = decodeURIComponent(t[0]);
      } catch {
        const a = U(t[0]);
        a !== t[0] && (e[t[0]] = a);
      }
      t = S.exec(r);
    }
    e["%C2"] = "�";
    const n = Object.keys(e);
    for (const a of n) r = r.replace(new RegExp(a, "g"), e[a]);
    return r;
  }
  function I(r) {
    if (typeof r != "string")
      throw new TypeError(
        "Expected `encodedURI` to be of type `string`, got `" + typeof r + "`",
      );
    try {
      return decodeURIComponent(r);
    } catch {
      return $(r);
    }
  }
  function L(r, e) {
    const t = {};
    if (Array.isArray(e))
      for (const n of e) {
        const a = Object.getOwnPropertyDescriptor(r, n);
        a != null && a.enumerable && Object.defineProperty(t, n, a);
      }
    else
      for (const n of Reflect.ownKeys(r)) {
        const a = Object.getOwnPropertyDescriptor(r, n);
        if (a.enumerable) {
          const s = r[n];
          e(n, s, r) && Object.defineProperty(t, n, a);
        }
      }
    return t;
  }
  function b(r, e) {
    if (!(typeof r == "string" && typeof e == "string"))
      throw new TypeError("Expected the arguments to be of type `string`");
    if (r === "" || e === "") return [];
    const t = r.indexOf(e);
    return t === -1 ? [] : [r.slice(0, t), r.slice(t + e.length)];
  }
  const R = (r) => r == null,
    D = (r) =>
      encodeURIComponent(r).replaceAll(
        /[!'()*]/g,
        (e) => `%${e.charCodeAt(0).toString(16).toUpperCase()}`,
      ),
    m = Symbol("encodeFragmentIdentifier");
  function T(r) {
    switch (r.arrayFormat) {
      case "index":
        return (e) => (t, n) => {
          const a = t.length;
          return n === void 0 ||
            (r.skipNull && n === null) ||
            (r.skipEmptyString && n === "")
            ? t
            : n === null
              ? [...t, [f(e, r), "[", a, "]"].join("")]
              : [...t, [f(e, r), "[", f(a, r), "]=", f(n, r)].join("")];
        };
      case "bracket":
        return (e) => (t, n) =>
          n === void 0 ||
          (r.skipNull && n === null) ||
          (r.skipEmptyString && n === "")
            ? t
            : n === null
              ? [...t, [f(e, r), "[]"].join("")]
              : [...t, [f(e, r), "[]=", f(n, r)].join("")];
      case "colon-list-separator":
        return (e) => (t, n) =>
          n === void 0 ||
          (r.skipNull && n === null) ||
          (r.skipEmptyString && n === "")
            ? t
            : n === null
              ? [...t, [f(e, r), ":list="].join("")]
              : [...t, [f(e, r), ":list=", f(n, r)].join("")];
      case "comma":
      case "separator":
      case "bracket-separator": {
        const e = r.arrayFormat === "bracket-separator" ? "[]=" : "=";
        return (t) => (n, a) =>
          a === void 0 ||
          (r.skipNull && a === null) ||
          (r.skipEmptyString && a === "")
            ? n
            : ((a = a === null ? "" : a),
              n.length === 0
                ? [[f(t, r), e, f(a, r)].join("")]
                : [[n, f(a, r)].join(r.arrayFormatSeparator)]);
      }
      default:
        return (e) => (t, n) =>
          n === void 0 ||
          (r.skipNull && n === null) ||
          (r.skipEmptyString && n === "")
            ? t
            : n === null
              ? [...t, f(e, r)]
              : [...t, [f(e, r), "=", f(n, r)].join("")];
    }
  }
  function M(r) {
    let e;
    switch (r.arrayFormat) {
      case "index":
        return (t, n, a) => {
          if (((e = /\[(\d*)]$/.exec(t)), (t = t.replace(/\[\d*]$/, "")), !e)) {
            a[t] = n;
            return;
          }
          a[t] === void 0 && (a[t] = {}), (a[t][e[1]] = n);
        };
      case "bracket":
        return (t, n, a) => {
          if (((e = /(\[])$/.exec(t)), (t = t.replace(/\[]$/, "")), !e)) {
            a[t] = n;
            return;
          }
          if (a[t] === void 0) {
            a[t] = [n];
            return;
          }
          a[t] = [...a[t], n];
        };
      case "colon-list-separator":
        return (t, n, a) => {
          if (((e = /(:list)$/.exec(t)), (t = t.replace(/:list$/, "")), !e)) {
            a[t] = n;
            return;
          }
          if (a[t] === void 0) {
            a[t] = [n];
            return;
          }
          a[t] = [...a[t], n];
        };
      case "comma":
      case "separator":
        return (t, n, a) => {
          const s = typeof n == "string" && n.includes(r.arrayFormatSeparator),
            i =
              typeof n == "string" &&
              !s &&
              o(n, r).includes(r.arrayFormatSeparator);
          n = i ? o(n, r) : n;
          const c =
            s || i
              ? n.split(r.arrayFormatSeparator).map((y) => o(y, r))
              : n === null
                ? n
                : o(n, r);
          a[t] = c;
        };
      case "bracket-separator":
        return (t, n, a) => {
          const s = /(\[])$/.test(t);
          if (((t = t.replace(/\[]$/, "")), !s)) {
            a[t] = n && o(n, r);
            return;
          }
          const i = n === null ? [] : o(n, r).split(r.arrayFormatSeparator);
          if (a[t] === void 0) {
            a[t] = i;
            return;
          }
          a[t] = [...a[t], ...i];
        };
      default:
        return (t, n, a) => {
          if (a[t] === void 0) {
            a[t] = n;
            return;
          }
          a[t] = [...[a[t]].flat(), n];
        };
    }
  }
  function p(r) {
    if (typeof r != "string" || r.length !== 1)
      throw new TypeError(
        "arrayFormatSeparator must be single character string",
      );
  }
  function f(r, e) {
    return e.encode ? (e.strict ? D(r) : encodeURIComponent(r)) : r;
  }
  function o(r, e) {
    return e.decode ? I(r) : r;
  }
  function A(r) {
    return Array.isArray(r)
      ? r.sort()
      : typeof r == "object"
        ? A(Object.keys(r))
            .sort((e, t) => Number(e) - Number(t))
            .map((e) => r[e])
        : r;
  }
  function O(r) {
    const e = r.indexOf("#");
    return e !== -1 && (r = r.slice(0, e)), r;
  }
  function P(r) {
    let e = "";
    const t = r.indexOf("#");
    return t !== -1 && (e = r.slice(t)), e;
  }
  function N(r, e, t) {
    return t === "string" && typeof r == "string"
      ? r
      : typeof t == "function" && typeof r == "string"
        ? t(r)
        : t === "boolean" &&
            r !== null &&
            (r.toLowerCase() === "true" || r.toLowerCase() === "false")
          ? r.toLowerCase() === "true"
          : t === "boolean" &&
              r !== null &&
              (r.toLowerCase() === "1" || r.toLowerCase() === "0")
            ? r.toLowerCase() === "1"
            : t === "string[]" &&
                e.arrayFormat !== "none" &&
                typeof r == "string"
              ? [r]
              : t === "number[]" &&
                  e.arrayFormat !== "none" &&
                  !Number.isNaN(Number(r)) &&
                  typeof r == "string" &&
                  r.trim() !== ""
                ? [Number(r)]
                : t === "number" &&
                    !Number.isNaN(Number(r)) &&
                    typeof r == "string" &&
                    r.trim() !== ""
                  ? Number(r)
                  : e.parseBooleans &&
                      r !== null &&
                      (r.toLowerCase() === "true" ||
                        r.toLowerCase() === "false")
                    ? r.toLowerCase() === "true"
                    : e.parseNumbers &&
                        !Number.isNaN(Number(r)) &&
                        typeof r == "string" &&
                        r.trim() !== ""
                      ? Number(r)
                      : r;
  }
  function l(r) {
    r = O(r);
    const e = r.indexOf("?");
    return e === -1 ? "" : r.slice(e + 1);
  }
  function g(r, e) {
    (e = {
      decode: !0,
      sort: !0,
      arrayFormat: "none",
      arrayFormatSeparator: ",",
      parseNumbers: !1,
      parseBooleans: !1,
      types: Object.create(null),
      ...e,
    }),
      p(e.arrayFormatSeparator);
    const t = M(e),
      n = Object.create(null);
    if (typeof r != "string" || ((r = r.trim().replace(/^[?#&]/, "")), !r))
      return n;
    for (const a of r.split("&")) {
      if (a === "") continue;
      const s = e.decode ? a.replaceAll("+", " ") : a;
      let [i, c] = b(s, "=");
      i === void 0 && (i = s),
        (c =
          c === void 0
            ? null
            : ["comma", "separator", "bracket-separator"].includes(
                  e.arrayFormat,
                )
              ? c
              : o(c, e)),
        t(o(i, e), c, n);
    }
    for (const [a, s] of Object.entries(n))
      if (typeof s == "object" && s !== null && e.types[a] !== "string")
        for (const [i, c] of Object.entries(s)) {
          const y = e.types[a] ? e.types[a].replace("[]", "") : void 0;
          s[i] = N(c, e, y);
        }
      else
        typeof s == "object" && s !== null && e.types[a] === "string"
          ? (n[a] = Object.values(s).join(e.arrayFormatSeparator))
          : (n[a] = N(s, e, e.types[a]));
    return e.sort === !1
      ? n
      : (e.sort === !0
          ? Object.keys(n).sort()
          : Object.keys(n).sort(e.sort)
        ).reduce((a, s) => {
          const i = n[s];
          return (
            (a[s] = i && typeof i == "object" && !Array.isArray(i) ? A(i) : i),
            a
          );
        }, Object.create(null));
  }
  function w(r, e) {
    if (!r) return "";
    (e = {
      encode: !0,
      strict: !0,
      arrayFormat: "none",
      arrayFormatSeparator: ",",
      ...e,
    }),
      p(e.arrayFormatSeparator);
    const t = (i) =>
        (e.skipNull && R(r[i])) || (e.skipEmptyString && r[i] === ""),
      n = T(e),
      a = {};
    for (const [i, c] of Object.entries(r)) t(i) || (a[i] = c);
    const s = Object.keys(a);
    return (
      e.sort !== !1 && s.sort(e.sort),
      s
        .map((i) => {
          const c = r[i];
          return c === void 0
            ? ""
            : c === null
              ? f(i, e)
              : Array.isArray(c)
                ? c.length === 0 && e.arrayFormat === "bracket-separator"
                  ? f(i, e) + "[]"
                  : c.reduce(n(i), []).join("&")
                : f(i, e) + "=" + f(c, e);
        })
        .filter((i) => i.length > 0)
        .join("&")
    );
  }
  function j(r, e) {
    var a;
    e = { decode: !0, ...e };
    let [t, n] = b(r, "#");
    return (
      t === void 0 && (t = r),
      {
        url:
          ((a = t == null ? void 0 : t.split("?")) == null ? void 0 : a[0]) ??
          "",
        query: g(l(r), e),
        ...(e && e.parseFragmentIdentifier && n
          ? { fragmentIdentifier: o(n, e) }
          : {}),
      }
    );
  }
  function C(r, e) {
    e = { encode: !0, strict: !0, [m]: !0, ...e };
    const t = O(r.url).split("?")[0] || "",
      n = l(r.url),
      a = { ...g(n, { sort: !1 }), ...r.query };
    let s = w(a, e);
    s && (s = `?${s}`);
    let i = P(r.url);
    if (typeof r.fragmentIdentifier == "string") {
      const c = new URL(t);
      (c.hash = r.fragmentIdentifier),
        (i = e[m] ? c.hash : `#${r.fragmentIdentifier}`);
    }
    return `${t}${s}${i}`;
  }
  function E(r, e, t) {
    t = { parseFragmentIdentifier: !0, [m]: !1, ...t };
    const { url: n, query: a, fragmentIdentifier: s } = j(r, t);
    return C({ url: n, query: L(a, e), fragmentIdentifier: s }, t);
  }
  function G(r, e, t) {
    const n = Array.isArray(e) ? (a) => !e.includes(a) : (a, s) => !e(a, s);
    return E(r, n, t);
  }
  const H = Object.freeze(
      Object.defineProperty(
        {
          __proto__: null,
          exclude: G,
          extract: l,
          parse: g,
          parseUrl: j,
          pick: E,
          stringify: w,
          stringifyUrl: C,
        },
        Symbol.toStringTag,
        { value: "Module" },
      ),
    ),
    V = () => {
      const r = "https://example.com",
        e = {
          name: "amit",
          location: "india",
          interests: ["workspace", "apps script"],
        },
        t = H.stringify(e, { sort: !1, arrayFormat: "bracket" }),
        n = `${r}?${t}`;
      Logger.log(`URL: ${n}`);
    },
    q = () =>
      HtmlService.createHtmlOutputFromFile("index.html")
        .setTitle("Google Apps Script")
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT);
  function _(r) {
    const e = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    k();
    const t = JSON.parse(r.postData.contents);
    e.appendRow([new Date(), t.name || "", t.date || "", t.chintamani || ""]);
    var n = {
      ok: !0,
      message: "Thank You... Your Message has been recorded..",
    };
    return ContentService.createTextOutput(JSON.stringify(n));
  }
  function k() {
    const r = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet(),
      e = r.getRange(1, 1, 1, r.getLastColumn()).getValues()[0],
      t = ["Timestamp", "Name", "Date", "Chintamani"];
    (e.join("") === "" || e.length < t.length) && (r.clear(), r.appendRow(t));
  }
  return (
    (d.doGet = q),
    (d.doPost = _),
    (d.getGmailAliases = x),
    (d.makeQueryString = V),
    Object.defineProperty(d, Symbol.toStringTag, { value: "Module" }),
    d
  );
})({});

const doGet = (...args) => app.doGet(...args);
const doPost = (...args) => app.doPost(...args);
const getGmailAliases = (...args) => app.getGmailAliases(...args);
const makeQueryString = (...args) => app.makeQueryString(...args);
