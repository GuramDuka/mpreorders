webpackJsonp([1],{BqMY:function(e,t,n){"use strict";function o(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function r(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}Object.defineProperty(t,"__esModule",{value:!0}),n.d(t,"default",function(){return p});var i=n("KM04"),c=(n.n(i),n("7/cg")),u=n("aqQ4"),l=(n.n(u),n("Tv6c")),a=n.n(l),p=function(e){function t(){for(var t,n,r,i=arguments.length,c=Array(i),u=0;u<i;u++)c[u]=arguments[u];return t=n=o(this,e.call.apply(e,[this].concat(c))),n.state={time:Date.now(),count:10},n.updateTime=function(){n.setState({time:Date.now()})},n.increment=function(){n.setState({count:n.state.count+1})},r=t,o(n,r)}return r(t,e),t.prototype.componentDidMount=function(){this.timer=setInterval(this.updateTime,1e3)},t.prototype.componentWillUnmount=function(){clearInterval(this.timer)},t.prototype.render=function(e,t){var n=e.user,o=t.time,r=t.count;return Object(i.h)("div",{class:a.a.profile},Object(i.h)("h1",null,"Profile: ",n),Object(i.h)("p",null,"This is the user profile for a user named ",n,"."),Object(i.h)("div",null,"Current time: ",new Date(o).toLocaleString()),Object(i.h)("p",null,Object(i.h)(c.a,{raised:!0,ripple:!0,onClick:this.increment},"Click Me")," ","Clicked ",r," times."))},t}(i.Component)},Tv6c:function(e){e.exports={profile:"profile__1f25-"}},aqQ4:function(){}});
//# sourceMappingURL=1.chunk.c3664.js.map