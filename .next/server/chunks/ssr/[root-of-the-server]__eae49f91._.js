module.exports=[18622,(a,b,c)=>{b.exports=a.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(a,b,c)=>{b.exports=a.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(a,b,c)=>{b.exports=a.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},20635,(a,b,c)=>{b.exports=a.x("next/dist/server/app-render/action-async-storage.external.js",()=>require("next/dist/server/app-render/action-async-storage.external.js"))},24725,(a,b,c)=>{b.exports=a.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},43285,(a,b,c)=>{b.exports=a.x("next/dist/server/app-render/dynamic-access-async-storage.external.js",()=>require("next/dist/server/app-render/dynamic-access-async-storage.external.js"))},38783,(a,b,c)=>{"use strict";b.exports=a.r(42602).vendored["react-ssr"].ReactServerDOMTurbopackClient},42602,(a,b,c)=>{"use strict";b.exports=a.r(18622)},72131,(a,b,c)=>{"use strict";b.exports=a.r(42602).vendored["react-ssr"].React},87924,(a,b,c)=>{"use strict";b.exports=a.r(42602).vendored["react-ssr"].ReactJsxRuntime},9270,(a,b,c)=>{"use strict";b.exports=a.r(42602).vendored.contexts.AppRouterContext},36313,(a,b,c)=>{"use strict";b.exports=a.r(42602).vendored.contexts.HooksClientContext},18341,(a,b,c)=>{"use strict";b.exports=a.r(42602).vendored.contexts.ServerInsertedHtml},35112,(a,b,c)=>{"use strict";b.exports=a.r(42602).vendored["react-ssr"].ReactDOM},33463,(a,b,c)=>{"use strict";function d(a){if("function"!=typeof WeakMap)return null;var b=new WeakMap,c=new WeakMap;return(d=function(a){return a?c:b})(a)}c._=function(a,b){if(!b&&a&&a.__esModule)return a;if(null===a||"object"!=typeof a&&"function"!=typeof a)return{default:a};var c=d(b);if(c&&c.has(a))return c.get(a);var e={__proto__:null},f=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var g in a)if("default"!==g&&Object.prototype.hasOwnProperty.call(a,g)){var h=f?Object.getOwnPropertyDescriptor(a,g):null;h&&(h.get||h.set)?Object.defineProperty(e,g,h):e[g]=a[g]}return e.default=a,c&&c.set(a,e),e}},39118,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0});var d={DEFAULT_SEGMENT_KEY:function(){return l},NOT_FOUND_SEGMENT_KEY:function(){return m},PAGE_SEGMENT_KEY:function(){return k},addSearchParamsIfPageSegment:function(){return i},computeSelectedLayoutSegment:function(){return j},getSegmentValue:function(){return f},getSelectedLayoutSegmentPath:function(){return function a(b,c,d=!0,e=[]){let g;if(d)g=b[1][c];else{let a=b[1];g=a.children??Object.values(a)[0]}if(!g)return e;let h=f(g[0]);return!h||h.startsWith(k)?e:(e.push(h),a(g,c,!1,e))}},isGroupSegment:function(){return g},isParallelRouteSegment:function(){return h}};for(var e in d)Object.defineProperty(c,e,{enumerable:!0,get:d[e]});function f(a){return Array.isArray(a)?a[1]:a}function g(a){return"("===a[0]&&a.endsWith(")")}function h(a){return a.startsWith("@")&&"@children"!==a}function i(a,b){if(a.includes(k)){let a=JSON.stringify(b);return"{}"!==a?k+"?"+a:k}return a}function j(a,b){if(!a||0===a.length)return null;let c="children"===b?a[0]:a[a.length-1];return c===l?null:c}let k="__PAGE__",l="__DEFAULT__",m="/_not-found"},88347,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0});var d,e={ACTION_HMR_REFRESH:function(){return k},ACTION_NAVIGATE:function(){return h},ACTION_REFRESH:function(){return g},ACTION_RESTORE:function(){return i},ACTION_SERVER_ACTION:function(){return l},ACTION_SERVER_PATCH:function(){return j},PrefetchKind:function(){return m}};for(var f in e)Object.defineProperty(c,f,{enumerable:!0,get:e[f]});let g="refresh",h="navigate",i="restore",j="server-patch",k="hmr-refresh",l="server-action";var m=((d={}).AUTO="auto",d.FULL="full",d);("function"==typeof c.default||"object"==typeof c.default&&null!==c.default)&&void 0===c.default.__esModule&&(Object.defineProperty(c.default,"__esModule",{value:!0}),Object.assign(c.default,c),b.exports=c.default)},67009,(a,b,c)=>{"use strict";function d(a){return null!==a&&"object"==typeof a&&"then"in a&&"function"==typeof a.then}Object.defineProperty(c,"__esModule",{value:!0}),Object.defineProperty(c,"isThenable",{enumerable:!0,get:function(){return d}})},90841,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0});var d={dispatchAppRouterAction:function(){return i},useActionQueue:function(){return j}};for(var e in d)Object.defineProperty(c,e,{enumerable:!0,get:d[e]});let f=a.r(33463)._(a.r(72131)),g=a.r(67009),h=null;function i(a){if(null===h)throw Object.defineProperty(Error("Internal Next.js error: Router action dispatched before initialization."),"__NEXT_ERROR_CODE",{value:"E668",enumerable:!1,configurable:!0});h(a)}function j(a){let[b,c]=f.default.useState(a.state);h=b=>a.dispatch(b,c);let d=(0,f.useMemo)(()=>b,[b]);return(0,g.isThenable)(d)?(0,f.use)(d):d}("function"==typeof c.default||"object"==typeof c.default&&null!==c.default)&&void 0===c.default.__esModule&&(Object.defineProperty(c.default,"__esModule",{value:!0}),Object.assign(c.default,c),b.exports=c.default)},20611,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0}),Object.defineProperty(c,"callServer",{enumerable:!0,get:function(){return g}});let d=a.r(72131),e=a.r(88347),f=a.r(90841);async function g(a,b){return new Promise((c,g)=>{(0,d.startTransition)(()=>{(0,f.dispatchAppRouterAction)({type:e.ACTION_SERVER_ACTION,actionId:a,actionArgs:b,resolve:c,reject:g})})})}("function"==typeof c.default||"object"==typeof c.default&&null!==c.default)&&void 0===c.default.__esModule&&(Object.defineProperty(c.default,"__esModule",{value:!0}),Object.assign(c.default,c),b.exports=c.default)},1722,(a,b,c)=>{"use strict";let d;Object.defineProperty(c,"__esModule",{value:!0}),Object.defineProperty(c,"findSourceMapURL",{enumerable:!0,get:function(){return d}});("function"==typeof c.default||"object"==typeof c.default&&null!==c.default)&&void 0===c.default.__esModule&&(Object.defineProperty(c.default,"__esModule",{value:!0}),Object.assign(c.default,c),b.exports=c.default)},68063,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0});var d={getDeploymentId:function(){return f},getDeploymentIdQueryOrEmptyString:function(){return g}};for(var e in d)Object.defineProperty(c,e,{enumerable:!0,get:d[e]});function f(){return!1}function g(){return""}},64475,a=>{"use strict";let b=process.env.NEXT_PUBLIC_API_URL||"http://localhost:8000";async function c(a){let c=await fetch(`${b}/api/students/check`,{headers:{Authorization:`Bearer ${a}`}});if(!c.ok){let a=await c.text();throw console.error(`[checkOnboardingStatus] Failed: ${c.status} ${c.statusText}`,a),Error(`Failed to check onboarding status: ${c.status} ${c.statusText} - ${a}`)}return c.json()}async function d(a,c){let d=await fetch(`${b}/api/students`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${c}`},body:JSON.stringify(a)});if(!d.ok)throw Error("Failed to create student profile");return d.json()}async function e(a,c){let d=await fetch(`${b}/api/teachers`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${c}`},body:JSON.stringify(a)});if(!d.ok)throw Error("Failed to create teacher profile");return d.json()}async function f(a,c,d=null){let e=`${b}/api/teachers/me`;d&&(e+=`?language=${encodeURIComponent(d)}`);let g=await fetch(e,{method:"PATCH",headers:{"Content-Type":"application/json",Authorization:`Bearer ${c}`},body:JSON.stringify(a)});if(!g.ok){let a=await g.text();throw Error(`Failed to update teacher profile: ${a}`)}return g.json()}async function g(a,c){let d=await fetch(`${b}/api/students/check-username?username=${a}`,{headers:{Authorization:`Bearer ${c}`}});if(!d.ok)throw Error("Failed to check username availability");return d.json()}async function h(a,c){let d=await fetch(`${b}/api/students/me/privacy`,{method:"PATCH",headers:{"Content-Type":"application/json",Authorization:`Bearer ${c}`},body:JSON.stringify(a)});if(!d.ok)throw Error("Failed to update privacy settings");return d.json()}async function i(a){let c=await fetch(`${b}/api/profiles/${a}`);if(!c.ok)throw Error(await c.text()||"Failed to fetch public profile");return c.json()}a.s(["checkOnboardingStatus",()=>c,"checkUsernameAvailability",()=>g,"createStudentProfile",()=>d,"createTeacherProfile",()=>e,"getPublicProfile",()=>i,"updatePrivacySettings",()=>h,"updateTeacherProfile",()=>f])},90914,a=>{"use strict";var b=a.i(87924),c=a.i(72131),d=a.i(76267),e=a.i(63944),f=a.i(64475);let g=(0,c.createContext)();a.s(["ProfileProvider",0,({children:a})=>{let{isLoaded:h,user:i}=(0,e.useUser)(),{getToken:j}=(0,d.useAuth)(),[k,l]=(0,c.useState)([]),[m,n]=(0,c.useState)(null),[o,p]=(0,c.useState)(!0),q=(0,c.useCallback)(async()=>{if(!i){l([]),n(null),p(!1);return}try{p(!0);let a=await j(),b=await (0,f.checkOnboardingStatus)(a);if(b.isComplete&&b.profiles){l(b.profiles);let a=localStorage.getItem("active_profile_id"),c=b.profiles.find(b=>b.id===a);c?n(c):n(b.profiles[0])}else l([]),n(null)}catch(a){console.error("Error fetching profiles:",a)}finally{p(!1)}},[i,j]);(0,c.useEffect)(()=>{h&&q()},[h,i,q]);let r={profiles:k,activeProfile:m,isLoading:o,switchProfile:a=>{n(a),localStorage.setItem("active_profile_id",a.id);let b=a.language||a.primaryLanguage;b&&localStorage.setItem("learning_lang",b.toLowerCase().substring(0,2))},refreshProfiles:q,role:m?.role||null,language:m?.language||null};return(0,b.jsx)(g.Provider,{value:r,children:a})},"useProfile",0,()=>{let a=(0,c.useContext)(g);if(!a)throw Error("useProfile must be used within a ProfileProvider");return a}])},50194,a=>{"use strict";var b=a.i(87924),c=a.i(72131),d=a.i(90914);let e=(0,c.createContext)();a.s(["LanguageProvider",0,({children:a})=>{let{activeProfile:f}=(0,d.useProfile)(),[g,h]=(0,c.useState)("fr"),[i,j]=(0,c.useState)("en");return(0,c.useEffect)(()=>{let a=localStorage.getItem("learning_lang");a&&h(a);let b=localStorage.getItem("known_lang");b&&j(b)},[]),(0,c.useEffect)(()=>{f&&f.language&&h(f.language.toLowerCase().substring(0,2))},[f]),(0,c.useEffect)(()=>{localStorage.setItem("learning_lang",g),localStorage.setItem("known_lang",i)},[g,i]),(0,b.jsx)(e.Provider,{value:{learningLang:g,setLearningLang:h,knownLang:i,setKnownLang:j},children:a})},"useLanguage",0,()=>{let a=(0,c.useContext)(e);if(!a)throw Error("useLanguage must be used within a LanguageProvider");return a}])},6704,a=>{"use strict";let b,c;var d,e=a.i(72131);let f={data:""},g=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,h=/\/\*[^]*?\*\/|  +/g,i=/\n+/g,j=(a,b)=>{let c="",d="",e="";for(let f in a){let g=a[f];"@"==f[0]?"i"==f[1]?c=f+" "+g+";":d+="f"==f[1]?j(g,f):f+"{"+j(g,"k"==f[1]?"":b)+"}":"object"==typeof g?d+=j(g,b?b.replace(/([^,])+/g,a=>f.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,b=>/&/.test(b)?b.replace(/&/g,a):a?a+" "+b:b)):f):null!=g&&(f=/^--/.test(f)?f:f.replace(/[A-Z]/g,"-$&").toLowerCase(),e+=j.p?j.p(f,g):f+":"+g+";")}return c+(b&&e?b+"{"+e+"}":e)+d},k={},l=a=>{if("object"==typeof a){let b="";for(let c in a)b+=c+l(a[c]);return b}return a};function m(a){let b,c,d=this||{},e=a.call?a(d.p):a;return((a,b,c,d,e)=>{var f;let m=l(a),n=k[m]||(k[m]=(a=>{let b=0,c=11;for(;b<a.length;)c=101*c+a.charCodeAt(b++)>>>0;return"go"+c})(m));if(!k[n]){let b=m!==a?a:(a=>{let b,c,d=[{}];for(;b=g.exec(a.replace(h,""));)b[4]?d.shift():b[3]?(c=b[3].replace(i," ").trim(),d.unshift(d[0][c]=d[0][c]||{})):d[0][b[1]]=b[2].replace(i," ").trim();return d[0]})(a);k[n]=j(e?{["@keyframes "+n]:b}:b,c?"":"."+n)}let o=c&&k.g?k.g:null;return c&&(k.g=k[n]),f=k[n],o?b.data=b.data.replace(o,f):-1===b.data.indexOf(f)&&(b.data=d?f+b.data:b.data+f),n})(e.unshift?e.raw?(b=[].slice.call(arguments,1),c=d.p,e.reduce((a,d,e)=>{let f=b[e];if(f&&f.call){let a=f(c),b=a&&a.props&&a.props.className||/^go/.test(a)&&a;f=b?"."+b:a&&"object"==typeof a?a.props?"":j(a,""):!1===a?"":a}return a+d+(null==f?"":f)},"")):e.reduce((a,b)=>Object.assign(a,b&&b.call?b(d.p):b),{}):e,d.target||f,d.g,d.o,d.k)}m.bind({g:1});let n,o,p,q=m.bind({k:1});function r(a,b){let c=this||{};return function(){let d=arguments;function e(f,g){let h=Object.assign({},f),i=h.className||e.className;c.p=Object.assign({theme:o&&o()},h),c.o=/ *go\d+/.test(i),h.className=m.apply(c,d)+(i?" "+i:""),b&&(h.ref=g);let j=a;return a[0]&&(j=h.as||a,delete h.as),p&&j[0]&&p(h),n(j,h)}return b?b(e):e}}var s=(a,b)=>"function"==typeof a?a(b):a,t=(b=0,()=>(++b).toString()),u="default",v=(a,b)=>{let{toastLimit:c}=a.settings;switch(b.type){case 0:return{...a,toasts:[b.toast,...a.toasts].slice(0,c)};case 1:return{...a,toasts:a.toasts.map(a=>a.id===b.toast.id?{...a,...b.toast}:a)};case 2:let{toast:d}=b;return v(a,{type:+!!a.toasts.find(a=>a.id===d.id),toast:d});case 3:let{toastId:e}=b;return{...a,toasts:a.toasts.map(a=>a.id===e||void 0===e?{...a,dismissed:!0,visible:!1}:a)};case 4:return void 0===b.toastId?{...a,toasts:[]}:{...a,toasts:a.toasts.filter(a=>a.id!==b.toastId)};case 5:return{...a,pausedAt:b.time};case 6:let f=b.time-(a.pausedAt||0);return{...a,pausedAt:void 0,toasts:a.toasts.map(a=>({...a,pauseDuration:a.pauseDuration+f}))}}},w=[],x={toasts:[],pausedAt:void 0,settings:{toastLimit:20}},y={},z=(a,b=u)=>{y[b]=v(y[b]||x,a),w.forEach(([a,c])=>{a===b&&c(y[b])})},A=a=>Object.keys(y).forEach(b=>z(a,b)),B=(a=u)=>b=>{z(b,a)},C={blank:4e3,error:4e3,success:2e3,loading:1/0,custom:4e3},D=a=>(b,c)=>{let d,e=((a,b="blank",c)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:b,ariaProps:{role:"status","aria-live":"polite"},message:a,pauseDuration:0,...c,id:(null==c?void 0:c.id)||t()}))(b,a,c);return B(e.toasterId||(d=e.id,Object.keys(y).find(a=>y[a].toasts.some(a=>a.id===d))))({type:2,toast:e}),e.id},E=(a,b)=>D("blank")(a,b);E.error=D("error"),E.success=D("success"),E.loading=D("loading"),E.custom=D("custom"),E.dismiss=(a,b)=>{let c={type:3,toastId:a};b?B(b)(c):A(c)},E.dismissAll=a=>E.dismiss(void 0,a),E.remove=(a,b)=>{let c={type:4,toastId:a};b?B(b)(c):A(c)},E.removeAll=a=>E.remove(void 0,a),E.promise=(a,b,c)=>{let d=E.loading(b.loading,{...c,...null==c?void 0:c.loading});return"function"==typeof a&&(a=a()),a.then(a=>{let e=b.success?s(b.success,a):void 0;return e?E.success(e,{id:d,...c,...null==c?void 0:c.success}):E.dismiss(d),a}).catch(a=>{let e=b.error?s(b.error,a):void 0;e?E.error(e,{id:d,...c,...null==c?void 0:c.error}):E.dismiss(d)}),a};var F=1e3,G=q`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,H=q`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,I=q`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,J=r("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${a=>a.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${G} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${H} 0.15s ease-out forwards;
    animation-delay: 150ms;
    position: absolute;
    border-radius: 3px;
    opacity: 0;
    background: ${a=>a.secondary||"#fff"};
    bottom: 9px;
    left: 4px;
    height: 2px;
    width: 12px;
  }

  &:before {
    animation: ${I} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,K=q`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,L=r("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${a=>a.secondary||"#e0e0e0"};
  border-right-color: ${a=>a.primary||"#616161"};
  animation: ${K} 1s linear infinite;
`,M=q`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`,N=q`
0% {
	height: 0;
	width: 0;
	opacity: 0;
}
40% {
  height: 0;
	width: 6px;
	opacity: 1;
}
100% {
  opacity: 1;
  height: 10px;
}`,O=r("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${a=>a.primary||"#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${M} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${N} 0.2s ease-out forwards;
    opacity: 0;
    animation-delay: 200ms;
    position: absolute;
    border-right: 2px solid;
    border-bottom: 2px solid;
    border-color: ${a=>a.secondary||"#fff"};
    bottom: 6px;
    left: 6px;
    height: 10px;
    width: 6px;
  }
`,P=r("div")`
  position: absolute;
`,Q=r("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,R=q`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`,S=r("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${R} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,T=({toast:a})=>{let{icon:b,type:c,iconTheme:d}=a;return void 0!==b?"string"==typeof b?e.createElement(S,null,b):b:"blank"===c?null:e.createElement(Q,null,e.createElement(L,{...d}),"loading"!==c&&e.createElement(P,null,"error"===c?e.createElement(J,{...d}):e.createElement(O,{...d})))},U=r("div")`
  display: flex;
  align-items: center;
  background: #fff;
  color: #363636;
  line-height: 1.3;
  will-change: transform;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1), 0 3px 3px rgba(0, 0, 0, 0.05);
  max-width: 350px;
  pointer-events: auto;
  padding: 8px 10px;
  border-radius: 8px;
`,V=r("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`,W=e.memo(({toast:a,position:b,style:d,children:f})=>{let g=a.height?((a,b)=>{let d=a.includes("top")?1:-1,[e,f]=c?["0%{opacity:0;} 100%{opacity:1;}","0%{opacity:1;} 100%{opacity:0;}"]:[`
0% {transform: translate3d(0,${-200*d}%,0) scale(.6); opacity:.5;}
100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
`,`
0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
100% {transform: translate3d(0,${-150*d}%,-1px) scale(.6); opacity:0;}
`];return{animation:b?`${q(e)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`:`${q(f)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`}})(a.position||b||"top-center",a.visible):{opacity:0},h=e.createElement(T,{toast:a}),i=e.createElement(V,{...a.ariaProps},s(a.message,a));return e.createElement(U,{className:a.className,style:{...g,...d,...a.style}},"function"==typeof f?f({icon:h,message:i}):e.createElement(e.Fragment,null,h,i))});d=e.createElement,j.p=void 0,n=d,o=void 0,p=void 0;var X=({id:a,className:b,style:c,onHeightUpdate:d,children:f})=>{let g=e.useCallback(b=>{if(b){let c=()=>{d(a,b.getBoundingClientRect().height)};c(),new MutationObserver(c).observe(b,{subtree:!0,childList:!0,characterData:!0})}},[a,d]);return e.createElement("div",{ref:g,className:b,style:c},f)},Y=m`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`,Z=({reverseOrder:a,position:b="top-center",toastOptions:d,gutter:f,children:g,toasterId:h,containerStyle:i,containerClassName:j})=>{let{toasts:k,handlers:l}=((a,b="default")=>{let{toasts:c,pausedAt:d}=((a={},b=u)=>{let[c,d]=(0,e.useState)(y[b]||x),f=(0,e.useRef)(y[b]);(0,e.useEffect)(()=>(f.current!==y[b]&&d(y[b]),w.push([b,d]),()=>{let a=w.findIndex(([a])=>a===b);a>-1&&w.splice(a,1)}),[b]);let g=c.toasts.map(b=>{var c,d,e;return{...a,...a[b.type],...b,removeDelay:b.removeDelay||(null==(c=a[b.type])?void 0:c.removeDelay)||(null==a?void 0:a.removeDelay),duration:b.duration||(null==(d=a[b.type])?void 0:d.duration)||(null==a?void 0:a.duration)||C[b.type],style:{...a.style,...null==(e=a[b.type])?void 0:e.style,...b.style}}});return{...c,toasts:g}})(a,b),f=(0,e.useRef)(new Map).current,g=(0,e.useCallback)((a,b=F)=>{if(f.has(a))return;let c=setTimeout(()=>{f.delete(a),h({type:4,toastId:a})},b);f.set(a,c)},[]);(0,e.useEffect)(()=>{if(d)return;let a=Date.now(),e=c.map(c=>{if(c.duration===1/0)return;let d=(c.duration||0)+c.pauseDuration-(a-c.createdAt);if(d<0){c.visible&&E.dismiss(c.id);return}return setTimeout(()=>E.dismiss(c.id,b),d)});return()=>{e.forEach(a=>a&&clearTimeout(a))}},[c,d,b]);let h=(0,e.useCallback)(B(b),[b]),i=(0,e.useCallback)(()=>{h({type:5,time:Date.now()})},[h]),j=(0,e.useCallback)((a,b)=>{h({type:1,toast:{id:a,height:b}})},[h]),k=(0,e.useCallback)(()=>{d&&h({type:6,time:Date.now()})},[d,h]),l=(0,e.useCallback)((a,b)=>{let{reverseOrder:d=!1,gutter:e=8,defaultPosition:f}=b||{},g=c.filter(b=>(b.position||f)===(a.position||f)&&b.height),h=g.findIndex(b=>b.id===a.id),i=g.filter((a,b)=>b<h&&a.visible).length;return g.filter(a=>a.visible).slice(...d?[i+1]:[0,i]).reduce((a,b)=>a+(b.height||0)+e,0)},[c]);return(0,e.useEffect)(()=>{c.forEach(a=>{if(a.dismissed)g(a.id,a.removeDelay);else{let b=f.get(a.id);b&&(clearTimeout(b),f.delete(a.id))}})},[c,g]),{toasts:c,handlers:{updateHeight:j,startPause:i,endPause:k,calculateOffset:l}}})(d,h);return e.createElement("div",{"data-rht-toaster":h||"",style:{position:"fixed",zIndex:9999,top:16,left:16,right:16,bottom:16,pointerEvents:"none",...i},className:j,onMouseEnter:l.startPause,onMouseLeave:l.endPause},k.map(d=>{let h,i,j=d.position||b,k=l.calculateOffset(d,{reverseOrder:a,gutter:f,defaultPosition:b}),m=(h=j.includes("top"),i=j.includes("center")?{justifyContent:"center"}:j.includes("right")?{justifyContent:"flex-end"}:{},{left:0,right:0,display:"flex",position:"absolute",transition:c?void 0:"all 230ms cubic-bezier(.21,1.02,.73,1)",transform:`translateY(${k*(h?1:-1)}px)`,...h?{top:0}:{bottom:0},...i});return e.createElement(X,{id:d.id,key:d.id,onHeightUpdate:l.updateHeight,className:d.visible?Y:"",style:m},"custom"===d.type?s(d.message,d):g?g(d):e.createElement(W,{toast:d,position:j}))}))};a.s(["Toaster",()=>Z,"default",()=>E,"toast",()=>E],6704)},37927,a=>{"use strict";var b=a.i(72131),c=a.i(87924),d=b.createContext(void 0),e=a=>{let c=b.useContext(d);if(a)return a;if(!c)throw Error("No QueryClient set, use QueryClientProvider to set one");return c},f=({client:a,children:e})=>(b.useEffect(()=>(a.mount(),()=>{a.unmount()}),[a]),(0,c.jsx)(d.Provider,{value:a,children:e}));a.s(["QueryClientProvider",()=>f,"useQueryClient",()=>e])},13412,67595,32075,23378,50603,a=>{"use strict";let b=()=>!1,c=()=>!1,d=()=>{try{return!0}catch{}return!1};function e(a){return a.endsWith(".lclstage.dev")||a.endsWith(".stgstage.dev")||a.endsWith(".clerkstage.dev")||a.endsWith(".accountsstage.dev")}a.s(["n",()=>d,"r",()=>c,"t",()=>b],67595),a.s(["t",()=>e],32075);let f=(...a)=>{};a.s(["t",()=>f],23378);let g=()=>{let a=f,b=f;return{promise:new Promise((c,d)=>{a=c,b=d}),resolve:a,reject:b}};a.s(["t",()=>g],50603),a.s([],13412)},5050,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0});var d={callServer:function(){return f.callServer},createServerReference:function(){return h.createServerReference},findSourceMapURL:function(){return g.findSourceMapURL}};for(var e in d)Object.defineProperty(c,e,{enumerable:!0,get:d[e]});let f=a.r(20611),g=a.r(1722),h=a.r(38783)},51234,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0}),Object.defineProperty(c,"HandleISRError",{enumerable:!0,get:function(){return e}});let d=a.r(56704).workAsyncStorage;function e({error:a}){if(d){let b=d.getStore();if(b?.isStaticGeneration)throw a&&console.error(a),a}return null}("function"==typeof c.default||"object"==typeof c.default&&null!==c.default)&&void 0===c.default.__esModule&&(Object.defineProperty(c.default,"__esModule",{value:!0}),Object.assign(c.default,c),b.exports=c.default)},40622,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0}),Object.defineProperty(c,"default",{enumerable:!0,get:function(){return h}});let d=a.r(87924),e=a.r(51234),f={fontFamily:'system-ui,"Segoe UI",Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji"',height:"100vh",textAlign:"center",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"},g={fontSize:"14px",fontWeight:400,lineHeight:"28px",margin:"0 8px"},h=function({error:a}){let b=a?.digest;return(0,d.jsxs)("html",{id:"__next_error__",children:[(0,d.jsx)("head",{}),(0,d.jsxs)("body",{children:[(0,d.jsx)(e.HandleISRError,{error:a}),(0,d.jsx)("div",{style:f,children:(0,d.jsxs)("div",{children:[(0,d.jsxs)("h2",{style:g,children:["Application error: a ",b?"server":"client","-side exception has occurred while loading ",window.location.hostname," (see the"," ",b?"server logs":"browser console"," for more information)."]}),b?(0,d.jsx)("p",{style:g,children:`Digest: ${b}`}):null]})})]})]})};("function"==typeof c.default||"object"==typeof c.default&&null!==c.default)&&void 0===c.default.__esModule&&(Object.defineProperty(c.default,"__esModule",{value:!0}),Object.assign(c.default,c),b.exports=c.default)},12794,a=>{"use strict";var b=a.i(18544),c=a.i(85659),d=a.i(21778),e=class extends c.Removable{#a;#b;#c;#d;constructor(a){super(),this.#a=a.client,this.mutationId=a.mutationId,this.#c=a.mutationCache,this.#b=[],this.state=a.state||f(),this.setOptions(a.options),this.scheduleGc()}setOptions(a){this.options=a,this.updateGcTime(this.options.gcTime)}get meta(){return this.options.meta}addObserver(a){this.#b.includes(a)||(this.#b.push(a),this.clearGcTimeout(),this.#c.notify({type:"observerAdded",mutation:this,observer:a}))}removeObserver(a){this.#b=this.#b.filter(b=>b!==a),this.scheduleGc(),this.#c.notify({type:"observerRemoved",mutation:this,observer:a})}optionalRemove(){this.#b.length||("pending"===this.state.status?this.scheduleGc():this.#c.remove(this))}continue(){return this.#d?.continue()??this.execute(this.state.variables)}async execute(a){let b=()=>{this.#e({type:"continue"})},c={client:this.#a,meta:this.options.meta,mutationKey:this.options.mutationKey};this.#d=(0,d.createRetryer)({fn:()=>this.options.mutationFn?this.options.mutationFn(a,c):Promise.reject(Error("No mutationFn found")),onFail:(a,b)=>{this.#e({type:"failed",failureCount:a,error:b})},onPause:()=>{this.#e({type:"pause"})},onContinue:b,retry:this.options.retry??0,retryDelay:this.options.retryDelay,networkMode:this.options.networkMode,canRun:()=>this.#c.canRun(this)});let e="pending"===this.state.status,f=!this.#d.canStart();try{if(e)b();else{this.#e({type:"pending",variables:a,isPaused:f}),await this.#c.config.onMutate?.(a,this,c);let b=await this.options.onMutate?.(a,c);b!==this.state.context&&this.#e({type:"pending",context:b,variables:a,isPaused:f})}let d=await this.#d.start();return await this.#c.config.onSuccess?.(d,a,this.state.context,this,c),await this.options.onSuccess?.(d,a,this.state.context,c),await this.#c.config.onSettled?.(d,null,this.state.variables,this.state.context,this,c),await this.options.onSettled?.(d,null,a,this.state.context,c),this.#e({type:"success",data:d}),d}catch(b){try{await this.#c.config.onError?.(b,a,this.state.context,this,c)}catch(a){Promise.reject(a)}try{await this.options.onError?.(b,a,this.state.context,c)}catch(a){Promise.reject(a)}try{await this.#c.config.onSettled?.(void 0,b,this.state.variables,this.state.context,this,c)}catch(a){Promise.reject(a)}try{await this.options.onSettled?.(void 0,b,a,this.state.context,c)}catch(a){Promise.reject(a)}throw this.#e({type:"error",error:b}),b}finally{this.#c.runNext(this)}}#e(a){this.state=(b=>{switch(a.type){case"failed":return{...b,failureCount:a.failureCount,failureReason:a.error};case"pause":return{...b,isPaused:!0};case"continue":return{...b,isPaused:!1};case"pending":return{...b,context:a.context,data:void 0,failureCount:0,failureReason:null,error:null,isPaused:a.isPaused,status:"pending",variables:a.variables,submittedAt:Date.now()};case"success":return{...b,data:a.data,failureCount:0,failureReason:null,error:null,status:"success",isPaused:!1};case"error":return{...b,data:void 0,error:a.error,failureCount:b.failureCount+1,failureReason:a.error,isPaused:!1,status:"error"}}})(this.state),b.notifyManager.batch(()=>{this.#b.forEach(b=>{b.onMutationUpdate(a)}),this.#c.notify({mutation:this,type:"updated",action:a})})}};function f(){return{context:void 0,data:void 0,error:null,failureCount:0,failureReason:null,isPaused:!1,status:"idle",variables:void 0,submittedAt:0}}a.s(["Mutation",()=>e,"getDefaultState",()=>f])},45617,99058,89968,52254,a=>{"use strict";let b=[".lcl.dev",".lclstage.dev",".lclclerk.com"],c=[".accounts.dev",".accountsstage.dev",".accounts.lclclerk.com"],d=[".lcl.dev",".stg.dev",".lclstage.dev",".stgstage.dev",".dev.lclclerk.com",".stg.lclclerk.com",".accounts.lclclerk.com","accountsstage.dev","accounts.dev"],e=[".lcl.dev","lclstage.dev",".lclclerk.com",".accounts.lclclerk.com"],f=[".accountsstage.dev"];a.s(["a",()=>"https://api.lclclerk.com","c",()=>"https://api.clerk.com","d",()=>f,"i",()=>b,"o",()=>e,"r",()=>d,"t",()=>c,"u",()=>"https://api.clerkstage.dev"],45617);let g=a=>"u">typeof atob&&"function"==typeof atob?atob(a):void 0!==globalThis.Buffer?globalThis.Buffer.from(a,"base64").toString():a;a.s(["t",()=>g],99058);let h=a=>"u">typeof btoa&&"function"==typeof btoa?btoa(a):void 0!==globalThis.Buffer?globalThis.Buffer.from(a).toString("base64"):a;a.s(["t",()=>h],89968);let i="pk_live_";function j(a){if(!a.endsWith("$"))return!1;let b=a.slice(0,-1);return!b.includes("$")&&b.includes(".")}function k(a,b={}){let c;if(!(a=a||"")||!l(a)){if(b.fatal&&!a)throw Error("Publishable key is missing. Ensure that your publishable key is correctly configured. Double-check your environment configuration for your keys, or access them here: https://dashboard.clerk.com/last-active?path=api-keys");if(b.fatal&&!l(a))throw Error("Publishable key not valid.");return null}let d=a.startsWith(i)?"production":"development";try{c=g(a.split("_")[2])}catch{if(b.fatal)throw Error("Publishable key not valid: Failed to decode key.");return null}if(!j(c)){if(b.fatal)throw Error("Publishable key not valid: Decoded key has invalid format.");return null}let e=c.slice(0,-1);return b.proxyUrl?e=b.proxyUrl:"development"!==d&&b.domain&&b.isSatellite&&(e=`clerk.${b.domain}`),{instanceType:d,frontendApi:e}}function l(a=""){try{if(!(a.startsWith(i)||a.startsWith("pk_test_")))return!1;let b=a.split("_");if(3!==b.length)return!1;let c=b[2];if(!c)return!1;return j(g(c))}catch{return!1}}function m(){let a=new Map;return{isDevOrStagingUrl:b=>{if(!b)return!1;let c="string"==typeof b?b:b.hostname,e=a.get(c);return void 0===e&&(e=d.some(a=>c.endsWith(a)),a.set(c,e)),e}}}a.s(["n",()=>m,"u",()=>k],52254)},31840,a=>{"use strict";let b=a=>{if(0==a.length)return"";if(1==a.length)return a[0];let b=a.slice(0,-1).join(", ");return b+`, or ${a.slice(-1)}`},c=/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;function d(a){return c.test(a||"")}function e(a){let b=a||"";return b.charAt(0).toUpperCase()+b.slice(1)}function f(a){return a?a.replace(/([-_][a-z])/g,a=>a.toUpperCase().replace(/-|_/,"")):""}function g(a){return a?a.replace(/[A-Z]/g,a=>`_${a.toLowerCase()}`):""}let h=a=>{let b=c=>{if(!c)return c;if(Array.isArray(c))return c.map(a=>"object"==typeof a||Array.isArray(a)?b(a):a);let d={...c};for(let c of Object.keys(d)){let e=a(c.toString());e!==c&&(d[e]=d[c],delete d[c]),"object"==typeof d[e]&&(d[e]=b(d[e]))}return d};return b},i=h(g),j=h(f);function k(a){if("boolean"==typeof a)return a;if(null==a)return!1;if("string"==typeof a){if("true"===a.toLowerCase())return!0;if("false"===a.toLowerCase())return!1}let b=parseInt(a,10);return!isNaN(b)&&b>0}function l(a){return Object.entries(a).reduce((a,[b,c])=>(void 0!==c&&(a[b]=c),a),{})}a.s(["a",()=>d,"c",()=>e,"i",()=>l,"l",()=>b,"n",()=>i,"o",()=>k,"r",()=>j,"s",()=>f,"t",()=>g])},77116,a=>{"use strict";var b=a.i(67595);a.s(["isDevelopmentEnvironment",()=>b.t])},6615,a=>{"use strict";var b=a.i(45617);a.i(99058),a.i(89968);var c=a.i(52254);let d=a=>{let d=(0,c.u)(a)?.frontendApi;return d?.startsWith("clerk.")&&b.i.some(a=>d?.endsWith(a))?b.c:b.o.some(a=>d?.endsWith(a))?b.a:b.d.some(a=>d?.endsWith(a))?b.u:b.c};a.s(["apiUrlFromPublishableKey",()=>d])},29742,16822,24505,15272,a=>{"use strict";a.i(13412);var b=a.i(77116),c=a.i(6615),d=a.i(31840);a.s([],16822);var e=d;a.s(["isTruthy",()=>e.o],24505);var e=d;process.env.NEXT_PUBLIC_CLERK_JS_VERSION,process.env.NEXT_PUBLIC_CLERK_JS_URL,process.env.NEXT_PUBLIC_CLERK_UI_URL,process.env.NEXT_PUBLIC_CLERK_UI_VERSION,process.env.CLERK_API_VERSION,process.env.CLERK_SECRET_KEY,process.env.CLERK_MACHINE_SECRET_KEY;let f=process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY||"";process.env.CLERK_ENCRYPTION_KEY,process.env.CLERK_API_URL||(0,c.apiUrlFromPublishableKey)(f),process.env.NEXT_PUBLIC_CLERK_DOMAIN,process.env.NEXT_PUBLIC_CLERK_PROXY_URL,(0,e.o)(process.env.NEXT_PUBLIC_CLERK_IS_SATELLITE),process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL;let g={name:"@clerk/nextjs",version:"7.0.4",environment:"production"};(0,e.o)(process.env.NEXT_PUBLIC_CLERK_TELEMETRY_DISABLED),(0,e.o)(process.env.NEXT_PUBLIC_CLERK_TELEMETRY_DEBUG);let h=(0,e.o)(process.env.NEXT_PUBLIC_CLERK_KEYLESS_DISABLED)||!1;a.s(["KEYLESS_DISABLED",()=>h,"SDK_METADATA",()=>g],15272);let i=(0,b.isDevelopmentEnvironment)()&&!h;a.s(["canUseKeyless",()=>i],29742)},37334,a=>{"use strict";var b=a.i(50944),c=a.i(72131),d=a.i(29742);function e(e){var f;let g=(null==(f=(0,b.useSelectedLayoutSegments)()[0])?void 0:f.startsWith("/_not-found"))||!1;return(0,c.useEffect)(()=>{d.canUseKeyless&&!g&&a.A(97477).then(a=>a.syncKeylessConfigAction({...e,returnUrl:window.location.href}))},[g]),e.children}a.s(["KeylessCookieSync",()=>e])},11080,a=>{a.v(b=>Promise.all(["server/chunks/ssr/node_modules_@clerk_nextjs_dist_esm_app-router_aefcbdee._.js"].map(b=>a.l(b))).then(()=>b(88985)))},97477,a=>{a.v(b=>Promise.all(["server/chunks/ssr/node_modules_@clerk_nextjs_dist_esm_app-router_b77da890._.js"].map(b=>a.l(b))).then(()=>b(37247)))}];

//# sourceMappingURL=%5Broot-of-the-server%5D__eae49f91._.js.map