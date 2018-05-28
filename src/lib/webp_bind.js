//------------------------------------------------------------------------------
/* eslint-disable */
// begin of emscripten wasm loader body
//------------------------------------------------------------------------------
var Module = function(c) {
    c = void 0 !== (c = c || {}) ? c : {};
    var n, e = {};
    for (n in c) c.hasOwnProperty(n) && (e[n] = c[n]);
    c.arguments = [], c.thisProgram = "./this.program", c.quit = function(n, e) {
        throw e;
    }, c.preRun = [];
    var r, i, p = !(c.postRun = []), y = !1, t = !1, a = !1;
    if (c.ENVIRONMENT) if ("WEB" === c.ENVIRONMENT) p = !0; else if ("WORKER" === c.ENVIRONMENT) y = !0; else if ("NODE" === c.ENVIRONMENT) t = !0; else {
        if ("SHELL" !== c.ENVIRONMENT) throw new Error("Module['ENVIRONMENT'] value is not valid. must be one of: WEB|WORKER|NODE|SHELL.");
        a = !0;
    } else p = "object" == typeof window, y = "function" == typeof importScripts, t = "object" == typeof process && "function" == typeof require && !p && !y, 
    a = !p && !t && !y;
    t ? (c.read = function(n, e) {
        var t;
        return r || (r = 0), i || (i = 0), n = i.normalize(n), 
        t = r.readFileSync(n), e ? t : t.toString();
    }, c.readBinary = function(n) {
        var e = c.read(n, !0);
        return e.buffer || (e = new Uint8Array(e)), m(e.buffer), e;
    }, 1 < process.argv.length && (c.thisProgram = process.argv[1].replace(/\\/g, "/")), 
    c.arguments = process.argv.slice(2), process.on("uncaughtException", function(n) {
        if (!(n instanceof Y)) throw n;
    }), process.on("unhandledRejection", function(n, e) {
        process.exit(1);
    }), c.inspect = function() {
        return "[Emscripten Module object]";
    }) : a ? ("undefined" != typeof read && (c.read = function(n) {
        return read(n);
    }), c.readBinary = function(n) {
        var e;
        return "function" == typeof readbuffer ? new Uint8Array(readbuffer(n)) : (m("object" == typeof (e = read(n, "binary"))), 
        e);
    }, "undefined" != typeof scriptArgs ? c.arguments = scriptArgs : void 0 !== arguments && (c.arguments = arguments), 
    "function" == typeof quit && (c.quit = function(n, e) {
        quit(n);
    })) : (p || y) && (c.read = function(n) {
        var e = new XMLHttpRequest();
        return e.open("GET", n, !1), e.send(null), e.responseText;
    }, y && (c.readBinary = function(n) {
        var e = new XMLHttpRequest();
        return e.open("GET", n, !1), e.responseType = "arraybuffer", e.send(null), new Uint8Array(e.response);
    }), c.readAsync = function(n, e, t) {
        var r = new XMLHttpRequest();
        r.open("GET", n, !0), r.responseType = "arraybuffer", r.onload = function() {
            200 == r.status || 0 == r.status && r.response ? e(r.response) : t();
        }, r.onerror = t, r.send(null);
    }, c.setWindowTitle = function(n) {
        document.title = n;
    });
    for (n in c.print = "undefined" != typeof console ? console.log.bind(console) : "undefined" != typeof print ? print : null, 
    c.printErr = "undefined" != typeof printErr ? printErr : "undefined" != typeof console && console.warn.bind(console) || c.print, 
    c.print = c.print, c.printErr = c.printErr, e) e.hasOwnProperty(n) && (c[n] = e[n]);
    e = void 0;
    function o(n, e) {
        return e || (e = 16), n = Math.ceil(n / e) * e;
    }
    new Array(0);
    var u = 0;
    function m(n, e) {
        n || Q("Assertion failed: " + e);
    }
    "undefined" != typeof TextDecoder && new TextDecoder("utf8");
    "undefined" != typeof TextDecoder && new TextDecoder("utf-16le");
    var l, s, f, d, h, b, w, v, _, g, A, T, M, E = 65536, R = 16777216, C = 16777216;
    function S(n, e) {
        return 0 < n % e && (n += e - n % e), n;
    }
    function B(n) {
        c.buffer = l = n;
    }
    function j() {
        c.HEAP8 = s = new Int8Array(l), c.HEAP16 = d = new Int16Array(l), c.HEAP32 = h = new Int32Array(l), 
        c.HEAPU8 = f = new Uint8Array(l), c.HEAPU16 = new Uint16Array(l), c.HEAPU32 = new Uint32Array(l), 
        c.HEAPF32 = b = new Float32Array(l), c.HEAPF64 = w = new Float64Array(l);
    }
    function I() {
        var n = c.usingWasm ? E : R, e = 2147483648 - n;
        if (h[M >> 2] > e) return !1;
        var t = N;
        for (N = Math.max(N, C); N < h[M >> 2]; ) N = N <= 536870912 ? S(2 * N, n) : Math.min(S((3 * N + 2147483648) / 4, n), e);
        var r = c.reallocBuffer(N);
        return r && r.byteLength == N ? (B(r), j(), !0) : (N = t, !1);
    }
    v = g = M = 0, _ = !1, c.reallocBuffer || (c.reallocBuffer = function(n) {
        var e;
        try {
            if (ArrayBuffer.transfer) e = ArrayBuffer.transfer(l, n); else {
                var t = s;
                e = new ArrayBuffer(n), new Int8Array(e).set(t);
            }
        } catch (n) {
            return !1;
        }
        return !!X(e) && e;
    });
    try {
        Function.prototype.call.bind(Object.getOwnPropertyDescriptor(ArrayBuffer.prototype, "byteLength").get)(new ArrayBuffer(4));
    } catch (n) {
        (function(n) {
            return n.byteLength;
        });
    }
    var x = c.TOTAL_STACK || 5242880, N = c.TOTAL_MEMORY || 16777216;
    if (N < x && c.printErr("TOTAL_MEMORY should be larger than TOTAL_STACK, was " + N + "! (TOTAL_STACK=" + x + ")"), 
    c.buffer ? l = c.buffer : ("object" == typeof WebAssembly && "function" == typeof WebAssembly.Memory ? (c.wasmMemory = new WebAssembly.Memory({
        initial: N / E
    }), l = c.wasmMemory.buffer) : l = new ArrayBuffer(N), c.buffer = l), j(), h[0] = 1668509029, 
    d[1] = 25459, 115 !== f[2] || 99 !== f[3]) throw "Runtime error: expected the system to be little-endian!";
    function O(n) {
        for (;0 < n.length; ) {
            var e = n.shift();
            if ("function" != typeof e) {
                var t = e.func;
                "number" == typeof t ? void 0 === e.arg ? c.dynCall_v(t) : c.dynCall_vi(t, e.arg) : t(void 0 === e.arg ? null : e.arg);
            } else e();
        }
    }
    var W = [], k = [], P = [], L = [], H = [], D = !1;
    Math.abs, Math.cos, Math.sin, Math.tan, Math.acos, Math.asin, Math.atan, Math.atan2, 
    Math.exp, Math.log, Math.sqrt, Math.ceil, Math.floor, Math.pow, Math.imul, Math.fround, 
    Math.round, Math.min, Math.max, Math.clz32, Math.trunc;
    var q = 0, U = null, z = null;
    c.preloadedImages = {}, c.preloadedAudios = {};
    var F = "data:application/octet-stream;base64,";
    function V(n) {
        return String.prototype.startsWith ? n.startsWith(F) : 0 === n.indexOf(F);
    }
    !function() {
        var n = "webpjs.wast", o = "webpjs.wasm", e = "webpjs.temp.asm.js";
        "function" == typeof c.locateFile && (V(n) || (n = c.locateFile(n)), V(o) || (o = c.locateFile(o)), 
        V(e) || (e = c.locateFile(e)));
        var u = {
            global: null,
            env: null,
            asm2wasm: {
                "f64-rem": function(n, e) {
                    return n % e;
                },
                debugger: function() {}
            },
            parent: c
        }, l = null;
        function s() {
            try {
                if (c.wasmBinary) return new Uint8Array(c.wasmBinary);
                if (c.readBinary) return c.readBinary(o);
                throw "on the web, we need the wasm binary to be preloaded and set on Module['wasmBinary']. emcc.py will do that for you when generating HTML (but not JS)";
            } catch (n) {
                Q(n);
            }
        }
        function f(n, e, t) {
            if ("object" != typeof WebAssembly) return c.printErr("no native wasm support detected"), 
            !1;
            if (!(c.wasmMemory instanceof WebAssembly.Memory)) return c.printErr("no native wasm Memory in use"), 
            !1;
            function r(n, e) {
                (l = n.exports).memory && function(n) {
                    var e = c.buffer;
                    n.byteLength < e.byteLength && c.printErr("the new buffer in mergeMemory is smaller than the previous one. in native wasm, we should grow memory here");
                    var t = new Int8Array(e);
                    new Int8Array(n).set(t), B(n), j();
                }(l.memory), c.asm = l, c.usingWasm = !0, function(n) {
                    if (q--, c.monitorRunDependencies && c.monitorRunDependencies(q), 0 == q && (null !== U && (clearInterval(U), 
                    U = null), z)) {
                        var e = z;
                        z = null, e();
                    }
                }();
            }
            if (e.memory = c.wasmMemory, u.global = {
                NaN: NaN,
                Infinity: 1 / 0
            }, u["global.Math"] = Math, u.env = e, q++, c.monitorRunDependencies && c.monitorRunDependencies(q), 
            c.instantiateWasm) try {
                return c.instantiateWasm(u, r);
            } catch (n) {
                return c.printErr("Module.instantiateWasm callback failed with error: " + n), !1;
            }
            function i(n) {
                r(n.instance, n.module);
            }
            function a(n) {
                (c.wasmBinary || !p && !y || "function" != typeof fetch ? new Promise(function(n, e) {
                    n(s());
                }) : fetch(o, {
                    credentials: "same-origin"
                }).then(function(n) {
                    if (!n.ok) throw "failed to load wasm binary file at '" + o + "'";
                    return n.arrayBuffer();
                }).catch(function() {
                    return s();
                })).then(function(n) {
                    return WebAssembly.instantiate(n, u);
                }).then(n).catch(function(n) {
                    c.printErr("failed to asynchronously prepare wasm: " + n), Q(n);
                });
            }
            return c.wasmBinary || "function" != typeof WebAssembly.instantiateStreaming || V(o) || "function" != typeof fetch ? a(i) : WebAssembly.instantiateStreaming(fetch(o, {
                credentials: "same-origin"
            }), u).then(i).catch(function(n) {
                c.printErr("wasm streaming compile failed: " + n), c.printErr("falling back to ArrayBuffer instantiation"), 
                a(i);
            }), {};
        }
        c.asmPreload = c.asm;
        var t = c.reallocBuffer;
        c.reallocBuffer = function(n) {
            return "asmjs" === r ? t(n) : function(n) {
                n = S(n, c.usingWasm ? E : R);
                var e = c.buffer.byteLength;
                if (c.usingWasm) try {
                    return -1 !== c.wasmMemory.grow((n - e) / 65536) ? c.buffer = c.wasmMemory.buffer : null;
                } catch (n) {
                    return null;
                }
            }(n);
        };
        var r = "";
        c.asm = function(n, e, t) {
            var r;
            if (!(e = e).table) {
                var i = c.wasmTableSize;
                void 0 === i && (i = 1024);
                var a = c.wasmMaxTableSize;
                "object" == typeof WebAssembly && "function" == typeof WebAssembly.Table ? e.table = void 0 !== a ? new WebAssembly.Table({
                    initial: i,
                    maximum: a,
                    element: "anyfunc"
                }) : new WebAssembly.Table({
                    initial: i,
                    element: "anyfunc"
                }) : e.table = new Array(i), c.wasmTable = e.table;
            }
            return e.memoryBase || (e.memoryBase = c.STATIC_BASE), e.tableBase || (e.tableBase = 0), 
            m(r = f(0, e), "no binaryen method succeeded."), r;
        };
    }(), v = 11264, k.push();
    c.STATIC_BASE = 1024, c.STATIC_BUMP = 10240;
    var K = v;
    v += 16, M = function(n) {
        m(!_);
        var e = v;
        return v = v + n + 15 & -16, e;
    }(4), T = o(A = (g = o(v)) + x), h[M >> 2] = T;
    _ = !0;
    c.wasmTableSize = 168, c.wasmMaxTableSize = 168, c.asmGlobalArg = {}, c.asmLibraryArg = {
        abort: Q,
        assert: m,
        enlargeMemory: I,
        getTotalMemory: function() {
            return N;
        },
        invoke_ii: function(n, e) {
            try {
                return c.dynCall_ii(n, e);
            } catch (n) {
                if ("number" != typeof n && "longjmp" !== n) throw n;
                c.setThrew(1, 0);
            }
        },
        invoke_iii: function(n, e, t) {
            try {
                return c.dynCall_iii(n, e, t);
            } catch (n) {
                if ("number" != typeof n && "longjmp" !== n) throw n;
                c.setThrew(1, 0);
            }
        },
        invoke_iiii: function(n, e, t, r) {
            try {
                return c.dynCall_iiii(n, e, t, r);
            } catch (n) {
                if ("number" != typeof n && "longjmp" !== n) throw n;
                c.setThrew(1, 0);
            }
        },
        invoke_iiiiiii: function(n, e, t, r, i, a, o) {
            try {
                return c.dynCall_iiiiiii(n, e, t, r, i, a, o);
            } catch (n) {
                if ("number" != typeof n && "longjmp" !== n) throw n;
                c.setThrew(1, 0);
            }
        },
        invoke_jiiii: function(n, e, t, r, i) {
            try {
                return c.dynCall_jiiii(n, e, t, r, i);
            } catch (n) {
                if ("number" != typeof n && "longjmp" !== n) throw n;
                c.setThrew(1, 0);
            }
        },
        invoke_vi: function(n, e) {
            try {
                c.dynCall_vi(n, e);
            } catch (n) {
                if ("number" != typeof n && "longjmp" !== n) throw n;
                c.setThrew(1, 0);
            }
        },
        invoke_vii: function(n, e, t) {
            try {
                c.dynCall_vii(n, e, t);
            } catch (n) {
                if ("number" != typeof n && "longjmp" !== n) throw n;
                c.setThrew(1, 0);
            }
        },
        invoke_viii: function(n, e, t, r) {
            try {
                c.dynCall_viii(n, e, t, r);
            } catch (n) {
                if ("number" != typeof n && "longjmp" !== n) throw n;
                c.setThrew(1, 0);
            }
        },
        invoke_viiii: function(n, e, t, r, i) {
            try {
                c.dynCall_viiii(n, e, t, r, i);
            } catch (n) {
                if ("number" != typeof n && "longjmp" !== n) throw n;
                c.setThrew(1, 0);
            }
        },
        invoke_viiiii: function(n, e, t, r, i, a) {
            try {
                c.dynCall_viiiii(n, e, t, r, i, a);
            } catch (n) {
                if ("number" != typeof n && "longjmp" !== n) throw n;
                c.setThrew(1, 0);
            }
        },
        invoke_viiiiii: function(n, e, t, r, i, a, o) {
            try {
                c.dynCall_viiiiii(n, e, t, r, i, a, o);
            } catch (n) {
                if ("number" != typeof n && "longjmp" !== n) throw n;
                c.setThrew(1, 0);
            }
        },
        invoke_viiiiiiiii: function(n, e, t, r, i, a, o, u, l, s) {
            try {
                c.dynCall_viiiiiiiii(n, e, t, r, i, a, o, u, l, s);
            } catch (n) {
                if ("number" != typeof n && "longjmp" !== n) throw n;
                c.setThrew(1, 0);
            }
        },
        ___setErrNo: function(n) {
            return c.___errno_location && (h[c.___errno_location() >> 2] = n), n;
        },
        _emscripten_memcpy_big: function(n, e, t) {
            return f.set(f.subarray(e, e + t), n), n;
        },
        DYNAMICTOP_PTR: M,
        tempDoublePtr: K,
        ABORT: u,
        STACKTOP: g,
        STACK_MAX: A
    };
    var G = c.asm(c.asmGlobalArg, c.asmLibraryArg, l);
    c.asm = G;
    c._decode = function() {
        return c.asm._decode.apply(null, arguments);
    };
    var X = c._emscripten_replace_memory = function() {
        return c.asm._emscripten_replace_memory.apply(null, arguments);
    };
    c._free = function() {
        return c.asm._free.apply(null, arguments);
    }, c._getInfo = function() {
        return c.asm._getInfo.apply(null, arguments);
    }, c._llvm_bswap_i32 = function() {
        return c.asm._llvm_bswap_i32.apply(null, arguments);
    }, c._llvm_ctpop_i32 = function() {
        return c.asm._llvm_ctpop_i32.apply(null, arguments);
    }, c._malloc = function() {
        return c.asm._malloc.apply(null, arguments);
    }, c._memcpy = function() {
        return c.asm._memcpy.apply(null, arguments);
    }, c._memmove = function() {
        return c.asm._memmove.apply(null, arguments);
    }, c._memset = function() {
        return c.asm._memset.apply(null, arguments);
    }, c._sbrk = function() {
        return c.asm._sbrk.apply(null, arguments);
    }, c._svpng = function() {
        return c.asm._svpng.apply(null, arguments);
    }, c._version = function() {
        return c.asm._version.apply(null, arguments);
    }, c._webp2png = function() {
        return c.asm._webp2png.apply(null, arguments);
    }, c.establishStackSpace = function() {
        return c.asm.establishStackSpace.apply(null, arguments);
    }, c.getTempRet0 = function() {
        return c.asm.getTempRet0.apply(null, arguments);
    }, c.runPostSets = function() {
        return c.asm.runPostSets.apply(null, arguments);
    }, c.setTempRet0 = function() {
        return c.asm.setTempRet0.apply(null, arguments);
    }, c.setThrew = function() {
        return c.asm.setThrew.apply(null, arguments);
    }, c.stackAlloc = function() {
        return c.asm.stackAlloc.apply(null, arguments);
    }, c.stackRestore = function() {
        return c.asm.stackRestore.apply(null, arguments);
    }, c.stackSave = function() {
        return c.asm.stackSave.apply(null, arguments);
    }, c.dynCall_ii = function() {
        return c.asm.dynCall_ii.apply(null, arguments);
    }, c.dynCall_iii = function() {
        return c.asm.dynCall_iii.apply(null, arguments);
    }, c.dynCall_iiii = function() {
        return c.asm.dynCall_iiii.apply(null, arguments);
    }, c.dynCall_iiiiiii = function() {
        return c.asm.dynCall_iiiiiii.apply(null, arguments);
    }, c.dynCall_jiiii = function() {
        return c.asm.dynCall_jiiii.apply(null, arguments);
    }, c.dynCall_vi = function() {
        return c.asm.dynCall_vi.apply(null, arguments);
    }, c.dynCall_vii = function() {
        return c.asm.dynCall_vii.apply(null, arguments);
    }, c.dynCall_viii = function() {
        return c.asm.dynCall_viii.apply(null, arguments);
    }, c.dynCall_viiii = function() {
        return c.asm.dynCall_viiii.apply(null, arguments);
    }, c.dynCall_viiiii = function() {
        return c.asm.dynCall_viiiii.apply(null, arguments);
    }, c.dynCall_viiiiii = function() {
        return c.asm.dynCall_viiiiii.apply(null, arguments);
    }, c.dynCall_viiiiiiiii = function() {
        return c.asm.dynCall_viiiiiiiii.apply(null, arguments);
    };
    function Y(n) {
        this.name = "ExitStatus", this.message = "Program terminated with exit(" + n + ")", 
        this.status = n;
    }
    function J(n) {
        function e() {
            c.calledRun || (c.calledRun = !0, u || (D || (D = !0, O(k)), O(P), c.onRuntimeInitialized && c.onRuntimeInitialized(), 
            function() {
                if (c.postRun) for ("function" == typeof c.postRun && (c.postRun = [ c.postRun ]); c.postRun.length; ) n = c.postRun.shift(), 
                H.unshift(n);
                var n;
                O(H);
            }()));
        }
        n = n || c.arguments, 0 < q || (!function() {
            if (c.preRun) for ("function" == typeof c.preRun && (c.preRun = [ c.preRun ]); c.preRun.length; ) n = c.preRun.shift(), 
            W.unshift(n);
            var n;
            O(W);
        }(), 0 < q || c.calledRun || (c.setStatus ? (c.setStatus("Running..."), setTimeout(function() {
            setTimeout(function() {
                c.setStatus("");
            }, 1), e();
        }, 1)) : e()));
    }
    function Q(n) {
        throw c.onAbort && c.onAbort(n), void 0 !== n ? (c.print(n), c.printErr(n), n = JSON.stringify(n)) : n = "", 
        u = !0, 1, "abort(" + n + "). Build with -s ASSERTIONS=1 for more info.";
    }
    if (c.asm = G, c.getValue = function(n, e, t) {
        switch ("*" === (e = e || "i8").charAt(e.length - 1) && (e = "i32"), e) {
          case "i1":
          case "i8":
            return s[n >> 0];

          case "i16":
            return d[n >> 1];

          case "i32":
          case "i64":
            return h[n >> 2];

          case "float":
            return b[n >> 2];

          case "double":
            return w[n >> 3];

          default:
            Q("invalid type for getValue: " + e);
        }
        return null;
    }, c.then = function(n) {
        if (c.calledRun) n(c); else {
            var e = c.onRuntimeInitialized;
            c.onRuntimeInitialized = function() {
                e && e(), n(c);
            };
        }
        return c;
    }, (Y.prototype = new Error()).constructor = Y, z = function n() {
        c.calledRun || J(), c.calledRun || (z = n);
    }, c.run = J, c.exit = function(n, e) {
        e && c.noExitRuntime && 0 === n || (c.noExitRuntime || (u = !0, n, g = void 0, O(L), 
        !0, c.onExit && c.onExit(n)), t && process.exit(n), c.quit(n, new Y(n)));
    }, c.abort = Q, c.preInit) for ("function" == typeof c.preInit && (c.preInit = [ c.preInit ]); 0 < c.preInit.length; ) c.preInit.pop()();
    return c.noExitRuntime = !0, J(), c;
};
//------------------------------------------------------------------------------
// end of emscripten wasm loader body
/* eslint-enable */
//------------------------------------------------------------------------------
export default Module;
//------------------------------------------------------------------------------
