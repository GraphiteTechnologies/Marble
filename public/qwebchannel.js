/****************************************************************************
 **
 ** Copyright (C) 2015 The Qt Company Ltd.
 ** Contact: http://www.qt.io/licensing/
 **
 ** This file is part of the QtWebChannel module of the Qt Toolkit.
 **
 ** $QT_BEGIN_LICENSE:BSD$
 ** You may use this file under the terms of the BSD license as follows:
 **
 ** "Redistribution and use in source and binary forms, with or without
 ** modification, are permitted provided that the following conditions are
 ** met:
 **   * Redistributions of source code must retain the above copyright
 **     notice, this list of conditions and the following disclaimer.
 **   * Redistributions in binary form must reproduce the above copyright
 **     notice, this list of conditions and the following disclaimer in
 **     the documentation and/or other materials provided with the
 **     distribution.
 **   * Neither the name of The Qt Company Ltd nor the names of its
 **     contributors may be used to endorse or promote products derived
 **     from this software without specific prior written permission.
 **
 **
 ** THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 ** "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 ** LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 ** A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 ** OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 ** SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 ** LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 ** DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 ** THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 ** (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 ** OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE."
 **
 ** $QT_END_LICENSE$
 **
 ****************************************************************************/

"use strict";

var QWebChannel = function(transport, initCallback) {
    if(typeof transport === "undefined") {
        console.error("QWebChannel: transport is undefined!");
        return;
    }

    var channel = this;
    this.transport = transport;
    this.send = function(data) {
        if(typeof channel.transport.send !== "function") {
            console.error("QWebChannel: transport.send is not a function!");
            return;
        }
        channel.transport.send(JSON.stringify(data));
    };

    this.transport.onmessage = function(message) {
        var data = message.data;
        if(typeof data === "string") {
            data = JSON.parse(data);
        }
        channel.handleMessage(data);
    };

    this.objects = {};
    this.execCallbacks = {};
    this.execId = 0;
    this.enums = {};

    this.handleMessage = function(data) {
        if(typeof data.type === "undefined") {
            console.error("QWebChannel: Received message without type!");
            return;
        }

        switch(data.type) {
            case 2: // signal
                channel.handleSignal(data);
                break;
            case 3: // response
                channel.handleResponse(data);
                break;
            case 4: // property update
                channel.handlePropertyUpdate(data);
                break;
            case 1: // init
                channel.handleInit(data);
                break;
            default:
                console.error("QWebChannel: Invalid message type received: " + data.type);
                break;
        }
    };

    this.handleInit = function(data) {
        for(var objectName in data.objects) {
            var object = new QObject(objectName, data.objects[objectName], channel);
            channel.objects[objectName] = object;
            // so that we can access the object directly as channel.objects.name
            if(Object.defineProperty) {
                Object.defineProperty(channel.objects, objectName, {
                    configurable: true,
                    value: object
                });
            }
        }
        // now that all objects are created, connect the signals
        for(var objectName in channel.objects) {
            channel.objects[objectName].__connectSignals__();
        }
        if(initCallback) {
            initCallback(channel);
        }
    };

    this.handleSignal = function(data) {
        var object = channel.objects[data.object];
        if(object) {
            object.signalEmitted(data.signal, data.args);
        } else {
            console.error("QWebChannel: Cannot find object " + data.object + " to emit signal " + data.signal);
        }
    };

    this.handleResponse = function(data) {
        if(typeof data.id === "undefined" || typeof channel.execCallbacks[data.id] === "undefined") {
            console.error("QWebChannel: Received response for unknown request " + data.id);
            return;
        }
        channel.execCallbacks[data.id](data.data);
        delete channel.execCallbacks[data.id];
    };

    this.handlePropertyUpdate = function(data) {
        for(var i in data.data) {
            var message = data.data[i];
            var object = channel.objects[message.object];
            if(object) {
                object.propertyUpdate(message.signals, message.properties);
            } else {
                console.error("QWebChannel: Cannot find object " + message.object + " to update property.");
            }
        }
    };

    this.exec = function(data, callback) {
        if(!callback) {
            // if no callback is given, we don't need to register it
            this.send(data);
            return;
        }
        if(this.execId === Number.MAX_SAFE_INTEGER) {
            // wrap
            this.execId = 0;
        }
        var id = ++this.execId;
        this.execCallbacks[id] = callback;
        data.id = id;
        this.send(data);
    };

    this.send({type: 1}); // INIT
};

