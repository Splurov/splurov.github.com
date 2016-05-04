/**
* @preserve Copyright 2012 Twitter, Inc.
* @license http://www.apache.org/licenses/LICENSE-2.0.txt
*/
var Hogan={};!function(t){function i(t,i,s){var e;return i&&"object"==typeof i&&(void 0!==i[t]?e=i[t]:s&&i.get&&"function"==typeof i.get&&(e=i.get(t))),e}function s(t,i,s,e,n,r){function o(){}function u(){}o.prototype=t,u.prototype=t.subs;var a,c=new o;c.subs=new u,c.subsText={},c.buf="",e=e||{},c.stackSubs=e,c.subsText=r;for(a in i)e[a]||(e[a]=i[a]);for(a in e)c.subs[a]=e[a];n=n||{},c.stackPartials=n;for(a in s)n[a]||(n[a]=s[a]);for(a in n)c.partials[a]=n[a];return c}function e(t){return String(null===t||void 0===t?"":t)}function n(t){return t=e(t),h.test(t)?t.replace(r,"&amp;").replace(o,"&lt;").replace(u,"&gt;").replace(a,"&#39;").replace(c,"&quot;"):t}t.Template=function(t,i,s,e){t=t||{},this.r=t.code||this.r,this.c=s,this.options=e||{},this.text=i||"",this.partials=t.partials||{},this.subs=t.subs||{},this.buf=""},t.Template.prototype={r:function(){return""},v:n,t:e,render:function(t,i,s){return this.ri([t],i||{},s)},ri:function(t,i,s){return this.r(t,i,s)},ep:function(t,i){var e=this.partials[t],n=i[e.name];if(e.instance&&e.base==n)return e.instance;if("string"==typeof n){if(!this.c)throw new Error("No compiler available.");n=this.c.compile(n,this.options)}if(!n)return null;if(this.partials[t].base=n,e.subs){i.stackText||(i.stackText={});for(key in e.subs)i.stackText[key]||(i.stackText[key]=void 0!==this.activeSub&&i.stackText[this.activeSub]?i.stackText[this.activeSub]:this.text);n=s(n,e.subs,e.partials,this.stackSubs,this.stackPartials,i.stackText)}return this.partials[t].instance=n,n},rp:function(t,i,s,e){var n=this.ep(t,s);return n?n.ri(i,s,e):""},rs:function(t,i,s){var e=t[t.length-1];if(!f(e))return void s(t,i,this);for(var n=0;n<e.length;n++)t.push(e[n]),s(t,i,this),t.pop()},s:function(t,i,s,e,n,r,o){var u;return f(t)&&0===t.length?!1:("function"==typeof t&&(t=this.ms(t,i,s,e,n,r,o)),u=!!t,!e&&u&&i&&i.push("object"==typeof t?t:i[i.length-1]),u)},d:function(t,s,e,n){var r,o=t.split("."),u=this.f(o[0],s,e,n),a=this.options.modelGet,c=null;if("."===t&&f(s[s.length-2]))u=s[s.length-1];else for(var h=1;h<o.length;h++)r=i(o[h],u,a),void 0!==r?(c=u,u=r):u="";return n&&!u?!1:(n||"function"!=typeof u||(s.push(c),u=this.mv(u,s,e),s.pop()),u)},f:function(t,s,e,n){for(var r=!1,o=null,u=!1,a=this.options.modelGet,c=s.length-1;c>=0;c--)if(o=s[c],r=i(t,o,a),void 0!==r){u=!0;break}return u?(n||"function"!=typeof r||(r=this.mv(r,s,e)),r):n?!1:""},ls:function(t,i,s,n,r){var o=this.options.delimiters;return this.options.delimiters=r,this.b(this.ct(e(t.call(i,n)),i,s)),this.options.delimiters=o,!1},ct:function(t,i,s){if(this.options.disableLambda)throw new Error("Lambda features disabled.");return this.c.compile(t,this.options).render(i,s)},b:function(t){this.buf+=t},fl:function(){var t=this.buf;return this.buf="",t},ms:function(t,i,s,e,n,r,o){var u,a=i[i.length-1],c=t.call(a);return"function"==typeof c?e?!0:(u=this.activeSub&&this.subsText&&this.subsText[this.activeSub]?this.subsText[this.activeSub]:this.text,this.ls(c,a,s,u.substring(n,r),o)):c},mv:function(t,i,s){var n=i[i.length-1],r=t.call(n);return"function"==typeof r?this.ct(e(r.call(n)),n,s):r},sub:function(t,i,s,e){var n=this.subs[t];n&&(this.activeSub=t,n(i,s,this,e),this.activeSub=!1)}};var r=/&/g,o=/</g,u=/>/g,a=/\'/g,c=/\"/g,h=/[&<>\"\']/,f=Array.isArray||function(t){return"[object Array]"===Object.prototype.toString.call(t)}}("undefined"!=typeof exports?exports:Hogan);

// Copyright 2014 Mikhail Kalashnik
var part=function(){var t,e=[],a={},n=function(t){return t.map(function(t){return a[t]})};return"undefined"!=typeof window?(t=window.MK_DOM_CONTENT_LOADED,document.addEventListener("DOMContentLoaded",function(){for(t=!0;e.length;){var a=e.shift();a()}},!1)):t=!0,function(r,i,o){var s=function(){"string"==typeof r?a[r]=o?o.apply(null,n(i)):i():i.apply(null,n(r))};t?s():e.push(s)}}();part("dom",function(){var t,e=function(t,e){var a;t.addEventListener("touchstart",function(){a=!0},!1),t.addEventListener("touchmove",function(){a=!1},!1),t.addEventListener("touchcancel",function(){a=!1},!1),t.addEventListener("touchend",function(t){t.preventDefault(),a&&e(t)},!1),t.addEventListener("click",function(t){e(t)},!1)},a=function(t,a,n){"universalClick"===a?e(t,n):"transitionend"===a?["transitionend","webkitTransitionEnd"].forEach(function(e){t.addEventListener(e,n,!1)}):"animationend"===a?["animationend","webkitAnimationEnd","MSAnimationEnd"].forEach(function(e){t.addEventListener(e,n,!1)}):t.addEventListener(a,n)},n=function(t,e,a){t.classList[a?"add":"remove"](e)},r=function(t){this.elements=t?t:[],this.iterate=function(t){for(var e=-1,a=this.elements.length;++e<a;)t(this.elements[e])},this.toggleClass=function(t,e){this.iterate(function(a){n(a,t,e)})},this.listen=function(t,e){this.iterate(function(n){a(n,t,e)})}},i=function(e){var a=e.target;"setSelectionRange"in a&&""!==a.value&&(clearTimeout(t),t=setTimeout(function(){a.setSelectionRange(0,a.value.length)},0))},o={},s=function(t){return o[t]||(o[t]=document.getElementById(t)),o[t]},l=function(){var t={},e={},a={text:function(t,e){t.textContent=e},html:function(t,e){t.innerHTML=e},display:function(t,e){t.style.display=e}},n=function(e,n,r){t[e]||(t[e]={type:null,value:null});var i=t[e];(i.type!==n||i.value!==r)&&(i.type=n,i.value=r,a[n](s(e),r))},r=function(){Object.keys(e).forEach(function(t){n(t,e[t].type,e[t].value)}),e={}};return{defer:function(t,a,n){e[t]={type:a,value:n}},runDeferred:function(){r()},instantly:n}}(),c={};return{id:s,find:function(t,e){return new r((e||document).querySelectorAll(t))},findCache:function(t){return c[t]||(c[t]=this.find(t)),c[t]},selectOnFocus:function(t,e){a(t,"focus",function(t){i(t),e&&e()})},toggleClass:n,updater:l,listen:a,trigger:function(t,e){var a=document.createEvent("HTMLEvents");a.initEvent(e,!0,!1),t.dispatchEvent(a)},listenCustom:function(t,e){a(window,t,function(t){e(t.detail)})},triggerCustom:function(t,e){var a=document.createEvent("CustomEvent");a.initCustomEvent(t,!1,!1,e||{}),window.dispatchEvent(a)},getPosition:function(t){var e=0,a=0;do e+=t.offsetTop,a+=t.offsetLeft;while(t=t.offsetParent);return{top:e,left:a}}}}),part("goal",["dom"],function(t){var e,a=[],n={},r=!1,i=!0,o=function(){return r&&i},s=function(t,a){e.reachGoal(t,a)},l=function(){o()&&Object.keys(n).forEach(function(t){s(t,n[t])})};t.listen(window,"load",function(){i=!0,l()}),window.yandexMetrikaLoadCallback=function(t){r=!0,e=t,l()};var c=function(t,e){if(-1===a.indexOf(t)){a.push(t);var r=e||null;o()?s(t,r):n[t]=r}};return{reach:c}}),part("smoothScroll",["dom","goal"],function(t){var e=parseInt(window.getComputedStyle(document.body).getPropertyValue("padding-top"),10),a=function(a,n){var r=window.pageYOffset,i=Math.max(t.getPosition(a).top-e,0),o=r>i,s=o?r-i:i-r,l=100+s/20,c=16,u=Math.ceil(s/(l/c));0!==u&&!function d(){setTimeout(function(){o?(r-=u,i>r&&(r=i)):(r+=u,r>i&&(r=i)),window.scrollTo(window.pageXOffset,r),r!==i?d():n&&n()},c)}()};return{scrollTo:a}}),part("localStorageSet",["dom","goal","smoothScroll"],function(t,e,a){var n=["data5","light-boosted-1","light-boosted-2","light-boosted-3","light-boosted-4","dark-boosted-1","dark-boosted-2","light-spells-boosted","dark-spells-boosted","light-view","dark-view"],r="storage-quota-exceeded",i=t.id(r);return function(o,s,l){void 0===l&&(l=-2);var c;try{localStorage.setItem(o,s)}catch(u){e.reach("QUOTA_EXCEEDED",{quotaExceededFavoritesCount:""+l});var d={};n.forEach(function(t){d[t]=localStorage.getItem(t)}),localStorage.clear(),Object.keys(d).forEach(function(t){d[t]&&localStorage.setItem(t,d[t])}),d=null;try{localStorage.setItem(o,s)}catch(u){if(l>0)e.reach("QUOTA_EXCEEDED_AGAIN",{quotaExceededAgainFavoritesCount:""+l}),c="<strong>Attention!</strong> Looks like we have exceeded the quota to store Clash Calc data. Please remove unused army compositions from favorites.";else{var f=-1,p=localStorage.getItem(n[0]);p&&(f=p.length),-1===f&&-1!==navigator.userAgent.indexOf("Safari")?(c="Looks like you are using private mode of the Safari browser, so it’s not possible to store Clash Calc data. Please turn off private mode if you want to preserve data between visits.",f=-2):c="<strong>Attention!</strong> Looks like we have exceeded the quota to store Clash Calc data. Normally this shouldn’t have happened. Perhaps your browser is configured in a special way. To fix the problem please check the settings related to the Local Storage.",e.reach("QUOTA_EXCEEDED_UNKNOWN",{quotaExceededDataLength:""+f})}}}return c?(t.updater.instantly(r,"html",c),t.updater.instantly(r,"display",""),a.scrollTo(i),!1):(t.updater.instantly(r,"display","none"),!0)}}),part("common",function(){return{objectCopy:function(t){var e=t.constructor();return Object.keys(t).forEach(function(a){e[a]=t[a]}),e},numberFormat:function(t){return(""+t).replace(/\B(?=(\d{3})+(?!\d))/g,",")},convertToTitle:function(t){var e=t.replace("_"," ").replace(/-/g,".");return"."===e[e.length-1]?e.slice(0,-1):e},getFormattedTime:function(t,e){var a=[],n=t;if(n>3599&&(a.push(Math.floor(n/3600)+"h"),n%=3600,e=!0),n>59){var r=Math.floor(n/60);n%=60,e&&n&&r++,a.push(r+"m")}else a.push("0m");return""!==a&&e||a.push(n+"s"),a.join("&thinsp;")},Dict:function(t){this.data=t,this.get=function(t,e){var a=this.data[t];return void 0===e||void 0!==a&&null!==a?a:e},this.set=function(t,e){this.data[t]=e},this.getAll=function(){return this.data}}}}),part("converter",["goal"],function(){var t=function(t){var e=[28,29,30,31,32,33,34,35,36,37,54,55,56,57,62],a=63,n=0;e.forEach(function(e){void 0!==t[e-n]&&(t.splice(e-n,1),n++)}),void 0!==t[a-n]&&t.splice(a-n,1)},e=function(t){var e=[0,18,19,20,21,22,23,24,25,26,27,32,33,34,35,40,41,42,43,45,47];e.forEach(function(e){t[e]||(t[e]=0),t[e]++})};return["savedData","savedCalculations","data","data2","data3","data4","settingsMode"].forEach(function(t){localStorage.removeItem(t)}),{oldConvert3to4:t,oldConvert4to5:e}}),part("types",function(){var t={light:{Barbarian:[20,[0,25,40,60,100,150,200,250],1,1,{1:1,3:2,5:3,7:4,8:5,9:6,10:7}],Archer:[25,[0,50,80,120,200,300,400,500],1,2,{1:1,3:2,5:3,7:4,8:5,9:6,10:7}],Giant:[120,[0,250,750,1250,1750,2250,3e3,3500],5,3,{1:1,3:2,6:3,7:4,8:5,9:6,10:7}],Goblin:[30,[0,25,40,60,80,100,150,200],1,4,{1:1,4:2,5:3,7:4,8:5,9:6,10:7}],Wall_Breaker:[60,[0,1e3,1500,2e3,2500,3e3,3500],2,5,{1:1,3:1,4:2,6:3,7:4,8:5,10:6}],Balloon:[300,[0,2e3,2500,3e3,3500,4e3,4500],5,6,{1:1,4:2,6:3,7:4,8:5,9:6}],Wizard:[300,[0,1500,2e3,2500,3e3,3500,4e3],4,7,{1:1,5:2,6:3,7:4,8:5,10:6}],Healer:[600,[0,5e3,6e3,8e3,1e4],14,8,{1:1,6:1,7:2,8:3,9:4}],Dragon:[900,[0,25e3,29e3,33e3,37e3,42e3],20,9,{1:1,7:2,8:3,9:4,10:5}],"P-E-K-K-A-":[900,[0,28e3,32e3,36e3,4e4,45e3],25,10,{1:1,8:3,10:5}]},dark:{Minion:[45,[0,6,7,8,9,10,11,12],2,1,{1:1,7:2,8:4,9:5,10:6,11:7}],Hog_Rider:[120,[0,40,45,52,58,65,90],5,2,{1:1,7:2,8:4,9:5,10:6}],Valkyrie:[300,[0,70,100,130,160,190],8,3,{1:1,7:1,8:2,9:4,10:5}],Golem:[900,[0,450,525,600,675,750],30,4,{1:1,8:2,9:4,10:5}],Witch:[600,[0,250,350,450],12,5,{1:1,9:2,11:3}],Lava_Hound:[900,[0,390,450,510],30,6,{1:1,9:2,10:3}],Bowler:[300,[0,130,150,170],8,7,{1:1,10:2,11:3}]},"light-spells":{Lightning:[600,[0,15e3,16500,18e3,2e4,22e3,24e3,26e3],2,1,{1:1,5:4,8:5,9:6,10:7}],Healing:[600,[0,15e3,16500,18e3,2e4,22e3,24e3],2,2,{1:1,6:3,7:4,8:5,9:6}],Rage:[600,[0,23e3,25e3,27e3,3e4,33e3],2,3,{1:1,7:4,8:5}],Jump:[600,[0,23e3,27e3,31e3],2,4,{1:1,9:2,10:3}],Freeze:[600,[0,26e3,29e3,31e3,33e3,35e3],2,4,{1:1,9:1,10:5}]},"dark-spells":{Poison:[300,[0,95,110,125,140],1,1,{1:1,8:2,9:3,10:4}],Earthquake:[300,[0,125,140,160,180],1,2,{1:1,8:2,9:3,10:4}],Haste:[300,[0,80,85,90,95],1,3,{1:1,9:2,10:4}]}};return{data:t,iterateTree:function(e){Object.keys(t).forEach(function(a){Object.keys(t[a]).forEach(function(n){e(a,n,t[a][n])})})},buildings:{light:{count:4,queue:[0,20,25,30,35,40,45,50,55,60,75],maxLevel:10,firstRequired:!0,th:{1:[3,0,0,0],2:[4,4,0,0],3:[5,5,0,0],4:[6,6,6,0],5:[7,7,7,0],6:[8,8,8,0],7:[9,9,9,9],8:[10,10,10,10]}},dark:{count:2,queue:[0,40,50,60,70,80,90,100],maxLevel:7,th:{1:[0,0],7:[2,0],8:[4,4],9:[6,6],10:[7,7]}},"light-spells":{maxLevel:5,th:{1:0,5:1,6:2,7:3,9:4,10:5}},"dark-spells":{maxLevel:3,th:{1:0,8:2,9:3}}}}}),part("storage",["common","localStorageSet"],function(t,e){var a=["light-level-1","light-level-2","light-level-3","light-level-4","dark-level-1","dark-level-2","army-camps","light-spells-level","Barbarian","Archer","Goblin","Giant","Wall_Breaker","Balloon","Wizard","Healer","Dragon","P-E-K-K-A-","Barbarian-level","Archer-level","Goblin-level","Giant-level","Wall_Breaker-level","Balloon-level","Wizard-level","Healer-level","Dragon-level","P-E-K-K-A--level","Lightning","Healing","Rage","Jump","Lightning-level","Healing-level","Rage-level","Jump-level","Minion","Hog_Rider","Valkyrie","Golem","Minion-level","Hog_Rider-level","Valkyrie-level","Golem-level","Freeze","Freeze-level","Witch","Witch-level","favorite-title","Lava_Hound","Lava_Hound-level","dark-spells-level","Poison","Poison-level","Earthquake","Earthquake-level","Haste","Haste-level"],n=[a.indexOf("favorite-title")],r=function(t){var e=[];return a.forEach(function(a){var n;n=t.hasOwnProperty(a)?t[a]:null,e.push(n)}),e},i=function(t){var e={};return a.forEach(function(a,n){e[a]=void 0===t[n]?null:t[n]}),e},o="data5",s=function(t){var e=localStorage.getItem(o);return e=e&&JSON.parse(e)||[],t?e:e=e.map(i)},l=s().map(function(e){return new t.Dict(e)});return{getForDiff:function(){var t=s(!0);return n.forEach(function(e){t.forEach(function(t){t[e]=null})}),t},excludeIndexes:n,all:l,current:l[0]||new t.Dict({}),save:function(){l[0]=this.current;var t=l.map(function(t){return t.getAll()}),a=t.map(r);return e(o,JSON.stringify(a),l.length-1)},dataArrayToObject:i,dataObjectToArray:r}}),part(["types","dom","localStorageSet"],function(t,e,a){var n=["barrack","level","quantity","total","subtract"],r={light:{quantity:["level","quantity","total"],subtract:["quantity","subtract"],barrack:["barrack"]},dark:{quantity:["level","quantity","total"],subtract:["quantity","subtract"],barrack:["quantity","barrack"]}},i=function(t,i){a(t+"-view",i),n.forEach(function(a){var n=e.findCache(".js-col-"+t+"-"+a),o=-1===r[t][i].indexOf(a);n.iterate(function(t){t.style.display=o?"none":"",e.toggleClass(t,"active",!o),t.classList.remove("data__last")})}),e.find(".data tr").iterate(function(t){var e=t.querySelectorAll(".active");e.length&&e[e.length-1].classList.add("data__last")}),Object.keys(r[t]).forEach(function(a){var n=document.querySelector('.js-cols-switcher[data-type="'+t+'"][data-view="'+a+'"]');e.toggleClass(n,"button_selected",i===a)})},o=e.find(".js-cols-switcher");o.listen("universalClick",function(t){i(t.currentTarget.getAttribute("data-type"),t.currentTarget.getAttribute("data-view"))});var s=function(){["light","dark"].forEach(function(t){i(t,localStorage.getItem(t+"-view")||"quantity")})},l=window.matchMedia("(max-width: 640px)");l.matches&&s(),l.addListener(function(t){t.matches?s():(["light","dark"].forEach(function(t){n.forEach(function(a){var n=e.findCache(".js-col-"+t+"-"+a);n.iterate(function(t){t.style.display="",t.classList.remove("data__last"),t.classList.remove("active")})})}),o.iterate(function(t){t.classList.remove("button_selected")}))})}),part("calculate",["storage","types","dom","goal"],function(t,e,a,n){var r=4,i={};Object.keys(e.data).forEach(function(t){i[t]=[],Object.keys(e.data[t]).forEach(function(a){i[t].unshift(e.data[t][a].concat(a))})}),i.dark.sort(function(t,e){return e[2]-t[2]});var o=function(t,e){var a=t.getActualTime(),n=e.getActualTime();return n>a?-1:a>n?1:t.space<e.space?-1:t.space>e.space?1:t.maxSpace<e.maxSpace?-1:t.maxSpace>e.maxSpace?1:0},s=function(t,e){return t.level<e.level?-1:t.level>e.level?1:o(t,e)},l=function(t,e,a,n,r){var i=t.filter(function(t){return t.level>=e&&t.space+a<=t.maxSpace});if(!i.length)return null;if(i.length>1){if(1===a){var l=i.filter(function(t){return t.time+n<=t.getAverageTime(r)});if(l.length)return l.length>1&&l.sort(s),l[0]}i.sort(o)}return i[0]},c=function(t,e,a,n){var r=!0,i=0,o=0;e.forEach(function(t){r&&t[1]%n!==0&&(r=!1),i=Math.max(t[2],i),o+=t[1]*t[4]});var s=!0,c=0,u=[];t.forEach(function(e){if(0!==e.level){var a=e.isBoosted===t[0].isBoosted;!r||e.level>=i&&a||(r=!1),r&&o/n>e.maxSpace&&(r=!1),!s||e.level===t[0].level&&a||(s=!1),u.push(e.num),c+=e.maxSpace}}),r=r&&c>=o;for(var d=!1;e.length;){var f=e.shift(),p=f[0],v=f[1],h=f[2],m=f[3],g=f[4];if(r){var b=v/n,y=b*m,k=b*g;t.forEach(function(t){0!==t.level&&(t.units[p]=b,t.time+=y,t.space+=k)})}else for(var x=null;v--;){var C=!0;if(x){var E=x.time+m,T=x.space+g;1===g&&E<=x.getAverageTime(a)&&T<=x.maxSpace&&(C=!1)}if(C&&(x=l(t,h,g,m,a)),null===x){d=!0;break}x.units[p]?x.units[p]++:x.units[p]=1,x.time+=m,x.space+=g}}return d||!s||r||(t.sort(function(t,e){return e.getActualTime()-t.getActualTime()}),t.forEach(function(t,e){0!==t.level&&(t.num=u[e])})),!d},u=function(t,o){var s;if(-1!==["light-spells","dark-spells"].indexOf(t))s=o.storage.get(t+"-level",0);else{for(var l=[],u=0;++u<=e.buildings[t].count;)l.push(o.storage.get(t+"-level-"+u,0));s=Math.max.apply(null,l)}for(var d={capLevel:o.capLevel,levelValue:s,objects:[]},f=0,p=0,v=0,h=0,m=0,g=[],b=-1,y=i[t].length;++b<y;){var k={},x=i[t][b];if(!(x[3]>s)){var C=x[5],E=o.storage.get(C,0),T=o.storage.get(C+"-level",0),S=x[1][T],w=S*E;if(k.name=C,k.summaryCost=w,k.level=T,k.minBarrackLevel=x[3],f+=w,v+=x[2]*E,-1!==["light-spells","dark-spells"].indexOf(t))h+=x[0]*E;else{var L=0;o.current&&(L=parseInt(a.id(C+"-subtract").value,10)||0),L&&n.reach("SUBTRACT"),E-=L,0>E&&(E=0),E&&(g.push([b,E,x[3],x[0],x[2]]),m=Math.max(m,x[0]),h+=x[0]*E),p+=S*E}k.quantity=E,d.objects.push(k)}}if(d.typesSorted=i[t],d.totalCost=f,d.totalSpace=v,-1!==["light-spells","dark-spells"].indexOf(t))d.totalTime=h;else{var A=l.map(function(a,n){var i=n+1,s=!1;return o.current&&(s="yes"===localStorage.getItem(t+"-boosted-"+i)),{num:i,time:0,space:0,maxSpace:e.buildings[t].queue[a],units:{},level:a,isBoosted:s,getActualTime:function(){return this.isBoosted?Math.floor(this.time/r):this.time},getAverageTime:function(t){return this.isBoosted?t*r:t}}}),j=A.filter(function(t){return t.isBoosted===!0}).length;j&&(m=Math.ceil(m/r));var O=A.filter(function(t){return t.level>0}).length,_=O+j*(r-1),q=Math.max(Math.ceil(h/_),m),D=q%5;0!==D&&(q+=5-D),d.fillSuccess=c(A,g,q,O),d.barracksQueue=A,d.subtractedCost=p}return d},d=function(t){var a={params:t};return a.armyCampsSpace=t.storage.get("army-camps",0),["light","dark","light-spells","dark-spells"].forEach(function(n){a[n]=u(n,{storage:t.storage,current:t.current,capLevel:e.buildings[n].maxLevel})}),a};return d}),part("calculateCurrent",["storage","dom","types","common","calculate"],function(t,e,a,n,r){var i=function(t,a,n){var r=t-a;0>r&&(r='<span class="limit-exceeded">'+(""+r).replace("-","&minus;")+"</span>"),e.updater.defer(n+"-quantity","html",r);var i=a;a>t&&(i='<span class="limit-exceeded">'+a+"</span>"),i=i+"&thinsp;/&thinsp;"+t,e.updater.defer(n+"-space","html",i)},o=function(t,a){var r=[];if(t.fillSuccess){e.updater.defer(a+"-exceeded","display","none");for(var i=0,o=1;t.barracksQueue.length;){var s=t.barracksQueue.shift();for(var l in s.units)s.units[l]&&e.updater.defer("quantity-"+t.typesSorted[l][5]+"-"+s.num,"text","×"+s.units[l]);var c=s.getActualTime();c>i&&(i=c,o=parseInt(s.num,10));var u=c?n.getFormattedTime(c):"";s.isBoosted&&(u='<span class="boosted">'+u+"</span>"),r[s.num]=u;var d="";0!==s.maxSpace&&(d=s.space+" / "),e.updater.defer(a+"-space-"+s.num,"text",d)}r.forEach(function(t,n){n===o&&(t='<span class="result">'+t+"</span>"),e.updater.defer(a+"-time-"+n,"html",t)})}else{e.updater.defer(a+"-exceeded","display","");for(var f=[],p=0;t.barracksQueue.length;){var s=t.barracksQueue.shift();e.updater.defer(a+"-time-"+s.num,"text",""),f[s.num]=s.space,p+=s.space}var v=!0;f.forEach(function(n,r){var i=a+"-space-"+r;0===n?e.updater.defer(i,"text",""):v?(v=!1,n+=t.totalSpace-p,e.updater.defer(i,"html",'<span class="limit-exceeded result">'+n+"</span> / ")):e.updater.defer(i,"text",n+" / ")})}};return e.listenCustom("calculateDone",function(t){if("all"===t.params.type||-1===["light-spells","dark-spells"].indexOf(t.params.type)){var r=t.light.totalSpace+t.dark.totalSpace;i(t.armyCampsSpace,r,"light"),i(t.armyCampsSpace,r,"dark")}if("all"===t.params.type||-1!==["light-spells","dark-spells"].indexOf(t.params.type)){var s=2*t["light-spells"].levelValue+(t["dark-spells"].levelValue?1:0),l=t["light-spells"].totalSpace+t["dark-spells"].totalSpace;i(s,l,"light-spells"),i(s,l,"dark-spells"),["light-spells","dark-spells"].forEach(function(a){var r=a+"-time",i="";t[a].totalTime&&(i="yes"===localStorage.getItem(a+"-boosted")?'<span class="boosted">'+n.getFormattedTime(Math.floor(t[a].totalTime/4),!0)+"</span>":n.getFormattedTime(t[a].totalTime,!0)),e.updater.defer(r,"html",i)})}["light","dark","light-spells","dark-spells"].forEach(function(r){if(-1!==["all","barrack-"+r,r].indexOf(t.params.type)){var i=e.findCache(".js-"+r+"-object");if(i.iterate(function(e){e.style.display=0===t[r].levelValue?"none":""}),Object.keys(a.data[r]).forEach(function(n){var i=a.data[r][n],o=r+"-building-level-"+n,s=e.id(r+"-building-level-"+n);i[3]>t[r].levelValue?(e.updater.instantly(o,"display","none"),e.find("td.changed-animation",s).iterate(function(t){t.classList.remove("changed-animation")})):e.updater.instantly(o,"display","")}),t[r].objects.forEach(function(t){if(e.updater.defer(t.name+"-summary","text",t.summaryCost?n.numberFormat(t.summaryCost):""),-1===["light-spells","dark-spells"].indexOf(r))for(var i=0,o=a.buildings[r].count;++i<=o;)e.updater.defer("quantity-"+t.name+"-"+i,"text","")}),e.updater.defer(r+"-cost","text",n.numberFormat(t[r].totalCost)),-1===["light-spells","dark-spells"].indexOf(r)){o(t[r],r);var s=r+"-subtracted-cost";t[r].subtractedCost===t[r].totalCost?e.updater.defer(s,"text",""):e.updater.defer(s,"html","−&thinsp;"+n.numberFormat(t[r].totalCost-t[r].subtractedCost)+'&thinsp;=&thinsp;<span class="result">'+n.numberFormat(t[r].subtractedCost)+"</span>")}}}),e.updater.defer("light-spells-grand-total","text",n.numberFormat(t.light.subtractedCost+t["light-spells"].totalCost)),e.updater.defer("dark-spells-grand-total","text",n.numberFormat(t.dark.subtractedCost+t["dark-spells"].totalCost)),e.updater.runDeferred()}),function(a){var n={type:a,storage:t.current,current:!0},i=r(n);t.save()&&e.triggerCustom("calculateDone",i)}}),part("collection",["dom","storage","calculateCurrent"],function(t,e,a){var n=function(){var n={},r=function(t,n,r,i){Array.isArray(i)&&(i=i[n.index-1]),e.current.set(t,parseInt(i,10)),"dom"===r&&a(n.calculateType);var o=""+i;"storage"!==r&&"settings"!==r||n.el.value===o||(n.el.value=o,"settings"===r&&n.el.parentNode.classList.add("changed-animation")),n.onUpdate&&n.onUpdate(t,n)};return{add:function(e,a){a.el=t.id(e),t.listen(a.el.parentNode,"animationend",function(t){t.target.classList.remove("changed-animation")}),"__fromAttr"===a.calculateType&&(a.calculateType=a.el.getAttribute("data-type")),a.update||(a.update=r),n[e]=a},update:function(t){var e=n[t];e.update(t,e,"dom",e.el.value)},updateFromStorage:function(){Object.keys(n).forEach(function(t){var a=n[t];a.update(t,a,"storage",e.current.get(t,a.el.value))})},updateSetting:function(t,e){Object.keys(n).forEach(function(a){var r=n[a];r.update(a,r,"settings",e(t,r.th))})}}}();return t.listenCustom("storageUpdated",n.updateFromStorage),n}),part("boostedCollection",["dom","goal","calculateCurrent","localStorageSet","storage"],function(t,e,a,n,r){var i=function(){var i={};return{add:function(e,a){var n={type:a,el:t.id(e)};i[e]=n,"yes"===localStorage.getItem(e)&&(n.el.checked=!0)},update:function(t){var o=n(t,i[t].el.checked?"yes":"no",r.all.length-1);o&&(e.reach("BOOSTED",{boostedType:i[t].type}),a(i[t].type))}}}();return i}),part(["dom","goal","collection","calculateCurrent","localStorageSet","storage"],function(t,e,a,n){var r=function(t,e){for(;!e.hasOwnProperty(t)&&t>0;)t--;return e[t]},i=function(t){a.updateSetting(t,r),e.reach("SETTINGS_TH",{settingsLevel:""+t}),n("all")};t.find(".js-settings-level").listen("universalClick",function(t){i(parseInt(t.currentTarget.textContent,10))})}),part("favorites",["storage","dom","calculate","common","smoothScroll","goal","calculateCurrent"],function(t,e,a,n,r,i,o){var s=function(){e.updater.instantly("view-shared","display","none")},l=e.id("light-anchor"),c=e.id("favorites"),u=new Hogan.Template({code:function(t,e,a){var n=this;return n.b(a=a||""),n.b('<div class="favorite js-favorite" data-num="'),n.b(n.v(n.f("index",t,e,0))),n.b('">'),n.b("\n"+a),n.b('<textarea class="favorite__title js-favorite-title"'),n.b("\n"+a),n.b('placeholder="Untitled"'),n.b("\n"+a),n.b('rows="1"'),n.b("\n"+a),n.b('data-num="'),n.b(n.v(n.f("index",t,e,0))),n.b('">'),n.b(n.v(n.f("title",t,e,0))),n.b("</textarea>"),n.b("\n"+a),n.s(n.f("types",t,e,1),t,e,0,192,588,"{{ }}")&&(n.rs(t,e,function(t,e,n){n.s(n.f("totalCapacity",t,e,1),t,e,0,211,304,"{{ }}")&&(n.rs(t,e,function(t,e,n){n.b('<div class="favorite__capacity">'),n.b(n.v(n.f("totalCapacity",t,e,0))),n.b("&thinsp;/&thinsp;"),n.b(n.v(n.f("maximumCapacity",t,e,0))),n.b("</div>"),n.b("\n"+a)}),t.pop()),n.b('<table class="favorite__objects">'),n.b("\n"+a),n.s(n.f("items",t,e,1),t,e,0,367,435,"{{ }}")&&(n.rs(t,e,function(t,e,n){n.b("<tr>"),n.b("\n"+a),n.b('<td class="number">×'),n.b(n.v(n.f("quantity",t,e,0))),n.b("</td>"),n.b("\n"+a),n.b("<td>"),n.b(n.v(n.f("name",t,e,0))),n.b("</td>"),n.b("\n"+a),n.b("</tr>"),n.b("\n"+a)}),t.pop()),n.b("</table>"),n.b("\n"+a),n.b('<div class="favorite__time">'),n.b(n.t(n.f("time",t,e,0))),n.b("</div>"),n.b("\n"+a),n.b('<div class="favorite__cost">'),n.b("\n"+a),n.b('<span class="icon-'),n.b(n.v(n.f("costModifier",t,e,0))),n.b('">'),n.b(n.v(n.f("cost",t,e,0))),n.b("</span>"),n.b("\n"+a),n.b("</div>"),n.b("\n"+a)}),t.pop()),n.b('<span class="button-group">'),n.b("\n"+a),n.b('<span class="button js-favorite-load" data-num="'),n.b(n.v(n.f("index",t,e,0))),n.b('">Load</span><!--'),n.b("\n"+a),n.b('--><span class="button button_after js-favorite-delete" data-num="'),n.b(n.v(n.f("index",t,e,0))),n.b('">Remove</span>'),n.b("\n"+a),n.b("</span>"),n.b("\n"+a),n.b("</div>"),n.fl()},partials:{},subs:{}}),d=function(a){i.reach("LOAD_SAVED");var c=parseInt(a.currentTarget.getAttribute("data-num"),10),u=n.objectCopy(t.all[c].getAll());t.current=new n.Dict(u),t.current.set("favorite-title",""),e.triggerCustom("storageUpdated"),o("all"),s(),r.scrollTo(l)},f=function(a){i.reach("DELETE_SAVED");var n=parseInt(a.currentTarget.getAttribute("data-num"),10),r=c.querySelector('.js-favorite[data-num="'+n+'"]');e.listen(r,"transitionend",function(){r.parentNode.removeChild(r),e.find(".js-favorite",c).iterate(function(t){var a=parseInt(t.getAttribute("data-num"),10);if(a>n){var r=""+(a-1);t.setAttribute("data-num",r),e.find("[data-num]",t).iterate(function(t){t.setAttribute("data-num",r)})}})}),r.classList.add("favorite_deleted"),t.all.splice(n,1),t.save()},p=function(t){t.currentTarget.classList.remove("favorite_added")},v=function(e){var a=parseInt(e.currentTarget.getAttribute("data-num"),10);t.all[a].set("favorite-title",e.currentTarget.value),t.save()},h=function(t){var e=t.scrollHeight;e>t.offsetHeight&&(t.style.height=e+2+"px")},m=function(t,a){e.find(".js-favorite-load",t).listen("universalClick",d),e.find(".js-favorite-delete",t).listen("universalClick",f),a?e.listen(t,"animationend",p):e.find(".js-favorite",t).listen("animationend",p),e.find(".js-favorite-title",t).iterate(function(t){h(t),e.listen(t,"input",function(t){v(t),h(t.currentTarget)})})},g=function(t,e){if(0!==e){var r={index:e,title:t.get("favorite-title",""),types:[]},i=a({type:"all",current:!1,storage:t}),o={light:"elixir",dark:"dark-elixir","light-spells":"elixir","dark-spells":"dark-elixir"},s=null;["light","dark","light-spells","dark-spells"].forEach(function(t){var e=[];if(-1===["light-spells","dark-spells"].indexOf(t)&&i[t].objects.sort(function(t,e){return t.minBarrackLevel-e.minBarrackLevel}),i[t].objects.forEach(function(t){t.quantity&&e.push({name:n.convertToTitle(t.name),quantity:t.quantity})}),e.length){var a={items:e,cost:n.numberFormat(i[t].totalCost),costModifier:o[t]};if(-1!==["light-spells","dark-spells"].indexOf(t))a.time=n.getFormattedTime(i[t].totalTime,!0),null===s&&(s=r.types.length);else{var l;i[t].fillSuccess&&(l=Math.max.apply(null,i[t].barracksQueue.map(function(t){return t.time})),l=n.getFormattedTime(l)),a.time=l}r.types.push(a)}});var l=i.light.totalSpace+i.dark.totalSpace;return l&&(r.types[0].totalCapacity=l,r.types[0].maximumCapacity=i.armyCampsSpace),null!==s&&(r.types[s].totalCapacity=i["light-spells"].totalSpace+i["dark-spells"].totalSpace,r.types[s].maximumCapacity=2*i["light-spells"].levelValue+(i["dark-spells"].levelValue?1:0)),u.render(r)}},b=function(t){var e=c.querySelector('.js-favorite[data-num="'+t+'"]');r.scrollTo(e,function(){e.classList.add("favorite_added")})},y=function(){var e={},a=t.getForDiff();if(a[0]){for(var r=JSON.stringify(a[0]),i=0,o=a.length;++i<o;){var s=JSON.stringify(a[i]);if(r===s)return e.exists=!0,e.index=i,e}var l=t.all.length;t.current.set("favorite-title","");var u=new n.Dict(n.objectCopy(t.current.getAll()));t.all.push(u),t.save()?(c.insertAdjacentHTML("beforeend",g(u,l)),m(c.lastChild,!0),e.added=!0,e.index=l):t.all.pop()}return e};return e.find(".js-favorite-add").listen("universalClick",function(t){t.preventDefault();var e=y(!0);e.added&&i.reach("SAVE_COMPOSITION",{favoriteButton:t.target.textContent}),e.index&&b(e.index)}),setTimeout(function(){c.innerHTML=t.all.map(g).join(""),m(c)},0),window.yandexMetrikaParams.favoritesCount=""+(t.all.length?t.all.length-1:0),{addBeforeShare:function(){var t=y();(t.added||t.exists)&&(e.listen(e.id("view-shared"),"universalClick",s),e.updater.instantly("view-shared","display",""))}}}),part(["storage","dom","common","converter","favorites","goal"],function(t,e,a,n,r,i){var o=0;if(-1!==location.search.indexOf("?l=")?o=1:-1!==location.search.indexOf("?s=")?o=2:-1!==location.search.indexOf("?s3=")&&(o=3),0!==o){var s=location.search.substr(3===o?4:3);s=decodeURIComponent(s);var l={};l["shareV"+o]=s,i.reach("SHARE",l),s=s.replace(/[a-z]/g,","),s=s.replace(/"+$/,""),s=s.replace(/,$/,""),s=s.replace(/,(?=,)/g,",0"),","===s[0]&&(s="0"+s),s="["+s+"]";try{s=JSON.parse(s)}catch(c){s=!1}history.replaceState({},"",location.protocol+"//"+location.host+location.pathname),s&&(1===o?n.oldConvert3to4(s):2===o&&n.oldConvert4to5(s),s=t.dataArrayToObject(s),r.addBeforeShare(),t.current=new a.Dict(s),t.save())}var u=e.find(".js-share-link"),d=e.id("share-permalink");e.selectOnFocus(d,function(){i.reach("SHARE_LINK")});var f,p=function(){var e="http://mkln.ru/clash-of-clans/?s3=",n=a.objectCopy(t.current.getAll());n=t.dataObjectToArray(n),t.excludeIndexes.forEach(function(t){n[t]=null}),n=JSON.stringify(n),n=n.replace(/\b(?:null|0)\b/g,""),n=n.substr(1,n.length-2),n=n.replace(/,+$/,"");var r=97;n=n.replace(/,/g,function(){var t=String.fromCharCode(r);return 122===r?r=97:r++,t}),d.value=e+n;var i=encodeURIComponent(e+n);u.iterate(function(t){t.setAttribute("href",t.getAttribute("data-share-link").replace("{url}",i))})},v=e.find(".js-share"),h=function(t){var e="",a=["light","dark","light-spells","dark-spells"].some(function(e){return t[e].totalCost?!0:void 0});a?p():e="none",v.iterate(function(t){t.style.display=e})};e.listenCustom("calculateDone",function(t){clearTimeout(f),f=setTimeout(function(){h(t)},300)})}),part(["storage","types","dom","collection","boostedCollection","calculateCurrent"],function(t,e,a,n,r,i){a.listen(document.body,"change",function(t){t.target.classList.contains("js-comp-level")?n.update(t.target.getAttribute("id")):t.target.classList.contains("js-comp-boosted")&&r.update(t.target.getAttribute("id"))}),n.add("army-camps",{calculateType:"all",th:{1:20,2:30,3:70,4:80,5:135,6:150,7:200,9:220,10:240}}),["light-spells","dark-spells"].forEach(function(i){n.add(i+"-level",{calculateType:i,th:e.buildings[i].th,onUpdate:function(e){a.updater.instantly(i+"-boosted-wrapper","display",0===t.current.get(e,0)?"none":"")}}),r.add(i+"-boosted",i)}),["light","dark"].forEach(function(i){for(var o=e.buildings[i],s=0;++s<=o.count;)n.add(i+"-level-"+s,{index:s,calculateType:"barrack-"+i,th:o.th,onUpdate:function(e,n){var r="",s=t.current.get(e,0);0!==s&&(r=o.queue[s]),a.updater.instantly(i+"-maxSpace-"+n.index,"text",r),a.updater.instantly(i+"-levelText-"+n.index,"text",s),a.updater.instantly(i+"-barrack-info-"+n.index,"display",0===s?"none":"")}}),r.add(i+"-boosted-"+s,i)}),e.iterateTree(function(t,e,a){n.add(e+"-level",{calculateType:"__fromAttr",th:a[4],attachEvent:!1})}),a.listen(document.body,"input",function(e){var a=e.target,n=a.classList.contains("js-comp-quantity"),r=a.classList.contains("js-comp-subtract");if(n||r){var o=parseInt(a.value,10)||0;0>o&&(o=0),a.value=o||"",n&&t.current.set(a.getAttribute("id"),o),i(a.getAttribute("data-type"))}}),a.listenCustom("storageUpdated",function(){e.iterateTree(function(e,n){a.id(n).value=t.current.get(n)||""})}),a.triggerCustom("storageUpdated"),i("all")}),part(["dom"],function(t){var e=function(e,a){var n=parseInt(e.value,10);e.value="+"===a?isNaN(n)?1:++n:isNaN(n)||1>=n?"":--n,t.trigger(e,"input")},a=function(t){var e=this;this.target=t.target,this.click=!0,this.x=t.screenX,this.y=t.screenY,this.firstTimeout=setTimeout(function(){e.click=!1,function t(){e.secondTimeout=setTimeout(function(){e.allowPrevent=!0,e.run(),t()},100)}()},300)};a.prototype.run=function(){var a=t.id(this.target.getAttribute("data-for"));e(a,this.target.textContent)},a.prototype.isMoved=function(t,e){var a=Math.abs(t.screenX-this.x)/e,n=Math.abs(t.screenY-this.y)/e;return a>16||n>16},a.prototype.destroy=function(){clearTimeout(this.firstTimeout),clearTimeout(this.secondTimeout)};var n={items:{},start:function(t){for(var e=!1,n=0,r=t.length;r>n;n++){var i=t[n];i.target.classList.contains("js-spinner")&&(0===Object.keys(this.items).length&&(e=!0),this.items[i.identifier]=new a(i))}return e},move:function(t,e){e=e||1;for(var a=!1,n=0,r=t.length;r>n;n++){var i=t[n];i.identifier in this.items&&(this.items[i.identifier].click=!1,this.items[i.identifier].isMoved(i,e)?(this.items[i.identifier].destroy(),delete this.items[i.identifier]):this.items[i.identifier].allowPrevent&&(a=!0))}return a},end:function(t){for(var e=0,a=t.length;a>e;e++){var n=t[e];n.identifier in this.items&&(this.items[n.identifier].click&&this.items[n.identifier].run(),this.items[n.identifier].destroy(),delete this.items[n.identifier])}}},r=!1,i=0;t.listen(document.body,"touchstart",function(t){r=!0,n.start(t.changedTouches)&&(t.timeStamp-i<=300&&t.preventDefault(),i=t.timeStamp)}),t.listen(document.body,"touchmove",function(t){n.move(t.changedTouches,2)&&t.preventDefault()}),["touchend","touchcancel"].forEach(function(e){t.listen(document.body,e,function(t){n.end(t.changedTouches)})}),t.listen(document.body,"mousedown",function(t){r||1!==t.which||(t.identifier="mouse",n.start([t]))}),t.listen(document.body,"mousemove",function(t){t.identifier="mouse",n.move([t])}),["mouseup","click"].forEach(function(e){t.listen(document.body,e,function(t){t.identifier="mouse",n.end([t])})}),t.listen(document.body,"keydown",function(t){!t.target.classList.contains("js-number")||t.metaKey||t.shiftKey||t.ctrlKey||t.altKey||-1===[38,40].indexOf(t.keyCode)||(e(t.target,38===t.keyCode?"+":"-"),t.preventDefault())
}),t.find(".js-number").iterate(t.selectOnFocus)}),part(["dom","goal"],function(t,e){t.find(".js-reset").listen("universalClick",function(a){var n=a.currentTarget.getAttribute("data-reset"),r=a.currentTarget.getAttribute("data-scope");t.findCache("input.js-comp-"+r+'[data-type="'+n+'"]').iterate(function(e){e.value="",t.trigger(e,"input")}),e.reach("RESET",{resetType:n})})}),part(["dom"],function(t){var e,a,n="help-tooltip",r=n+"_visible",i=n+"_right",o="-999px",s=15,l=7,c=!1,u=function(){e=document.createElement("div"),e.classList.add(n),e.style.left=o,document.body.appendChild(e),t.listen(e,"transitionend",function(){e.classList.contains(r)||(e.style.left=o)});var i;t.listen(window,"touchstart",function(t){i=t.target!==e,i&&e.classList.contains(r)&&(a=setTimeout(function(){e.classList.remove(r)},300))}),t.listen(window,"touchmove",function(){i=!1}),t.listen(window,"touchend",function(){clearTimeout(a),i&&e.classList.remove(r)}),["mousedown","resize"].forEach(function(a){t.listen(window,a,function(t){t.target!==e&&e.classList.remove(r)})})};t.find(".js-help-link").listen("universalClick",function(t){t.stopPropagation(),c||(u(),c=!0),clearTimeout(a);var n=t.currentTarget;e.style.left=o,e.style.width="auto",e.innerHTML=n.querySelector(".js-help-content").innerHTML;var d=e.offsetWidth,f=window.pageXOffset,p=window.innerWidth,v=n.getBoundingClientRect(),h=v.left+f,m=v.top+window.pageYOffset,g=h-s;g+d>f+p&&g-f>p/2?(g=h-d+n.offsetWidth+s,0>=g&&(e.style.width=h+s-1+"px",g=1),e.classList.add(i)):e.classList.remove(i),e.style.top=m+n.offsetHeight+l+"px",e.style.left=g+"px",e.classList.add(r)})}),part(["dom"],function(t){var e="menu__items_active",a="menu__item_selected",n="18px",r="-999px",i=document.querySelector(".js-menu-switcher"),o=document.querySelector(".js-menu-items");o.style.right=r,t.listen(i,"universalClick",function(){i.classList.contains(a)||(o.classList.add(e),o.style.right=n,i.classList.add(a))});var s=function(){o.classList.remove(e),i.classList.remove(a)};["touchmove","scroll","resize"].forEach(function(e){t.listen(window,e,s)}),["touchend","click"].forEach(function(e){t.listen(window,e,function(t){t.target!==i&&s()})}),t.listen(o,"transitionend",function(){o.classList.contains(e)||(o.style.right=r)})}),part(["dom","goal","smoothScroll"],function(t,e,a){t.find(".js-anchor").listen("universalClick",function(n){n.preventDefault();var r=n.currentTarget.getAttribute("data-for");a.scrollTo(t.id(r)),e.reach("ANCHOR_CLICKED",{anchorFor:r})})});