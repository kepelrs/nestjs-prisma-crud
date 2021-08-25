"use strict";(self.webpackChunkdocumentation=self.webpackChunkdocumentation||[]).push([[671],{3905:function(e,t,r){r.d(t,{Zo:function(){return p},kt:function(){return d}});var n=r(7294);function i(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function a(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function o(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?a(Object(r),!0).forEach((function(t){i(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):a(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function s(e,t){if(null==e)return{};var r,n,i=function(e,t){if(null==e)return{};var r,n,i={},a=Object.keys(e);for(n=0;n<a.length;n++)r=a[n],t.indexOf(r)>=0||(i[r]=e[r]);return i}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(n=0;n<a.length;n++)r=a[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(i[r]=e[r])}return i}var l=n.createContext({}),c=function(e){var t=n.useContext(l),r=t;return e&&(r="function"==typeof e?e(t):o(o({},t),e)),r},p=function(e){var t=c(e.components);return n.createElement(l.Provider,{value:t},e.children)},u={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},m=n.forwardRef((function(e,t){var r=e.components,i=e.mdxType,a=e.originalType,l=e.parentName,p=s(e,["components","mdxType","originalType","parentName"]),m=c(r),d=i,f=m["".concat(l,".").concat(d)]||m[d]||u[d]||a;return r?n.createElement(f,o(o({ref:t},p),{},{components:r})):n.createElement(f,o({ref:t},p))}));function d(e,t){var r=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var a=r.length,o=new Array(a);o[0]=m;var s={};for(var l in t)hasOwnProperty.call(t,l)&&(s[l]=t[l]);s.originalType=e,s.mdxType="string"==typeof e?e:i,o[1]=s;for(var c=2;c<a;c++)o[c]=r[c];return n.createElement.apply(null,o)}return n.createElement.apply(null,r)}m.displayName="MDXCreateElement"},426:function(e,t,r){r.r(t),r.d(t,{frontMatter:function(){return s},contentTitle:function(){return l},metadata:function(){return c},toc:function(){return p},default:function(){return m}});var n=r(7462),i=r(3366),a=(r(7294),r(3905)),o=["components"],s={sidebar_position:1,slug:"/"},l="Intro",c={unversionedId:"intro",id:"intro",isDocsHomePage:!1,title:"Intro",description:"nestjs-prisma-crud is a minimal CRUD tool for NestJS projects that use Prisma for their database operations. It is inspired by the great work at @nestjsx/crud.",source:"@site/docs/intro.md",sourceDirName:".",slug:"/",permalink:"/nestjs-prisma-crud/",editUrl:"https://github.com/kepelrs/nestjs-prisma-crud/edit/master/docs/docs/intro.md",version:"current",sidebarPosition:1,frontMatter:{sidebar_position:1,slug:"/"},sidebar:"tutorialSidebar",next:{title:"Quickstart",permalink:"/nestjs-prisma-crud/quickstart"}},p=[{value:"\u2714 Features",id:"-features",children:[]}],u={toc:p};function m(e){var t=e.components,r=(0,i.Z)(e,o);return(0,a.kt)("wrapper",(0,n.Z)({},u,r,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("h1",{id:"intro"},"Intro"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"nestjs-prisma-crud")," is a minimal CRUD tool for ",(0,a.kt)("a",{parentName:"p",href:"https://nestjs.com/"},"NestJS")," projects that use ",(0,a.kt)("a",{parentName:"p",href:"https://www.prisma.io/"},"Prisma")," for their database operations. It is inspired by the great work at ",(0,a.kt)("a",{parentName:"p",href:"https://github.com/nestjsx/crud"},"@nestjsx/crud"),"."),(0,a.kt)("h2",{id:"-features"},"\u2714 Features"),(0,a.kt)("p",null,"An overview of the provided functionality:"),(0,a.kt)("ol",null,(0,a.kt)("li",{parentName:"ol"},"Advanced client side ",(0,a.kt)("strong",{parentName:"li"},"joining"),", ",(0,a.kt)("strong",{parentName:"li"},"sorting"),", ",(0,a.kt)("strong",{parentName:"li"},"filtering")," and ",(0,a.kt)("strong",{parentName:"li"},"pagination")," via query parameters",(0,a.kt)("ul",{parentName:"li"},(0,a.kt)("li",{parentName:"ul"},"Any valid prisma ",(0,a.kt)("inlineCode",{parentName:"li"},".where")," can be sent by the frontend."),(0,a.kt)("li",{parentName:"ul"},"Server side validation to safeguard against arbitrarily deep ",(0,a.kt)("inlineCode",{parentName:"li"},".join")," or ",(0,a.kt)("inlineCode",{parentName:"li"},".where")," clauses by clients."),(0,a.kt)("li",{parentName:"ul"},"Support for including only specific properties in the response."))),(0,a.kt)("li",{parentName:"ol"},"Access control",(0,a.kt)("ul",{parentName:"li"},(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("inlineCode",{parentName:"li"},"@AccessPolicy")," decorator with default utilities that support functionalities similar to ",(0,a.kt)("a",{parentName:"li",href:"https://en.wikipedia.org/wiki/Role-based_access_control"},"RBAC"),"/",(0,a.kt)("a",{parentName:"li",href:"https://en.wikipedia.org/wiki/Attribute-based_access_control"},"ABAC"),"."),(0,a.kt)("li",{parentName:"ul"},"Custom policy support"))),(0,a.kt)("li",{parentName:"ol"},"Atomic operations",(0,a.kt)("ul",{parentName:"li"},(0,a.kt)("li",{parentName:"ul"},"Supports POST/PATCH with nested objects."),(0,a.kt)("li",{parentName:"ul"},"Transaction support when extending controller functionality."))),(0,a.kt)("li",{parentName:"ol"},"Schematics",(0,a.kt)("ul",{parentName:"li"},(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("inlineCode",{parentName:"li"},"crud-resource"),": a modified NestJS ",(0,a.kt)("inlineCode",{parentName:"li"},"resource")," schematic that scaffolds the entire CRUD module for you.",(0,a.kt)("br",null)," One-line scaffolding with: ",(0,a.kt)("em",{parentName:"li"},(0,a.kt)("inlineCode",{parentName:"em"},"nest g -c nestjs-prisma-crud-schematics crud-resource <YOUR-TABLE-NAME-HERE>"))))),(0,a.kt)("li",{parentName:"ol"},"Plug and play",(0,a.kt)("ul",{parentName:"li"},(0,a.kt)("li",{parentName:"ul"},"Can be used alongside your other non ",(0,a.kt)("inlineCode",{parentName:"li"},"nestjs-prisma-crud")," controllers."),(0,a.kt)("li",{parentName:"ul"},"You can use ",(0,a.kt)("inlineCode",{parentName:"li"},"PrismaCrudService")," and ",(0,a.kt)("inlineCode",{parentName:"li"},"@AccessPolicy")," in your custom controllers if you want to retain some of ",(0,a.kt)("inlineCode",{parentName:"li"},"nestjs-prisma-crud"),"'s functionalities.")))))}m.isMDXComponent=!0}}]);