var QObject = function(name, data, webChannel) {
    this.__id__ = name;
    this.webChannel = webChannel;
    this.methods = {};
    this.signals = {};
    this.properties = {};

    var object = this;

    // __ QObject helper functions __ //
    object.__addMethod__ = function(name, type) {
        var method = function() {
            var args = [];
            var callback;
            for(var i = 0; i < arguments.length; ++i) {
                if(typeof arguments[i] === "function")
                    callback = arguments[i];
                else
                    args.push(arguments[i]);
            }

            object.webChannel.exec({
                "type": 0, // "method"
                "object": object.__id__,
                "method": name,
                "args": args
            }, callback);
        };
        method.invoke = method;
        method.connect = function(callback) {
            if(typeof callback !== "function") {
                console.error("QObject: Cannot connect to method " + name + " without a callback!");
                return;
            }
            object.methods[name] = callback;
        };
        method.disconnect = function(callback) {
            if(typeof callback !== "function") {
                console.error("QObject: Cannot disconnect from method " + name + " without a callback!");
                return;
            }
            delete object.methods[name];
        };
        object[name] = method;
    };

    object.__addSignal__ = function(name, type) {
        object.signals[name] = [];
        var signal = function() {
            object.webChannel.exec({
                "type": 2, // "signal"
                "object": object.__id__,
                "signal": name,
                "args": Array.prototype.slice.call(arguments)
            });
        };
        signal.connect = function(callback) {
            if(typeof callback !== "function") {
                console.error("QObject: Cannot connect to signal " + name + " without a callback!");
                return;
            }
            object.signals[name].push(callback);
        };
        signal.disconnect = function(callback) {
            if(typeof callback !== "function") {
                console.error("QObject: Cannot disconnect from signal " + name + " without a callback!");
                return;
            }
            var index = object.signals[name].indexOf(callback);
            if(index !== -1) {
                object.signals[name].splice(index, 1);
            }
        };
        object[name] = signal;
    };

    object.__addProperty__ = function(name, type) {
        object.properties[name] = undefined;
        var property = {};
        property.get = function() {
            return object.properties[name];
        };
        property.set = function(value) {
            object.webChannel.exec({
                "type": 1, // "property"
                "object": object.__id__,
                "property": name,
                "value": value
            });
        };
        property.connect = function(callback) {
            if(typeof callback !== "function") {
                console.error("QObject: Cannot connect to property " + name + " without a callback!");
                return;
            }
            object.properties[name + "Changed"] = callback;
        };
        property.disconnect = function(callback) {
            if(typeof callback !== "function") {
                console.error("QObject: Cannot disconnect from property " + name + " without a callback!");
                return;
            }
            delete object.properties[name + "Changed"];
        };
        if(Object.defineProperty) {
            Object.defineProperty(object, name, {
                configurable: true,
                get: property.get,
                set: property.set
            });
        }
    };

    object.signalEmitted = function(name, args) {
        if(object.signals[name]) {
            object.signals[name].forEach(function(callback) {
                callback.apply(callback, args);
            });
        }
    };

    object.propertyUpdate = function(signals, properties) {
        // update the properties, and then emit the changed signals
        for(var property in properties) {
            object.properties[property] = properties[property];
        }
        for(var signal in signals) {
            var signalName = signals[signal];
            if(object.properties[signalName]) {
                object.properties[signalName].apply(object.properties[signalName], [object.properties[signalName.substring(0, signalName.length - 7)]]);
            }
        }
    };

    object.__connectSignals__ = function() {
        for(var i in data.signals) {
            var signal = data.signals[i];
            var signalName = signal[0];
            var signalType = signal[1];
            object.signals[signalName].forEach(function(callback) {
                object.webChannel.exec({
                    "type": 3, // "connect"
                    "object": object.__id__,
                    "signal": signalName,
                    "slot": callback.toString()
                });
            });
        }
    };

    // init
    for(var i in data.methods) {
        var method = data.methods[i];
        object.__addMethod__(method[0], method[1]);
    }

    for(var i in data.signals) {
        var signal = data.signals[i];
        object.__addSignal__(signal[0], signal[1]);
    }

    for(var i in data.properties) {
        var property = data.properties[i];
        object.__addProperty__(property[0], property[1]);
    }

    for(var name in data.enums) {
        object.webChannel.enums[name] = data.enums[name];
    }
};
