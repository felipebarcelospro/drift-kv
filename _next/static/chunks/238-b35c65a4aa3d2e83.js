"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[238],{11825:(e,t,n)=>{n.d(t,{Ry:()=>c});var r=new WeakMap,o=new WeakMap,a={},i=0,u=function(e){return e&&(e.host||u(e.parentNode))},l=function(e,t,n,l){var c=(Array.isArray(e)?e:[e]).map(function(e){if(t.contains(e))return e;var n=u(e);return n&&t.contains(n)?n:(console.error("aria-hidden",e,"in not contained inside",t,". Doing nothing"),null)}).filter(function(e){return!!e});a[n]||(a[n]=new WeakMap);var s=a[n],d=[],f=new Set,p=new Set(c),v=function(e){!e||f.has(e)||(f.add(e),v(e.parentNode))};c.forEach(v);var m=function(e){!e||p.has(e)||Array.prototype.forEach.call(e.children,function(e){if(f.has(e))m(e);else try{var t=e.getAttribute(l),a=null!==t&&"false"!==t,i=(r.get(e)||0)+1,u=(s.get(e)||0)+1;r.set(e,i),s.set(e,u),d.push(e),1===i&&a&&o.set(e,!0),1===u&&e.setAttribute(n,"true"),a||e.setAttribute(l,"true")}catch(t){console.error("aria-hidden: cannot operate on ",e,t)}})};return m(t),f.clear(),i++,function(){d.forEach(function(e){var t=r.get(e)-1,a=s.get(e)-1;r.set(e,t),s.set(e,a),t||(o.has(e)||e.removeAttribute(l),o.delete(e)),a||e.removeAttribute(n)}),--i||(r=new WeakMap,r=new WeakMap,o=new WeakMap,a={})}},c=function(e,t,n){void 0===n&&(n="data-aria-hidden");var r,o=Array.from(Array.isArray(e)?e:[e]),a=t||(r=e,"undefined"==typeof document?null:(Array.isArray(r)?r[0]:r).ownerDocument.body);return a?(o.push.apply(o,Array.from(a.querySelectorAll("[aria-live]"))),l(o,a,n,"aria-hidden")):function(){return null}}},78001:(e,t,n)=>{n.d(t,{Av:()=>i,pF:()=>r,xv:()=>a,zi:()=>o});var r="right-scroll-bar-position",o="width-before-scroll-bar",a="with-scroll-bars-hidden",i="--removed-body-scroll-bar-size"},17006:(e,t,n)=>{n.d(t,{jp:()=>m});var r=n(7653),o=n(61228),a=n(78001),i={left:0,top:0,right:0,gap:0},u=function(e){return parseInt(e||"",10)||0},l=function(e){var t=window.getComputedStyle(document.body),n=t["padding"===e?"paddingLeft":"marginLeft"],r=t["padding"===e?"paddingTop":"marginTop"],o=t["padding"===e?"paddingRight":"marginRight"];return[u(n),u(r),u(o)]},c=function(e){if(void 0===e&&(e="margin"),"undefined"==typeof window)return i;var t=l(e),n=document.documentElement.clientWidth,r=window.innerWidth;return{left:t[0],top:t[1],right:t[2],gap:Math.max(0,r-n+t[2]-t[0])}},s=(0,o.Ws)(),d="data-scroll-locked",f=function(e,t,n,r){var o=e.left,i=e.top,u=e.right,l=e.gap;return void 0===n&&(n="margin"),"\n  .".concat(a.xv," {\n   overflow: hidden ").concat(r,";\n   padding-right: ").concat(l,"px ").concat(r,";\n  }\n  body[").concat(d,"] {\n    overflow: hidden ").concat(r,";\n    overscroll-behavior: contain;\n    ").concat([t&&"position: relative ".concat(r,";"),"margin"===n&&"\n    padding-left: ".concat(o,"px;\n    padding-top: ").concat(i,"px;\n    padding-right: ").concat(u,"px;\n    margin-left:0;\n    margin-top:0;\n    margin-right: ").concat(l,"px ").concat(r,";\n    "),"padding"===n&&"padding-right: ".concat(l,"px ").concat(r,";")].filter(Boolean).join(""),"\n  }\n  \n  .").concat(a.pF," {\n    right: ").concat(l,"px ").concat(r,";\n  }\n  \n  .").concat(a.zi," {\n    margin-right: ").concat(l,"px ").concat(r,";\n  }\n  \n  .").concat(a.pF," .").concat(a.pF," {\n    right: 0 ").concat(r,";\n  }\n  \n  .").concat(a.zi," .").concat(a.zi," {\n    margin-right: 0 ").concat(r,";\n  }\n  \n  body[").concat(d,"] {\n    ").concat(a.Av,": ").concat(l,"px;\n  }\n")},p=function(){var e=parseInt(document.body.getAttribute(d)||"0",10);return isFinite(e)?e:0},v=function(){r.useEffect(function(){return document.body.setAttribute(d,(p()+1).toString()),function(){var e=p()-1;e<=0?document.body.removeAttribute(d):document.body.setAttribute(d,e.toString())}},[])},m=function(e){var t=e.noRelative,n=e.noImportant,o=e.gapMode,a=void 0===o?"margin":o;v();var i=r.useMemo(function(){return c(a)},[a]);return r.createElement(s,{styles:f(i,!t,a,n?"":"!important")})}},61228:(e,t,n)=>{n.d(t,{Ws:()=>u});var r,o=n(7653),a=function(){var e=0,t=null;return{add:function(o){if(0==e&&(t=function(){if(!document)return null;var e=document.createElement("style");e.type="text/css";var t=r||n.nc;return t&&e.setAttribute("nonce",t),e}())){var a,i;(a=t).styleSheet?a.styleSheet.cssText=o:a.appendChild(document.createTextNode(o)),i=t,(document.head||document.getElementsByTagName("head")[0]).appendChild(i)}e++},remove:function(){--e||!t||(t.parentNode&&t.parentNode.removeChild(t),t=null)}}},i=function(){var e=a();return function(t,n){o.useEffect(function(){return e.add(t),function(){e.remove()}},[t&&n])}},u=function(){var e=i();return function(t){return e(t.styles,t.dynamic),null}}},3417:(e,t,n)=>{n.d(t,{q:()=>u});var r=n(7653);function o(e,t){return"function"==typeof e?e(t):e&&(e.current=t),e}var a="undefined"!=typeof window?r.useLayoutEffect:r.useEffect,i=new WeakMap;function u(e,t){var n,u,l,c=(n=t||null,u=function(t){return e.forEach(function(e){return o(e,t)})},(l=(0,r.useState)(function(){return{value:n,callback:u,facade:{get current(){return l.value},set current(value){var e=l.value;e!==value&&(l.value=value,l.callback(value,e))}}}})[0]).callback=u,l.facade);return a(function(){var t=i.get(c);if(t){var n=new Set(t),r=new Set(e),a=c.current;n.forEach(function(e){r.has(e)||o(e,null)}),r.forEach(function(e){n.has(e)||o(e,a)})}i.set(c,e)},[e]),c}},63021:(e,t,n)=>{n.d(t,{L:()=>i});var r=n(53176),o=n(7653),a=function(e){var t=e.sideCar,n=(0,r._T)(e,["sideCar"]);if(!t)throw Error("Sidecar: please provide `sideCar` property to import the right car");var a=t.read();if(!a)throw Error("Sidecar medium not found");return o.createElement(a,(0,r.pi)({},n))};function i(e,t){return e.useMedium(t),a}a.isSideCarExport=!0},36650:(e,t,n)=>{n.d(t,{_:()=>a});var r=n(53176);function o(e){return e}function a(e){void 0===e&&(e={});var t,n,a,i=(void 0===t&&(t=o),n=[],a=!1,{read:function(){if(a)throw Error("Sidecar: could not `read` from an `assigned` medium. `read` could be used only with `useMedium`.");return n.length?n[n.length-1]:null},useMedium:function(e){var r=t(e,a);return n.push(r),function(){n=n.filter(function(e){return e!==r})}},assignSyncMedium:function(e){for(a=!0;n.length;){var t=n;n=[],t.forEach(e)}n={push:function(t){return e(t)},filter:function(){return n}}},assignMedium:function(e){a=!0;var t=[];if(n.length){var r=n;n=[],r.forEach(e),t=n}var o=function(){var n=t;t=[],n.forEach(e)},i=function(){return Promise.resolve().then(o)};i(),n={push:function(e){t.push(e),i()},filter:function(e){return t=t.filter(e),n}}}});return i.options=(0,r.pi)({async:!0,ssr:!1},e),i}},2467:(e,t,n)=>{n.d(t,{M:()=>r});function r(e,t,{checkForDefaultPrevented:n=!0}={}){return function(r){if(e?.(r),!1===n||!r.defaultPrevented)return t?.(r)}}},18497:(e,t,n)=>{n.d(t,{F:()=>o,e:()=>a});var r=n(7653);function o(...e){return t=>e.forEach(e=>{"function"==typeof e?e(t):null!=e&&(e.current=t)})}function a(...e){return r.useCallback(o(...e),e)}},20379:(e,t,n)=>{n.d(t,{b:()=>i,k:()=>a});var r=n(7653),o=n(27573);function a(e,t){let n=r.createContext(t),a=e=>{let{children:t,...a}=e,i=r.useMemo(()=>a,Object.values(a));return(0,o.jsx)(n.Provider,{value:i,children:t})};return a.displayName=e+"Provider",[a,function(o){let a=r.useContext(n);if(a)return a;if(void 0!==t)return t;throw Error(`\`${o}\` must be used within \`${e}\``)}]}function i(e,t=[]){let n=[],a=()=>{let t=n.map(e=>r.createContext(e));return function(n){let o=n?.[e]||t;return r.useMemo(()=>({[`__scope${e}`]:{...n,[e]:o}}),[n,o])}};return a.scopeName=e,[function(t,a){let i=r.createContext(a),u=n.length;n=[...n,a];let l=t=>{let{scope:n,children:a,...l}=t,c=n?.[e]?.[u]||i,s=r.useMemo(()=>l,Object.values(l));return(0,o.jsx)(c.Provider,{value:s,children:a})};return l.displayName=t+"Provider",[l,function(n,o){let l=o?.[e]?.[u]||i,c=r.useContext(l);if(c)return c;if(void 0!==a)return a;throw Error(`\`${n}\` must be used within \`${t}\``)}]},function(...e){let t=e[0];if(1===e.length)return t;let n=()=>{let n=e.map(e=>({useScope:e(),scopeName:e.scopeName}));return function(e){let o=n.reduce((t,{useScope:n,scopeName:r})=>{let o=n(e)[`__scope${r}`];return{...t,...o}},{});return r.useMemo(()=>({[`__scope${t.scopeName}`]:o}),[o])}};return n.scopeName=t.scopeName,n}(a,...t)]}},4238:(e,t,n)=>{n.d(t,{x8:()=>eK,VY:()=>eB,dk:()=>eU,aV:()=>eV,h_:()=>e_,fC:()=>eI,Dx:()=>ez,xz:()=>eF});var r,o=n(7653),a=n(2467),i=n(18497),u=n(20379),l=n(52608),c=n(65192),s=n(76646),d=n(63465),f=n(27573),p="dismissableLayer.update",v=o.createContext({layers:new Set,layersWithOutsidePointerEventsDisabled:new Set,branches:new Set}),m=o.forwardRef((e,t)=>{var n,u;let{disableOutsidePointerEvents:l=!1,onEscapeKeyDown:c,onPointerDownOutside:m,onFocusOutside:y,onInteractOutside:b,onDismiss:E,...w}=e,C=o.useContext(v),[N,x]=o.useState(null),R=null!==(u=null==N?void 0:N.ownerDocument)&&void 0!==u?u:null===(n=globalThis)||void 0===n?void 0:n.document,[,S]=o.useState({}),M=(0,i.e)(t,e=>x(e)),O=Array.from(C.layers),[D]=[...C.layersWithOutsidePointerEventsDisabled].slice(-1),T=O.indexOf(D),P=N?O.indexOf(N):-1,L=C.layersWithOutsidePointerEventsDisabled.size>0,j=P>=T,A=function(e){var t;let n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null===(t=globalThis)||void 0===t?void 0:t.document,r=(0,d.W)(e),a=o.useRef(!1),i=o.useRef(()=>{});return o.useEffect(()=>{let e=e=>{if(e.target&&!a.current){let t=function(){g("dismissableLayer.pointerDownOutside",r,o,{discrete:!0})},o={originalEvent:e};"touch"===e.pointerType?(n.removeEventListener("click",i.current),i.current=t,n.addEventListener("click",i.current,{once:!0})):t()}else n.removeEventListener("click",i.current);a.current=!1},t=window.setTimeout(()=>{n.addEventListener("pointerdown",e)},0);return()=>{window.clearTimeout(t),n.removeEventListener("pointerdown",e),n.removeEventListener("click",i.current)}},[n,r]),{onPointerDownCapture:()=>a.current=!0}}(e=>{let t=e.target,n=[...C.branches].some(e=>e.contains(t));!j||n||(null==m||m(e),null==b||b(e),e.defaultPrevented||null==E||E())},R),W=function(e){var t;let n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null===(t=globalThis)||void 0===t?void 0:t.document,r=(0,d.W)(e),a=o.useRef(!1);return o.useEffect(()=>{let e=e=>{e.target&&!a.current&&g("dismissableLayer.focusOutside",r,{originalEvent:e},{discrete:!1})};return n.addEventListener("focusin",e),()=>n.removeEventListener("focusin",e)},[n,r]),{onFocusCapture:()=>a.current=!0,onBlurCapture:()=>a.current=!1}}(e=>{let t=e.target;[...C.branches].some(e=>e.contains(t))||(null==y||y(e),null==b||b(e),e.defaultPrevented||null==E||E())},R);return!function(e,t=globalThis?.document){let n=(0,d.W)(e);o.useEffect(()=>{let e=e=>{"Escape"===e.key&&n(e)};return t.addEventListener("keydown",e,{capture:!0}),()=>t.removeEventListener("keydown",e,{capture:!0})},[n,t])}(e=>{P!==C.layers.size-1||(null==c||c(e),!e.defaultPrevented&&E&&(e.preventDefault(),E()))},R),o.useEffect(()=>{if(N)return l&&(0===C.layersWithOutsidePointerEventsDisabled.size&&(r=R.body.style.pointerEvents,R.body.style.pointerEvents="none"),C.layersWithOutsidePointerEventsDisabled.add(N)),C.layers.add(N),h(),()=>{l&&1===C.layersWithOutsidePointerEventsDisabled.size&&(R.body.style.pointerEvents=r)}},[N,R,l,C]),o.useEffect(()=>()=>{N&&(C.layers.delete(N),C.layersWithOutsidePointerEventsDisabled.delete(N),h())},[N,C]),o.useEffect(()=>{let e=()=>S({});return document.addEventListener(p,e),()=>document.removeEventListener(p,e)},[]),(0,f.jsx)(s.WV.div,{...w,ref:M,style:{pointerEvents:L?j?"auto":"none":void 0,...e.style},onFocusCapture:(0,a.M)(e.onFocusCapture,W.onFocusCapture),onBlurCapture:(0,a.M)(e.onBlurCapture,W.onBlurCapture),onPointerDownCapture:(0,a.M)(e.onPointerDownCapture,A.onPointerDownCapture)})});function h(){let e=new CustomEvent(p);document.dispatchEvent(e)}function g(e,t,n,r){let{discrete:o}=r,a=n.originalEvent.target,i=new CustomEvent(e,{bubbles:!1,cancelable:!0,detail:n});t&&a.addEventListener(e,t,{once:!0}),o?(0,s.jH)(a,i):a.dispatchEvent(i)}m.displayName="DismissableLayer",o.forwardRef((e,t)=>{let n=o.useContext(v),r=o.useRef(null),a=(0,i.e)(t,r);return o.useEffect(()=>{let e=r.current;if(e)return n.branches.add(e),()=>{n.branches.delete(e)}},[n.branches]),(0,f.jsx)(s.WV.div,{...e,ref:a})}).displayName="DismissableLayerBranch";var y="focusScope.autoFocusOnMount",b="focusScope.autoFocusOnUnmount",E={bubbles:!1,cancelable:!0},w=o.forwardRef((e,t)=>{let{loop:n=!1,trapped:r=!1,onMountAutoFocus:a,onUnmountAutoFocus:u,...l}=e,[c,p]=o.useState(null),v=(0,d.W)(a),m=(0,d.W)(u),h=o.useRef(null),g=(0,i.e)(t,e=>p(e)),w=o.useRef({paused:!1,pause(){this.paused=!0},resume(){this.paused=!1}}).current;o.useEffect(()=>{if(r){let e=function(e){if(w.paused||!c)return;let t=e.target;c.contains(t)?h.current=t:x(h.current,{select:!0})},t=function(e){if(w.paused||!c)return;let t=e.relatedTarget;null===t||c.contains(t)||x(h.current,{select:!0})};document.addEventListener("focusin",e),document.addEventListener("focusout",t);let n=new MutationObserver(function(e){if(document.activeElement===document.body)for(let t of e)t.removedNodes.length>0&&x(c)});return c&&n.observe(c,{childList:!0,subtree:!0}),()=>{document.removeEventListener("focusin",e),document.removeEventListener("focusout",t),n.disconnect()}}},[r,c,w.paused]),o.useEffect(()=>{if(c){R.add(w);let e=document.activeElement;if(!c.contains(e)){let t=new CustomEvent(y,E);c.addEventListener(y,v),c.dispatchEvent(t),t.defaultPrevented||(function(e){let{select:t=!1}=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},n=document.activeElement;for(let r of e)if(x(r,{select:t}),document.activeElement!==n)return}(C(c).filter(e=>"A"!==e.tagName),{select:!0}),document.activeElement===e&&x(c))}return()=>{c.removeEventListener(y,v),setTimeout(()=>{let t=new CustomEvent(b,E);c.addEventListener(b,m),c.dispatchEvent(t),t.defaultPrevented||x(null!=e?e:document.body,{select:!0}),c.removeEventListener(b,m),R.remove(w)},0)}}},[c,v,m,w]);let S=o.useCallback(e=>{if(!n&&!r||w.paused)return;let t="Tab"===e.key&&!e.altKey&&!e.ctrlKey&&!e.metaKey,o=document.activeElement;if(t&&o){let t=e.currentTarget,[r,a]=function(e){let t=C(e);return[N(t,e),N(t.reverse(),e)]}(t);r&&a?e.shiftKey||o!==a?e.shiftKey&&o===r&&(e.preventDefault(),n&&x(a,{select:!0})):(e.preventDefault(),n&&x(r,{select:!0})):o===t&&e.preventDefault()}},[n,r,w.paused]);return(0,f.jsx)(s.WV.div,{tabIndex:-1,...l,ref:g,onKeyDown:S})});function C(e){let t=[],n=document.createTreeWalker(e,NodeFilter.SHOW_ELEMENT,{acceptNode:e=>{let t="INPUT"===e.tagName&&"hidden"===e.type;return e.disabled||e.hidden||t?NodeFilter.FILTER_SKIP:e.tabIndex>=0?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_SKIP}});for(;n.nextNode();)t.push(n.currentNode);return t}function N(e,t){for(let n of e)if(!function(e,t){let{upTo:n}=t;if("hidden"===getComputedStyle(e).visibility)return!0;for(;e&&(void 0===n||e!==n);){if("none"===getComputedStyle(e).display)return!0;e=e.parentElement}return!1}(n,{upTo:t}))return n}function x(e){let{select:t=!1}=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};if(e&&e.focus){var n;let r=document.activeElement;e.focus({preventScroll:!0}),e!==r&&(n=e)instanceof HTMLInputElement&&"select"in n&&t&&e.select()}}w.displayName="FocusScope";var R=function(){let e=[];return{add(t){let n=e[0];t!==n&&(null==n||n.pause()),(e=S(e,t)).unshift(t)},remove(t){var n;null===(n=(e=S(e,t))[0])||void 0===n||n.resume()}}}();function S(e,t){let n=[...e],r=n.indexOf(t);return -1!==r&&n.splice(r,1),n}var M=n(3458),O=n(32316),D=o.forwardRef((e,t)=>{var n,r;let{container:a,...i}=e,[u,l]=o.useState(!1);(0,O.b)(()=>l(!0),[]);let c=a||u&&(null===(r=globalThis)||void 0===r?void 0:null===(n=r.document)||void 0===n?void 0:n.body);return c?M.createPortal((0,f.jsx)(s.WV.div,{...i,ref:t}),c):null});D.displayName="Portal";var T=n(72305),P=0;function L(){let e=document.createElement("span");return e.setAttribute("data-radix-focus-guard",""),e.tabIndex=0,e.style.outline="none",e.style.opacity="0",e.style.position="fixed",e.style.pointerEvents="none",e}var j=n(53176),A=n(78001),W=n(3417),k=(0,n(36650)._)(),I=function(){},F=o.forwardRef(function(e,t){var n=o.useRef(null),r=o.useState({onScrollCapture:I,onWheelCapture:I,onTouchMoveCapture:I}),a=r[0],i=r[1],u=e.forwardProps,l=e.children,c=e.className,s=e.removeScrollBar,d=e.enabled,f=e.shards,p=e.sideCar,v=e.noIsolation,m=e.inert,h=e.allowPinchZoom,g=e.as,y=e.gapMode,b=(0,j._T)(e,["forwardProps","children","className","removeScrollBar","enabled","shards","sideCar","noIsolation","inert","allowPinchZoom","as","gapMode"]),E=(0,W.q)([n,t]),w=(0,j.pi)((0,j.pi)({},b),a);return o.createElement(o.Fragment,null,d&&o.createElement(p,{sideCar:k,removeScrollBar:s,shards:f,noIsolation:v,inert:m,setCallbacks:i,allowPinchZoom:!!h,lockRef:n,gapMode:y}),u?o.cloneElement(o.Children.only(l),(0,j.pi)((0,j.pi)({},w),{ref:E})):o.createElement(void 0===g?"div":g,(0,j.pi)({},w,{className:c,ref:E}),l))});F.defaultProps={enabled:!0,removeScrollBar:!0,inert:!1},F.classNames={fullWidth:A.zi,zeroRight:A.pF};var _=n(63021),V=n(17006),B=n(61228),z=!1;if("undefined"!=typeof window)try{var U=Object.defineProperty({},"passive",{get:function(){return z=!0,!0}});window.addEventListener("test",U,U),window.removeEventListener("test",U,U)}catch(e){z=!1}var K=!!z&&{passive:!1},$=function(e,t){if(!(e instanceof Element))return!1;var n=window.getComputedStyle(e);return"hidden"!==n[t]&&!(n.overflowY===n.overflowX&&"TEXTAREA"!==e.tagName&&"visible"===n[t])},Y=function(e,t){var n=t.ownerDocument,r=t;do{if("undefined"!=typeof ShadowRoot&&r instanceof ShadowRoot&&(r=r.host),H(e,r)){var o=X(e,r);if(o[1]>o[2])return!0}r=r.parentNode}while(r&&r!==n.body);return!1},H=function(e,t){return"v"===e?$(t,"overflowY"):$(t,"overflowX")},X=function(e,t){return"v"===e?[t.scrollTop,t.scrollHeight,t.clientHeight]:[t.scrollLeft,t.scrollWidth,t.clientWidth]},q=function(e,t,n,r,o){var a,i=(a=window.getComputedStyle(t).direction,"h"===e&&"rtl"===a?-1:1),u=i*r,l=n.target,c=t.contains(l),s=!1,d=u>0,f=0,p=0;do{var v=X(e,l),m=v[0],h=v[1]-v[2]-i*m;(m||h)&&H(e,l)&&(f+=h,p+=m),l instanceof ShadowRoot?l=l.host:l=l.parentNode}while(!c&&l!==document.body||c&&(t.contains(l)||t===l));return d&&(o&&1>Math.abs(f)||!o&&u>f)?s=!0:!d&&(o&&1>Math.abs(p)||!o&&-u>p)&&(s=!0),s},Z=function(e){return"changedTouches"in e?[e.changedTouches[0].clientX,e.changedTouches[0].clientY]:[0,0]},G=function(e){return[e.deltaX,e.deltaY]},J=function(e){return e&&"current"in e?e.current:e},Q=0,ee=[];let et=(0,_.L)(k,function(e){var t=o.useRef([]),n=o.useRef([0,0]),r=o.useRef(),a=o.useState(Q++)[0],i=o.useState(B.Ws)[0],u=o.useRef(e);o.useEffect(function(){u.current=e},[e]),o.useEffect(function(){if(e.inert){document.body.classList.add("block-interactivity-".concat(a));var t=(0,j.ev)([e.lockRef.current],(e.shards||[]).map(J),!0).filter(Boolean);return t.forEach(function(e){return e.classList.add("allow-interactivity-".concat(a))}),function(){document.body.classList.remove("block-interactivity-".concat(a)),t.forEach(function(e){return e.classList.remove("allow-interactivity-".concat(a))})}}},[e.inert,e.lockRef.current,e.shards]);var l=o.useCallback(function(e,t){if("touches"in e&&2===e.touches.length||"wheel"===e.type&&e.ctrlKey)return!u.current.allowPinchZoom;var o,a=Z(e),i=n.current,l="deltaX"in e?e.deltaX:i[0]-a[0],c="deltaY"in e?e.deltaY:i[1]-a[1],s=e.target,d=Math.abs(l)>Math.abs(c)?"h":"v";if("touches"in e&&"h"===d&&"range"===s.type)return!1;var f=Y(d,s);if(!f)return!0;if(f?o=d:(o="v"===d?"h":"v",f=Y(d,s)),!f)return!1;if(!r.current&&"changedTouches"in e&&(l||c)&&(r.current=o),!o)return!0;var p=r.current||o;return q(p,t,e,"h"===p?l:c,!0)},[]),c=o.useCallback(function(e){if(ee.length&&ee[ee.length-1]===i){var n="deltaY"in e?G(e):Z(e),r=t.current.filter(function(t){var r;return t.name===e.type&&(t.target===e.target||e.target===t.shadowParent)&&(r=t.delta)[0]===n[0]&&r[1]===n[1]})[0];if(r&&r.should){e.cancelable&&e.preventDefault();return}if(!r){var o=(u.current.shards||[]).map(J).filter(Boolean).filter(function(t){return t.contains(e.target)});(o.length>0?l(e,o[0]):!u.current.noIsolation)&&e.cancelable&&e.preventDefault()}}},[]),s=o.useCallback(function(e,n,r,o){var a={name:e,delta:n,target:r,should:o,shadowParent:function(e){for(var t=null;null!==e;)e instanceof ShadowRoot&&(t=e.host,e=e.host),e=e.parentNode;return t}(r)};t.current.push(a),setTimeout(function(){t.current=t.current.filter(function(e){return e!==a})},1)},[]),d=o.useCallback(function(e){n.current=Z(e),r.current=void 0},[]),f=o.useCallback(function(t){s(t.type,G(t),t.target,l(t,e.lockRef.current))},[]),p=o.useCallback(function(t){s(t.type,Z(t),t.target,l(t,e.lockRef.current))},[]);o.useEffect(function(){return ee.push(i),e.setCallbacks({onScrollCapture:f,onWheelCapture:f,onTouchMoveCapture:p}),document.addEventListener("wheel",c,K),document.addEventListener("touchmove",c,K),document.addEventListener("touchstart",d,K),function(){ee=ee.filter(function(e){return e!==i}),document.removeEventListener("wheel",c,K),document.removeEventListener("touchmove",c,K),document.removeEventListener("touchstart",d,K)}},[]);var v=e.removeScrollBar,m=e.inert;return o.createElement(o.Fragment,null,m?o.createElement(i,{styles:"\n  .block-interactivity-".concat(a," {pointer-events: none;}\n  .allow-interactivity-").concat(a," {pointer-events: all;}\n")}):null,v?o.createElement(V.jp,{gapMode:e.gapMode}):null)});var en=o.forwardRef(function(e,t){return o.createElement(F,(0,j.pi)({},e,{ref:t,sideCar:et}))});en.classNames=F.classNames;var er=n(11825),eo=n(92721),ea="Dialog",[ei,eu]=(0,u.b)(ea),[el,ec]=ei(ea),es=e=>{let{__scopeDialog:t,children:n,open:r,defaultOpen:a,onOpenChange:i,modal:u=!0}=e,s=o.useRef(null),d=o.useRef(null),[p=!1,v]=(0,c.T)({prop:r,defaultProp:a,onChange:i});return(0,f.jsx)(el,{scope:t,triggerRef:s,contentRef:d,contentId:(0,l.M)(),titleId:(0,l.M)(),descriptionId:(0,l.M)(),open:p,onOpenChange:v,onOpenToggle:o.useCallback(()=>v(e=>!e),[v]),modal:u,children:n})};es.displayName=ea;var ed="DialogTrigger",ef=o.forwardRef((e,t)=>{let{__scopeDialog:n,...r}=e,o=ec(ed,n),u=(0,i.e)(t,o.triggerRef);return(0,f.jsx)(s.WV.button,{type:"button","aria-haspopup":"dialog","aria-expanded":o.open,"aria-controls":o.contentId,"data-state":eP(o.open),...r,ref:u,onClick:(0,a.M)(e.onClick,o.onOpenToggle)})});ef.displayName=ed;var ep="DialogPortal",[ev,em]=ei(ep,{forceMount:void 0}),eh=e=>{let{__scopeDialog:t,forceMount:n,children:r,container:a}=e,i=ec(ep,t);return(0,f.jsx)(ev,{scope:t,forceMount:n,children:o.Children.map(r,e=>(0,f.jsx)(T.z,{present:n||i.open,children:(0,f.jsx)(D,{asChild:!0,container:a,children:e})}))})};eh.displayName=ep;var eg="DialogOverlay",ey=o.forwardRef((e,t)=>{let n=em(eg,e.__scopeDialog),{forceMount:r=n.forceMount,...o}=e,a=ec(eg,e.__scopeDialog);return a.modal?(0,f.jsx)(T.z,{present:r||a.open,children:(0,f.jsx)(eb,{...o,ref:t})}):null});ey.displayName=eg;var eb=o.forwardRef((e,t)=>{let{__scopeDialog:n,...r}=e,o=ec(eg,n);return(0,f.jsx)(en,{as:eo.g7,allowPinchZoom:!0,shards:[o.contentRef],children:(0,f.jsx)(s.WV.div,{"data-state":eP(o.open),...r,ref:t,style:{pointerEvents:"auto",...r.style}})})}),eE="DialogContent",ew=o.forwardRef((e,t)=>{let n=em(eE,e.__scopeDialog),{forceMount:r=n.forceMount,...o}=e,a=ec(eE,e.__scopeDialog);return(0,f.jsx)(T.z,{present:r||a.open,children:a.modal?(0,f.jsx)(eC,{...o,ref:t}):(0,f.jsx)(eN,{...o,ref:t})})});ew.displayName=eE;var eC=o.forwardRef((e,t)=>{let n=ec(eE,e.__scopeDialog),r=o.useRef(null),u=(0,i.e)(t,n.contentRef,r);return o.useEffect(()=>{let e=r.current;if(e)return(0,er.Ry)(e)},[]),(0,f.jsx)(ex,{...e,ref:u,trapFocus:n.open,disableOutsidePointerEvents:!0,onCloseAutoFocus:(0,a.M)(e.onCloseAutoFocus,e=>{var t;e.preventDefault(),null===(t=n.triggerRef.current)||void 0===t||t.focus()}),onPointerDownOutside:(0,a.M)(e.onPointerDownOutside,e=>{let t=e.detail.originalEvent,n=0===t.button&&!0===t.ctrlKey;(2===t.button||n)&&e.preventDefault()}),onFocusOutside:(0,a.M)(e.onFocusOutside,e=>e.preventDefault())})}),eN=o.forwardRef((e,t)=>{let n=ec(eE,e.__scopeDialog),r=o.useRef(!1),a=o.useRef(!1);return(0,f.jsx)(ex,{...e,ref:t,trapFocus:!1,disableOutsidePointerEvents:!1,onCloseAutoFocus:t=>{var o,i;null===(o=e.onCloseAutoFocus)||void 0===o||o.call(e,t),t.defaultPrevented||(r.current||null===(i=n.triggerRef.current)||void 0===i||i.focus(),t.preventDefault()),r.current=!1,a.current=!1},onInteractOutside:t=>{var o,i;null===(o=e.onInteractOutside)||void 0===o||o.call(e,t),t.defaultPrevented||(r.current=!0,"pointerdown"!==t.detail.originalEvent.type||(a.current=!0));let u=t.target;(null===(i=n.triggerRef.current)||void 0===i?void 0:i.contains(u))&&t.preventDefault(),"focusin"===t.detail.originalEvent.type&&a.current&&t.preventDefault()}})}),ex=o.forwardRef((e,t)=>{let{__scopeDialog:n,trapFocus:r,onOpenAutoFocus:a,onCloseAutoFocus:u,...l}=e,c=ec(eE,n),s=o.useRef(null),d=(0,i.e)(t,s);return o.useEffect(()=>{var e,t;let n=document.querySelectorAll("[data-radix-focus-guard]");return document.body.insertAdjacentElement("afterbegin",null!==(e=n[0])&&void 0!==e?e:L()),document.body.insertAdjacentElement("beforeend",null!==(t=n[1])&&void 0!==t?t:L()),P++,()=>{1===P&&document.querySelectorAll("[data-radix-focus-guard]").forEach(e=>e.remove()),P--}},[]),(0,f.jsxs)(f.Fragment,{children:[(0,f.jsx)(w,{asChild:!0,loop:!0,trapped:r,onMountAutoFocus:a,onUnmountAutoFocus:u,children:(0,f.jsx)(m,{role:"dialog",id:c.contentId,"aria-describedby":c.descriptionId,"aria-labelledby":c.titleId,"data-state":eP(c.open),...l,ref:d,onDismiss:()=>c.onOpenChange(!1)})}),(0,f.jsxs)(f.Fragment,{children:[(0,f.jsx)(eW,{titleId:c.titleId}),(0,f.jsx)(ek,{contentRef:s,descriptionId:c.descriptionId})]})]})}),eR="DialogTitle",eS=o.forwardRef((e,t)=>{let{__scopeDialog:n,...r}=e,o=ec(eR,n);return(0,f.jsx)(s.WV.h2,{id:o.titleId,...r,ref:t})});eS.displayName=eR;var eM="DialogDescription",eO=o.forwardRef((e,t)=>{let{__scopeDialog:n,...r}=e,o=ec(eM,n);return(0,f.jsx)(s.WV.p,{id:o.descriptionId,...r,ref:t})});eO.displayName=eM;var eD="DialogClose",eT=o.forwardRef((e,t)=>{let{__scopeDialog:n,...r}=e,o=ec(eD,n);return(0,f.jsx)(s.WV.button,{type:"button",...r,ref:t,onClick:(0,a.M)(e.onClick,()=>o.onOpenChange(!1))})});function eP(e){return e?"open":"closed"}eT.displayName=eD;var eL="DialogTitleWarning",[ej,eA]=(0,u.k)(eL,{contentName:eE,titleName:eR,docsSlug:"dialog"}),eW=e=>{let{titleId:t}=e,n=eA(eL),r="`".concat(n.contentName,"` requires a `").concat(n.titleName,"` for the component to be accessible for screen reader users.\n\nIf you want to hide the `").concat(n.titleName,"`, you can wrap it with our VisuallyHidden component.\n\nFor more information, see https://radix-ui.com/primitives/docs/components/").concat(n.docsSlug);return o.useEffect(()=>{t&&!document.getElementById(t)&&console.error(r)},[r,t]),null},ek=e=>{let{contentRef:t,descriptionId:n}=e,r=eA("DialogDescriptionWarning"),a="Warning: Missing `Description` or `aria-describedby={undefined}` for {".concat(r.contentName,"}.");return o.useEffect(()=>{var e;let r=null===(e=t.current)||void 0===e?void 0:e.getAttribute("aria-describedby");n&&r&&!document.getElementById(n)&&console.warn(a)},[a,t,n]),null},eI=es,eF=ef,e_=eh,eV=ey,eB=ew,ez=eS,eU=eO,eK=eT},52608:(e,t,n)=>{n.d(t,{M:()=>l});var r,o=n(7653),a=n(32316),i=(r||(r=n.t(o,2)))["useId".toString()]||(()=>void 0),u=0;function l(e){let[t,n]=o.useState(i());return(0,a.b)(()=>{e||n(e=>e??String(u++))},[e]),e||(t?`radix-${t}`:"")}},72305:(e,t,n)=>{n.d(t,{z:()=>i});var r=n(7653),o=n(18497),a=n(32316),i=e=>{let{present:t,children:n}=e,i=function(e){var t,n;let[o,i]=r.useState(),l=r.useRef({}),c=r.useRef(e),s=r.useRef("none"),[d,f]=(t=e?"mounted":"unmounted",n={mounted:{UNMOUNT:"unmounted",ANIMATION_OUT:"unmountSuspended"},unmountSuspended:{MOUNT:"mounted",ANIMATION_END:"unmounted"},unmounted:{MOUNT:"mounted"}},r.useReducer((e,t)=>{let r=n[e][t];return null!=r?r:e},t));return r.useEffect(()=>{let e=u(l.current);s.current="mounted"===d?e:"none"},[d]),(0,a.b)(()=>{let t=l.current,n=c.current;if(n!==e){let r=s.current,o=u(t);e?f("MOUNT"):"none"===o||(null==t?void 0:t.display)==="none"?f("UNMOUNT"):n&&r!==o?f("ANIMATION_OUT"):f("UNMOUNT"),c.current=e}},[e,f]),(0,a.b)(()=>{if(o){var e;let t;let n=null!==(e=o.ownerDocument.defaultView)&&void 0!==e?e:window,r=e=>{let r=u(l.current).includes(e.animationName);if(e.target===o&&r&&(f("ANIMATION_END"),!c.current)){let e=o.style.animationFillMode;o.style.animationFillMode="forwards",t=n.setTimeout(()=>{"forwards"===o.style.animationFillMode&&(o.style.animationFillMode=e)})}},a=e=>{e.target===o&&(s.current=u(l.current))};return o.addEventListener("animationstart",a),o.addEventListener("animationcancel",r),o.addEventListener("animationend",r),()=>{n.clearTimeout(t),o.removeEventListener("animationstart",a),o.removeEventListener("animationcancel",r),o.removeEventListener("animationend",r)}}f("ANIMATION_END")},[o,f]),{isPresent:["mounted","unmountSuspended"].includes(d),ref:r.useCallback(e=>{e&&(l.current=getComputedStyle(e)),i(e)},[])}}(t),l="function"==typeof n?n({present:i.isPresent}):r.Children.only(n),c=(0,o.e)(i.ref,function(e){var t,n;let r=null===(t=Object.getOwnPropertyDescriptor(e.props,"ref"))||void 0===t?void 0:t.get,o=r&&"isReactWarning"in r&&r.isReactWarning;return o?e.ref:(o=(r=null===(n=Object.getOwnPropertyDescriptor(e,"ref"))||void 0===n?void 0:n.get)&&"isReactWarning"in r&&r.isReactWarning)?e.props.ref:e.props.ref||e.ref}(l));return"function"==typeof n||i.isPresent?r.cloneElement(l,{ref:c}):null};function u(e){return(null==e?void 0:e.animationName)||"none"}i.displayName="Presence"},76646:(e,t,n)=>{n.d(t,{WV:()=>u,jH:()=>l});var r=n(7653),o=n(3458),a=n(92721),i=n(27573),u=["a","button","div","form","h2","h3","img","input","label","li","nav","ol","p","span","svg","ul"].reduce((e,t)=>{let n=r.forwardRef((e,n)=>{let{asChild:r,...o}=e,u=r?a.g7:t;return"undefined"!=typeof window&&(window[Symbol.for("radix-ui")]=!0),(0,i.jsx)(u,{...o,ref:n})});return n.displayName=`Primitive.${t}`,{...e,[t]:n}},{});function l(e,t){e&&o.flushSync(()=>e.dispatchEvent(t))}},92721:(e,t,n)=>{n.d(t,{g7:()=>i});var r=n(7653),o=n(18497),a=n(27573),i=r.forwardRef((e,t)=>{let{children:n,...o}=e,i=r.Children.toArray(n),l=i.find(c);if(l){let e=l.props.children,n=i.map(t=>t!==l?t:r.Children.count(e)>1?r.Children.only(null):r.isValidElement(e)?e.props.children:null);return(0,a.jsx)(u,{...o,ref:t,children:r.isValidElement(e)?r.cloneElement(e,void 0,n):null})}return(0,a.jsx)(u,{...o,ref:t,children:n})});i.displayName="Slot";var u=r.forwardRef((e,t)=>{let{children:n,...a}=e;if(r.isValidElement(n)){let e=function(e){let t=Object.getOwnPropertyDescriptor(e.props,"ref")?.get,n=t&&"isReactWarning"in t&&t.isReactWarning;return n?e.ref:(n=(t=Object.getOwnPropertyDescriptor(e,"ref")?.get)&&"isReactWarning"in t&&t.isReactWarning)?e.props.ref:e.props.ref||e.ref}(n);return r.cloneElement(n,{...function(e,t){let n={...t};for(let r in t){let o=e[r],a=t[r];/^on[A-Z]/.test(r)?o&&a?n[r]=(...e)=>{a(...e),o(...e)}:o&&(n[r]=o):"style"===r?n[r]={...o,...a}:"className"===r&&(n[r]=[o,a].filter(Boolean).join(" "))}return{...e,...n}}(a,n.props),ref:t?(0,o.F)(t,e):e})}return r.Children.count(n)>1?r.Children.only(null):null});u.displayName="SlotClone";var l=({children:e})=>(0,a.jsx)(a.Fragment,{children:e});function c(e){return r.isValidElement(e)&&e.type===l}},63465:(e,t,n)=>{n.d(t,{W:()=>o});var r=n(7653);function o(e){let t=r.useRef(e);return r.useEffect(()=>{t.current=e}),r.useMemo(()=>(...e)=>t.current?.(...e),[])}},65192:(e,t,n)=>{n.d(t,{T:()=>a});var r=n(7653),o=n(63465);function a({prop:e,defaultProp:t,onChange:n=()=>{}}){let[a,i]=function({defaultProp:e,onChange:t}){let n=r.useState(e),[a]=n,i=r.useRef(a),u=(0,o.W)(t);return r.useEffect(()=>{i.current!==a&&(u(a),i.current=a)},[a,i,u]),n}({defaultProp:t,onChange:n}),u=void 0!==e,l=u?e:a,c=(0,o.W)(n);return[l,r.useCallback(t=>{if(u){let n="function"==typeof t?t(e):t;n!==e&&c(n)}else i(t)},[u,e,i,c])]}},32316:(e,t,n)=>{n.d(t,{b:()=>o});var r=n(7653),o=globalThis?.document?r.useLayoutEffect:()=>{}},53176:(e,t,n)=>{n.d(t,{_T:()=>o,ev:()=>a,pi:()=>r});var r=function(){return(r=Object.assign||function(e){for(var t,n=1,r=arguments.length;n<r;n++)for(var o in t=arguments[n])Object.prototype.hasOwnProperty.call(t,o)&&(e[o]=t[o]);return e}).apply(this,arguments)};function o(e,t){var n={};for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&0>t.indexOf(r)&&(n[r]=e[r]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols)for(var o=0,r=Object.getOwnPropertySymbols(e);o<r.length;o++)0>t.indexOf(r[o])&&Object.prototype.propertyIsEnumerable.call(e,r[o])&&(n[r[o]]=e[r[o]]);return n}function a(e,t,n){if(n||2==arguments.length)for(var r,o=0,a=t.length;o<a;o++)!r&&o in t||(r||(r=Array.prototype.slice.call(t,0,o)),r[o]=t[o]);return e.concat(r||Array.prototype.slice.call(t))}Object.create,Object.create,"function"==typeof SuppressedError&&SuppressedError}}]);